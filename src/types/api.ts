// ====================================================================
// NEXUS PHASE 10: DEVELOPER PLATFORM & PUBLIC API TYPES
// ====================================================================

export type ApiErrorCode =
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMIT_EXCEEDED'
  | 'CONFLICT'
  | 'BAD_REQUEST'
  | 'INTERNAL_ERROR';

export interface ApiSuccessResponse<T = any> {
  data: T;
  request_id: string;
}

export interface ApiErrorResponse {
  error: {
    code: ApiErrorCode;
    message: string;
    request_id: string;
    details?: Record<string, any>;
  };
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface ApiV1Request {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  headers: Record<string, string | undefined>;
  query?: Record<string, string | undefined>;
  body?: any;
}

export interface ApiV1Response {
  status: number;
  headers: Record<string, string>;
  body: ApiResponse;
}

// --------------------------------------------------------------------
// Webhooks
// --------------------------------------------------------------------

export type WebhookEventType =
  | 'workflow.completed'
  | 'workflow.failed'
  | 'agent.completed'
  | 'agent.failed'
  | 'approval.requested'
  | 'deployment.ready'
  | 'ping';

export const ALL_WEBHOOK_EVENTS: { id: WebhookEventType; label: string; description: string }[] = [
  {
    id: 'workflow.completed',
    label: 'workflow.completed',
    description: 'Triggered when a multi-agent workflow finishes all execution steps successfully',
  },
  {
    id: 'workflow.failed',
    label: 'workflow.failed',
    description: 'Triggered when any workflow node fails or human approval is rejected',
  },
  {
    id: 'agent.completed',
    label: 'agent.completed',
    description: 'Triggered when an individual AI agent finishes reasoning and tool tasks',
  },
  {
    id: 'agent.failed',
    label: 'agent.failed',
    description: 'Triggered when an agent encounters an error or reaches policy execution limits',
  },
  {
    id: 'approval.requested',
    label: 'approval.requested',
    description: 'Triggered when a workflow pauses at an approval gate waiting for human sign-off',
  },
  {
    id: 'deployment.ready',
    label: 'deployment.ready',
    description: 'Triggered when an automated Vercel deployment step completes successfully',
  },
];

export interface DeveloperWebhook {
  id: string;
  workspace_id: string;
  url: string;
  secret_encrypted: string;
  events: WebhookEventType[];
  status: 'active' | 'disabled';
  description?: string | null;
  created_at: string;
  updated_at: string;
  // Non-persisted or masked secret for display
  secret_preview?: string;
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  workspace_id: string;
  event_id: string;
  event_type: WebhookEventType;
  payload: Record<string, any>;
  response_status?: number | null;
  response_body?: string | null;
  attempt_count: number;
  status: 'success' | 'failed' | 'retrying';
  delivered_at?: string | null;
  next_retry_at?: string | null;
  created_at: string;
}

export interface WebhookEventEnvelope<T = any> {
  event_id: string;
  type: WebhookEventType;
  timestamp: string;
  workspace_id: string;
  data: T;
}

// --------------------------------------------------------------------
// Idempotency
// --------------------------------------------------------------------

export interface IdempotencyRecord {
  id: string;
  workspace_id: string;
  idempotency_key: string;
  resource_type: string;
  resource_id?: string | null;
  execution_id: string;
  response_data?: any;
  created_at: string;
  expires_at: string;
}
