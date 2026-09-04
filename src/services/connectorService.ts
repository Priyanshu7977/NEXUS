import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ConnectorConnection } from '../types/database';
import { RateLimitInfo, RepositoryItem } from '../types/connector';
import { encryptToken, decryptToken } from './encryptionService';
import { githubAdapter } from '../connectors/adapters/githubAdapter';
import { vercelAdapter } from '../connectors/adapters/vercelAdapter';
import { logWorkspaceActivity } from './activityService';

const LOCAL_CONNECTIONS_PREFIX = 'nexus_connections_';

// 5-Minute In-Memory Repository Cache
interface CachedRepos {
  data: RepositoryItem[];
  timestamp: number;
  rateLimit?: RateLimitInfo;
}
const repoCache = new Map<string, CachedRepos>();
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Helper to get local connections when running without live Supabase
 */
const getLocalConnections = (workspaceId: string): ConnectorConnection[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${LOCAL_CONNECTIONS_PREFIX}${workspaceId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalConnections = (workspaceId: string, list: ConnectorConnection[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${LOCAL_CONNECTIONS_PREFIX}${workspaceId}`, JSON.stringify(list));
  } catch (err) {
    console.error('[NEXUS ConnectorService] Failed to persist local connections:', err);
  }
};

/**
 * Fetches all active connector connections for a given workspace
 */
export const getWorkspaceConnections = async (
  workspaceId: string
): Promise<{ connections: ConnectorConnection[]; error?: string }> => {
  if (!workspaceId) {
    return { connections: [] };
  }

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('connector_connections')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (error) {
        return { connections: getLocalConnections(workspaceId) };
      }

      return { connections: (data as ConnectorConnection[]) || [] };
    } catch {
      return { connections: getLocalConnections(workspaceId) };
    }
  }

  return { connections: getLocalConnections(workspaceId) };
};

/**
 * Fetches a single connector connection for a workspace and connector ID
 */
export const getConnectorConnection = async (
  workspaceId: string,
  connectorId: string
): Promise<{ connection: ConnectorConnection | null; error?: string }> => {
  if (!workspaceId || !connectorId) {
    return { connection: null };
  }

  const { connections, error } = await getWorkspaceConnections(workspaceId);
  if (error) return { connection: null, error };

  const match = connections.find((c) => c.connector_id === connectorId && c.status === 'connected') || null;
  return { connection: match };
};

/**
 * Saves or updates a connector connection with an encrypted access token
 */
export const saveConnectorConnection = async (
  workspaceId: string,
  params: {
    connectorId: string;
    providerAccountId: string;
    providerAccountName: string;
    providerAvatarUrl?: string | null;
    scopes: string[];
    accessToken: string;
    refreshToken?: string | null;
    metadata?: Record<string, any>;
  }
): Promise<{ connection: ConnectorConnection | null; error?: string }> => {
  if (!workspaceId) {
    return { connection: null, error: 'Workspace ID is required' };
  }

  try {
    // Encrypt the access token before storage
    const encryptedToken = await encryptToken(params.accessToken);
    const encryptedRefresh = params.refreshToken ? await encryptToken(params.refreshToken) : null;

    const connectionData: Partial<ConnectorConnection> = {
      workspace_id: workspaceId,
      connector_id: params.connectorId,
      provider_account_id: params.providerAccountId,
      provider_account_name: params.providerAccountName,
      provider_avatar_url: params.providerAvatarUrl || null,
      status: 'connected',
      scopes: params.scopes,
      encrypted_access_token: encryptedToken,
      encrypted_refresh_token: encryptedRefresh,
      metadata: params.metadata || {},
      updated_at: new Date().toISOString(),
      last_used_at: new Date().toISOString(),
    };

    let savedConnection: ConnectorConnection | null = null;

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('connector_connections')
        .upsert(
          {
            ...connectionData,
            created_at: new Date().toISOString(),
          } as any,
          {
            onConflict: 'workspace_id,connector_id,provider_account_id',
          }
        )
        .select()
        .single();

      if (!error && data) {
        savedConnection = data as ConnectorConnection;
      }
    }

    if (!savedConnection) {
      // Local storage fallback
      const localList = getLocalConnections(workspaceId);
      const existingIdx = localList.findIndex(
        (c) =>
          c.connector_id === params.connectorId &&
          c.provider_account_id === params.providerAccountId
      );

      const fullRecord: ConnectorConnection = {
        id: existingIdx >= 0 ? localList[existingIdx].id : crypto.randomUUID(),
        workspace_id: workspaceId,
        connector_id: params.connectorId,
        provider_account_id: params.providerAccountId,
        provider_account_name: params.providerAccountName,
        provider_avatar_url: params.providerAvatarUrl || null,
        status: 'connected',
        scopes: params.scopes,
        encrypted_access_token: encryptedToken,
        encrypted_refresh_token: encryptedRefresh,
        token_expires_at: null,
        metadata: params.metadata || {},
        created_at: existingIdx >= 0 ? localList[existingIdx].created_at : new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_used_at: new Date().toISOString(),
      };

      if (existingIdx >= 0) {
        localList[existingIdx] = fullRecord;
      } else {
        localList.push(fullRecord);
      }
      saveLocalConnections(workspaceId, localList);
      savedConnection = fullRecord;
    }

    // Log activity
    await logWorkspaceActivity(workspaceId, {
      type: 'connector',
      action: 'github_connected',
      name: `GitHub account @${params.providerAccountName} connected`,
      status: 'completed',
      details: `Granted scopes: ${params.scopes.join(', ')}`,
      metadata: { connectorId: params.connectorId, account: params.providerAccountName },
    });

    return { connection: savedConnection };
  } catch (err: any) {
    return { connection: null, error: err.message || 'Failed to save connector connection' };
  }
};

/**
 * Disconnects / removes a connector from a workspace
 */
export const disconnectConnector = async (
  workspaceId: string,
  connectorId: string,
  providerAccountId?: string
): Promise<{ success: boolean; error?: string }> => {
  if (!workspaceId || !connectorId) {
    return { success: false, error: 'Workspace ID and Connector ID required' };
  }

  // Invalidate cache
  repoCache.delete(`${workspaceId}_${connectorId}`);

  if (isSupabaseConfigured) {
    try {
      let query = supabase
        .from('connector_connections')
        .delete()
        .eq('workspace_id', workspaceId)
        .eq('connector_id', connectorId);

      if (providerAccountId) {
        query = query.eq('provider_account_id', providerAccountId);
      }

      await query;
    } catch (err: any) {
      console.warn('[NEXUS ConnectorService] Delete error:', err.message);
    }
  }

  // Remove from local list
  const localList = getLocalConnections(workspaceId);
  const target = localList.find((c) => c.connector_id === connectorId);
  const updated = localList.filter((c) => {
    if (c.connector_id !== connectorId) return true;
    if (providerAccountId && c.provider_account_id !== providerAccountId) return true;
    return false;
  });
  saveLocalConnections(workspaceId, updated);

  // Log activity
  await logWorkspaceActivity(workspaceId, {
    type: 'connector',
    action: 'github_disconnected',
    name: `GitHub account @${target?.provider_account_name || 'account'} unlinked`,
    status: 'completed',
    details: 'Revoked connector credentials from workspace.',
    metadata: { connectorId },
  });

  return { success: true };
};

/**
 * Decrypts a connector's access token for execution
 */
export const getDecryptedAccessToken = async (
  connection: ConnectorConnection
): Promise<string | null> => {
  if (!connection.encrypted_access_token) return null;
  try {
    return await decryptToken(connection.encrypted_access_token);
  } catch {
    console.error('[NEXUS ConnectorService] Failed to decrypt connection access token');
    return null;
  }
};

/**
 * Retrieves live repositories for a connected GitHub connection (with 5-minute cache)
 */
export const getRepositoriesForConnection = async (
  connection: ConnectorConnection,
  forceRefresh = false
): Promise<{ repositories: RepositoryItem[]; rateLimit?: RateLimitInfo; error?: string }> => {
  if (!connection) {
    return { repositories: [], error: 'Connection record missing' };
  }

  const cacheKey = `${connection.workspace_id}_${connection.connector_id}`;
  const now = Date.now();

  // Check cache unless forced
  if (!forceRefresh) {
    const cached = repoCache.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      return { repositories: cached.data, rateLimit: cached.rateLimit };
    }
  }

  try {
    const rawToken = await getDecryptedAccessToken(connection);
    if (!rawToken) {
      return { repositories: [], error: 'Could not decrypt access token' };
    }

    const { repositories, rateLimit } = await githubAdapter.fetchRepositories(rawToken);

    // Save to cache
    repoCache.set(cacheKey, {
      data: repositories,
      timestamp: now,
      rateLimit
    });

    // Update last_used_at timestamp
    if (isSupabaseConfigured) {
      await (supabase
        .from('connector_connections') as any)
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', connection.id);
    }

    // Log activity
    await logWorkspaceActivity(connection.workspace_id, {
      type: 'connector',
      action: 'repositories_fetched',
      name: `Synced ${repositories.length} repositories from GitHub`,
      status: 'completed',
      details: `Account: @${connection.provider_account_name}`,
      metadata: { count: repositories.length },
    });

    return { repositories, rateLimit };
  } catch (err: any) {
    return { repositories: [], error: err.message || 'Failed to fetch repositories' };
  }
};

/**
 * Connects GitHub using a Personal Access Token or direct Token
 */
export const connectWithToken = async (
  workspaceId: string,
  token: string
): Promise<{ connection: ConnectorConnection | null; error?: string }> => {
  if (!workspaceId || !token.trim()) {
    return { connection: null, error: 'Token is required' };
  }

  try {
    // 1. Verify token by querying GitHub user profile
    const profile = await githubAdapter.fetchAccountProfile(token.trim());

    // 2. Save connection
    const result = await saveConnectorConnection(workspaceId, {
      connectorId: 'github',
      providerAccountId: profile.id,
      providerAccountName: profile.username,
      providerAvatarUrl: profile.avatarUrl,
      scopes: ['read:user', 'repo'],
      accessToken: token.trim(),
      metadata: profile.metadata,
    });

    return result;
  } catch (err: any) {
    return { connection: null, error: err.message || 'Failed to authenticate with token' };
  }
};

/**
 * Connects Vercel using an Access Token
 */
export const connectVercelWithToken = async (
  workspaceId: string,
  token: string
): Promise<{ connection: ConnectorConnection | null; error?: string }> => {
  if (!workspaceId || !token.trim()) {
    return { connection: null, error: 'Token is required' };
  }

  try {
    // 1. Verify token by querying Vercel user profile
    const profile = await vercelAdapter.fetchAccountProfile(token.trim());

    // 2. Save connection
    const result = await saveConnectorConnection(workspaceId, {
      connectorId: 'vercel',
      providerAccountId: profile.id,
      providerAccountName: profile.username,
      providerAvatarUrl: profile.avatarUrl,
      scopes: ['vercel.projects.read', 'vercel.deployments.read', 'vercel.deployments.create'],
      accessToken: token.trim(),
      metadata: profile.metadata,
    });

    return result;
  } catch (err: any) {
    return { connection: null, error: err.message || 'Failed to authenticate with Vercel token' };
  }
};

