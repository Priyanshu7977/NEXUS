import { supabase, isSupabaseConfigured } from '../lib/supabase';

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

const LOCAL_ACTIVITY_KEY = 'nexus_workspace_activities_';

export const getWorkspaceActivities = async (
  workspaceId: string
): Promise<{ activities: WorkspaceActivity[]; error?: string }> => {
  if (!workspaceId) {
    return { activities: [] };
  }

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('workspace_activities')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        return { activities: data as WorkspaceActivity[] };
      }
    } catch {
      // fallback to local store
    }
  }

  // Local storage fallback
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(`${LOCAL_ACTIVITY_KEY}${workspaceId}`);
      if (raw) {
        return { activities: JSON.parse(raw) };
      }
    } catch (err) {
      console.error('[NEXUS ActivityService] Failed to load local activities:', err);
    }
  }

  return { activities: [] };
};

export const logWorkspaceActivity = async (
  workspaceId: string,
  activity: {
    type: 'connector' | 'agent' | 'workflow' | 'system';
    action: string;
    name: string;
    status: 'completed' | 'running' | 'failed';
    duration?: string;
    details: string;
    metadata?: Record<string, any>;
  }
): Promise<WorkspaceActivity> => {
  const newActivity: WorkspaceActivity = {
    id: 'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    workspace_id: workspaceId,
    type: activity.type,
    action: activity.action,
    name: activity.name,
    status: activity.status,
    duration: activity.duration || '0.1s',
    details: activity.details,
    metadata: activity.metadata || {},
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      await (supabase
        .from('workspace_activities') as any)
        .insert([newActivity]);
    } catch {
      // persist locally
    }
  }

  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      const key = `${LOCAL_ACTIVITY_KEY}${workspaceId}`;
      const raw = localStorage.getItem(key);
      const list: WorkspaceActivity[] = raw ? JSON.parse(raw) : [];
      list.unshift(newActivity);
      // Keep last 100 activities
      if (list.length > 100) list.pop();
      localStorage.setItem(key, JSON.stringify(list));
    } catch (err) {
      console.error('[NEXUS ActivityService] Failed to persist activity:', err);
    }
  }

  return newActivity;
};
