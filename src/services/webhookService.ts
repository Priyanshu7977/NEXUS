import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ExternalEvent, NormalizedGitHubPushEvent, WebhookVerificationResult } from '../types/event';
import { Workflow } from '../types/workflow';
import { getWorkflows } from './workflowService';
import { executeWorkflow } from '../runtime/workflowEngine';
import { logWorkspaceActivity } from './activityService';

const EXTERNAL_EVENTS_KEY = 'nexus_external_events_v5';

const GITHUB_WEBHOOK_SECRET: string =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GITHUB_WEBHOOK_SECRET) || '';

// ----------------------------------------------------------------------
// Cryptographic Timing-Safe Signature Verification
// ----------------------------------------------------------------------

/**
 * Constant-time byte array comparison to prevent timing attacks
 */
const timingSafeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
};

/**
 * Verifies GitHub HMAC-SHA256 signature (X-Hub-Signature-256)
 */
export const verifyGitHubWebhookSignature = async (
  payloadRaw: string,
  signatureHeader: string,
  secret: string = GITHUB_WEBHOOK_SECRET
): Promise<WebhookVerificationResult> => {
  if (!secret) {
    // If no secret configured in evaluation mode, accept with warning
    return { isValid: true };
  }

  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) {
    return { isValid: false, error: 'Missing or malformed X-Hub-Signature-256 header' };
  }

  try {
    const expectedSig = signatureHeader.slice(7); // Remove 'sha256=' prefix
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(payloadRaw);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const computedSig = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const isValid = timingSafeEqual(computedSig, expectedSig);
    return {
      isValid,
      error: isValid ? undefined : 'HMAC signature mismatch. Request rejected for security.',
    };
  } catch (err: any) {
    return { isValid: false, error: `Signature verification error: ${err.message}` };
  }
};

// ----------------------------------------------------------------------
// Payload Normalization
// ----------------------------------------------------------------------

/**
 * Normalizes raw GitHub Push payload into standard NEXUS trigger format
 */
export const normalizeGitHubPushEvent = (
  rawPayload: Record<string, any>,
  deliveryId: string
): NormalizedGitHubPushEvent => {
  const repo = rawPayload.repository || {};
  const headCommit = rawPayload.head_commit || (rawPayload.commits && rawPayload.commits[0]) || {};
  const sender = rawPayload.sender || {};
  const ref = rawPayload.ref || 'refs/heads/main';
  const branch = ref.replace(/^refs\/heads\//, '');

  return {
    event: 'github.push',
    delivery_id: deliveryId,
    repository: {
      id: repo.id || 0,
      name: repo.name || 'repository',
      full_name: repo.full_name || 'owner/repository',
      owner: repo.owner?.login || repo.owner?.name || 'owner',
      html_url: repo.html_url || `https://github.com/${repo.full_name || 'owner/repository'}`,
      default_branch: repo.default_branch || 'main',
    },
    ref,
    branch,
    commit: {
      sha: headCommit.id || rawPayload.after || '0000000',
      message: headCommit.message || 'Push commit updates',
      author: {
        name: headCommit.author?.name || sender.login || 'Developer',
        email: headCommit.author?.email || 'developer@example.com',
        username: headCommit.author?.username || sender.login,
      },
      added: headCommit.added || [],
      removed: headCommit.removed || [],
      modified: headCommit.modified || [],
      timestamp: headCommit.timestamp || new Date().toISOString(),
      url: headCommit.url || `${repo.html_url}/commit/${headCommit.id || ''}`,
    },
    sender: {
      login: sender.login || 'github-user',
      id: sender.id || 0,
      avatar_url: sender.avatar_url || 'https://github.com/ghost.png',
    },
  };
};

// ----------------------------------------------------------------------
// Event Persistence & Deduplication
// ----------------------------------------------------------------------

const getLocalExternalEvents = (): ExternalEvent[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(EXTERNAL_EVENTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    return [];
  }
  return [];
};

const saveLocalExternalEvents = (events: ExternalEvent[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(EXTERNAL_EVENTS_KEY, JSON.stringify(events));
  } catch (err) {
    console.error('Failed to persist external event locally:', err);
  }
};

export const saveExternalEventRecord = async (
  workspaceId: string,
  event: Omit<ExternalEvent, 'id' | 'created_at'>
): Promise<ExternalEvent> => {
  const localList = getLocalExternalEvents();
  const existingIdx = localList.findIndex(
    (e) => e.workspace_id === workspaceId && e.provider === event.provider && e.external_event_id === event.external_event_id
  );

  const fullRecord: ExternalEvent = {
    id: crypto.randomUUID(),
    workspace_id: workspaceId,
    provider: event.provider,
    event_type: event.event_type,
    external_event_id: event.external_event_id,
    payload: event.payload,
    received_at: event.received_at || new Date().toISOString(),
    processed_at: event.processed_at || null,
    status: event.status || 'RECEIVED',
    error: event.error || null,
    created_at: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    localList[existingIdx] = fullRecord;
  } else {
    localList.unshift(fullRecord);
  }
  saveLocalExternalEvents(localList);

  if (isSupabaseConfigured) {
    try {
      await (supabase.from('external_events') as any).upsert({
        id: fullRecord.id,
        workspace_id: workspaceId,
        provider: fullRecord.provider,
        event_type: fullRecord.event_type,
        external_event_id: fullRecord.external_event_id,
        payload: fullRecord.payload,
        received_at: fullRecord.received_at,
        processed_at: fullRecord.processed_at,
        status: fullRecord.status,
        error: fullRecord.error,
      });
    } catch (err) {
      console.warn('Supabase external_events sync error:', err);
    }
  }

  return fullRecord;
};

// ----------------------------------------------------------------------
// Workflow Matching Engine
// ----------------------------------------------------------------------

export const findMatchingWorkflowsForEvent = async (
  workspaceId: string,
  normalizedEvent: NormalizedGitHubPushEvent
): Promise<Workflow[]> => {
  const { workflows } = await getWorkflows(workspaceId);

  return workflows.filter((wf) => {
    // 1. Must be active
    if (wf.status !== 'active') return false;

    // 2. Must be GitHub event or webhook trigger
    if (wf.trigger_type !== 'github_event' && wf.trigger_type !== 'webhook') {
      return false;
    }

    const cfg = wf.trigger_config || {};

    // 3. Match Event Type (push)
    const eventMatch = !cfg.event || cfg.event === 'push' || cfg.event === 'github_event' || cfg.event === 'all';
    if (!eventMatch) return false;

    // 4. Match Repository
    const targetRepo = (cfg.repository || cfg.defaultRepo || '').toLowerCase().trim();
    if (targetRepo && targetRepo !== 'all' && targetRepo !== '*') {
      const eventRepoFull = normalizedEvent.repository.full_name.toLowerCase();
      const eventRepoName = normalizedEvent.repository.name.toLowerCase();
      if (targetRepo !== eventRepoFull && targetRepo !== eventRepoName) {
        return false;
      }
    }

    // 5. Match Branch
    const targetBranch = (cfg.branch || '').toLowerCase().trim();
    if (targetBranch && targetBranch !== 'all' && targetBranch !== '*') {
      if (targetBranch !== normalizedEvent.branch.toLowerCase()) {
        return false;
      }
    }

    return true;
  });
};

// ----------------------------------------------------------------------
// Webhook Processing Handler
// ----------------------------------------------------------------------

export interface ProcessWebhookInput {
  workspaceId: string;
  headers: Record<string, string>;
  rawBody: string;
  parsedBody: Record<string, any>;
}

export interface WebhookProcessResult {
  statusCode: number;
  status: 'PROCESSED' | 'IGNORED' | 'FAILED';
  deliveryId: string;
  matchedWorkflowsCount: number;
  triggeredExecutionIds: string[];
  message: string;
}

export const processGitHubWebhook = async (
  input: ProcessWebhookInput
): Promise<WebhookProcessResult> => {
  const { workspaceId, headers, rawBody, parsedBody } = input;
  const deliveryId = headers['x-github-delivery'] || headers['X-GitHub-Delivery'] || `del_${Date.now()}`;
  const eventType = headers['x-github-event'] || headers['X-GitHub-Event'] || 'push';
  const signature = headers['x-hub-signature-256'] || headers['X-Hub-Signature-256'] || '';

  // 1. Check Signature
  const sigVerify = await verifyGitHubWebhookSignature(rawBody, signature);
  if (!sigVerify.isValid) {
    await saveExternalEventRecord(workspaceId, {
      workspace_id: workspaceId,
      provider: 'github',
      event_type: eventType,
      external_event_id: deliveryId,
      payload: parsedBody,
      received_at: new Date().toISOString(),
      processed_at: new Date().toISOString(),
      status: 'FAILED',
      error: sigVerify.error || 'Signature verification failed',
    });

    return {
      statusCode: 401,
      status: 'FAILED',
      deliveryId,
      matchedWorkflowsCount: 0,
      triggeredExecutionIds: [],
      message: sigVerify.error || 'Invalid signature',
    };
  }

  // 2. Replay / Deduplication Check
  const localList = getLocalExternalEvents();
  const existing = localList.find(
    (e) => e.workspace_id === workspaceId && e.provider === 'github' && e.external_event_id === deliveryId
  );
  if (existing) {
    return {
      statusCode: 200,
      status: 'IGNORED',
      deliveryId,
      matchedWorkflowsCount: 0,
      triggeredExecutionIds: [],
      message: `Delivery ${deliveryId} has already been processed. Replay ignored.`,
    };
  }

  // 3. Support only push events in this phase
  if (eventType !== 'push') {
    await saveExternalEventRecord(workspaceId, {
      workspace_id: workspaceId,
      provider: 'github',
      event_type: eventType,
      external_event_id: deliveryId,
      payload: parsedBody,
      received_at: new Date().toISOString(),
      processed_at: new Date().toISOString(),
      status: 'IGNORED',
      error: `Event type "${eventType}" is received but only "push" triggers automated pipelines in this phase.`,
    });

    return {
      statusCode: 200,
      status: 'IGNORED',
      deliveryId,
      matchedWorkflowsCount: 0,
      triggeredExecutionIds: [],
      message: `Event ${eventType} acknowledged. Only push triggers are currently active.`,
    };
  }

  // 4. Normalize Payload
  const normalized = normalizeGitHubPushEvent(parsedBody, deliveryId);

  // 5. Match Subscribed Workflows
  const matchingWorkflows = await findMatchingWorkflowsForEvent(workspaceId, normalized);

  const triggeredExecutionIds: string[] = [];

  // 6. Record Initial Ingested Event
  await saveExternalEventRecord(workspaceId, {
    workspace_id: workspaceId,
    provider: 'github',
    event_type: eventType,
    external_event_id: deliveryId,
    payload: normalized as any,
    received_at: new Date().toISOString(),
    processed_at: new Date().toISOString(),
    status: matchingWorkflows.length > 0 ? 'PROCESSED' : 'IGNORED',
    error: matchingWorkflows.length > 0 ? null : 'No active workflows subscribed to this repository and branch.',
  });

  // 7. Log Activity
  await logWorkspaceActivity(workspaceId, {
    type: 'connector',
    action: 'github_webhook_received',
    name: `GitHub Push: ${normalized.repository.name} (${normalized.branch})`,
    status: 'completed',
    details: `Commit ${normalized.commit.sha.slice(0, 7)} by ${normalized.sender.login}: "${normalized.commit.message.slice(0, 60)}"`,
    metadata: {
      deliveryId,
      repo: normalized.repository.full_name,
      branch: normalized.branch,
      matchedWorkflows: matchingWorkflows.length,
    },
  });

  // 8. Trigger Workflows Asynchronously
  for (const wf of matchingWorkflows) {
    // Trigger execution
    try {
      const exec = await executeWorkflow({
        workspaceId,
        workflowId: wf.id,
        triggerData: {
          event: normalized.event,
          delivery_id: normalized.delivery_id,
          repository: normalized.repository.full_name,
          repo_name: normalized.repository.name,
          branch: normalized.branch,
          commit: normalized.commit,
          sender: normalized.sender,
          input: `Automated GitHub push on ${normalized.repository.full_name} (${normalized.branch}): ${normalized.commit.message}`,
        },
      });
      triggeredExecutionIds.push(exec.id);
    } catch (err: any) {
      console.error(`[NEXUS Webhook] Error triggering workflow ${wf.name}:`, err);
    }
  }

  return {
    statusCode: 200,
    status: 'PROCESSED',
    deliveryId,
    matchedWorkflowsCount: matchingWorkflows.length,
    triggeredExecutionIds,
    message: `Processed GitHub push event for ${normalized.repository.full_name}. Triggered ${matchingWorkflows.length} workflow(s).`,
  };
};
