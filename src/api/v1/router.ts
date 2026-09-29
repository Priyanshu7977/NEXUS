import { ApiV1Request, ApiV1Response, ApiErrorCode } from '../../types/api';
import { verifyApiKey } from '../../services/apiKeyService';
import { apiRateLimiter } from '../../services/rateLimiter';
import { checkIdempotencyKey, storeIdempotencyKey } from '../../services/idempotencyService';
import { sanitizeObservabilityData } from '../../services/observabilityService';
import { getWorkspaceAgents, getAgentById } from '../../services/agentService';
import { executeAgent } from '../../runtime/agentRuntime';
import { getWorkflows, getWorkflowById, getWorkflowExecutionById } from '../../services/workflowService';
import { executeWorkflow } from '../../runtime/workflowEngine';
import { getExecutionLiveState } from '../../services/observabilityService';
import { getWorkspaceConnections } from '../../services/connectorService';
import { getWorkspaceActivities, logWorkspaceActivity } from '../../services/activityService';
import {
  getWorkspaceWebhooks,
  createDeveloperWebhook,
  deleteDeveloperWebhook,
  sendTestWebhookEvent,
} from '../../services/webhookDeliveryService';
import openApiSpec from './openapi.json';

// Helper to construct formatted API response
function formatResponse(status: number, data: any, requestId: string): ApiV1Response {
  return {
    status,
    headers: {
      'Content-Type': 'application/json',
      'X-Request-Id': requestId,
      'x-request-id': requestId,
      'X-NEXUS-Version': 'v1',
    },
    body: {
      data,
      request_id: requestId,
    },
  };
}

function formatError(status: number, code: ApiErrorCode, message: string, requestId: string): ApiV1Response {
  return {
    status,
    headers: {
      'Content-Type': 'application/json',
      'X-Request-Id': requestId,
      'x-request-id': requestId,
      'X-NEXUS-Version': 'v1',
    },
    body: {
      error: {
        code,
        message,
        request_id: requestId,
      },
    },
  };
}

/**
 * Authoritative Public API v1 Request Router.
 * Handles authentication, authorization, rate limiting, idempotency, routing, and secret sanitization.
 */
export async function handleApiV1Request(req: ApiV1Request): Promise<ApiV1Response> {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const method = req.method.toUpperCase();
  const urlPath = req.path.split('?')[0].replace(/\/+$/, '');

  // 1. OpenAPI Specification endpoint (public, unauthenticated, pure OpenAPI 3.1.0 document)
  if (method === 'GET' && (urlPath === '/api/v1/openapi.json' || urlPath === '/api/v1/openapi')) {
    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': 'public, max-age=3600',
        'X-NEXUS-Version': 'v1',
      },
      body: openApiSpec,
    };
  }

  // 2. Authentication: Extract Bearer API Key
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return formatError(
      401,
      'UNAUTHENTICATED',
      'Missing or malformed Authorization header. Expected format: "Authorization: Bearer nxs_live_..."',
      requestId
    );
  }

  const rawApiKey = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!rawApiKey) {
    return formatError(401, 'UNAUTHENTICATED', 'API key token is missing in Bearer header.', requestId);
  }

  // 3. Rate Limiting Check
  const clientIdentifier = rawApiKey.slice(0, 16);
  const rateLimitResult = apiRateLimiter.check(clientIdentifier, 120, 60000); // 120 requests/min
  if (!rateLimitResult.allowed) {
    return {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Id': requestId,
        'x-request-id': requestId,
        'Retry-After': String(rateLimitResult.retryAfterSeconds || 60),
        'X-RateLimit-Limit': '120',
        'X-RateLimit-Remaining': '0',
      },
      body: {
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'API rate limit exceeded. Please wait before retrying.',
          request_id: requestId,
        },
      },
    };
  }

  // 4. Resolve Required Scope for Endpoint
  let requiredScope = 'agents:read';
  if (urlPath.startsWith('/api/v1/agents')) {
    requiredScope = method === 'POST' && urlPath.endsWith('/execute') ? 'agents:execute' : 'agents:read';
  } else if (urlPath.startsWith('/api/v1/workflows')) {
    requiredScope = method === 'POST' && urlPath.endsWith('/execute') ? 'workflows:execute' : 'workflows:read';
  } else if (urlPath.startsWith('/api/v1/executions')) {
    requiredScope = 'executions:read';
  } else if (urlPath.startsWith('/api/v1/connectors')) {
    requiredScope = 'connectors:read';
  } else if (urlPath.startsWith('/api/v1/activity')) {
    requiredScope = 'activity:read';
  } else if (urlPath.startsWith('/api/v1/webhooks')) {
    requiredScope = method === 'GET' ? 'webhooks:read' : 'webhooks:write';
  }

  // 5. Verify API Key Validity & Scope
  const keyVerification = await verifyApiKey(rawApiKey, requiredScope);
  if (!keyVerification.valid || !keyVerification.workspaceId) {
    const isScopeError = keyVerification.error?.includes('Missing required scope');
    return formatError(
      isScopeError ? 403 : 401,
      isScopeError ? 'FORBIDDEN' : 'UNAUTHENTICATED',
      keyVerification.error || 'Invalid or revoked API key.',
      requestId
    );
  }

  const workspaceId = keyVerification.workspaceId;
  const apiKey = keyVerification.apiKey;

  // ------------------------------------------------------------------
  // ROUTE HANDLERS
  // ------------------------------------------------------------------

  try {
    // --- AGENTS ---
    if (urlPath === '/api/v1/agents' && method === 'GET') {
      const { agents } = await getWorkspaceAgents(workspaceId);
      const safeAgents = agents.map((a) => ({
        id: a.id,
        name: a.name,
        role: a.role,
        model: a.model_name || 'gemini-1.5-flash',
        description: a.description,
        status: a.status,
        tools: a.tools || [],
        created_at: a.created_at,
      }));
      return formatResponse(200, safeAgents, requestId);
    }

    const agentMatch = urlPath.match(/^\/api\/v1\/agents\/([^/]+)$/);
    if (agentMatch && method === 'GET') {
      const agentId = agentMatch[1];
      const { agent } = await getAgentById(workspaceId, agentId);
      if (!agent || agent.workspace_id !== workspaceId) {
        return formatError(404, 'NOT_FOUND', `Agent with ID "${agentId}" not found.`, requestId);
      }
      return formatResponse(
        200,
        {
          id: agent.id,
          name: agent.name,
          role: agent.role,
          model: agent.model_name || 'gemini-1.5-flash',
          description: agent.description,
          system_prompt: agent.instructions || '',
          tools: agent.tools || [],
          status: agent.status,
          created_at: agent.created_at,
        },
        requestId
      );
    }

    const agentExecMatch = urlPath.match(/^\/api\/v1\/agents\/([^/]+)\/execute$/);
    if (agentExecMatch && method === 'POST') {
      const agentId = agentExecMatch[1];
      const { agent } = await getAgentById(workspaceId, agentId);
      if (!agent || agent.workspace_id !== workspaceId) {
        return formatError(404, 'NOT_FOUND', `Agent with ID "${agentId}" not found.`, requestId);
      }

      const input = req.body?.input || req.body?.prompt;
      if (!input) {
        return formatError(422, 'VALIDATION_ERROR', 'Request body must contain "input" string.', requestId);
      }

      // Check Idempotency Key
      const idempotencyKey = req.headers['idempotency-key'] || req.headers['Idempotency-Key'];
      if (idempotencyKey) {
        const cached = await checkIdempotencyKey(workspaceId, idempotencyKey);
        if (cached && cached.response_data) {
          const res = formatResponse(200, cached.response_data, requestId);
          res.headers['x-idempotent-replay'] = 'true';
          return res;
        }
      }

      // Execute Agent asynchronously via real runtime
      const execution = await executeAgent({
        workspaceId,
        agentId: agent.id,
        input: typeof input === 'string' ? input : JSON.stringify(input),
      });

      const responseData = {
        id: execution.id,
        execution_id: execution.id,
        agent_id: agent.id,
        status: execution.status.toLowerCase(),
        started_at: execution.started_at,
        output: execution.output || null,
      };

      if (idempotencyKey) {
        await storeIdempotencyKey({
          workspaceId,
          idempotencyKey,
          resourceType: 'agent',
          resourceId: agent.id,
          executionId: execution.id,
          responseData,
        });
      }

      await logWorkspaceActivity(workspaceId, {
        type: 'agent',
        action: 'api.agent.execute',
        name: `Agent Executed: ${agent.name}`,
        status: 'completed',
        details: `Agent "${agent.name}" invoked via API key (${apiKey?.key_prefix || 'key'})`,
        metadata: { executionId: execution.id, agentId: agent.id, requestId },
      });

      return formatResponse(200, responseData, requestId);
    }

    // --- WORKFLOWS ---
    if (urlPath === '/api/v1/workflows' && method === 'GET') {
      const { workflows } = await getWorkflows(workspaceId);
      const safeWorkflows = workflows.map((w) => ({
        id: w.id,
        name: w.name,
        description: w.description,
        status: w.status,
        trigger_type: w.trigger_type,
        node_count: w.nodes?.length || 0,
        created_at: w.created_at,
      }));
      return formatResponse(200, safeWorkflows, requestId);
    }

    const wfMatch = urlPath.match(/^\/api\/v1\/workflows\/([^/]+)$/);
    if (wfMatch && method === 'GET') {
      const wfId = wfMatch[1];
      const { workflow } = await getWorkflowById(workspaceId, wfId);
      if (!workflow) {
        return formatError(404, 'NOT_FOUND', `Workflow with ID "${wfId}" not found.`, requestId);
      }
      return formatResponse(
        200,
        {
          id: workflow.id,
          name: workflow.name,
          description: workflow.description,
          status: workflow.status,
          trigger_type: workflow.trigger_type,
          trigger_config: workflow.trigger_config,
          nodes: workflow.nodes.map((n) => ({
            node_key: n.node_key,
            name: n.name,
            node_type: n.node_type,
          })),
          edges: workflow.edges,
          created_at: workflow.created_at,
        },
        requestId
      );
    }

    const wfExecMatch = urlPath.match(/^\/api\/v1\/workflows\/([^/]+)\/execute$/);
    if (wfExecMatch && method === 'POST') {
      const wfId = wfExecMatch[1];
      const { workflow } = await getWorkflowById(workspaceId, wfId);
      if (!workflow) {
        return formatError(404, 'NOT_FOUND', `Workflow with ID "${wfId}" not found.`, requestId);
      }

      // Check Idempotency Key
      const idempotencyKey = req.headers['idempotency-key'] || req.headers['Idempotency-Key'];
      if (idempotencyKey) {
        const cached = await checkIdempotencyKey(workspaceId, idempotencyKey);
        if (cached && cached.response_data) {
          const res = formatResponse(200, cached.response_data, requestId);
          res.headers['x-idempotent-replay'] = 'true';
          return res;
        }
      }

      const inputPayload = req.body?.input || req.body || {};

      // Execute Workflow via real runtime engine
      const execution = await executeWorkflow({
        workspaceId,
        workflowId: workflow.id,
        triggerData: inputPayload,
      });

      const responseData = {
        id: execution.id,
        execution_id: execution.id,
        workflow_id: workflow.id,
        status: execution.status.toLowerCase(),
        started_at: execution.started_at,
      };

      if (idempotencyKey) {
        await storeIdempotencyKey({
          workspaceId,
          idempotencyKey,
          resourceType: 'workflow',
          resourceId: workflow.id,
          executionId: execution.id,
          responseData,
        });
      }

      await logWorkspaceActivity(workspaceId, {
        type: 'workflow',
        action: 'api.workflow.execute',
        name: `Workflow Executed: ${workflow.name}`,
        status: 'completed',
        details: `Workflow "${workflow.name}" triggered via API key (${apiKey?.key_prefix || 'key'})`,
        metadata: { executionId: execution.id, workflowId: workflow.id, requestId },
      });

      return formatResponse(200, responseData, requestId);
    }

    // --- EXECUTIONS ---
    if (urlPath === '/api/v1/executions' && method === 'GET') {
      const liveState = await getExecutionLiveState(workspaceId, 'recent');
      return formatResponse(200, liveState || [], requestId);
    }

    const execEventsMatch = urlPath.match(/^\/api\/v1\/executions\/([^/]+)\/events$/);
    if (execEventsMatch && method === 'GET') {
      const execId = execEventsMatch[1];
      const liveState = await getExecutionLiveState(workspaceId, execId);
      if (!liveState || liveState.workspace_id !== workspaceId) {
        return formatError(404, 'NOT_FOUND', `Execution with ID "${execId}" not found.`, requestId);
      }
      return formatResponse(200, sanitizeObservabilityData(liveState.events || []), requestId);
    }

    const execMatch = urlPath.match(/^\/api\/v1\/executions\/([^/]+)$/);
    if (execMatch && method === 'GET') {
      const execId = execMatch[1];
      const liveState = await getExecutionLiveState(workspaceId, execId);
      if (!liveState || liveState.workspace_id !== workspaceId) {
        return formatError(404, 'NOT_FOUND', `Execution with ID "${execId}" not found.`, requestId);
      }

      const { execution } = await getWorkflowExecutionById(execId);

      return formatResponse(
        200,
        {
          id: liveState.execution_id,
          status: liveState.status.toLowerCase(),
          workflow_id: liveState.workflow_id,
          workflow_name: liveState.workflow_name,
          started_at: liveState.started_at,
          completed_at: liveState.completed_at,
          duration_ms: liveState.duration_ms,
          current_node_key: liveState.current_node_key,
          output: sanitizeObservabilityData(execution?.output_data || liveState.nodes?.agent_reasoning?.output_data?.result || null),
          error: liveState.error || null,
          approval: liveState.approval || null,
          deployment: liveState.deployment || null,
        },
        requestId
      );
    }

    // --- CONNECTORS ---
    if (urlPath === '/api/v1/connectors' && method === 'GET') {
      const { connections } = await getWorkspaceConnections(workspaceId);
      const safeConnectors = connections.map((c) => ({
        id: c.id,
        connector_id: c.connector_id,
        status: c.status,
        provider_account_name: c.provider_account_name,
        created_at: c.created_at,
      }));
      return formatResponse(200, safeConnectors, requestId);
    }

    // --- ACTIVITY ---
    if (urlPath === '/api/v1/activity' && method === 'GET') {
      const { activities } = await getWorkspaceActivities(workspaceId);
      const safeActivities = activities.map((a) => ({
        id: a.id,
        type: a.type,
        action: a.action,
        name: a.name,
        status: a.status,
        duration: a.duration,
        details: a.details,
        created_at: a.created_at,
      }));
      return formatResponse(200, safeActivities, requestId);
    }

    // --- WEBHOOKS ---
    if (urlPath === '/api/v1/webhooks' && method === 'GET') {
      const { webhooks } = await getWorkspaceWebhooks(workspaceId);
      return formatResponse(200, webhooks, requestId);
    }

    if (urlPath === '/api/v1/webhooks' && method === 'POST') {
      const { url, events, description } = req.body || {};
      const result = await createDeveloperWebhook({
        workspaceId,
        url,
        events,
        description,
      });

      if (result.error || !result.webhook) {
        return formatError(422, 'VALIDATION_ERROR', result.error || 'Failed to create webhook.', requestId);
      }

      return formatResponse(
        201,
        {
          webhook: result.webhook,
          secret: result.secret, // Shown once
        },
        requestId
      );
    }

    const testWebhookMatch = urlPath.match(/^\/api\/v1\/webhooks\/([^/]+)\/test$/);
    if (testWebhookMatch && method === 'POST') {
      const webhookId = testWebhookMatch[1];
      const testResult = await sendTestWebhookEvent(workspaceId, webhookId);
      if (!testResult.success) {
        return formatError(
          400,
          'BAD_REQUEST',
          `Webhook delivery failed: ${testResult.error || 'Endpoint unreachable'}`,
          requestId
        );
      }
      return formatResponse(200, { success: true, status: testResult.status }, requestId);
    }

    const deleteWebhookMatch = urlPath.match(/^\/api\/v1\/webhooks\/([^/]+)$/);
    if (deleteWebhookMatch && method === 'DELETE') {
      const webhookId = deleteWebhookMatch[1];
      await deleteDeveloperWebhook(workspaceId, webhookId);
      return formatResponse(200, { success: true, id: webhookId }, requestId);
    }

    // 404 Route Not Found
    return formatError(404, 'NOT_FOUND', `Endpoint "${method} ${urlPath}" does not exist in API v1.`, requestId);
  } catch (err: any) {
    console.error(`[NEXUS API v1 Error] ${method} ${urlPath}:`, err);
    return formatError(500, 'INTERNAL_ERROR', 'An unexpected server error occurred.', requestId);
  }
}
