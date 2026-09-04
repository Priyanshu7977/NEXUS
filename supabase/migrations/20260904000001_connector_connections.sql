-- ==============================================================================
-- NEXUS MIGRATION: CONNECTOR CONNECTIONS TABLE & RLS POLICIES
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. CONNECTOR CONNECTIONS TABLE
-- ------------------------------------------------------------------------------
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
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  last_used_at TIMESTAMPTZ,
  UNIQUE (workspace_id, connector_id, provider_account_id)
);

CREATE INDEX IF NOT EXISTS connector_connections_workspace_id_idx ON public.connector_connections(workspace_id);
CREATE INDEX IF NOT EXISTS connector_connections_connector_id_idx ON public.connector_connections(connector_id);
CREATE INDEX IF NOT EXISTS connector_connections_workspace_connector_idx ON public.connector_connections(workspace_id, connector_id);

-- Updated_at trigger for connector_connections
DROP TRIGGER IF EXISTS set_connector_connections_updated_at ON public.connector_connections;
CREATE TRIGGER set_connector_connections_updated_at
BEFORE UPDATE ON public.connector_connections
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.connector_connections ENABLE ROW LEVEL SECURITY;

-- Select policy: Workspace members can view connector connections
DROP POLICY IF EXISTS "Workspace members can view connector connections" ON public.connector_connections;
CREATE POLICY "Workspace members can view connector connections"
ON public.connector_connections FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.workspace_members wm
    WHERE wm.workspace_id = connector_connections.workspace_id
    AND wm.user_id = auth.uid()
  )
);

-- Insert policy: Workspace owners and admins can create connector connections
DROP POLICY IF EXISTS "Workspace owners and admins can create connector connections" ON public.connector_connections;
CREATE POLICY "Workspace owners and admins can create connector connections"
ON public.connector_connections FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.workspace_members wm
    WHERE wm.workspace_id = connector_connections.workspace_id
    AND wm.user_id = auth.uid()
    AND wm.role IN ('owner', 'admin')
  )
);

-- Update policy: Workspace owners and admins can update connector connections
DROP POLICY IF EXISTS "Workspace owners and admins can update connector connections" ON public.connector_connections;
CREATE POLICY "Workspace owners and admins can update connector connections"
ON public.connector_connections FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.workspace_members wm
    WHERE wm.workspace_id = connector_connections.workspace_id
    AND wm.user_id = auth.uid()
    AND wm.role IN ('owner', 'admin')
  )
);

-- Delete policy: Workspace owners and admins can remove connector connections
DROP POLICY IF EXISTS "Workspace owners and admins can delete connector connections" ON public.connector_connections;
CREATE POLICY "Workspace owners and admins can delete connector connections"
ON public.connector_connections FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.workspace_members wm
    WHERE wm.workspace_id = connector_connections.workspace_id
    AND wm.user_id = auth.uid()
    AND wm.role IN ('owner', 'admin')
  )
);
