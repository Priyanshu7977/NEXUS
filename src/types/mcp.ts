import { McpTransportType, McpServerStatus, ProtocolAuthType } from './database';

export interface McpJsonRpcRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: Record<string, any>;
}

export interface McpJsonRpcResponse<T = any> {
  jsonrpc: '2.0';
  id: string | number;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export interface McpToolInputSchema {
  type: 'object';
  properties?: Record<string, {
    type?: string;
    description?: string;
    enum?: string[];
    default?: any;
    items?: any;
    [key: string]: any;
  }>;
  required?: string[];
  additionalProperties?: boolean;
}

export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: McpToolInputSchema;
  is_high_risk?: boolean;
  risk_reason?: string;
  required_permissions?: string[];
}

export interface McpServerCapabilities {
  tools?: {
    listChanged?: boolean;
  };
  resources?: {
    subscribe?: boolean;
    listChanged?: boolean;
  };
  prompts?: {
    listChanged?: boolean;
  };
  logging?: Record<string, any>;
}

export interface McpInitializeResult {
  protocolVersion: string;
  capabilities: McpServerCapabilities;
  serverInfo: {
    name: string;
    version: string;
    description?: string;
  };
}

export interface McpToolsListResult {
  tools: McpToolDefinition[];
  nextCursor?: string;
}

export interface McpToolCallResult {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}

export interface McpServerConfig {
  id: string;
  workspace_id: string;
  name: string;
  slug: string;
  description?: string | null;
  server_url: string;
  transport_type: McpTransportType;
  status: McpServerStatus;
  protocol_version: string;
  capabilities: McpToolDefinition[];
  enabled_tools: string[];
  auth_type?: ProtocolAuthType;
  header_name?: string | null;
  auth_token?: string | null;
  last_ping_at?: string | null;
  last_error?: string | null;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface AddMcpServerInput {
  workspace_id: string;
  name: string;
  slug?: string;
  description?: string;
  server_url: string;
  transport_type: McpTransportType;
  auth_type?: ProtocolAuthType;
  header_name?: string;
  auth_token?: string;
  enabled_tools?: string[];
}
