import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ApiKey, ApiKeyScope } from '../types/security';
import { recordAuditLog } from './auditService';

const LOCAL_API_KEYS_PREFIX = 'nexus_api_keys_';

// In-memory fallback for testing / node runtime
const memoryApiKeys = new Map<string, ApiKey[]>();

export const getLocalApiKeys = (workspaceId: string): ApiKey[] => {
  if (typeof window === 'undefined') return memoryApiKeys.get(workspaceId) || [];
  try {
    const raw = localStorage.getItem(`${LOCAL_API_KEYS_PREFIX}${workspaceId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveLocalApiKeys = (workspaceId: string, keys: ApiKey[]): void => {
  memoryApiKeys.set(workspaceId, keys);
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${LOCAL_API_KEYS_PREFIX}${workspaceId}`, JSON.stringify(keys));
  } catch (err) {
    console.error('[NEXUS ApiKeyService] Failed to save local API keys:', err);
  }
};

/**
 * Computes a secure SHA-256 hash of a string.
 */
export async function hashApiKey(key: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Creates a new API key for a workspace.
 * Returns the raw key secret EXACTLY ONCE. Only the prefix and hash are persisted.
 */
export async function createApiKey(params: {
  workspaceId: string;
  name: string;
  scopes: ApiKeyScope[];
  createdBy?: string | null;
  expiresInDays?: number | null;
  expiresAt?: string | null;
}): Promise<{ apiKey: ApiKey; secret: string; rawKey: string; error?: string }> {
  const { workspaceId, name, scopes, createdBy = null, expiresInDays = null, expiresAt: inputExpiresAt = null } = params;

  // Generate 32-char cryptographically random secret
  const entropy = Array.from(crypto.getRandomValues(new Uint8Array(24)))
    .map((b) => b.toString(36).padStart(2, '0'))
    .join('')
    .slice(0, 32);

  const rawKey = `nxs_live_${entropy}`;
  const keyPrefix = `nxs_live_${entropy.slice(0, 6)}••••••••`;
  const keyHash = await hashApiKey(rawKey);

  const now = new Date();
  const expiresAt = inputExpiresAt || (expiresInDays
    ? new Date(now.getTime() + expiresInDays * 86400000).toISOString()
    : null);

  const newKey: ApiKey = {
    id: `key_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    workspace_id: workspaceId,
    name: name.trim(),
    key_prefix: keyPrefix,
    key_hash: keyHash,
    scopes,
    created_by: createdBy,
    last_used_at: null,
    expires_at: expiresAt,
    revoked_at: null,
    status: 'active',
    created_at: now.toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      await (supabase.from('api_keys') as any).insert({
        id: newKey.id,
        workspace_id: workspaceId,
        name: newKey.name,
        key_prefix: newKey.key_prefix,
        key_hash: newKey.key_hash,
        scopes: newKey.scopes,
        created_by: newKey.created_by,
        expires_at: newKey.expires_at,
      });
    } catch (e) {
      console.warn('[NEXUS ApiKeyService] Supabase insert failed, saving locally:', e);
    }
  }

  const local = getLocalApiKeys(workspaceId);
  local.unshift(newKey);
  saveLocalApiKeys(workspaceId, local);

  // Record audit log
  await recordAuditLog({
    workspaceId,
    userId: createdBy,
    action: 'API_KEY_CREATED',
    resourceType: 'api_key',
    resourceId: newKey.id,
    metadata: {
      key_name: newKey.name,
      key_prefix: newKey.key_prefix,
      scopes: newKey.scopes,
    },
  });

  return { apiKey: newKey, secret: rawKey, rawKey };
}

/**
 * Validates an incoming API key Bearer token against workspace records and scopes.
 */
export async function verifyApiKey(
  rawKey: string,
  requiredScope?: ApiKeyScope
): Promise<{
  valid: boolean;
  apiKey?: ApiKey;
  workspaceId?: string;
  reason?: 'INVALID_FORMAT' | 'NOT_FOUND' | 'REVOKED' | 'EXPIRED' | 'INSUFFICIENT_SCOPE';
  error?: string;
}> {
  if (!rawKey || !rawKey.startsWith('nxs_live_')) {
    return { valid: false, reason: 'INVALID_FORMAT', error: 'Invalid API key format. Must begin with "nxs_live_".' };
  }

  const keyHash = await hashApiKey(rawKey);

  let match: ApiKey | null = null;

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await (supabase.from('api_keys') as any)
        .select('*')
        .eq('key_hash', keyHash)
        .maybeSingle();

      if (!error && data) {
        match = data as ApiKey;
      }
    } catch (e) {
      console.warn('[NEXUS ApiKeyService] Supabase verification query failed:', e);
    }
  }

  if (!match) {
    // Check local stores across workspaces
    if (typeof window === 'undefined') {
      for (const [, keys] of memoryApiKeys.entries()) {
        const found = keys.find((k) => k.key_hash === keyHash);
        if (found) {
          match = found;
          break;
        }
      }
    } else {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith(LOCAL_API_KEYS_PREFIX)) {
          try {
            const list: ApiKey[] = JSON.parse(localStorage.getItem(k) || '[]');
            const found = list.find((item) => item.key_hash === keyHash);
            if (found) {
              match = found;
              break;
            }
          } catch {}
        }
      }
    }
  }

  if (!match) {
    return { valid: false, reason: 'NOT_FOUND', error: 'API key not recognized.' };
  }

  if (match.revoked_at) {
    return { valid: false, reason: 'REVOKED', error: 'API key has been revoked.' };
  }

  if (match.expires_at && new Date(match.expires_at).getTime() < Date.now()) {
    return { valid: false, reason: 'EXPIRED', error: 'API key has expired.' };
  }

  if (requiredScope && (!match.scopes || (!match.scopes.includes(requiredScope) && !match.scopes.includes('*')))) {
    return {
      valid: false,
      reason: 'INSUFFICIENT_SCOPE',
      error: `Missing required scope: API key lacks required scope "${requiredScope}". Authorized scopes: [${match.scopes?.join(', ')}]`,
    };
  }

  // Update last_used_at timestamp
  const nowIso = new Date().toISOString();
  match.last_used_at = nowIso;

  if (isSupabaseConfigured) {
    try {
      await (supabase.from('api_keys') as any)
        .update({ last_used_at: nowIso })
        .eq('id', match.id);
    } catch {}
  }

  const localKeys = getLocalApiKeys(match.workspace_id);
  const idx = localKeys.findIndex((k) => k.id === match!.id);
  if (idx !== -1) {
    localKeys[idx].last_used_at = nowIso;
    saveLocalApiKeys(match.workspace_id, localKeys);
  }

  return { valid: true, apiKey: match, workspaceId: match.workspace_id };
}

export type ApiKeysResult = ApiKey[] & { keys: ApiKey[] };

/**
 * Retrieves all API keys registered for a workspace.
 */
export async function getWorkspaceApiKeys(workspaceId: string): Promise<ApiKeysResult> {
  if (!workspaceId) {
    const empty: any = [];
    empty.keys = [];
    return empty as ApiKeysResult;
  }

  let rawList: ApiKey[] = [];

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await (supabase.from('api_keys') as any)
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        rawList = data as ApiKey[];
      }
    } catch (e) {
      console.warn('[NEXUS ApiKeyService] Supabase fetch failed, fallback to local:', e);
    }
  }

  if (rawList.length === 0) {
    rawList = getLocalApiKeys(workspaceId);
  }

  const list: ApiKey[] = rawList.map((k) => ({
    ...k,
    status: k.revoked_at
      ? 'revoked'
      : k.expires_at && new Date(k.expires_at).getTime() < Date.now()
      ? 'expired'
      : 'active',
  }));

  const res: any = [...list];
  res.keys = list;
  return res as ApiKeysResult;
}

/**
 * Revokes an API key.
 */
export async function revokeApiKey(
  workspaceId: string,
  keyId: string,
  userId?: string | null
): Promise<{ success: boolean; error?: string }> {
  const nowIso = new Date().toISOString();

  if (isSupabaseConfigured) {
    try {
      await (supabase.from('api_keys') as any)
        .update({ revoked_at: nowIso })
        .eq('id', keyId)
        .eq('workspace_id', workspaceId);
    } catch (e) {
      console.warn('[NEXUS ApiKeyService] Supabase revoke failed:', e);
    }
  }

  const local = getLocalApiKeys(workspaceId);
  const target = local.find((k) => k.id === keyId);
  if (target) {
    target.revoked_at = nowIso;
    saveLocalApiKeys(workspaceId, local);

    await recordAuditLog({
      workspaceId,
      userId: userId || null,
      action: 'API_KEY_REVOKED',
      resourceType: 'api_key',
      resourceId: keyId,
      metadata: { key_name: target.name, key_prefix: target.key_prefix },
    });

    return { success: true };
  }

  return { success: false, error: 'API key not found.' };
}
