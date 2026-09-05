import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AuditLogEntry, AuditLogAction } from '../types/security';

const LOCAL_AUDIT_PREFIX = 'nexus_audit_logs_';

// In-memory fallback for testing / node runtime
const memoryAuditLogs = new Map<string, AuditLogEntry[]>();

export const getLocalAuditLogs = (workspaceId: string): AuditLogEntry[] => {
  if (typeof window === 'undefined') return memoryAuditLogs.get(workspaceId) || [];
  try {
    const raw = localStorage.getItem(`${LOCAL_AUDIT_PREFIX}${workspaceId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveLocalAuditLogs = (workspaceId: string, logs: AuditLogEntry[]): void => {
  memoryAuditLogs.set(workspaceId, logs);
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${LOCAL_AUDIT_PREFIX}${workspaceId}`, JSON.stringify(logs));
  } catch (err) {
    console.error('[NEXUS AuditService] Failed to save local audit logs:', err);
  }
};

/**
 * Strips any sensitive credentials or tokens from audit metadata objects.
 */
function sanitizeAuditMetadata(metadata: Record<string, any> = {}): Record<string, any> {
  const SENSITIVE_KEYS = ['token', 'secret', 'password', 'key', 'auth', 'access_token', 'refresh_token', 'private_key', 'api_key'];
  const sanitized: Record<string, any> = {};

  for (const [k, v] of Object.entries(metadata)) {
    if (SENSITIVE_KEYS.some((sk) => k.toLowerCase().includes(sk))) {
      sanitized[k] = '[REDACTED]';
    } else if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      sanitized[k] = sanitizeAuditMetadata(v);
    } else {
      sanitized[k] = v;
    }
  }

  return sanitized;
}

export type AuditLogsResult = AuditLogEntry[] & { logs: AuditLogEntry[] };

/**
 * Appends an immutable audit log record to the workspace's audit trail.
 */
export async function recordAuditLog(
  param1: string | {
    workspaceId: string;
    userId?: string | null;
    user_id?: string | null;
    action: AuditLogAction;
    resourceType?: string;
    resource_type?: string;
    resourceId?: string | null;
    resource_id?: string | null;
    metadata?: Record<string, any>;
    ipAddress?: string | null;
    ip_address?: string | null;
    userAgent?: string | null;
    user_agent?: string | null;
    status?: 'success' | 'failure';
  },
  param2?: {
    userId?: string | null;
    user_id?: string | null;
    action?: AuditLogAction;
    resourceType?: string;
    resource_type?: string;
    resourceId?: string | null;
    resource_id?: string | null;
    metadata?: Record<string, any>;
    ipAddress?: string | null;
    ip_address?: string | null;
    userAgent?: string | null;
    user_agent?: string | null;
    status?: 'success' | 'failure';
  }
): Promise<AuditLogEntry> {
  let workspaceId: string;
  let userId: string | null = null;
  let action: AuditLogAction;
  let resourceType: string;
  let resourceId: string | null = null;
  let metadata: Record<string, any> = {};
  let ipAddress: string | null = null;
  let userAgent: string | null = null;
  let status: 'success' | 'failure' = 'success';

  if (typeof param1 === 'string') {
    workspaceId = param1;
    const p = param2 || {};
    userId = p.userId || p.user_id || null;
    action = (p.action || 'SECURITY_VIOLATION') as AuditLogAction;
    resourceType = p.resourceType || p.resource_type || 'system';
    resourceId = p.resourceId || p.resource_id || null;
    metadata = p.metadata || {};
    ipAddress = p.ipAddress || p.ip_address || null;
    userAgent = p.userAgent || p.user_agent || (typeof navigator !== 'undefined' ? navigator.userAgent : null);
    status = p.status || 'success';
  } else {
    workspaceId = param1.workspaceId;
    userId = param1.userId || param1.user_id || null;
    action = param1.action;
    resourceType = param1.resourceType || param1.resource_type || 'system';
    resourceId = param1.resourceId || param1.resource_id || null;
    metadata = param1.metadata || {};
    ipAddress = param1.ipAddress || param1.ip_address || null;
    userAgent = param1.userAgent || param1.user_agent || (typeof navigator !== 'undefined' ? navigator.userAgent : null);
    status = param1.status || 'success';
  }

  const sanitizedMetadata = sanitizeAuditMetadata(metadata);

  const entry: AuditLogEntry = {
    id: `aud_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    workspace_id: workspaceId,
    user_id: userId,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    metadata: sanitizedMetadata,
    ip_address: ipAddress,
    user_agent: userAgent,
    status,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      await (supabase.from('audit_logs') as any).insert({
        id: entry.id,
        workspace_id: entry.workspace_id,
        user_id: entry.user_id,
        action: entry.action,
        resource_type: entry.resource_type,
        resource_id: entry.resource_id,
        metadata: entry.metadata,
        ip_address: entry.ip_address,
        user_agent: entry.user_agent,
      });
    } catch (e) {
      console.warn('[NEXUS AuditService] Supabase insert failed, saving locally:', e);
    }
  }

  const local = getLocalAuditLogs(workspaceId);
  local.unshift(entry);
  // Cap local history at 500 records
  if (local.length > 500) local.pop();
  saveLocalAuditLogs(workspaceId, local);

  return entry;
}

/**
 * Retrieves audit log records with filtering.
 */
export async function getWorkspaceAuditLogs(
  workspaceId: string,
  filters?: {
    userId?: string;
    action?: AuditLogAction;
    resourceType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }
): Promise<AuditLogsResult> {
  if (!workspaceId) {
    const empty: any = [];
    empty.logs = [];
    return empty as AuditLogsResult;
  }

  let list: AuditLogEntry[] = [];

  if (isSupabaseConfigured) {
    try {
      let query = (supabase.from('audit_logs') as any)
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (filters?.userId) query = query.eq('user_id', filters.userId);
      if (filters?.action) query = query.eq('action', filters.action);
      if (filters?.resourceType) query = query.eq('resource_type', filters.resourceType);
      if (filters?.startDate) query = query.gte('created_at', filters.startDate);
      if (filters?.endDate) query = query.lte('created_at', filters.endDate);
      if (filters?.limit) query = query.limit(filters.limit);

      const { data, error } = await query;
      if (!error && data) {
        list = data as AuditLogEntry[];
      }
    } catch (e) {
      console.warn('[NEXUS AuditService] Supabase query failed, falling back to local:', e);
    }
  }

  if (list.length === 0) {
    list = getLocalAuditLogs(workspaceId);
    if (filters?.userId) list = list.filter((l) => l.user_id === filters.userId);
    if (filters?.action) list = list.filter((l) => l.action === filters.action);
    if (filters?.resourceType) list = list.filter((l) => l.resource_type === filters.resourceType);
    if (filters?.startDate) {
      const startMs = new Date(filters.startDate).getTime();
      list = list.filter((l) => new Date(l.created_at).getTime() >= startMs);
    }
    if (filters?.endDate) {
      const endMs = new Date(filters.endDate).getTime();
      list = list.filter((l) => new Date(l.created_at).getTime() <= endMs);
    }
    if (filters?.limit) list = list.slice(0, filters.limit);
  }

  const res: any = [...list];
  res.logs = list;
  return res as AuditLogsResult;
}
