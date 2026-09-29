export type AgentStatus = 'draft' | 'active' | 'paused' | 'archived';
export type AgentModelProvider = 'gemini' | 'openai' | 'anthropic' | 'deepseek' | 'groq' | 'mistral' | 'meta';
export type AgentPermissionMode = 'read_only' | 'read_write' | 'allowed';

export interface AgentToolPermission {
  id: string;
  agent_id: string;
  connector_id: string;
  capability: string;
  permission_mode: AgentPermissionMode;
  created_at: string;
}

export interface Agent {
  id: string;
  workspace_id: string;
  name: string;
  slug: string;
  role?: string;
  description: string;
  instructions: string;
  model_provider: AgentModelProvider;
  model_name: string;
  status: AgentStatus;
  temperature: number;
  max_steps: number;
  max_runtime_seconds: number;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  tools?: AgentToolPermission[];
}

export type AgentExecutionStatus =
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'limit_reached';

export type AgentExecutionEventType =
  | 'AGENT_STARTED'
  | 'MODEL_REQUEST'
  | 'TOOL_CALL'
  | 'TOOL_RESULT'
  | 'MODEL_RESPONSE'
  | 'AGENT_COMPLETED'
  | 'AGENT_FAILED'
  | 'LIMIT_REACHED';

export interface AgentExecutionEvent {
  id: string;
  execution_id: string;
  event_type: AgentExecutionEventType;
  tool_name?: string | null;
  status: 'completed' | 'running' | 'failed';
  message: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface AgentExecution {
  id: string;
  workspace_id: string;
  agent_id: string;
  status: AgentExecutionStatus;
  input: string;
  output: string | null;
  error: string | null;
  started_at: string;
  completed_at: string | null;
  steps_used: number;
  duration_ms: number;
  model: string | null;
  tokens_used: number | null;
  created_at: string;
  events?: AgentExecutionEvent[];
  agent?: Partial<Agent>;
}

export interface CreateAgentInput {
  name: string;
  role?: string;
  description?: string;
  instructions: string;
  model_provider?: AgentModelProvider;
  model_name?: string;
  status?: AgentStatus;
  temperature?: number;
  max_steps?: number;
  max_runtime_seconds?: number;
  tools?: {
    connector_id: string;
    capability: string;
    permission_mode?: AgentPermissionMode;
  }[];
}

export interface UpdateAgentInput {
  name?: string;
  role?: string;
  description?: string;
  instructions?: string;
  model_provider?: AgentModelProvider;
  model_name?: string;
  status?: AgentStatus;
  temperature?: number;
  max_steps?: number;
  max_runtime_seconds?: number;
  tools?: {
    connector_id: string;
    capability: string;
    permission_mode?: AgentPermissionMode;
  }[];
}
