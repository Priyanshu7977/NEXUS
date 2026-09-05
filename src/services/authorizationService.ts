import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { WorkspaceRole, Permission, ROLE_PERMISSIONS } from '../types/security';
import { WorkspaceMember } from '../types/database';

export class AuthorizationError extends Error {
  public code: 'UNAUTHORIZED' | 'FORBIDDEN';
  public permission?: Permission;

  constructor(message: string, code: 'UNAUTHORIZED' | 'FORBIDDEN' = 'FORBIDDEN', permission?: Permission) {
    super(message);
    this.name = 'AuthorizationError';
    this.code = code;
    this.permission = permission;
  }
}

const LOCAL_MEMBERS_PREFIX = 'nexus_ws_members_';

// In-memory fallback for testing / node runtime
const memoryMembers = new Map<string, WorkspaceMember[]>();

export const getLocalWorkspaceMembers = (workspaceId: string): WorkspaceMember[] => {
  if (typeof window === 'undefined') return memoryMembers.get(workspaceId) || [];
  try {
    const raw = localStorage.getItem(`${LOCAL_MEMBERS_PREFIX}${workspaceId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveLocalWorkspaceMembers = (workspaceId: string, members: WorkspaceMember[]): void => {
  memoryMembers.set(workspaceId, members);
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${LOCAL_MEMBERS_PREFIX}${workspaceId}`, JSON.stringify(members));
  } catch (err) {
    console.error('[NEXUS AuthorizationService] Failed to save local members:', err);
  }
};

/**
 * Checks if a role inherently grants a given permission based on the security matrix.
 */
export const hasRolePermission = (role: WorkspaceRole, permission: Permission): boolean => {
  const allowed = ROLE_PERMISSIONS[role] || [];
  return allowed.includes(permission);
};

/**
 * Retrieves the workspace membership details for a specific user.
 */
export const getWorkspaceMembership = async (
  workspaceId: string,
  userId: string
): Promise<WorkspaceMember | null> => {
  if (!workspaceId || !userId) return null;

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && data) {
        return data as WorkspaceMember;
      }
    } catch (e) {
      console.warn('[NEXUS AuthorizationService] Supabase membership lookup failed, fallback to local:', e);
    }
  }

  // Local storage / memory lookup
  const members = getLocalWorkspaceMembers(workspaceId);
  const found = members.find((m) => m.user_id === userId || (userId === 'current_user' && m.role === 'owner'));
  if (found) return found;

  // If there is an existing placeholder owner 'current_user' and an actual user is requesting access,
  // promote that placeholder to this user ID
  const placeholderOwner = members.find((m) => m.user_id === 'current_user' && m.role === 'owner');
  if (placeholderOwner) {
    placeholderOwner.user_id = userId;
    saveLocalWorkspaceMembers(workspaceId, members);
    return placeholderOwner;
  }

  // Fallback: If no members registered yet for workspace, default to owner for primary user
  if (members.length === 0) {
    const defaultMember: WorkspaceMember = {
      id: `mem_${userId.slice(0, 8)}_${workspaceId.slice(0, 8)}`,
      workspace_id: workspaceId,
      user_id: userId,
      role: 'owner',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    members.push(defaultMember);
    saveLocalWorkspaceMembers(workspaceId, members);
    return defaultMember;
  }

  return null;
};

/**
 * Authorizes an operation for a user inside a target workspace context.
 * Performs Identity -> Workspace -> Role -> Resource checks.
 */
export const authorize = async (params: {
  user: { id: string; email?: string } | null;
  workspaceId: string;
  permission: Permission;
  resourceOwnerId?: string;
}): Promise<{ authorized: boolean; reason?: string; role?: WorkspaceRole }> => {
  const { user, workspaceId, permission, resourceOwnerId } = params;

  // 1. Identity Check
  if (!user || !user.id) {
    return {
      authorized: false,
      reason: 'Authentication required. No active identity session detected.',
    };
  }

  // 2. Workspace Membership Check
  const membership = await getWorkspaceMembership(workspaceId, user.id);
  if (!membership) {
    return {
      authorized: false,
      reason: 'Access denied. You are not a member of this workspace.',
    };
  }

  if (membership.status && membership.status !== 'active') {
    return {
      authorized: false,
      reason: `Access denied. Workspace membership status is ${membership.status}.`,
    };
  }

  const role = membership.role as WorkspaceRole;

  // 3. Role Permission Matrix Check
  if (!hasRolePermission(role, permission)) {
    return {
      authorized: false,
      role,
      reason: `Permission denied. Role "${role.toUpperCase()}" lacks capability "${permission}".`,
    };
  }

  // 4. Resource Ownership Boundaries (e.g. member updating someone else's resource)
  if (role === 'member' && resourceOwnerId && resourceOwnerId !== user.id) {
    const isMutation = permission.endsWith('.update') || permission.endsWith('.delete');
    if (isMutation) {
      return {
        authorized: false,
        role,
        reason: 'Permission denied. Regular members cannot modify resources owned by other members.',
      };
    }
  }

  return { authorized: true, role };
};

/**
 * Enforces authorization, throwing an AuthorizationError if denied.
 */
export const requirePermission = async (params: {
  user: { id: string; email?: string } | null;
  workspaceId: string;
  permission: Permission;
  resourceOwnerId?: string;
}): Promise<{ role: WorkspaceRole }> => {
  const result = await authorize(params);
  if (!result.authorized) {
    const code = !params.user ? 'UNAUTHORIZED' : 'FORBIDDEN';
    throw new AuthorizationError(
      result.reason || `Permission denied for capability "${params.permission}".`,
      code,
      params.permission
    );
  }
  return { role: result.role! };
};

// --- Role Capability Guards ---

export const canManageMembers = (role: WorkspaceRole): boolean => {
  return role === 'owner' || role === 'admin';
};

export const canManageWorkspace = (role: WorkspaceRole): boolean => {
  return role === 'owner' || role === 'admin';
};

export const canManagePolicies = (role: WorkspaceRole): boolean => {
  return role === 'owner' || role === 'admin';
};

export const canManageApiKeys = (role: WorkspaceRole): boolean => {
  return role === 'owner' || role === 'admin';
};

export const canExecuteWorkflows = (role: WorkspaceRole): boolean => {
  return role !== 'viewer';
};

export const canExecuteAgents = (role: WorkspaceRole): boolean => {
  return role !== 'viewer';
};

/**
 * Retrieves all members of a workspace.
 */
export const getWorkspaceMembers = async (workspaceId: string): Promise<WorkspaceMember[]> => {
  if (!workspaceId) return [];

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        return data as WorkspaceMember[];
      }
    } catch (err) {
      console.warn('[NEXUS AuthorizationService] Error querying workspace members:', err);
    }
  }

  const local = getLocalWorkspaceMembers(workspaceId);
  if (local.length === 0) {
    // Return at least the current default owner
    const defaultOwner: WorkspaceMember = {
      id: `mem_owner_${workspaceId.slice(0, 8)}`,
      workspace_id: workspaceId,
      user_id: 'current_user',
      role: 'owner',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    local.push(defaultOwner);
    saveLocalWorkspaceMembers(workspaceId, local);
  }
  return local;
};

/**
 * Invites a new user to the workspace.
 */
export const inviteWorkspaceMember = async (params: {
  workspaceId: string;
  email: string;
  role: WorkspaceRole;
  invitedByUserId: string;
}): Promise<WorkspaceMember> => {
  const { workspaceId, email, role, invitedByUserId } = params;

  // Authorization check
  const inviter = await getWorkspaceMembership(workspaceId, invitedByUserId);
  if (!inviter || !canManageMembers(inviter.role as WorkspaceRole)) {
    throw new AuthorizationError('Only Workspace Owners or Admins can invite new members.');
  }

  const newMember: WorkspaceMember & { email?: string } = {
    id: `mem_${crypto.randomUUID().slice(0, 8)}`,
    workspace_id: workspaceId,
    user_id: `user_${crypto.randomUUID().slice(0, 8)}`,
    role,
    status: 'invited',
    email,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      await (supabase.from('workspace_members') as any).insert({
        id: newMember.id,
        workspace_id: workspaceId,
        user_id: newMember.user_id,
        role: newMember.role,
        status: newMember.status,
      });
    } catch (err) {
      console.warn('[NEXUS AuthorizationService] Supabase insert member failed, local fallback:', err);
    }
  }

  const members = getLocalWorkspaceMembers(workspaceId);
  members.push(newMember);
  saveLocalWorkspaceMembers(workspaceId, members);

  return newMember;
};

/**
 * Updates a workspace member's role. Protects against demoting the last owner.
 */
export const updateWorkspaceMemberRole = async (params: {
  workspaceId: string;
  memberId: string;
  newRole: WorkspaceRole;
  updatedByUserId: string;
}): Promise<WorkspaceMember> => {
  const { workspaceId, memberId, newRole, updatedByUserId } = params;

  const updater = await getWorkspaceMembership(workspaceId, updatedByUserId);
  if (!updater || !canManageMembers(updater.role as WorkspaceRole)) {
    throw new AuthorizationError('Only Workspace Owners or Admins can update member roles.');
  }

  const members = await getWorkspaceMembers(workspaceId);
  const targetMember = members.find((m) => m.id === memberId || m.user_id === memberId);
  if (!targetMember) {
    throw new Error('Workspace member not found.');
  }

  // Prevent demoting owner if they are the only owner
  if (targetMember.role === 'owner' && newRole !== 'owner') {
    const ownerCount = members.filter((m) => m.role === 'owner').length;
    if (ownerCount <= 1) {
      throw new Error('Cannot demote the primary owner. Transfer workspace ownership first.');
    }
  }

  targetMember.role = newRole;
  targetMember.updated_at = new Date().toISOString();

  if (isSupabaseConfigured) {
    try {
      await (supabase.from('workspace_members') as any)
        .update({ role: newRole, updated_at: targetMember.updated_at })
        .eq('id', targetMember.id);
    } catch (err) {
      console.warn('[NEXUS AuthorizationService] Supabase update member role failed:', err);
    }
  }

  saveLocalWorkspaceMembers(workspaceId, members);
  return targetMember;
};

/**
 * Removes a member from the workspace. Protects against removing an owner.
 */
export const removeWorkspaceMember = async (params: {
  workspaceId: string;
  memberId: string;
  removedByUserId: string;
}): Promise<void> => {
  const { workspaceId, memberId, removedByUserId } = params;

  const remover = await getWorkspaceMembership(workspaceId, removedByUserId);
  if (!remover || !canManageMembers(remover.role as WorkspaceRole)) {
    throw new AuthorizationError('Only Workspace Owners or Admins can remove members.');
  }

  const members = await getWorkspaceMembers(workspaceId);
  const targetMember = members.find((m) => m.id === memberId || m.user_id === memberId);
  if (!targetMember) {
    throw new Error('Workspace member not found.');
  }

  if (targetMember.role === 'owner') {
    throw new Error('Workspace owners cannot be removed from their own workspace.');
  }

  const filtered = members.filter((m) => m.id !== targetMember.id);

  if (isSupabaseConfigured) {
    try {
      await (supabase.from('workspace_members') as any).delete().eq('id', targetMember.id);
    } catch (err) {
      console.warn('[NEXUS AuthorizationService] Supabase delete member failed:', err);
    }
  }

  saveLocalWorkspaceMembers(workspaceId, filtered);
};

