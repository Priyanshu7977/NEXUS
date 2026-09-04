-- ==============================================================================
-- NEXUS - Phase 3: Real AI Agent System & Agent Execution Runtime Migration
-- ==============================================================================

-- 1. Create agents table
CREATE TABLE IF NOT EXISTS public.agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    role TEXT DEFAULT 'Specialized Agent',
    description TEXT,
    instructions TEXT NOT NULL,
    model_provider TEXT NOT NULL DEFAULT 'gemini',
    model_name TEXT NOT NULL DEFAULT 'gemini-1.5-flash',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
    temperature NUMERIC(3, 2) NOT NULL DEFAULT 0.70,
    max_steps INTEGER NOT NULL DEFAULT 10,
    max_runtime_seconds INTEGER NOT NULL DEFAULT 300,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create agent_tools table (Granular Capability Permissions)
CREATE TABLE IF NOT EXISTS public.agent_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    connector_id TEXT NOT NULL,
    capability TEXT NOT NULL,
    permission_mode TEXT NOT NULL DEFAULT 'read_only' CHECK (permission_mode IN ('read_only', 'read_write', 'allowed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_agent_connector_capability UNIQUE (agent_id, connector_id, capability)
);

-- 3. Create agent_executions table
CREATE TABLE IF NOT EXISTS public.agent_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed', 'cancelled', 'limit_reached')),
    input TEXT NOT NULL,
    output TEXT,
    error TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ,
    steps_used INTEGER NOT NULL DEFAULT 0,
    duration_ms INTEGER NOT NULL DEFAULT 0,
    model TEXT,
    tokens_used INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Create agent_execution_events table
CREATE TABLE IF NOT EXISTS public.agent_execution_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID NOT NULL REFERENCES public.agent_executions(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('AGENT_STARTED', 'MODEL_REQUEST', 'TOOL_CALL', 'TOOL_RESULT', 'MODEL_RESPONSE', 'AGENT_COMPLETED', 'AGENT_FAILED', 'LIMIT_REACHED')),
    tool_name TEXT,
    status TEXT NOT NULL DEFAULT 'completed',
    message TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_agents_workspace ON public.agents(workspace_id);
CREATE INDEX IF NOT EXISTS idx_agents_status ON public.agents(status);
CREATE INDEX IF NOT EXISTS idx_agent_tools_agent ON public.agent_tools(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_executions_workspace ON public.agent_executions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_agent_executions_agent ON public.agent_executions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_executions_created ON public.agent_executions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_execution_events_exec ON public.agent_execution_events(execution_id);
CREATE INDEX IF NOT EXISTS idx_agent_execution_events_created ON public.agent_execution_events(created_at ASC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_execution_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Workspace members can view agents" ON public.agents;
DROP POLICY IF EXISTS "Workspace members can insert agents" ON public.agents;
DROP POLICY IF EXISTS "Workspace members can update agents" ON public.agents;
DROP POLICY IF EXISTS "Workspace members can delete agents" ON public.agents;

DROP POLICY IF EXISTS "Workspace members can view agent tools" ON public.agent_tools;
DROP POLICY IF EXISTS "Workspace members can manage agent tools" ON public.agent_tools;

DROP POLICY IF EXISTS "Workspace members can view executions" ON public.agent_executions;
DROP POLICY IF EXISTS "Workspace members can insert executions" ON public.agent_executions;
DROP POLICY IF EXISTS "Workspace members can update executions" ON public.agent_executions;

DROP POLICY IF EXISTS "Workspace members can view execution events" ON public.agent_execution_events;
DROP POLICY IF EXISTS "Workspace members can insert execution events" ON public.agent_execution_events;

-- RLS Policies for agents
CREATE POLICY "Workspace members can view agents"
    ON public.agents FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = agents.workspace_id
              AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace members can insert agents"
    ON public.agents FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = agents.workspace_id
              AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace members can update agents"
    ON public.agents FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = agents.workspace_id
              AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace members can delete agents"
    ON public.agents FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = agents.workspace_id
              AND workspace_members.user_id = auth.uid()
        )
    );

-- RLS Policies for agent_tools
CREATE POLICY "Workspace members can view agent tools"
    ON public.agent_tools FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.agents
            JOIN public.workspace_members ON workspace_members.workspace_id = agents.workspace_id
            WHERE agents.id = agent_tools.agent_id
              AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace members can manage agent tools"
    ON public.agent_tools FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.agents
            JOIN public.workspace_members ON workspace_members.workspace_id = agents.workspace_id
            WHERE agents.id = agent_tools.agent_id
              AND workspace_members.user_id = auth.uid()
        )
    );

-- RLS Policies for agent_executions
CREATE POLICY "Workspace members can view executions"
    ON public.agent_executions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = agent_executions.workspace_id
              AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace members can insert executions"
    ON public.agent_executions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = agent_executions.workspace_id
              AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace members can update executions"
    ON public.agent_executions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = agent_executions.workspace_id
              AND workspace_members.user_id = auth.uid()
        )
    );

-- RLS Policies for agent_execution_events
CREATE POLICY "Workspace members can view execution events"
    ON public.agent_execution_events FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.agent_executions
            JOIN public.workspace_members ON workspace_members.workspace_id = agent_executions.workspace_id
            WHERE agent_executions.id = agent_execution_events.execution_id
              AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace members can insert execution events"
    ON public.agent_execution_events FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.agent_executions
            JOIN public.workspace_members ON workspace_members.workspace_id = agent_executions.workspace_id
            WHERE agent_executions.id = agent_execution_events.execution_id
              AND workspace_members.user_id = auth.uid()
        )
    );
