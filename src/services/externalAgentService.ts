import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  ExternalAgentConfig,
  AddExternalAgentInput,
  AgentCard,
  A2AInvocationRequest,
  A2AInvocationResponse,
} from '../types/a2a';
import { ExternalAgentRow, ExternalAgentStatus } from '../types/database';
import { A2AClient } from '../protocols/a2a/a2aClient';
import { validateAgentCard } from '../protocols/a2a/a2aAdapter';
import { encryptToken, decryptToken } from './encryptionService';
import { logWorkspaceActivity } from './activityService';

const LOCAL_A2A_PREFIX = 'nexus_external_agents_';

const memoryExternalAgents = new Map<string, ExternalAgentConfig[]>();

const getLocalAgents = (workspaceId: string): ExternalAgentConfig[] => {
  if (typeof window === 'undefined') return memoryExternalAgents.get(workspaceId) || [];
  try {
    const raw = localStorage.getItem(`${LOCAL_A2A_PREFIX}${workspaceId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalAgents = (workspaceId: string, list: ExternalAgentConfig[]): void => {
  memoryExternalAgents.set(workspaceId, list);
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${LOCAL_A2A_PREFIX}${workspaceId}`, JSON.stringify(list));
  } catch (err) {
    console.error('[NEXUS ExternalAgentService] Failed to persist local agents:', err);
  }
};

/**
 * Fetches all external A2A agents registered in a workspace.
 */
export const getWorkspaceExternalAgents = async (
  workspaceId: string
): Promise<{ agents: ExternalAgentConfig[]; error?: string }> => {
  if (!workspaceId) return { agents: [] };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('external_agents')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[NEXUS ExternalAgentService] Supabase query failed, falling back to local:', error);
        return { agents: getLocalAgents(workspaceId) };
      }

      const agents: ExternalAgentConfig[] = await Promise.all(
        (data || []).map(async (row: ExternalAgentRow) => {
          let decryptedToken: string | undefined = undefined;
          if (row.encrypted_secret) {
            try {
              decryptedToken = (await decryptToken(row.encrypted_secret)) || undefined;
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
            endpoint_url: row.endpoint_url,
            agent_card_url: row.agent_card_url,
            protocol_version: row.protocol_version,
            status: row.status,
            agent_card: (row.agent_card as AgentCard) || { name: row.name, skills: [], version: '0.1.0', description: '' },
            auth_type: row.auth_type,
            header_name: row.header_name,
            auth_token: decryptedToken,
            timeout_ms: row.timeout_ms || 30000,
            last_ping_at: row.last_ping_at,
            last_error: row.last_error,
            metadata: row.metadata || {},
            created_at: row.created_at,
            updated_at: row.updated_at,
          };
        })
      );

      return { agents };
    } catch (err) {
      console.warn('[NEXUS ExternalAgentService] Error querying Supabase:', err);
      return { agents: getLocalAgents(workspaceId) };
    }
  }

  return { agents: getLocalAgents(workspaceId) };
};

/**
 * Discovers and validates an Agent Card from an endpoint before registration.
 */
export const discoverAgentCard = async (
  endpointUrl: string,
  agentCardUrl?: string,
  authType: 'none' | 'bearer' | 'api_key' | 'custom_header' = 'none',
  headerName?: string,
  authToken?: string
): Promise<{ success: boolean; card?: AgentCard; error?: string }> => {
  try {
    const client = new A2AClient({
      endpointUrl,
      agentCardUrl,
      authType,
      headerName,
      authToken,
      timeoutMs: 12000,
    });

    const card = await client.fetchAgentCard();
    const validation = validateAgentCard(card);

    if (!validation.valid) {
      return {
        success: false,
        error: `Agent Card validation failed: ${validation.errors.join(', ')}`,
      };
    }

    return {
      success: true,
      card,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to discover Agent Card',
    };
  }
};

/**
 * Registers an external A2A agent into the workspace.
 */
export const registerExternalAgent = async (
  input: AddExternalAgentInput
): Promise<{ agent?: ExternalAgentConfig; error?: string }> => {
  const {
    workspace_id,
    name,
    description,
    endpoint_url,
    agent_card_url,
    auth_type = 'none',
    header_name,
    auth_token,
    timeout_ms = 30000,
  } = input;

  const slug = input.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  // 1. Discover and validate Agent Card
  const discovery = await discoverAgentCard(
    endpoint_url,
    agent_card_url,
    auth_type,
    header_name,
    auth_token
  );

  if (!discovery.success || !discovery.card) {
    return { error: discovery.error || 'Failed to verify external Agent Card.' };
  }

  const agentId = crypto.randomUUID();
  const now = new Date().toISOString();

  const newAgent: ExternalAgentConfig = {
    id: agentId,
    workspace_id,
    name,
    slug,
    description: description || discovery.card.description || null,
    endpoint_url,
    agent_card_url: agent_card_url || null,
    protocol_version: '0.3.0',
    status: 'active',
    agent_card: discovery.card,
    auth_type,
    header_name: header_name || null,
    auth_token: auth_token || null,
    timeout_ms,
    last_ping_at: now,
    last_error: null,
    metadata: {
      provider: discovery.card.provider,
      skills_count: discovery.card.skills.length,
    },
    created_at: now,
    updated_at: now,
  };

  if (isSupabaseConfigured) {
    try {
      const encryptedSecret = auth_token ? await encryptToken(auth_token) : null;
      await (supabase.from('external_agents') as any).insert({
        id: agentId,
        workspace_id,
        name,
        slug,
        description: description || discovery.card.description || null,
        endpoint_url,
        agent_card_url: agent_card_url || null,
        protocol_version: '0.3.0',
        status: 'active',
        agent_card: discovery.card as any,
        auth_type,
        header_name: header_name || null,
        encrypted_secret: encryptedSecret,
        timeout_ms,
        last_ping_at: now,
      });
    } catch (err) {
      console.warn('[NEXUS ExternalAgentService] Supabase insert failed, continuing with local:', err);
    }
  }

  const existing = getLocalAgents(workspace_id);
  const filtered = existing.filter((a) => a.id !== agentId && a.slug !== slug);
  saveLocalAgents(workspace_id, [newAgent, ...filtered]);

  await logWorkspaceActivity(workspace_id, {
    type: 'agent',
    action: 'external_agent_registered',
    name: `Connected External Agent: ${name}`,
    status: 'completed',
    details: `Connected A2A agent "${name}" with ${discovery.card.skills.length} skills.`,
    metadata: {
      agentId,
      skillsCount: discovery.card.skills.length,
    },
  });

  return { agent: newAgent };
};

/**
 * Invokes an external agent via A2A protocol.
 */
export const invokeExternalAgent = async (
  workspaceId: string,
  agentSlugOrId: string,
  request: A2AInvocationRequest
): Promise<A2AInvocationResponse> => {
  const { agents } = await getWorkspaceExternalAgents(workspaceId);
  const target = agents.find((a) => a.id === agentSlugOrId || a.slug === agentSlugOrId);

  if (!target) {
    throw new Error(`External agent "${agentSlugOrId}" not found in workspace.`);
  }

  if (target.status !== 'active') {
    throw new Error(`External agent "${target.name}" is currently ${target.status}.`);
  }

  const client = new A2AClient({
    endpointUrl: target.endpoint_url,
    agentCardUrl: target.agent_card_url || undefined,
    authType: target.auth_type,
    headerName: target.header_name || undefined,
    authToken: target.auth_token || undefined,
    timeoutMs: target.timeout_ms || 30000,
  });

  return await client.invoke(request);
};

/**
 * Pings an external agent to verify liveness.
 */
export const pingExternalAgent = async (
  workspaceId: string,
  agentId: string
): Promise<{ healthy: boolean; latencyMs: number }> => {
  const { agents } = await getWorkspaceExternalAgents(workspaceId);
  const target = agents.find((a) => a.id === agentId);
  if (!target) return { healthy: false, latencyMs: 0 };

  const client = new A2AClient({
    endpointUrl: target.endpoint_url,
    agentCardUrl: target.agent_card_url || undefined,
    authType: target.auth_type,
    headerName: target.header_name || undefined,
    authToken: target.auth_token || undefined,
    timeoutMs: 8000,
  });

  const pingRes = await client.ping();
  const now = new Date().toISOString();
  const newStatus: ExternalAgentStatus = pingRes.healthy ? 'active' : 'offline';

  if (isSupabaseConfigured) {
    try {
      await (supabase.from('external_agents') as any)
        .update({
          status: newStatus,
          last_ping_at: now,
          last_error: pingRes.healthy ? null : 'Health probe failed',
        })
        .eq('id', agentId);
    } catch {}
  }

  const local = getLocalAgents(workspaceId);
  const updated: ExternalAgentConfig[] = local.map((a) =>
    a.id === agentId
      ? {
          ...a,
          status: newStatus,
          last_ping_at: now,
          last_error: pingRes.healthy ? null : 'Health probe failed',
        }
      : a
  );
  saveLocalAgents(workspaceId, updated);

  return pingRes;
};

/**
 * Deletes an external agent from a workspace.
 */
export const deleteExternalAgent = async (
  workspaceId: string,
  agentId: string
): Promise<{ success: boolean; error?: string }> => {
  if (isSupabaseConfigured) {
    try {
      await supabase
        .from('external_agents')
        .delete()
        .eq('id', agentId)
        .eq('workspace_id', workspaceId);
    } catch (err) {
      console.warn('[NEXUS ExternalAgentService] Supabase delete error:', err);
    }
  }

  const local = getLocalAgents(workspaceId);
  saveLocalAgents(workspaceId, local.filter((a) => a.id !== agentId));

  await logWorkspaceActivity(workspaceId, {
    type: 'agent',
    action: 'external_agent_deleted',
    name: 'Removed External Agent',
    status: 'completed',
    details: `Disconnected and removed External Agent ID ${agentId}.`,
  });

  return { success: true };
};
