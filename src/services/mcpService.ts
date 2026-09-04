import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { McpServerConfig, AddMcpServerInput, McpToolDefinition } from '../types/mcp';
import { McpServerStatus } from '../types/database';
import { McpClient } from '../protocols/mcp/mcpClient';
import { isHighRiskMcpTool } from '../protocols/mcp/mcpAdapter';
import { encryptToken, decryptToken } from './encryptionService';
import { logWorkspaceActivity } from './activityService';

const LOCAL_MCP_PREFIX = 'nexus_mcp_servers_';

const memoryMcpServers = new Map<string, McpServerConfig[]>();

const getLocalMcpServers = (workspaceId: string): McpServerConfig[] => {
  if (typeof window === 'undefined') return memoryMcpServers.get(workspaceId) || [];
  try {
    const raw = localStorage.getItem(`${LOCAL_MCP_PREFIX}${workspaceId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalMcpServers = (workspaceId: string, list: McpServerConfig[]): void => {
  memoryMcpServers.set(workspaceId, list);
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${LOCAL_MCP_PREFIX}${workspaceId}`, JSON.stringify(list));
  } catch (err) {
    console.error('[NEXUS McpService] Failed to persist local servers:', err);
  }
};

/**
 * Fetches all MCP servers registered in a workspace.
 */
export const getWorkspaceMcpServers = async (
  workspaceId: string
): Promise<{ servers: McpServerConfig[]; error?: string }> => {
  if (!workspaceId) return { servers: [] };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('mcp_servers')
        .select(`
          *,
          mcp_credentials (
            auth_type,
            header_name,
            encrypted_secret
          )
        `)
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[NEXUS McpService] Supabase query failed, falling back to local:', error);
        return { servers: getLocalMcpServers(workspaceId) };
      }

      const servers: McpServerConfig[] = await Promise.all(
        (data || []).map(async (row: any) => {
          const cred = Array.isArray(row.mcp_credentials) ? row.mcp_credentials[0] : row.mcp_credentials;
          let decryptedToken: string | undefined = undefined;
          if (cred?.encrypted_secret) {
            try {
              decryptedToken = (await decryptToken(cred.encrypted_secret)) || undefined;
            } catch {
              decryptedToken = undefined;
            }
          }

          return {
            id: row.id,
            workspace_id: row.workspace_id,
            name: row.name,
            slug: row.slug,
            description: row.description,
            server_url: row.server_url,
            transport_type: row.transport_type,
            status: row.status as McpServerStatus,
            protocol_version: row.protocol_version,
            capabilities: row.capabilities || [],
            enabled_tools: row.enabled_tools || [],
            auth_type: cred?.auth_type || 'none',
            header_name: cred?.header_name || undefined,
            auth_token: decryptedToken,
            last_ping_at: row.last_ping_at,
            last_error: row.last_error,
            metadata: row.metadata || {},
            created_at: row.created_at,
            updated_at: row.updated_at,
          };
        })
      );

      return { servers };
    } catch (err: any) {
      console.warn('[NEXUS McpService] Unexpected error querying Supabase:', err);
      return { servers: getLocalMcpServers(workspaceId) };
    }
  }

  return { servers: getLocalMcpServers(workspaceId) };
};

/**
 * Tests connectivity and discovers tools from an MCP server.
 */
export const testMcpServerConnection = async (
  serverUrl: string,
  transportType: 'sse' | 'streamable_http' | 'stdio' | 'websocket' = 'streamable_http',
  authType: 'none' | 'bearer' | 'api_key' | 'custom_header' = 'none',
  headerName?: string,
  authToken?: string
): Promise<{
  success: boolean;
  tools: McpToolDefinition[];
  protocolVersion: string;
  serverInfo?: any;
  error?: string;
}> => {
  try {
    const client = new McpClient({
      serverUrl,
      transportType,
      authType,
      headerName,
      authToken,
      timeoutMs: 15000,
    });

    // 1. Initialize
    const initRes = await client.initialize();

    // 2. Discover Tools
    const toolsRes = await client.listTools();

    // 3. Mark high risk tools with badges
    const toolsWithRisk: McpToolDefinition[] = (toolsRes.tools || []).map((tool) => {
      const riskAssessment = isHighRiskMcpTool(tool);
      return {
        ...tool,
        is_high_risk: riskAssessment.isHighRisk,
        risk_reason: riskAssessment.riskReason,
      };
    });

    return {
      success: true,
      tools: toolsWithRisk,
      protocolVersion: initRes.protocolVersion || '2024-11-05',
      serverInfo: initRes.serverInfo,
    };
  } catch (err: any) {
    return {
      success: false,
      tools: [],
      protocolVersion: '2024-11-05',
      error: err.message || 'Failed to connect to MCP endpoint',
    };
  }
};

/**
 * Registers a new MCP server in the workspace with discovered tools and permissions.
 */
export const registerMcpServer = async (
  input: AddMcpServerInput
): Promise<{ server?: McpServerConfig; error?: string }> => {
  const {
    workspace_id,
    name,
    description,
    server_url,
    transport_type,
    auth_type = 'none',
    header_name,
    auth_token,
  } = input;

  const slug = input.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  // 1. Test and discover tools
  const testRes = await testMcpServerConnection(
    server_url,
    transport_type,
    auth_type,
    header_name,
    auth_token
  );

  if (!testRes.success) {
    return { error: testRes.error || 'Connection to MCP server failed during handshake.' };
  }

  // Default enabled tools: enable safe tools by default, require explicit check for high-risk tools
  const defaultEnabled = input.enabled_tools || testRes.tools
    .filter((t) => !t.is_high_risk)
    .map((t) => t.name);

  const serverId = crypto.randomUUID();
  const now = new Date().toISOString();

  const newServer: McpServerConfig = {
    id: serverId,
    workspace_id,
    name,
    slug,
    description: description || null,
    server_url,
    transport_type,
    status: 'connected',
    protocol_version: testRes.protocolVersion,
    capabilities: testRes.tools,
    enabled_tools: defaultEnabled,
    auth_type,
    header_name: header_name || null,
    auth_token: auth_token || null,
    last_ping_at: now,
    last_error: null,
    metadata: {
      server_info: testRes.serverInfo,
    },
    created_at: now,
    updated_at: now,
  };

  if (isSupabaseConfigured) {
    try {
      const { error: serverErr } = await (supabase.from('mcp_servers') as any)
        .insert({
          id: serverId,
          workspace_id,
          name,
          slug,
          description: description || null,
          server_url,
          transport_type,
          status: 'connected',
          protocol_version: testRes.protocolVersion,
          capabilities: testRes.tools,
          enabled_tools: defaultEnabled,
          last_ping_at: now,
          metadata: { server_info: testRes.serverInfo },
        });

      if (serverErr) {
        console.warn('[NEXUS McpService] Supabase insert failed, saving locally:', serverErr);
      } else if (auth_token && auth_type !== 'none') {
        const encrypted = await encryptToken(auth_token);
        await (supabase.from('mcp_credentials') as any).insert({
          mcp_server_id: serverId,
          auth_type,
          header_name: header_name || null,
          encrypted_secret: encrypted,
        });
      }
    } catch (err) {
      console.warn('[NEXUS McpService] Supabase insert threw error:', err);
    }
  }

  // Save to local cache
  const existing = getLocalMcpServers(workspace_id);
  const filtered = existing.filter((s) => s.id !== serverId && s.slug !== slug);
  saveLocalMcpServers(workspace_id, [newServer, ...filtered]);

  await logWorkspaceActivity(workspace_id, {
    type: 'connector',
    action: 'mcp_server_registered',
    name: `Connected MCP Server: ${name}`,
    status: 'completed',
    details: `Connected MCP tool server "${name}" with ${testRes.tools.length} discovered tools (${defaultEnabled.length} enabled).`,
    metadata: {
      serverId,
      toolCount: testRes.tools.length,
      enabledCount: defaultEnabled.length,
    },
  });

  return { server: newServer };
};

/**
 * Toggles a tool's enabled state for an MCP server.
 */
export const updateMcpToolPermissions = async (
  workspaceId: string,
  serverId: string,
  enabledTools: string[]
): Promise<{ success: boolean; error?: string }> => {
  if (isSupabaseConfigured) {
    try {
      const { error } = await (supabase.from('mcp_servers') as any)
        .update({
          enabled_tools: enabledTools,
          updated_at: new Date().toISOString(),
        })
        .eq('id', serverId)
        .eq('workspace_id', workspaceId);

      if (error) {
        console.warn('[NEXUS McpService] Failed to update enabled tools in Supabase:', error);
      }
    } catch (err) {
      console.warn('[NEXUS McpService] Error updating tools in Supabase:', err);
    }
  }

  const local = getLocalMcpServers(workspaceId);
  const updated = local.map((s) => (s.id === serverId ? { ...s, enabled_tools: enabledTools } : s));
  saveLocalMcpServers(workspaceId, updated);

  return { success: true };
};

/**
 * Deletes an MCP server from a workspace.
 */
export const deleteMcpServer = async (
  workspaceId: string,
  serverId: string
): Promise<{ success: boolean; error?: string }> => {
  if (isSupabaseConfigured) {
    try {
      await supabase
        .from('mcp_servers')
        .delete()
        .eq('id', serverId)
        .eq('workspace_id', workspaceId);
    } catch (err) {
      console.warn('[NEXUS McpService] Error deleting from Supabase:', err);
    }
  }

  const local = getLocalMcpServers(workspaceId);
  saveLocalMcpServers(workspaceId, local.filter((s) => s.id !== serverId));

  await logWorkspaceActivity(workspaceId, {
    type: 'connector',
    action: 'mcp_server_deleted',
    name: 'Removed MCP Server',
    status: 'completed',
    details: `Disconnected and removed MCP server ID ${serverId}.`,
  });

  return { success: true };
};

/**
 * Pings an MCP server and updates its health in the database.
 */
export const pingMcpServer = async (
  workspaceId: string,
  serverId: string
): Promise<{ healthy: boolean; latencyMs: number }> => {
  const { servers } = await getWorkspaceMcpServers(workspaceId);
  const target = servers.find((s) => s.id === serverId);
  if (!target) return { healthy: false, latencyMs: 0 };

  const client = new McpClient({
    serverUrl: target.server_url,
    transportType: target.transport_type,
    authType: target.auth_type,
    headerName: target.header_name || undefined,
    authToken: target.auth_token || undefined,
    timeoutMs: 8000,
  });

  const pingRes = await client.ping();
  const now = new Date().toISOString();
  const newStatus: McpServerStatus = pingRes.healthy ? 'connected' : 'error';

  if (isSupabaseConfigured) {
    try {
      await (supabase.from('mcp_servers') as any)
        .update({
          status: newStatus,
          last_ping_at: now,
          last_error: pingRes.healthy ? null : 'Ping timed out or failed',
        })
        .eq('id', serverId);
    } catch {}
  }

  const local = getLocalMcpServers(workspaceId);
  const updated: McpServerConfig[] = local.map((s) =>
    s.id === serverId
      ? {
          ...s,
          status: newStatus,
          last_ping_at: now,
          last_error: pingRes.healthy ? null : 'Ping timed out or failed',
        }
      : s
  );
  saveLocalMcpServers(workspaceId, updated);

  return pingRes;
};
