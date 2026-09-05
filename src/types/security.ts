export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer';

export type Permission =
  // Workspace management
  | 'workspace.read'
  | 'workspace.update'
  | 'workspace.delete'
  | 'workspace.manage'
  | 'workspace.members.manage'
  | 'members.manage'
  // Agents
  | 'agents.read'
  | 'agents.create'
  | 'agents.update'
  | 'agents.delete'
  | 'agents.execute'
  // Connectors
  | 'connectors.read'
  | 'connectors.connect'
  | 'connectors.disconnect'
  // Workflows
  | 'workflows.read'
  | 'workflows.create'
  | 'workflows.update'
  | 'workflows.delete'
  | 'workflows.execute'
  | 'workflows.activate'
  // Executions
  | 'executions.read'
  | 'executions.cancel'
  // Human Approvals
  | 'approvals.review'
  | 'approvals.decide'
  // Marketplace
  | 'marketplace.install'
  | 'marketplace.publish'
  // Governance & Administration
  | 'settings.manage'
  | 'api_keys.manage'
  | 'keys.manage'
  | 'audit.read'
  | 'policies.manage';

export const ROLE_PERMISSIONS: Record<WorkspaceRole, readonly Permission[]> = {
  owner: [
    'workspace.read',
    'workspace.update',
    'workspace.delete',
    'workspace.manage',
    'workspace.members.manage',
    'members.manage',
    'agents.read',
    'agents.create',
    'agents.update',
    'agents.delete',
    'agents.execute',
    'connectors.read',
    'connectors.connect',
    'connectors.disconnect',
    'workflows.read',
    'workflows.create',
    'workflows.update',
    'workflows.delete',
    'workflows.execute',
    'workflows.activate',
    'executions.read',
    'executions.cancel',
    'approvals.review',
    'approvals.decide',
    'marketplace.install',
    'marketplace.publish',
    'settings.manage',
    'api_keys.manage',
    'keys.manage',
    'audit.read',
    'policies.manage',
  ],
  admin: [
    'workspace.read',
    'workspace.update',
    'workspace.members.manage',
    'members.manage',
    'agents.read',
    'agents.create',
    'agents.update',
    'agents.delete',
    'agents.execute',
    'connectors.read',
    'connectors.connect',
    'connectors.disconnect',
    'workflows.read',
    'workflows.create',
    'workflows.update',
    'workflows.delete',
    'workflows.execute',
    'workflows.activate',
    'executions.read',
    'executions.cancel',
    'approvals.review',
    'approvals.decide',
    'marketplace.install',
    'marketplace.publish',
    'settings.manage',
    'api_keys.manage',
    'keys.manage',
    'audit.read',
    'policies.manage',
  ],
  member: [
    'workspace.read',
    'agents.read',
    'agents.create',
    'agents.update',
    'agents.execute',
    'connectors.read',
    'connectors.connect',
    'workflows.read',
    'workflows.create',
    'workflows.update',
    'workflows.execute',
    'executions.read',
    'approvals.review',
    'marketplace.install',
  ],
  viewer: [
    'workspace.read',
    'agents.read',
    'connectors.read',
    'workflows.read',
    'executions.read',
    'audit.read',
  ],
};

export type ApiKeyScope =
  | '*'
  | 'agents:read'
  | 'agents:write'
  | 'agents:execute'
  | 'workflows:read'
  | 'workflows:write'
  | 'workflows:execute'
  | 'connectors:read'
  | 'connectors:write'
  | 'executions:read'
  | 'audit:read'
  | (string & {});

export const ALL_API_KEY_SCOPES: { id: ApiKeyScope; label: string; description: string }[] = [
  { id: '*', label: 'Full Access (*)', description: 'Full access to all workspace resources and APIs' },
  { id: 'agents:read', label: 'Read Agents', description: 'Query agent manifests, configurations, and tools' },
  { id: 'agents:write', label: 'Write Agents', description: 'Create and update workspace agents' },
  { id: 'agents:execute', label: 'Execute Agents', description: 'Trigger autonomous agent execution with input prompts' },
  { id: 'workflows:read', label: 'Read Workflows', description: 'Inspect workflow DAG nodes, edges, and triggers' },
  { id: 'workflows:write', label: 'Write Workflows', description: 'Create, modify, and delete workflows' },
  { id: 'workflows:execute', label: 'Execute Workflows', description: 'Trigger deterministic multi-agent workflow runs' },
  { id: 'connectors:read', label: 'Read Connectors', description: 'Inspect active connector status and scopes' },
  { id: 'connectors:write', label: 'Write Connectors', description: 'Install, authorize, and configure connectors' },
  { id: 'executions:read', label: 'Read Executions', description: 'Query execution history, node logs, and outputs' },
  { id: 'audit:read', label: 'Read Audit Logs', description: 'Query security and activity audit records' },
];

export interface ApiKey {
  id: string;
  workspace_id: string;
  name: string;
  key_prefix: string;
  key_hash: string;
  scopes: ApiKeyScope[];
  created_by: string | null;
  last_used_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  created_at: string;
  status?: 'active' | 'revoked' | 'expired';
}

export type AuditLogAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'CONNECTOR_CONNECTED'
  | 'CONNECTOR_DISCONNECTED'
  | 'AGENT_CREATED'
  | 'AGENT_UPDATED'
  | 'AGENT_DELETED'
  | 'AGENT_EXECUTED'
  | 'WORKFLOW_CREATED'
  | 'WORKFLOW_UPDATED'
  | 'WORKFLOW_ACTIVATED'
  | 'WORKFLOW_EXECUTED'
  | 'WORKFLOW_CANCELLED'
  | 'APPROVAL_GRANTED'
  | 'APPROVAL_REJECTED'
  | 'API_KEY_CREATED'
  | 'API_KEY_REVOKED'
  | 'MEMBER_INVITED'
  | 'MEMBER_UPDATED'
  | 'MEMBER_REMOVED'
  | 'POLICY_UPDATED'
  | 'RESOURCE_PUBLISHED'
  | 'SECURITY_VIOLATION'
  | (string & {});

export interface AuditLogEntry {
  id: string;
  workspace_id: string;
  user_id: string | null;
  action: AuditLogAction;
  resource_type: string;
  resource_id: string | null;
  metadata: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  status?: 'success' | 'failure';
  created_at: string;
}

export interface WorkspacePolicy {
  workspace_id: string;
  require_approval_for_deployment?: boolean;
  require_approval_for_deploy?: boolean;
  allow_external_agents: boolean;
  allow_mcp: boolean;
  allow_marketplace_install?: boolean;
  allow_public_publishing?: boolean;
  max_workflow_runtime?: number; // in seconds
  max_workflow_runtime_seconds?: number;
  max_workflow_nodes?: number;
  max_nodes_per_workflow?: number;
  max_agent_steps: number;
  max_tool_calls: number;
  external_agent_allow_list?: string[];
  mcp_allow_list?: string[];
  updated_at: string;
}

export const DEFAULT_WORKSPACE_POLICY: Omit<WorkspacePolicy, 'workspace_id' | 'updated_at'> = {
  require_approval_for_deployment: true,
  require_approval_for_deploy: true,
  allow_external_agents: true,
  allow_mcp: true,
  allow_marketplace_install: true,
  allow_public_publishing: false,
  max_workflow_runtime: 300, // 5 minutes
  max_workflow_runtime_seconds: 300,
  max_workflow_nodes: 30,
  max_nodes_per_workflow: 30,
  max_agent_steps: 15,
  max_tool_calls: 20,
};

export type CapabilityRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export const CAPABILITY_RISK_MAP: Record<string, CapabilityRiskLevel> = {
  'github_fetch_diff': 'LOW',
  'github_list_repos': 'LOW',
  'github_read_issue': 'LOW',
  'github_create_comment': 'MEDIUM',
  'github_create_issue': 'MEDIUM',
  'github_update_pr': 'MEDIUM',
  'vercel_list_projects': 'LOW',
  'vercel_get_deployment_status': 'LOW',
  'vercel_create_deployment': 'HIGH',
  'mcp_vector_context': 'LOW',
  'mcp_tool_call': 'HIGH',
  'a2a_agent_invoke': 'HIGH',
  'system_exec': 'CRITICAL',
};
