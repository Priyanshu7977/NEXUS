-- ==============================================================================
-- NEXUS - Phase 6: MCP + A2A + Universal Tool & Agent Protocol Layer Migration
-- ==============================================================================

-- 1. Create mcp_servers table (Model Context Protocol endpoints)
CREATE TABLE IF NOT EXISTS public.mcp_servers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    server_url TEXT NOT NULL,
    transport_type TEXT NOT NULL DEFAULT 'streamable_http' CHECK (transport_type IN ('sse', 'streamable_http', 'stdio', 'websocket')),
    status TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error', 'connecting')),
    protocol_version TEXT NOT NULL DEFAULT '2024-11-05',
    capabilities JSONB NOT NULL DEFAULT '[]'::jsonb,
    enabled_tools JSONB NOT NULL DEFAULT '[]'::jsonb,
    last_ping_at TIMESTAMPTZ,
    last_error TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_mcp_server_slug_per_workspace UNIQUE (workspace_id, slug)
);

-- 2. Create mcp_credentials table (Encrypted Auth Secrets for MCP servers)
CREATE TABLE IF NOT EXISTS public.mcp_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mcp_server_id UUID NOT NULL REFERENCES public.mcp_servers(id) ON DELETE CASCADE,
    auth_type TEXT NOT NULL DEFAULT 'none' CHECK (auth_type IN ('none', 'bearer', 'api_key', 'custom_header')),
    header_name TEXT,
    encrypted_secret TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_credentials_per_mcp_server UNIQUE (mcp_server_id)
);

-- 3. Create external_agents table (A2A Protocol External Agent Integrations)
CREATE TABLE IF NOT EXISTS public.external_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    endpoint_url TEXT NOT NULL,
    agent_card_url TEXT,
    protocol_version TEXT NOT NULL DEFAULT '0.3.0',
    status TEXT NOT NULL DEFAULT 'pending_verification' CHECK (status IN ('active', 'offline', 'error', 'pending_verification')),
    agent_card JSONB NOT NULL DEFAULT '{}'::jsonb,
    auth_type TEXT NOT NULL DEFAULT 'none' CHECK (auth_type IN ('none', 'bearer', 'api_key', 'custom_header')),
    header_name TEXT,
    encrypted_secret TEXT,
    timeout_ms INTEGER NOT NULL DEFAULT 30000,
    last_ping_at TIMESTAMPTZ,
    last_error TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_external_agent_slug_per_workspace UNIQUE (workspace_id, slug)
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_mcp_servers_ws ON public.mcp_servers(workspace_id);
CREATE INDEX IF NOT EXISTS idx_mcp_servers_status ON public.mcp_servers(status);
CREATE INDEX IF NOT EXISTS idx_mcp_credentials_server ON public.mcp_credentials(mcp_server_id);
CREATE INDEX IF NOT EXISTS idx_external_agents_ws ON public.external_agents(workspace_id);
CREATE INDEX IF NOT EXISTS idx_external_agents_status ON public.external_agents(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.mcp_servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcp_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_agents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Workspace members can view mcp servers" ON public.mcp_servers;
DROP POLICY IF EXISTS "Workspace members can insert mcp servers" ON public.mcp_servers;
DROP POLICY IF EXISTS "Workspace members can update mcp servers" ON public.mcp_servers;
DROP POLICY IF EXISTS "Workspace members can delete mcp servers" ON public.mcp_servers;

DROP POLICY IF EXISTS "Workspace members can view mcp credentials" ON public.mcp_credentials;
DROP POLICY IF EXISTS "Workspace members can insert mcp credentials" ON public.mcp_credentials;
DROP POLICY IF EXISTS "Workspace members can update mcp credentials" ON public.mcp_credentials;
DROP POLICY IF EXISTS "Workspace members can delete mcp credentials" ON public.mcp_credentials;

DROP POLICY IF EXISTS "Workspace members can view external agents" ON public.external_agents;
DROP POLICY IF EXISTS "Workspace members can insert external agents" ON public.external_agents;
DROP POLICY IF EXISTS "Workspace members can update external agents" ON public.external_agents;
DROP POLICY IF EXISTS "Workspace members can delete external agents" ON public.external_agents;

-- RLS Policies for mcp_servers
CREATE POLICY "Workspace members can view mcp servers"
    ON public.mcp_servers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = mcp_servers.workspace_id
              AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace members can insert mcp servers"
    ON public.mcp_servers FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = mcp_servers.workspace_id
              AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace members can update mcp servers"
    ON public.mcp_servers FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = mcp_servers.workspace_id
              AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace members can delete mcp servers"
    ON public.mcp_servers FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = mcp_servers.workspace_id
              AND workspace_members.user_id = auth.uid()
        )
    );

-- RLS Policies for mcp_credentials (restricted to workspace members via parent server)
CREATE POLICY "Workspace members can view mcp credentials"
    ON public.mcp_credentials FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.mcp_servers
            JOIN public.workspace_members ON workspace_members.workspace_id = mcp_servers.workspace_id
            WHERE mcp_servers.id = mcp_credentials.mcp_server_id
              AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace members can insert mcp credentials"
    ON public.mcp_credentials FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.mcp_servers
            JOIN public.workspace_members ON workspace_members.workspace_id = mcp_servers.workspace_id
            WHERE mcp_servers.id = mcp_credentials.mcp_server_id
              AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace members can update mcp credentials"
    ON public.mcp_credentials FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.mcp_servers
            JOIN public.workspace_members ON workspace_members.workspace_id = mcp_servers.workspace_id
            WHERE mcp_servers.id = mcp_credentials.mcp_server_id
              AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace members can delete mcp credentials"
    ON public.mcp_credentials FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.mcp_servers
            JOIN public.workspace_members ON workspace_members.workspace_id = mcp_servers.workspace_id
            WHERE mcp_servers.id = mcp_credentials.mcp_server_id
              AND workspace_members.user_id = auth.uid()
        )
    );

-- RLS Policies for external_agents
CREATE POLICY "Workspace members can view external agents"
    ON public.external_agents FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = external_agents.workspace_id
              AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace members can insert external agents"
    ON public.external_agents FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = external_agents.workspace_id
              AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace members can update external agents"
    ON public.external_agents FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = external_agents.workspace_id
              AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace members can delete external agents"
    ON public.external_agents FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = external_agents.workspace_id
              AND workspace_members.user_id = auth.uid()
        )
    );
