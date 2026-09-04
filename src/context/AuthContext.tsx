import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Profile, Workspace, WorkspaceRole } from '../types/database';

export interface NexusUser {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  workspace?: string;
}

interface AuthContextType {
  user: NexusUser | null;
  rawUser: SupabaseUser | null;
  session: Session | null;
  profile: Profile | null;
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  setCurrentWorkspace: (workspace: Workspace) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSupabaseConnected: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signInWithOAuth: (provider: 'github' | 'google') => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  createWorkspace: (name: string) => Promise<{ workspace?: Workspace; error?: string }>;
  refreshWorkspaces: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'nexus_auth_user';
const LOCAL_STORAGE_WS_KEY = 'nexus_active_workspace_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rawUser, setRawUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspaceState] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fallback state for local simulation mode
  const [mockUser, setMockUser] = useState<NexusUser | null>(() => {
    if (isSupabaseConfigured) return null;
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Set and persist active workspace
  const setCurrentWorkspace = (workspace: Workspace) => {
    setCurrentWorkspaceState(workspace);
    try {
      localStorage.setItem(LOCAL_STORAGE_WS_KEY, workspace.id);
    } catch {
      // Ignore storage errors
    }
  };

  // Helper to fetch Profile from Supabase
  const fetchProfile = useCallback(async (userId: string, userEmail?: string, metadata?: Record<string, unknown>): Promise<Profile | null> => {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.warn('Error fetching profile:', error.message);
      }

      if (data) {
        const p = data as Profile;
        setProfile(p);
        return p;
      }

      // If trigger hasn't completed or profile table is empty, build safe profile from auth metadata
      const fallbackProfile: Profile = {
        id: userId,
        email: userEmail || '',
        display_name: (metadata?.full_name as string) || (metadata?.name as string) || userEmail?.split('@')[0] || 'Developer',
        avatar_url: (metadata?.avatar_url as string) || (metadata?.picture as string) || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setProfile(fallbackProfile);
      return fallbackProfile;
    } catch (err) {
      console.warn('Profile fetch exception:', err);
      return null;
    }
  }, []);

  // Helper to fetch Workspaces from Supabase
  const fetchWorkspaces = useCallback(async (userId: string, userName?: string): Promise<Workspace[]> => {
    if (!isSupabaseConfigured) return [];
    try {
      // Query workspace IDs where user is a member
      const { data: memberRows, error: memberErr } = await supabase
        .from('workspace_members')
        .select('workspace_id, role')
        .eq('user_id', userId);

      if (memberErr) {
        console.warn('Error querying workspace memberships:', memberErr.message);
      }

      let fetchedWorkspaces: Workspace[] = [];
      const members = (memberRows as { workspace_id: string; role: WorkspaceRole }[] | null) || [];

      if (members.length > 0) {
        const workspaceIds = members.map((m) => m.workspace_id);
        const { data: wsData, error: wsErr } = await supabase
          .from('workspaces')
          .select('*')
          .in('id', workspaceIds);

        if (!wsErr && wsData) {
          const wsList = wsData as Workspace[];
          fetchedWorkspaces = wsList.map((ws) => {
            const memberInfo = members.find((m) => m.workspace_id === ws.id);
            return {
              ...ws,
              role: memberInfo?.role || 'owner',
            };
          });
        }
      }

      // If no workspace exists in database yet, generate fallback
      if (fetchedWorkspaces.length === 0) {
        const defaultName = `${userName || 'Developer'}'s Workspace`;
        const defaultSlug = `workspace-${userId.slice(0, 6)}`;
        const fallbackWs: Workspace = {
          id: 'ws-default-' + userId.slice(0, 8),
          name: defaultName,
          slug: defaultSlug,
          owner_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          role: 'owner',
        };
        fetchedWorkspaces = [fallbackWs];
      }

      setWorkspaces(fetchedWorkspaces);

      // Restore previously selected workspace or select first
      const savedWsId = localStorage.getItem(LOCAL_STORAGE_WS_KEY);
      const matched = fetchedWorkspaces.find((w) => w.id === savedWsId);
      setCurrentWorkspaceState(matched || fetchedWorkspaces[0]);

      return fetchedWorkspaces;
    } catch (err) {
      console.warn('Workspace fetch exception:', err);
      return [];
    }
  }, []);

  // Initialize Supabase Auth Session
  useEffect(() => {
    let mounted = true;

    if (!isSupabaseConfigured) {
      setIsLoading(false);
      if (mockUser) {
        const mockWs: Workspace = {
          id: 'ws-mock-1',
          name: mockUser.workspace || `${mockUser.name}'s Workspace`,
          slug: 'personal-workspace',
          owner_id: mockUser.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          role: 'owner',
        };
        setWorkspaces([mockWs]);
        setCurrentWorkspaceState(mockWs);
      }
      return;
    }

    const initAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Error fetching session:', error.message);
        }

        if (mounted) {
          if (initialSession?.user) {
            setSession(initialSession);
            setRawUser(initialSession.user);
            const userProfile = await fetchProfile(
              initialSession.user.id,
              initialSession.user.email,
              initialSession.user.user_metadata
            );
            await fetchWorkspaces(
              initialSession.user.id,
              userProfile?.display_name || initialSession.user.email?.split('@')[0]
            );
          } else {
            setSession(null);
            setRawUser(null);
            setProfile(null);
            setWorkspaces([]);
            setCurrentWorkspaceState(null);
          }
        }
      } catch (err) {
        console.warn('Auth initialization error:', err);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    // Subscribe to real-time auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        setSession(newSession);
        setRawUser(newSession?.user ?? null);

        if (newSession?.user) {
          const userProfile = await fetchProfile(
            newSession.user.id,
            newSession.user.email,
            newSession.user.user_metadata
          );
          await fetchWorkspaces(
            newSession.user.id,
            userProfile?.display_name || newSession.user.email?.split('@')[0]
          );
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setWorkspaces([]);
          setCurrentWorkspaceState(null);
          try {
            localStorage.removeItem(LOCAL_STORAGE_WS_KEY);
          } catch {
            // Ignore
          }
        }
        setIsLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile, fetchWorkspaces, mockUser]);

  // Derived user representation
  const user: NexusUser | null = (() => {
    if (isSupabaseConfigured) {
      if (!rawUser) return null;
      return {
        id: rawUser.id,
        email: rawUser.email || '',
        name: profile?.display_name || rawUser.user_metadata?.full_name || rawUser.user_metadata?.name || rawUser.email?.split('@')[0] || 'Developer',
        avatar_url: profile?.avatar_url || rawUser.user_metadata?.avatar_url || rawUser.user_metadata?.picture,
        workspace: currentWorkspace?.name || 'Personal Workspace',
      };
    }
    return mockUser;
  })();

  const isAuthenticated = isSupabaseConfigured ? !!session?.user : !!mockUser;

  // Actions
  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured) {
      const simulatedUser: NexusUser = {
        id: 'usr_nexus_' + Math.random().toString(36).substring(2, 7),
        name: email.split('@')[0] || 'Developer',
        email,
        workspace: 'Personal Workspace',
      };
      setMockUser(simulatedUser);
      try {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(simulatedUser));
      } catch {
        // Ignore
      }
      return { success: true };
    }

    if (!password) {
      return { success: false, error: 'Password is required' };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.';
      return { success: false, error: message };
    }
  };

  const signup = async (name: string, email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured) {
      const simulatedUser: NexusUser = {
        id: 'usr_nexus_' + Math.random().toString(36).substring(2, 7),
        name,
        email,
        workspace: `${name}'s Workspace`,
      };
      setMockUser(simulatedUser);
      try {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(simulatedUser));
      } catch {
        // Ignore
      }
      return { success: true };
    }

    if (!password) {
      return { success: false, error: 'Password is required' };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            name: name,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user && !data.session) {
        return {
          success: true,
          error: 'Account created! Please check your email to confirm your account, then log in.',
        };
      }

      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      return { success: false, error: message };
    }
  };

  const signInWithOAuth = async (provider: 'github' | 'google'): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured) {
      const simulatedUser: NexusUser = {
        id: 'usr_oauth_' + Math.random().toString(36).substring(2, 7),
        name: `${provider === 'github' ? 'GitHub' : 'Google'} Developer`,
        email: `dev@${provider}.com`,
        workspace: 'Personal Workspace',
      };
      setMockUser(simulatedUser);
      try {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(simulatedUser));
      } catch {
        // Ignore
      }
      return { success: true };
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/app`,
        },
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'OAuth sign-in failed.';
      return { success: false, error: message };
    }
  };

  const logout = async (): Promise<void> => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Sign out error:', err);
      }
    }
    setMockUser(null);
    setRawUser(null);
    setSession(null);
    setProfile(null);
    setWorkspaces([]);
    setCurrentWorkspaceState(null);
    try {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      localStorage.removeItem(LOCAL_STORAGE_WS_KEY);
    } catch {
      // Ignore
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured) {
      return { success: true };
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Password reset request failed.';
      return { success: false, error: message };
    }
  };

  const updatePassword = async (password: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured) {
      return { success: true };
    }
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Password update failed.';
      return { success: false, error: message };
    }
  };

  const createWorkspace = async (name: string): Promise<{ workspace?: Workspace; error?: string }> => {
    if (!isSupabaseConfigured) {
      const newWs: Workspace = {
        id: 'ws-' + Math.random().toString(36).substring(2, 7),
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substring(2, 5),
        owner_id: user?.id || 'usr_mock',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        role: 'owner',
      };
      setWorkspaces((prev) => [...prev, newWs]);
      setCurrentWorkspace(newWs);
      return { workspace: newWs };
    }

    if (!rawUser) {
      return { error: 'Authentication required' };
    }

    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + rawUser.id.slice(0, 6);
      const { data: newWs, error: wsError } = await (supabase
        .from('workspaces') as any)
        .insert({
          name,
          slug,
          owner_id: rawUser.id,
        })
        .select()
        .single();

      if (wsError || !newWs) {
        return { error: wsError?.message || 'Failed to create workspace' };
      }

      const wsRow = newWs as Workspace;

      // Add owner membership record
      await (supabase.from('workspace_members') as any).insert({
        workspace_id: wsRow.id,
        user_id: rawUser.id,
        role: 'owner',
      });

      const fullWs: Workspace = { ...wsRow, role: 'owner' };
      setWorkspaces((prev) => [...prev, fullWs]);
      setCurrentWorkspace(fullWs);
      return { workspace: fullWs };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create workspace';
      return { error: message };
    }
  };

  const refreshProfile = async () => {
    if (rawUser) {
      await fetchProfile(rawUser.id, rawUser.email, rawUser.user_metadata);
    }
  };

  const refreshWorkspaces = async () => {
    if (rawUser) {
      await fetchWorkspaces(rawUser.id, profile?.display_name || undefined);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        rawUser,
        session,
        profile,
        workspaces,
        currentWorkspace,
        setCurrentWorkspace,
        isLoading,
        isAuthenticated,
        isSupabaseConnected: isSupabaseConfigured,
        login,
        signup,
        signInWithOAuth,
        logout,
        resetPassword,
        updatePassword,
        createWorkspace,
        refreshWorkspaces,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
