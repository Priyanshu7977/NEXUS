import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { WorkspacePolicy, DEFAULT_WORKSPACE_POLICY } from '../types/security';
import { requirePermission } from './authorizationService';
import { recordAuditLog } from './auditService';

const LOCAL_POLICIES_PREFIX = 'nexus_ws_policy_';

const memoryPolicies = new Map<string, WorkspacePolicy>();

export const normalizePolicy = (policy: Partial<WorkspacePolicy>, workspaceId: string): WorkspacePolicy => {
  const maxNodes = policy.max_nodes_per_workflow ?? policy.max_workflow_nodes ?? DEFAULT_WORKSPACE_POLICY.max_workflow_nodes ?? 30;
  const maxRuntime = policy.max_workflow_runtime_seconds ?? policy.max_workflow_runtime ?? DEFAULT_WORKSPACE_POLICY.max_workflow_runtime ?? 300;
  const requireApproval = policy.require_approval_for_deploy ?? policy.require_approval_for_deployment ?? DEFAULT_WORKSPACE_POLICY.require_approval_for_deployment ?? true;
  const maxAgentSteps = policy.max_agent_steps ?? DEFAULT_WORKSPACE_POLICY.max_agent_steps ?? 15;
  const maxToolCalls = policy.max_tool_calls ?? DEFAULT_WORKSPACE_POLICY.max_tool_calls ?? 20;

  return {
    workspace_id: workspaceId,
    require_approval_for_deployment: requireApproval,
    require_approval_for_deploy: requireApproval,
    allow_external_agents: policy.allow_external_agents ?? DEFAULT_WORKSPACE_POLICY.allow_external_agents ?? true,
    allow_mcp: policy.allow_mcp ?? DEFAULT_WORKSPACE_POLICY.allow_mcp ?? true,
    allow_marketplace_install: policy.allow_marketplace_install ?? DEFAULT_WORKSPACE_POLICY.allow_marketplace_install ?? true,
    allow_public_publishing: policy.allow_public_publishing ?? DEFAULT_WORKSPACE_POLICY.allow_public_publishing ?? false,
    max_workflow_runtime: maxRuntime,
    max_workflow_runtime_seconds: maxRuntime,
    max_workflow_nodes: maxNodes,
    max_nodes_per_workflow: maxNodes,
    max_agent_steps: maxAgentSteps,
    max_tool_calls: maxToolCalls,
    external_agent_allow_list: policy.external_agent_allow_list,
    mcp_allow_list: policy.mcp_allow_list,
    updated_at: policy.updated_at || new Date().toISOString(),
  };
};

export const getLocalPolicy = (workspaceId: string): WorkspacePolicy => {
  if (typeof window === 'undefined') {
    const mem = memoryPolicies.get(workspaceId);
    if (mem) return normalizePolicy(mem, workspaceId);
    return normalizePolicy(DEFAULT_WORKSPACE_POLICY, workspaceId);
  }
  try {
    const raw = localStorage.getItem(`${LOCAL_POLICIES_PREFIX}${workspaceId}`);
    if (raw) return normalizePolicy(JSON.parse(raw), workspaceId);
  } catch {}

  return normalizePolicy(DEFAULT_WORKSPACE_POLICY, workspaceId);
};

export const saveLocalPolicy = (workspaceId: string, policy: WorkspacePolicy): void => {
  const normalized = normalizePolicy(policy, workspaceId);
  memoryPolicies.set(workspaceId, normalized);
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${LOCAL_POLICIES_PREFIX}${workspaceId}`, JSON.stringify(normalized));
  } catch (err) {
    console.error('[NEXUS PolicyService] Failed to save local policy:', err);
  }
};

/**
 * Fetches the active security and execution policy for a workspace.
 */
export async function getWorkspacePolicy(workspaceId: string): Promise<WorkspacePolicy> {
  if (!workspaceId) {
    return normalizePolicy(DEFAULT_WORKSPACE_POLICY, 'default');
  }

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await (supabase.from('workspace_policies') as any)
        .select('*')
        .eq('workspace_id', workspaceId)
        .maybeSingle();

      if (!error && data) {
        return normalizePolicy(data, workspaceId);
      }
    } catch (e) {
      console.warn('[NEXUS PolicyService] Supabase query failed, falling back to local:', e);
    }
  }

  return getLocalPolicy(workspaceId);
}

/**
 * Updates workspace security policies. Requires 'policies.manage' permission (OWNER or ADMIN).
 */
export async function updateWorkspacePolicy(
  workspaceId: string,
  updates: Partial<Omit<WorkspacePolicy, 'workspace_id' | 'updated_at'>> & Record<string, any>,
  user?: { id: string } | string | null
): Promise<{ policy: WorkspacePolicy; error?: string }> {
  // Authorize
  const userId = typeof user === 'string' ? user : user?.id || 'admin_user';
  try {
    await requirePermission({
      user: { id: userId },
      workspaceId,
      permission: 'policies.manage',
    });
  } catch (err: any) {
    return {
      policy: await getWorkspacePolicy(workspaceId),
      error: err.message || 'Permission denied.',
    };
  }

  const current = await getWorkspacePolicy(workspaceId);

  const maxNodes = updates.max_nodes_per_workflow ?? updates.max_workflow_nodes ?? current.max_workflow_nodes ?? 30;
  const maxRuntime = updates.max_workflow_runtime_seconds ?? updates.max_workflow_runtime ?? current.max_workflow_runtime ?? 300;
  const requireApproval = updates.require_approval_for_deploy ?? updates.require_approval_for_deployment ?? current.require_approval_for_deployment ?? true;

  // Enforce sensible boundary constraints
  const updatedPolicy: WorkspacePolicy = {
    ...current,
    require_approval_for_deployment: requireApproval,
    require_approval_for_deploy: requireApproval,
    allow_external_agents: updates.allow_external_agents ?? current.allow_external_agents,
    allow_mcp: updates.allow_mcp ?? current.allow_mcp,
    allow_marketplace_install:
      updates.allow_marketplace_install ?? current.allow_marketplace_install,
    allow_public_publishing:
      updates.allow_public_publishing ?? current.allow_public_publishing,
    max_workflow_runtime: Math.min(Math.max(maxRuntime, 10), 1800),
    max_workflow_runtime_seconds: Math.min(Math.max(maxRuntime, 10), 1800),
    max_workflow_nodes: Math.min(Math.max(maxNodes, 2), 100),
    max_nodes_per_workflow: Math.min(Math.max(maxNodes, 2), 100),
    max_agent_steps: Math.min(
      Math.max(updates.max_agent_steps ?? current.max_agent_steps, 1),
      100
    ),
    max_tool_calls: Math.min(
      Math.max(updates.max_tool_calls ?? current.max_tool_calls, 1),
      50
    ),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      await (supabase.from('workspace_policies') as any).upsert({
        workspace_id: workspaceId,
        require_approval_for_deployment: updatedPolicy.require_approval_for_deployment,
        allow_external_agents: updatedPolicy.allow_external_agents,
        allow_mcp: updatedPolicy.allow_mcp,
        allow_marketplace_install: updatedPolicy.allow_marketplace_install,
        allow_public_publishing: updatedPolicy.allow_public_publishing,
        max_workflow_runtime: updatedPolicy.max_workflow_runtime,
        max_workflow_nodes: updatedPolicy.max_workflow_nodes,
        max_agent_steps: updatedPolicy.max_agent_steps,
        max_tool_calls: updatedPolicy.max_tool_calls,
        updated_at: updatedPolicy.updated_at,
      });
    } catch (e) {
      console.warn('[NEXUS PolicyService] Supabase upsert failed, saving locally:', e);
    }
  }

  saveLocalPolicy(workspaceId, updatedPolicy);

  await recordAuditLog({
    workspaceId,
    userId,
    action: 'POLICY_UPDATED',
    resourceType: 'workspace_policy',
    resourceId: workspaceId,
    metadata: { updates },
  });

  return { policy: updatedPolicy };
}

/**
 * Validates whether MCP tool execution is permitted by workspace policy.
 */
export async function checkMcpAllowed(workspaceId: string): Promise<boolean> {
  const policy = await getWorkspacePolicy(workspaceId);
  return policy.allow_mcp;
}

/**
 * Validates whether external A2A agents are permitted by workspace policy.
 */
export async function checkExternalAgentAllowed(workspaceId: string): Promise<boolean> {
  const policy = await getWorkspacePolicy(workspaceId);
  return policy.allow_external_agents;
}

/**
 * Validates whether marketplace installation is permitted.
 */
export async function checkMarketplaceInstallAllowed(workspaceId: string): Promise<boolean> {
  const policy = await getWorkspacePolicy(workspaceId);
  return policy.allow_marketplace_install ?? true;
}

/**
 * Validates whether public publishing to marketplace is permitted.
 */
export async function checkPublicPublishingAllowed(workspaceId: string): Promise<boolean> {
  const policy = await getWorkspacePolicy(workspaceId);
  return policy.allow_public_publishing ?? false;
}

/**
 * Computes effective runtime limits bounding requested agent/workflow parameters by policy ceilings.
 */
export async function getEffectiveExecutionLimits(
  workspaceId: string,
  requested?: {
    agentSteps?: number;
    workflowRuntimeSeconds?: number;
    toolCalls?: number;
  }
): Promise<{
  maxAgentSteps: number;
  maxWorkflowRuntimeMs: number;
  maxToolCalls: number;
}> {
  const policy = await getWorkspacePolicy(workspaceId);
  const maxRuntimeSec = policy.max_workflow_runtime ?? policy.max_workflow_runtime_seconds ?? 300;

  const maxAgentSteps = Math.min(
    Math.max(requested?.agentSteps || policy.max_agent_steps, 1),
    policy.max_agent_steps
  );

  const maxWorkflowRuntimeMs =
    Math.min(
      Math.max(requested?.workflowRuntimeSeconds || maxRuntimeSec, 10),
      maxRuntimeSec
    ) * 1000;

  const maxToolCalls = Math.min(
    Math.max(requested?.toolCalls || policy.max_tool_calls, 1),
    policy.max_tool_calls
  );

  return {
    maxAgentSteps,
    maxWorkflowRuntimeMs,
    maxToolCalls,
  };
}
