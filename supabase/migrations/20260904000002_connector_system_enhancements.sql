-- ==============================================================================
-- NEXUS - Phase 2: Real Connector System & Workspace Activity Migration
-- ==============================================================================

-- 1. Ensure connector_connections table exists with proper unique constraints
CREATE TABLE IF NOT EXISTS public.connector_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    connector_id TEXT NOT NULL,
    provider_account_id TEXT NOT NULL,
    provider_account_name TEXT NOT NULL,
    provider_avatar_url TEXT,
    status TEXT NOT NULL DEFAULT 'connected' CHECK (status IN ('connected', 'disconnected', 'error', 'reauth_required')),
    scopes TEXT[] NOT NULL DEFAULT '{}',
    encrypted_access_token TEXT,
    encrypted_refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    last_used_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_workspace_connector_account UNIQUE (workspace_id, connector_id, provider_account_id)
);

-- 2. Create workspace_activities table for real execution and connector event auditing
CREATE TABLE IF NOT EXISTS public.workspace_activities (
    id TEXT PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('connector', 'agent', 'workflow', 'system')),
    action TEXT NOT NULL,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'running', 'failed')),
    duration TEXT DEFAULT '0.1s',
    details TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_connector_connections_workspace ON public.connector_connections(workspace_id);
CREATE INDEX IF NOT EXISTS idx_connector_connections_connector ON public.connector_connections(connector_id);
CREATE INDEX IF NOT EXISTS idx_workspace_activities_workspace ON public.workspace_activities(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_activities_created ON public.workspace_activities(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.connector_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_activities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to avoid duplication
DROP POLICY IF EXISTS "Workspace members can view connector connections" ON public.connector_connections;
DROP POLICY IF EXISTS "Workspace owners/admins can insert connector connections" ON public.connector_connections;
DROP POLICY IF EXISTS "Workspace owners/admins can update connector connections" ON public.connector_connections;
DROP POLICY IF EXISTS "Workspace owners/admins can delete connector connections" ON public.connector_connections;
DROP POLICY IF EXISTS "Workspace members can view workspace activities" ON public.workspace_activities;
DROP POLICY IF EXISTS "Workspace members can insert workspace activities" ON public.workspace_activities;

-- RLS Policies for connector_connections
CREATE POLICY "Workspace members can view connector connections"
    ON public.connector_connections FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = connector_connections.workspace_id
              AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace owners/admins can insert connector connections"
    ON public.connector_connections FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = connector_connections.workspace_id
              AND workspace_members.user_id = auth.uid()
              AND workspace_members.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Workspace owners/admins can update connector connections"
    ON public.connector_connections FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = connector_connections.workspace_id
              AND workspace_members.user_id = auth.uid()
              AND workspace_members.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Workspace owners/admins can delete connector connections"
    ON public.connector_connections FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = connector_connections.workspace_id
              AND workspace_members.user_id = auth.uid()
              AND workspace_members.role IN ('owner', 'admin')
        )
    );

-- RLS Policies for workspace_activities
CREATE POLICY "Workspace members can view workspace activities"
    ON public.workspace_activities FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = workspace_activities.workspace_id
              AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace members can insert workspace activities"
    ON public.workspace_activities FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = workspace_activities.workspace_id
              AND workspace_members.user_id = auth.uid()
        )
    );
