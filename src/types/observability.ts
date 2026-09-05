export type ExecutionEventSourceType =
  | 'workflow'
  | 'agent'
  | 'tool'
  | 'connector'
  | 'deployment'
  | 'approval';

export type ExecutionNodeStatus =
  | 'pending'
  | 'running'
  | 'waiting'
  | 'completed'
  | 'failed'
  | 'skipped'
  | 'cancelled';

export interface NormalizedExecutionEvent {
  id: string;
  execution_id: string;
  workspace_id: string;
  source_type: ExecutionEventSourceType;
  source_id?: string | null; // e.g., node_key, agent_id, tool_name
  event_type: string;        // e.g., 'WORKFLOW_STARTED', 'NODE_STARTED', 'TOOL_CALLED', 'APPROVAL_REQUESTED', etc.
  status: 'pending' | 'running' | 'waiting' | 'completed' | 'failed' | 'cancelled';
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface LiveNodeState {
  node_key: string;
  name: string;
  type: string;
  status: ExecutionNodeStatus;
  started_at?: string | null;
  completed_at?: string | null;
  duration_ms?: number;
  input_data?: Record<string, any>;
  output_data?: Record<string, any> | null;
  error?: string | null;
}

export interface LiveApprovalState {
  node_key: string;
  require_role?: string;
  title: string;
  description: string;
  status: 'waiting' | 'approved' | 'rejected' | 'expired';
  context?: Record<string, any>;
  resolved_at?: string | null;
  resolved_by?: string | null;
}

export interface LiveDeploymentState {
  deployment_id: string;
  project_name: string;
  status: 'QUEUED' | 'BUILDING' | 'READY' | 'ERROR' | 'CANCELLED';
  url?: string | null;
  commit_sha?: string | null;
  branch?: string;
  target?: string;
  started_at?: string;
  completed_at?: string | null;
  duration_ms?: number;
}

export interface LiveExecutionState {
  execution_id: string;
  workspace_id: string;
  workflow_id?: string;
  workflow_name?: string;
  status: 'running' | 'waiting_for_approval' | 'completed' | 'failed' | 'cancelled';
  started_at: string;
  completed_at?: string | null;
  duration_ms: number;
  current_node_key?: string | null;
  nodes: Record<string, LiveNodeState>;
  node_order: string[];
  events: NormalizedExecutionEvent[];
  approval?: LiveApprovalState | null;
  deployment?: LiveDeploymentState | null;
  error?: string | null;
  trigger_data?: Record<string, any>;
}

export interface SystemHealthCheckItem {
  id: string;
  name: string;
  category: 'connector' | 'ai_provider' | 'mcp' | 'a2a';
  status: 'healthy' | 'degraded' | 'unavailable' | 'not_configured';
  message: string;
  last_checked_at: string;
  details?: Record<string, any>;
}

export interface WorkspaceSystemHealth {
  workspace_id: string;
  status: 'healthy' | 'degraded' | 'unavailable';
  checks: SystemHealthCheckItem[];
  checked_at: string;
}

export interface UsageSummary {
  workspace_id: string;
  time_range: 'today' | '7d' | '30d' | 'all';
  total_workflow_runs: number;
  successful_workflow_runs: number;
  failed_workflow_runs: number;
  cancelled_workflow_runs: number;
  total_agent_runs: number;
  successful_agent_runs: number;
  failed_agent_runs: number;
  total_tool_calls: number;
  total_duration_ms: number;
  models_used: Record<string, number>;
  has_real_token_data: boolean;
  tokens_used?: number | null;
  generated_at: string;
}
