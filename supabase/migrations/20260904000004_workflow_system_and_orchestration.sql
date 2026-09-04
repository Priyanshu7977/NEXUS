-- ==============================================================================
-- NEXUS - Phase 4: Real Workflow Builder & Multi-Agent Orchestration Engine Migration
-- ==============================================================================

-- 1. Create workflows table
CREATE TABLE IF NOT EXISTS public.workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
    trigger_type TEXT NOT NULL DEFAULT 'manual' CHECK (trigger_type IN ('manual', 'github_event', 'schedule_cron', 'webhook')),
    trigger_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create workflow_nodes table
CREATE TABLE IF NOT EXISTS public.workflow_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
    node_key TEXT NOT NULL,
    node_type TEXT NOT NULL CHECK (node_type IN ('TRIGGER', 'AGENT', 'TOOL', 'CONDITION', 'APPROVAL', 'OUTPUT')),
    name TEXT NOT NULL,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    position_x NUMERIC NOT NULL DEFAULT 0,
    position_y NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_workflow_node_key UNIQUE (workflow_id, node_key)
);

-- 3. Create workflow_edges table
CREATE TABLE IF NOT EXISTS public.workflow_edges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
    source_node_key TEXT NOT NULL,
    target_node_key TEXT NOT NULL,
    source_handle TEXT,
    target_handle TEXT,
    condition_expression TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_workflow_edge UNIQUE (workflow_id, source_node_key, target_node_key, source_handle)
);

-- 4. Create workflow_executions table
CREATE TABLE IF NOT EXISTS public.workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'waiting_for_approval', 'completed', 'failed', 'cancelled')),
    trigger_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    context_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    output_data JSONB,
    error TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER NOT NULL DEFAULT 0,
    current_node_key TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Create workflow_execution_nodes table (tracks node level state)
CREATE TABLE IF NOT EXISTS public.workflow_execution_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID NOT NULL REFERENCES public.workflow_executions(id) ON DELETE CASCADE,
    node_key TEXT NOT NULL,
    node_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'waiting_for_approval', 'completed', 'skipped', 'failed')),
    input_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    output_data JSONB,
    error TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_execution_node UNIQUE (execution_id, node_key)
);

-- 6. Create workflow_execution_events table
CREATE TABLE IF NOT EXISTS public.workflow_execution_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID NOT NULL REFERENCES public.workflow_executions(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'WORKFLOW_STARTED', 
        'NODE_STARTED', 
        'NODE_COMPLETED', 
        'NODE_SKIPPED', 
        'APPROVAL_REQUESTED', 
        'APPROVAL_DECISION', 
        'TOOL_EXECUTED', 
        'AGENT_EXECUTED', 
        'WORKFLOW_COMPLETED', 
        'WORKFLOW_FAILED', 
        'WORKFLOW_PAUSED'
    )),
    node_key TEXT,
    status TEXT NOT NULL DEFAULT 'completed',
    message TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_workflows_workspace ON public.workflows(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON public.workflows(status);
CREATE INDEX IF NOT EXISTS idx_workflow_nodes_wf ON public.workflow_nodes(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_edges_wf ON public.workflow_edges(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_ws ON public.workflow_executions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_wf ON public.workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON public.workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_created ON public.workflow_executions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_exec_nodes_exec ON public.workflow_execution_nodes(execution_id);
CREATE INDEX IF NOT EXISTS idx_workflow_exec_events_exec ON public.workflow_execution_events(execution_id);
CREATE INDEX IF NOT EXISTS idx_workflow_exec_events_created ON public.workflow_execution_events(created_at ASC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_execution_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_execution_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Workspace members can view workflows" ON public.workflows;
DROP POLICY IF EXISTS "Workspace members can insert workflows" ON public.workflows;
DROP POLICY IF EXISTS "Workspace members can update workflows" ON public.workflows;
DROP POLICY IF EXISTS "Workspace members can delete workflows" ON public.workflows;

DROP POLICY IF EXISTS "Workspace members can view workflow nodes" ON public.workflow_nodes;
DROP POLICY IF EXISTS "Workspace members can manage workflow nodes" ON public.workflow_nodes;

DROP POLICY IF EXISTS "Workspace members can view workflow edges" ON public.workflow_edges;
DROP POLICY IF EXISTS "Workspace members can manage workflow edges" ON public.workflow_edges;

DROP POLICY IF EXISTS "Workspace members can view workflow executions" ON public.workflow_executions;
DROP POLICY IF EXISTS "Workspace members can insert workflow executions" ON public.workflow_executions;
DROP POLICY IF EXISTS "Workspace members can update workflow executions" ON public.workflow_executions;

DROP POLICY IF EXISTS "Workspace members can view workflow execution nodes" ON public.workflow_execution_nodes;
DROP POLICY IF EXISTS "Workspace members can manage workflow execution nodes" ON public.workflow_execution_nodes;

DROP POLICY IF EXISTS "Workspace members can view workflow execution events" ON public.workflow_execution_events;
DROP POLICY IF EXISTS "Workspace members can insert workflow execution events" ON public.workflow_execution_events;

-- RLS Policies for workflows
CREATE POLICY "Workspace members can view workflows"
    ON public.workflows FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = workflows.workspace_id
              AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace members can insert workflows"
    ON public.workflows FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = workflows.workspace_id
              AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace members can update workflows"
    ON public.workflows FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = workflows.workspace_id
              AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace members can delete workflows"
    ON public.workflows FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = workflows.workspace_id
              AND workspace_members.user_id = auth.uid()
        )
    );

-- RLS Policies for workflow_nodes
CREATE POLICY "Workspace members can view workflow nodes"
    ON public.workflow_nodes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.workflows
            JOIN public.workspace_members ON workspace_members.workspace_id = workflows.workspace_id
            WHERE workflows.id = workflow_nodes.workflow_id
              AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace members can manage workflow nodes"
    ON public.workflow_nodes FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.workflows
            JOIN public.workspace_members ON workspace_members.workspace_id = workflows.workspace_id
            WHERE workflows.id = workflow_nodes.workflow_id
              AND workspace_members.user_id = auth.uid()
        )
    );

-- RLS Policies for workflow_edges
CREATE POLICY "Workspace members can view workflow edges"
    ON public.workflow_edges FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.workflows
            JOIN public.workspace_members ON workspace_members.workspace_id = workflows.workspace_id
            WHERE workflows.id = workflow_edges.workflow_id
              AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace members can manage workflow edges"
    ON public.workflow_edges FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.workflows
            JOIN public.workspace_members ON workspace_members.workspace_id = workflows.workspace_id
            WHERE workflows.id = workflow_edges.workflow_id
              AND workspace_members.user_id = auth.uid()
        )
    );

-- RLS Policies for workflow_executions
CREATE POLICY "Workspace members can view workflow executions"
    ON public.workflow_executions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = workflow_executions.workspace_id
              AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace members can insert workflow executions"
    ON public.workflow_executions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = workflow_executions.workspace_id
              AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace members can update workflow executions"
    ON public.workflow_executions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = workflow_executions.workspace_id
              AND workspace_members.user_id = auth.uid()
        )
    );

-- RLS Policies for workflow_execution_nodes
CREATE POLICY "Workspace members can view workflow execution nodes"
    ON public.workflow_execution_nodes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.workflow_executions
            JOIN public.workspace_members ON workspace_members.workspace_id = workflow_executions.workspace_id
            WHERE workflow_executions.id = workflow_execution_nodes.execution_id
              AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace members can manage workflow execution nodes"
    ON public.workflow_execution_nodes FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.workflow_executions
            JOIN public.workspace_members ON workspace_members.workspace_id = workflow_executions.workspace_id
            WHERE workflow_executions.id = workflow_execution_nodes.execution_id
              AND workspace_members.user_id = auth.uid()
        )
    );

-- RLS Policies for workflow_execution_events
CREATE POLICY "Workspace members can view workflow execution events"
    ON public.workflow_execution_events FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.workflow_executions
            JOIN public.workspace_members ON workspace_members.workspace_id = workflow_executions.workspace_id
            WHERE workflow_executions.id = workflow_execution_events.execution_id
              AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace members can insert workflow execution events"
    ON public.workflow_execution_events FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.workflow_executions
            JOIN public.workspace_members ON workspace_members.workspace_id = workflow_executions.workspace_id
            WHERE workflow_executions.id = workflow_execution_events.execution_id
              AND workspace_members.user_id = auth.uid()
        )
    );
