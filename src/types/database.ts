export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type WorkspaceRole = 'owner' | 'admin' | 'member';

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  role?: WorkspaceRole;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  created_at: string;
  profile?: Profile;
}

export type ConnectionStatus = 'connected' | 'disconnected' | 'error' | 'reauth_required';

export interface ConnectorConnection {
  id: string;
  workspace_id: string;
  connector_id: string;
  provider_account_id: string;
  provider_account_name: string;
  provider_avatar_url: string | null;
  status: ConnectionStatus;
  scopes: string[];
  encrypted_access_token: string | null;
  encrypted_refresh_token: string | null;
  token_expires_at: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  last_used_at: string | null;
}

export interface WorkspaceActivity {
  id: string;
  workspace_id: string;
  type: 'connector' | 'agent' | 'workflow' | 'system';
  action: string;
  name: string;
  status: 'completed' | 'running' | 'failed';
  duration?: string;
  details: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export type McpTransportType = 'sse' | 'streamable_http' | 'stdio' | 'websocket';
export type McpServerStatus = 'connected' | 'disconnected' | 'error' | 'connecting';
export type ProtocolAuthType = 'none' | 'bearer' | 'api_key' | 'custom_header';
export type ExternalAgentStatus = 'active' | 'offline' | 'error' | 'pending_verification';

export interface McpServerRow {
  id: string;
  workspace_id: string;
  name: string;
  slug: string;
  description: string | null;
  server_url: string;
  transport_type: McpTransportType;
  status: McpServerStatus;
  protocol_version: string;
  capabilities: any[];
  enabled_tools: string[];
  last_ping_at: string | null;
  last_error: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface McpCredentialRow {
  id: string;
  mcp_server_id: string;
  auth_type: ProtocolAuthType;
  header_name: string | null;
  encrypted_secret: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExternalAgentRow {
  id: string;
  workspace_id: string;
  name: string;
  slug: string;
  description: string | null;
  endpoint_url: string;
  agent_card_url: string | null;
  protocol_version: string;
  status: ExternalAgentStatus;
  agent_card: Record<string, any>;
  auth_type: ProtocolAuthType;
  header_name: string | null;
  encrypted_secret: string | null;
  timeout_ms: number;
  last_ping_at: string | null;
  last_error: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PublisherRow {
  id: string;
  workspace_id: string;
  name: string;
  slug: string;
  description: string | null;
  publisher_type: string;
  website_url: string | null;
  support_email: string | null;
  github_handle: string | null;
  avatar_url: string | null;
  verified: boolean;
  verification_badge: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceResourceRow {
  id: string;
  workspace_id: string;
  publisher_id: string;
  type: string;
  name: string;
  slug: string;
  summary: string;
  description: string;
  icon_url: string | null;
  banner_url: string | null;
  version: string;
  latest_version: string;
  visibility: string;
  is_verified: boolean;
  verification_status: string;
  spec: Record<string, any>;
  required_connectors: string[];
  required_capabilities: string[];
  tags: string[];
  categories: string[];
  install_count: number;
  view_count: number;
  documentation_url: string | null;
  repository_url: string | null;
  license: string;
  is_deprecated: boolean;
  deprecation_reason: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceInstallationRow {
  id: string;
  workspace_id: string;
  resource_id: string;
  installed_version: string;
  installed_resource_id: string | null;
  status: string;
  granted_permissions: string[];
  configuration: Record<string, any>;
  installed_by: string;
  installed_at: string;
  updated_at: string;
}

export interface MarketplaceReportRow {
  id: string;
  resource_id: string;
  reporter_workspace_id: string;
  reporter_user_id: string;
  category: string;
  details: string;
  status: string;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceReviewRow {
  id: string;
  resource_id: string;
  workspace_id: string;
  user_id: string;
  rating: number;
  review_title: string | null;
  review_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      workspaces: {
        Row: Workspace;
        Insert: {
          id?: string;
          name: string;
          slug: string;
          owner_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          owner_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      workspace_members: {
        Row: WorkspaceMember;
        Insert: {
          id?: string;
          workspace_id: string;
          user_id: string;
          role?: WorkspaceRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          user_id?: string;
          role?: WorkspaceRole;
          created_at?: string;
        };
        Relationships: [];
      };
      connector_connections: {
        Row: ConnectorConnection;
        Insert: {
          id?: string;
          workspace_id: string;
          connector_id: string;
          provider_account_id: string;
          provider_account_name: string;
          provider_avatar_url?: string | null;
          status?: ConnectionStatus;
          scopes?: string[];
          encrypted_access_token?: string | null;
          encrypted_refresh_token?: string | null;
          token_expires_at?: string | null;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
          last_used_at?: string | null;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          connector_id?: string;
          provider_account_id?: string;
          provider_account_name?: string;
          provider_avatar_url?: string | null;
          status?: ConnectionStatus;
          scopes?: string[];
          encrypted_access_token?: string | null;
          encrypted_refresh_token?: string | null;
          token_expires_at?: string | null;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
          last_used_at?: string | null;
        };
        Relationships: [];
      };
      workspace_activities: {
        Row: WorkspaceActivity;
        Insert: {
          id?: string;
          workspace_id: string;
          type: 'connector' | 'agent' | 'workflow' | 'system';
          action: string;
          name: string;
          status: 'completed' | 'running' | 'failed';
          duration?: string;
          details: string;
          metadata?: Record<string, any>;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          type?: 'connector' | 'agent' | 'workflow' | 'system';
          action?: string;
          name?: string;
          status?: 'completed' | 'running' | 'failed';
          duration?: string;
          details?: string;
          metadata?: Record<string, any>;
          created_at?: string;
        };
        Relationships: [];
      };
      agents: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          slug: string;
          role?: string | null;
          description: string | null;
          instructions: string;
          model_provider: string;
          model_name: string;
          status: 'draft' | 'active' | 'paused' | 'archived';
          temperature: number;
          max_steps: number;
          max_runtime_seconds: number;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          slug: string;
          role?: string | null;
          description?: string | null;
          instructions: string;
          model_provider?: string;
          model_name?: string;
          status?: 'draft' | 'active' | 'paused' | 'archived';
          temperature?: number;
          max_steps?: number;
          max_runtime_seconds?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          slug?: string;
          role?: string | null;
          description?: string | null;
          instructions?: string;
          model_provider?: string;
          model_name?: string;
          status?: 'draft' | 'active' | 'paused' | 'archived';
          temperature?: number;
          max_steps?: number;
          max_runtime_seconds?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      agent_tools: {
        Row: {
          id: string;
          agent_id: string;
          connector_id: string;
          capability: string;
          permission_mode: 'read_only' | 'read_write' | 'allowed';
          created_at: string;
        };
        Insert: {
          id?: string;
          agent_id: string;
          connector_id: string;
          capability: string;
          permission_mode?: 'read_only' | 'read_write' | 'allowed';
          created_at?: string;
        };
        Update: {
          id?: string;
          agent_id?: string;
          connector_id?: string;
          capability?: string;
          permission_mode?: 'read_only' | 'read_write' | 'allowed';
          created_at?: string;
        };
        Relationships: [];
      };
      agent_executions: {
        Row: {
          id: string;
          workspace_id: string;
          agent_id: string;
          status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'limit_reached';
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
        };
        Insert: {
          id?: string;
          workspace_id: string;
          agent_id: string;
          status?: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'limit_reached';
          input: string;
          output?: string | null;
          error?: string | null;
          started_at?: string;
          completed_at?: string | null;
          steps_used?: number;
          duration_ms?: number;
          model?: string | null;
          tokens_used?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          agent_id?: string;
          status?: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'limit_reached';
          input?: string;
          output?: string | null;
          error?: string | null;
          started_at?: string;
          completed_at?: string | null;
          steps_used?: number;
          duration_ms?: number;
          model?: string | null;
          tokens_used?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      agent_execution_events: {
        Row: {
          id: string;
          execution_id: string;
          event_type: 'AGENT_STARTED' | 'MODEL_REQUEST' | 'TOOL_CALL' | 'TOOL_RESULT' | 'MODEL_RESPONSE' | 'AGENT_COMPLETED' | 'AGENT_FAILED' | 'LIMIT_REACHED';
          tool_name: string | null;
          status: string;
          message: string;
          metadata: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: string;
          execution_id: string;
          event_type: 'AGENT_STARTED' | 'MODEL_REQUEST' | 'TOOL_CALL' | 'TOOL_RESULT' | 'MODEL_RESPONSE' | 'AGENT_COMPLETED' | 'AGENT_FAILED' | 'LIMIT_REACHED';
          tool_name?: string | null;
          status?: string;
          message: string;
          metadata?: Record<string, any>;
          created_at?: string;
        };
        Update: {
          id?: string;
          execution_id?: string;
          event_type?: 'AGENT_STARTED' | 'MODEL_REQUEST' | 'TOOL_CALL' | 'TOOL_RESULT' | 'MODEL_RESPONSE' | 'AGENT_COMPLETED' | 'AGENT_FAILED' | 'LIMIT_REACHED';
          tool_name?: string | null;
          status?: string;
          message?: string;
          metadata?: Record<string, any>;
          created_at?: string;
        };
        Relationships: [];
      };
      workflows: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          slug: string;
          description: string | null;
          status: 'draft' | 'active' | 'paused' | 'archived';
          trigger_type: 'manual' | 'github_event' | 'schedule_cron' | 'webhook';
          trigger_config: Record<string, any>;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          slug: string;
          description?: string | null;
          status?: 'draft' | 'active' | 'paused' | 'archived';
          trigger_type?: 'manual' | 'github_event' | 'schedule_cron' | 'webhook';
          trigger_config?: Record<string, any>;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          status?: 'draft' | 'active' | 'paused' | 'archived';
          trigger_type?: 'manual' | 'github_event' | 'schedule_cron' | 'webhook';
          trigger_config?: Record<string, any>;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      workflow_nodes: {
        Row: {
          id: string;
          workflow_id: string;
          node_key: string;
          node_type: string;
          name: string;
          config: Record<string, any>;
          position_x: number;
          position_y: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          workflow_id: string;
          node_key: string;
          node_type: string;
          name: string;
          config?: Record<string, any>;
          position_x?: number;
          position_y?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          workflow_id?: string;
          node_key?: string;
          node_type?: string;
          name?: string;
          config?: Record<string, any>;
          position_x?: number;
          position_y?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      workflow_edges: {
        Row: {
          id: string;
          workflow_id: string;
          source_node_key: string;
          target_node_key: string;
          source_handle: string | null;
          target_handle: string | null;
          condition_expression: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workflow_id: string;
          source_node_key: string;
          target_node_key: string;
          source_handle?: string | null;
          target_handle?: string | null;
          condition_expression?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          workflow_id?: string;
          source_node_key?: string;
          target_node_key?: string;
          source_handle?: string | null;
          target_handle?: string | null;
          condition_expression?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      workflow_executions: {
        Row: {
          id: string;
          workspace_id: string;
          workflow_id: string;
          status: 'queued' | 'running' | 'waiting_for_approval' | 'completed' | 'failed' | 'cancelled';
          trigger_data: Record<string, any>;
          context_data: Record<string, any>;
          output_data: Record<string, any> | null;
          error: string | null;
          started_at: string;
          completed_at: string | null;
          duration_ms: number;
          current_node_key: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          workflow_id: string;
          status?: 'queued' | 'running' | 'waiting_for_approval' | 'completed' | 'failed' | 'cancelled';
          trigger_data?: Record<string, any>;
          context_data?: Record<string, any>;
          output_data?: Record<string, any> | null;
          error?: string | null;
          started_at?: string;
          completed_at?: string | null;
          duration_ms?: number;
          current_node_key?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          workflow_id?: string;
          status?: 'queued' | 'running' | 'waiting_for_approval' | 'completed' | 'failed' | 'cancelled';
          trigger_data?: Record<string, any>;
          context_data?: Record<string, any>;
          output_data?: Record<string, any> | null;
          error?: string | null;
          started_at?: string;
          completed_at?: string | null;
          duration_ms?: number;
          current_node_key?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      workflow_execution_nodes: {
        Row: {
          id: string;
          execution_id: string;
          node_key: string;
          node_type: string;
          status: 'pending' | 'running' | 'waiting_for_approval' | 'completed' | 'skipped' | 'failed';
          input_data: Record<string, any>;
          output_data: Record<string, any> | null;
          error: string | null;
          started_at: string | null;
          completed_at: string | null;
          duration_ms: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          execution_id: string;
          node_key: string;
          node_type: string;
          status?: 'pending' | 'running' | 'waiting_for_approval' | 'completed' | 'skipped' | 'failed';
          input_data?: Record<string, any>;
          output_data?: Record<string, any> | null;
          error?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          duration_ms?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          execution_id?: string;
          node_key?: string;
          node_type?: string;
          status?: 'pending' | 'running' | 'waiting_for_approval' | 'completed' | 'skipped' | 'failed';
          input_data?: Record<string, any>;
          output_data?: Record<string, any> | null;
          error?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          duration_ms?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      workflow_execution_events: {
        Row: {
          id: string;
          execution_id: string;
          event_type: 'WORKFLOW_STARTED' | 'NODE_STARTED' | 'NODE_COMPLETED' | 'NODE_SKIPPED' | 'APPROVAL_REQUESTED' | 'APPROVAL_DECISION' | 'TOOL_EXECUTED' | 'AGENT_EXECUTED' | 'WORKFLOW_COMPLETED' | 'WORKFLOW_FAILED' | 'WORKFLOW_PAUSED';
          node_key: string | null;
          status: string;
          message: string;
          metadata: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: string;
          execution_id: string;
          event_type: 'WORKFLOW_STARTED' | 'NODE_STARTED' | 'NODE_COMPLETED' | 'NODE_SKIPPED' | 'APPROVAL_REQUESTED' | 'APPROVAL_DECISION' | 'TOOL_EXECUTED' | 'AGENT_EXECUTED' | 'WORKFLOW_COMPLETED' | 'WORKFLOW_FAILED' | 'WORKFLOW_PAUSED';
          node_key?: string | null;
          status?: string;
          message: string;
          metadata?: Record<string, any>;
          created_at?: string;
        };
        Update: {
          id?: string;
          execution_id?: string;
          event_type?: 'WORKFLOW_STARTED' | 'NODE_STARTED' | 'NODE_COMPLETED' | 'NODE_SKIPPED' | 'APPROVAL_REQUESTED' | 'APPROVAL_DECISION' | 'TOOL_EXECUTED' | 'AGENT_EXECUTED' | 'WORKFLOW_COMPLETED' | 'WORKFLOW_FAILED' | 'WORKFLOW_PAUSED';
          node_key?: string | null;
          status?: string;
          message?: string;
          metadata?: Record<string, any>;
          created_at?: string;
        };
        Relationships: [];
      };
      external_events: {
        Row: {
          id: string;
          workspace_id: string;
          provider: 'github' | 'vercel' | 'webhook';
          event_type: string;
          external_event_id: string;
          payload: Record<string, any>;
          received_at: string;
          processed_at: string | null;
          status: 'RECEIVED' | 'PROCESSING' | 'PROCESSED' | 'FAILED' | 'IGNORED';
          error: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          provider: 'github' | 'vercel' | 'webhook';
          event_type: string;
          external_event_id: string;
          payload?: Record<string, any>;
          received_at?: string;
          processed_at?: string | null;
          status?: 'RECEIVED' | 'PROCESSING' | 'PROCESSED' | 'FAILED' | 'IGNORED';
          error?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          provider?: 'github' | 'vercel' | 'webhook';
          event_type?: string;
          external_event_id?: string;
          payload?: Record<string, any>;
          received_at?: string;
          processed_at?: string | null;
          status?: 'RECEIVED' | 'PROCESSING' | 'PROCESSED' | 'FAILED' | 'IGNORED';
          error?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      deployments: {
        Row: {
          id: string;
          workspace_id: string;
          workflow_execution_id: string | null;
          connector_connection_id: string | null;
          project_id: string;
          project_name: string;
          external_deployment_id: string;
          status: 'QUEUED' | 'BUILDING' | 'READY' | 'ERROR' | 'CANCELLED';
          url: string | null;
          commit_sha: string | null;
          branch: string | null;
          target: 'production' | 'preview';
          metadata: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          workflow_execution_id?: string | null;
          connector_connection_id?: string | null;
          project_id: string;
          project_name: string;
          external_deployment_id: string;
          status?: 'QUEUED' | 'BUILDING' | 'READY' | 'ERROR' | 'CANCELLED';
          url?: string | null;
          commit_sha?: string | null;
          branch?: string | null;
          target?: 'production' | 'preview';
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          workflow_execution_id?: string | null;
          connector_connection_id?: string | null;
          project_id?: string;
          project_name?: string;
          external_deployment_id?: string;
          status?: 'QUEUED' | 'BUILDING' | 'READY' | 'ERROR' | 'CANCELLED';
          url?: string | null;
          commit_sha?: string | null;
          branch?: string | null;
          target?: 'production' | 'preview';
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      mcp_servers: {
        Row: McpServerRow;
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          slug: string;
          description?: string | null;
          server_url: string;
          transport_type?: McpTransportType;
          status?: McpServerStatus;
          protocol_version?: string;
          capabilities?: any[];
          enabled_tools?: string[];
          last_ping_at?: string | null;
          last_error?: string | null;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          server_url?: string;
          transport_type?: McpTransportType;
          status?: McpServerStatus;
          protocol_version?: string;
          capabilities?: any[];
          enabled_tools?: string[];
          last_ping_at?: string | null;
          last_error?: string | null;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      mcp_credentials: {
        Row: McpCredentialRow;
        Insert: {
          id?: string;
          mcp_server_id: string;
          auth_type?: ProtocolAuthType;
          header_name?: string | null;
          encrypted_secret?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          mcp_server_id?: string;
          auth_type?: ProtocolAuthType;
          header_name?: string | null;
          encrypted_secret?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      external_agents: {
        Row: ExternalAgentRow;
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          slug: string;
          description?: string | null;
          endpoint_url: string;
          agent_card_url?: string | null;
          protocol_version?: string;
          status?: ExternalAgentStatus;
          agent_card?: Record<string, any>;
          auth_type?: ProtocolAuthType;
          header_name?: string | null;
          encrypted_secret?: string | null;
          timeout_ms?: number;
          last_ping_at?: string | null;
          last_error?: string | null;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          endpoint_url?: string;
          agent_card_url?: string | null;
          protocol_version?: string;
          status?: ExternalAgentStatus;
          agent_card?: Record<string, any>;
          auth_type?: ProtocolAuthType;
          header_name?: string | null;
          encrypted_secret?: string | null;
          timeout_ms?: number;
          last_ping_at?: string | null;
          last_error?: string | null;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      publishers: {
        Row: PublisherRow;
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          slug: string;
          description?: string | null;
          publisher_type?: string;
          website_url?: string | null;
          support_email?: string | null;
          github_handle?: string | null;
          avatar_url?: string | null;
          verified?: boolean;
          verification_badge?: string;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          publisher_type?: string;
          website_url?: string | null;
          support_email?: string | null;
          github_handle?: string | null;
          avatar_url?: string | null;
          verified?: boolean;
          verification_badge?: string;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      marketplace_resources: {
        Row: MarketplaceResourceRow;
        Insert: {
          id?: string;
          workspace_id: string;
          publisher_id: string;
          type: string;
          name: string;
          slug: string;
          summary: string;
          description?: string;
          icon_url?: string | null;
          banner_url?: string | null;
          version?: string;
          latest_version?: string;
          visibility?: string;
          is_verified?: boolean;
          verification_status?: string;
          spec?: Record<string, any>;
          required_connectors?: string[];
          required_capabilities?: string[];
          tags?: string[];
          categories?: string[];
          install_count?: number;
          view_count?: number;
          documentation_url?: string | null;
          repository_url?: string | null;
          license?: string;
          is_deprecated?: boolean;
          deprecation_reason?: string | null;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          publisher_id?: string;
          type?: string;
          name?: string;
          slug?: string;
          summary?: string;
          description?: string;
          icon_url?: string | null;
          banner_url?: string | null;
          version?: string;
          latest_version?: string;
          visibility?: string;
          is_verified?: boolean;
          verification_status?: string;
          spec?: Record<string, any>;
          required_connectors?: string[];
          required_capabilities?: string[];
          tags?: string[];
          categories?: string[];
          install_count?: number;
          view_count?: number;
          documentation_url?: string | null;
          repository_url?: string | null;
          license?: string;
          is_deprecated?: boolean;
          deprecation_reason?: string | null;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      marketplace_installations: {
        Row: MarketplaceInstallationRow;
        Insert: {
          id?: string;
          workspace_id: string;
          resource_id: string;
          installed_version: string;
          installed_resource_id?: string | null;
          status?: string;
          granted_permissions?: string[];
          configuration?: Record<string, any>;
          installed_by?: string;
          installed_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          resource_id?: string;
          installed_version?: string;
          installed_resource_id?: string | null;
          status?: string;
          granted_permissions?: string[];
          configuration?: Record<string, any>;
          installed_by?: string;
          installed_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      marketplace_reports: {
        Row: MarketplaceReportRow;
        Insert: {
          id?: string;
          resource_id: string;
          reporter_workspace_id: string;
          reporter_user_id: string;
          category: string;
          details: string;
          status?: string;
          resolution_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          resource_id?: string;
          reporter_workspace_id?: string;
          reporter_user_id?: string;
          category?: string;
          details?: string;
          status?: string;
          resolution_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      marketplace_reviews: {
        Row: MarketplaceReviewRow;
        Insert: {
          id?: string;
          resource_id: string;
          workspace_id: string;
          user_id: string;
          rating: number;
          review_title?: string | null;
          review_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          resource_id?: string;
          workspace_id?: string;
          user_id?: string;
          rating?: number;
          review_title?: string | null;
          review_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

