import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { IdempotencyRecord } from '../types/api';

const LOCAL_IDEMPOTENCY_PREFIX = 'nexus_idempotency_';
const memoryIdempotency = new Map<string, IdempotencyRecord>();

/**
 * Checks whether an Idempotency-Key has already been used for this workspace.
 * Returns the cached record if valid and not expired.
 */
export async function checkIdempotencyKey(
  workspaceId: string,
  idempotencyKey: string
): Promise<IdempotencyRecord | null> {
  if (!workspaceId || !idempotencyKey) return null;

  const cacheKey = `${workspaceId}:${idempotencyKey}`;
  const now = Date.now();

  // 1. Check in-memory store
  const memRecord = memoryIdempotency.get(cacheKey);
  if (memRecord) {
    if (new Date(memRecord.expires_at).getTime() > now) {
      return memRecord;
    }
    memoryIdempotency.delete(cacheKey);
  }

  // 2. Check Supabase (if configured)
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await (supabase.from('api_idempotency_keys') as any)
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('idempotency_key', idempotencyKey)
        .single();

      if (!error && data) {
        if (new Date(data.expires_at).getTime() > now) {
          memoryIdempotency.set(cacheKey, data);
          return data as IdempotencyRecord;
        }
      }
    } catch {
      // fallback
    }
  }

  // 3. Check LocalStorage fallback
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(`${LOCAL_IDEMPOTENCY_PREFIX}${cacheKey}`);
      if (raw) {
        const parsed: IdempotencyRecord = JSON.parse(raw);
        if (new Date(parsed.expires_at).getTime() > now) {
          memoryIdempotency.set(cacheKey, parsed);
          return parsed;
        }
        localStorage.removeItem(`${LOCAL_IDEMPOTENCY_PREFIX}${cacheKey}`);
      }
    } catch {}
  }

  return null;
}

/**
 * Stores an idempotency record for a newly dispatched execution with a default 24h TTL.
 */
export async function storeIdempotencyKey(params: {
  workspaceId: string;
  idempotencyKey: string;
  resourceType: string;
  resourceId?: string | null;
  executionId: string;
  responseData?: any;
  ttlHours?: number;
}): Promise<IdempotencyRecord> {
  const {
    workspaceId,
    idempotencyKey,
    resourceType,
    resourceId = null,
    executionId,
    responseData = null,
    ttlHours = 24,
  } = params;

  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlHours * 60 * 60 * 1000).toISOString();
  const cacheKey = `${workspaceId}:${idempotencyKey}`;

  const record: IdempotencyRecord = {
    id: `idem_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    workspace_id: workspaceId,
    idempotency_key: idempotencyKey,
    resource_type: resourceType,
    resource_id: resourceId,
    execution_id: executionId,
    response_data: responseData,
    created_at: now.toISOString(),
    expires_at: expiresAt,
  };

  memoryIdempotency.set(cacheKey, record);

  if (isSupabaseConfigured) {
    try {
      await (supabase.from('api_idempotency_keys') as any).upsert({
        id: record.id,
        workspace_id: workspaceId,
        idempotency_key: idempotencyKey,
        resource_type: resourceType,
        resource_id: resourceId,
        execution_id: executionId,
        created_at: record.created_at,
        expires_at: expiresAt,
      });
    } catch (e) {
      console.warn('[NEXUS Idempotency] Supabase insert failed, cached locally:', e);
    }
  }

  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(`${LOCAL_IDEMPOTENCY_PREFIX}${cacheKey}`, JSON.stringify(record));
    } catch {}
  }

  return record;
}
