import { ExternalAgentStatus, ProtocolAuthType } from './database';

export interface AgentSkill {
  id: string;
  name: string;
  description: string;
  tags?: string[];
  parameters?: Record<string, any>;
  examples?: Array<{
    input: any;
    output: any;
  }>;
}

export interface AgentCard {
  name: string;
  description: string;
  version: string;
  provider?: {
    name: string;
    url?: string;
    organization?: string;
  };
  skills: AgentSkill[];
  capabilities?: string[];
  input_schema?: Record<string, any>;
  output_schema?: Record<string, any>;
  pricing?: {
    model: 'free' | 'per_request' | 'per_token';
    unit_price?: number;
    currency?: string;
  };
  tags?: string[];
  homepage?: string;
  privacy_policy_url?: string;
  terms_of_service_url?: string;
  created_at?: string;
}

export interface ExternalAgentConfig {
  id: string;
  workspace_id: string;
  name: string;
  slug: string;
  description?: string | null;
  endpoint_url: string;
  agent_card_url?: string | null;
  protocol_version: string;
  status: ExternalAgentStatus;
  agent_card: AgentCard;
  auth_type: ProtocolAuthType;
  header_name?: string | null;
  auth_token?: string | null;
  timeout_ms: number;
  last_ping_at?: string | null;
  last_error?: string | null;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface AddExternalAgentInput {
  workspace_id: string;
  name: string;
  slug?: string;
  description?: string;
  endpoint_url: string;
  agent_card_url?: string;
  auth_type?: ProtocolAuthType;
  header_name?: string;
  auth_token?: string;
  timeout_ms?: number;
}

export interface A2AInvocationRequest {
  skill?: string;
  message?: string;
  input: Record<string, any>;
  context?: Record<string, any>;
  stream?: boolean;
}

export interface A2AInvocationResponse {
  status: 'success' | 'failed' | 'in_progress';
  output: any;
  skill_used?: string;
  metrics?: {
    duration_ms: number;
    tokens_used?: number;
  };
  error?: string;
}
