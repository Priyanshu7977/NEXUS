export type WorkflowNodeType =
  | 'TRIGGER'
  | 'AGENT'
  | 'EXTERNAL_AGENT'
  | 'TOOL'
  | 'CONDITION'
  | 'APPROVAL'
  | 'OUTPUT';

export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'archived';

export type WorkflowTriggerType =
  | 'manual'
  | 'github_event'
  | 'schedule_cron'
  | 'webhook'
  | 'event';

export interface WorkflowNode {
  id?: string;
  workflow_id?: string;
  node_key: string;
  node_type: WorkflowNodeType;
  name: string;
  config: Record<string, any>;
  position_x: number;
  position_y: number;
  status?: 'idle' | 'pending' | 'running' | 'waiting_for_approval' | 'completed' | 'skipped' | 'failed';
  created_at?: string;
}

export interface WorkflowEdge {
  id?: string;
  workflow_id?: string;
  source_node_key: string;
  target_node_key: string;
  source_handle?: string;
  target_handle?: string;
  condition_expression?: string;
  created_at?: string;
}

export interface Workflow {
  id: string;
  workspace_id: string;
  name: string;
  slug: string;
  description: string;
  status: WorkflowStatus;
  trigger_type: WorkflowTriggerType;
  trigger_config: Record<string, any>;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export type WorkflowExecutionStatus =
  | 'queued'
  | 'running'
  | 'waiting_for_approval'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type WorkflowExecutionEventType =
  | 'WORKFLOW_STARTED'
  | 'NODE_STARTED'
  | 'NODE_COMPLETED'
  | 'NODE_SKIPPED'
  | 'APPROVAL_REQUESTED'
  | 'APPROVAL_DECISION'
  | 'TOOL_EXECUTED'
  | 'AGENT_EXECUTED'
  | 'EXTERNAL_AGENT_INVOKED'
  | 'MCP_TOOL_EXECUTED'
  | 'WORKFLOW_COMPLETED'
  | 'WORKFLOW_FAILED'
  | 'WORKFLOW_CANCELLED'
  | 'WORKFLOW_PAUSED';

export interface WorkflowExecutionNode {
  id: string;
  execution_id: string;
  node_key: string;
  node_type: WorkflowNodeType;
  status: 'pending' | 'running' | 'waiting_for_approval' | 'completed' | 'skipped' | 'failed';
  input_data: Record<string, any>;
  output_data: Record<string, any> | null;
  error: string | null;
  started_at: string | null;
  completed_at: string | null;
  duration_ms: number;
  created_at: string;
}

export interface WorkflowExecutionEvent {
  id: string;
  execution_id: string;
  event_type: WorkflowExecutionEventType;
  node_key?: string | null;
  status: 'completed' | 'running' | 'failed' | 'waiting_for_approval';
  message: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface WorkflowExecution {
  id: string;
  workspace_id: string;
  workflow_id: string;
  status: WorkflowExecutionStatus;
  trigger_data: Record<string, any>;
  context_data: Record<string, any>;
  output_data: Record<string, any> | null;
  error: string | null;
  started_at: string;
  completed_at: string | null;
  duration_ms: number;
  current_node_key: string | null;
  created_at: string;
  nodes?: WorkflowExecutionNode[];
  events?: WorkflowExecutionEvent[];
  workflow?: Partial<Workflow>;
}

export interface CreateWorkflowInput {
  name: string;
  slug?: string;
  description?: string;
  status?: WorkflowStatus;
  trigger_type?: WorkflowTriggerType;
  trigger_config?: Record<string, any>;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface UpdateWorkflowInput {
  name?: string;
  slug?: string;
  description?: string;
  status?: WorkflowStatus;
  trigger_type?: WorkflowTriggerType;
  trigger_config?: Record<string, any>;
  nodes?: WorkflowNode[];
  edges?: WorkflowEdge[];
}

export interface RunWorkflowInput {
  workspaceId: string;
  workflowId: string;
  userId?: string;
  triggerData?: Record<string, any>;
  onEvent?: (event: WorkflowExecutionEvent) => void;
}

export interface ApprovalDecisionInput {
  workspaceId: string;
  executionId: string;
  nodeKey: string;
  decision: 'approve' | 'reject';
  notes?: string;
  decidedBy?: string;
  userId?: string;
  onEvent?: (event: WorkflowExecutionEvent) => void;
}
