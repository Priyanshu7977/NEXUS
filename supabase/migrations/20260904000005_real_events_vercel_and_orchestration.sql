-- ==============================================================================
-- NEXUS - Phase 5: Real Events, Vercel Connector & End-to-End Orchestration Migration
-- ==============================================================================

-- 1. Create external_events table (External Webhook Ingestion & Audit Trail)
CREATE TABLE IF NOT EXISTS public.external_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('github', 'vercel', 'webhook')),
    event_type TEXT NOT NULL,
    external_event_id TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    received_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    processed_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'RECEIVED' CHECK (status IN ('RECEIVED', 'PROCESSING', 'PROCESSED', 'FAILED', 'IGNORED')),
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_external_event_per_workspace UNIQUE (workspace_id, provider, external_event_id)
);

-- 2. Create deployments table (Vercel & Platform Deployment Tracking)
CREATE TABLE IF NOT EXISTS public.deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    workflow_execution_id UUID REFERENCES public.workflow_executions(id) ON DELETE SET NULL,
    connector_connection_id UUID REFERENCES public.connector_connections(id) ON DELETE SET NULL,
    project_id TEXT NOT NULL,
    project_name TEXT NOT NULL,
    external_deployment_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'QUEUED' CHECK (status IN ('QUEUED', 'BUILDING', 'READY', 'ERROR', 'CANCELLED')),
    url TEXT,
    commit_sha TEXT,
    branch TEXT,
    target TEXT NOT NULL DEFAULT 'production' CHECK (target IN ('production', 'preview')),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_external_events_ws ON public.external_events(workspace_id);
CREATE INDEX IF NOT EXISTS idx_external_events_prov ON public.external_events(provider, event_type);
CREATE INDEX IF NOT EXISTS idx_external_events_status ON public.external_events(status);
CREATE INDEX IF NOT EXISTS idx_external_events_received ON public.external_events(received_at DESC);

CREATE INDEX IF NOT EXISTS idx_deployments_ws ON public.deployments(workspace_id);
CREATE INDEX IF NOT EXISTS idx_deployments_exec ON public.deployments(workflow_execution_id);
CREATE INDEX IF NOT EXISTS idx_deployments_status ON public.deployments(status);
CREATE INDEX IF NOT EXISTS idx_deployments_created ON public.deployments(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.external_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Workspace members can view external events" ON public.external_events;
DROP POLICY IF EXISTS "Workspace members can insert external events" ON public.external_events;
DROP POLICY IF EXISTS "Workspace members can update external events" ON public.external_events;

DROP POLICY IF EXISTS "Workspace members can view deployments" ON public.deployments;
DROP POLICY IF EXISTS "Workspace members can insert deployments" ON public.deployments;
DROP POLICY IF EXISTS "Workspace members can update deployments" ON public.deployments;

-- RLS Policies for external_events
CREATE POLICY "Workspace members can view external events"
    ON public.external_events FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = external_events.workspace_id
              AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace members can insert external events"
    ON public.external_events FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = external_events.workspace_id
              AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace members can update external events"
    ON public.external_events FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = external_events.workspace_id
              AND workspace_members.user_id = auth.uid()
        )
    );

-- RLS Policies for deployments
CREATE POLICY "Workspace members can view deployments"
    ON public.deployments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = deployments.workspace_id
              AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace members can insert deployments"
    ON public.deployments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = deployments.workspace_id
              AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace members can update deployments"
    ON public.deployments FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = deployments.workspace_id
              AND workspace_members.user_id = auth.uid()
        )
    );
