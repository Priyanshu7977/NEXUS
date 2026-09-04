-- ==============================================================================
-- NEXUS - Phase 7: Discovery + Agent & Connector Marketplace Migration
-- ==============================================================================

-- 1. Create publishers table (Publisher Identity & Verification)
CREATE TABLE IF NOT EXISTS public.publishers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    logo_url TEXT,
    website TEXT,
    verification_status TEXT NOT NULL DEFAULT 'UNVERIFIED' CHECK (verification_status IN ('UNVERIFIED', 'VERIFIED', 'OFFICIAL')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create marketplace_resources table (Universal Resource Abstraction)
CREATE TABLE IF NOT EXISTS public.marketplace_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publisher_id UUID REFERENCES public.publishers(id) ON DELETE SET NULL,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('AGENT', 'CONNECTOR', 'MCP_SERVER', 'EXTERNAL_AGENT', 'WORKFLOW')),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    short_description TEXT,
    icon TEXT,
    banner_url TEXT,
    category TEXT NOT NULL,
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    visibility TEXT NOT NULL DEFAULT 'PUBLIC' CHECK (visibility IN ('PUBLIC', 'UNLISTED', 'PRIVATE')),
    status TEXT NOT NULL DEFAULT 'PUBLISHED' CHECK (status IN ('DRAFT', 'SUBMITTED', 'PUBLISHED', 'UNPUBLISHED', 'ARCHIVED', 'REJECTED')),
    version TEXT NOT NULL DEFAULT '1.0.0',
    trust_level TEXT NOT NULL DEFAULT 'COMMUNITY' CHECK (trust_level IN ('COMMUNITY', 'VERIFIED', 'OFFICIAL')),
    source_resource_id TEXT,
    spec JSONB NOT NULL DEFAULT '{}'::jsonb,
    required_connectors JSONB NOT NULL DEFAULT '[]'::jsonb,
    required_capabilities JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Create marketplace_installations table (Tracks Workspace-Installed Instances)
CREATE TABLE IF NOT EXISTS public.marketplace_installations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES public.marketplace_resources(id) ON DELETE CASCADE,
    installed_version TEXT NOT NULL,
    installed_resource_id TEXT,
    status TEXT NOT NULL DEFAULT 'INSTALLED' CHECK (status IN ('INSTALLED', 'DISABLED', 'UNINSTALLED', 'UPDATE_AVAILABLE')),
    installed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    installed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_workspace_installed_resource UNIQUE (workspace_id, resource_id)
);

-- 4. Create marketplace_reports table (Safety & Abuse Reporting)
CREATE TABLE IF NOT EXISTS public.marketplace_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES public.marketplace_resources(id) ON DELETE CASCADE,
    reported_by_workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
    category TEXT NOT NULL CHECK (category IN ('MALWARE', 'CREDENTIAL_ABUSE', 'BROKEN', 'MISLEADING', 'COPYRIGHT', 'OTHER')),
    details TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'REVIEWED', 'DISMISSED', 'ACTIONED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Create marketplace_reviews table (Architectural Foundation for Reviews)
CREATE TABLE IF NOT EXISTS public.marketplace_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES public.marketplace_resources(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_review_per_resource UNIQUE (resource_id, user_id)
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_publishers_ws ON public.publishers(workspace_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_res_type ON public.marketplace_resources(type);
CREATE INDEX IF NOT EXISTS idx_marketplace_res_visibility ON public.marketplace_resources(visibility, status);
CREATE INDEX IF NOT EXISTS idx_marketplace_res_category ON public.marketplace_resources(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_res_ws ON public.marketplace_resources(workspace_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_inst_ws ON public.marketplace_installations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_inst_res ON public.marketplace_installations(resource_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_reports_res ON public.marketplace_reports(resource_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.publishers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view verified or public publishers" ON public.publishers;
DROP POLICY IF EXISTS "Workspace members can manage their publisher profile" ON public.publishers;

DROP POLICY IF EXISTS "Public marketplace resources are viewable by everyone" ON public.marketplace_resources;
DROP POLICY IF EXISTS "Workspace members can view and manage their published resources" ON public.marketplace_resources;

DROP POLICY IF EXISTS "Workspace members can view their installations" ON public.marketplace_installations;
DROP POLICY IF EXISTS "Workspace members can manage their installations" ON public.marketplace_installations;

DROP POLICY IF EXISTS "Users can submit marketplace reports" ON public.marketplace_reports;
DROP POLICY IF EXISTS "Workspace members can view their own reports" ON public.marketplace_reports;

-- RLS Policies for publishers
CREATE POLICY "Anyone can view verified or public publishers"
    ON public.publishers FOR SELECT
    USING (true);

CREATE POLICY "Workspace members can manage their publisher profile"
    ON public.publishers FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = publishers.workspace_id
              AND workspace_members.user_id = auth.uid()
        )
    );

-- RLS Policies for marketplace_resources (Strict Visibility Isolation)
CREATE POLICY "Public marketplace resources are viewable by everyone"
    ON public.marketplace_resources FOR SELECT
    USING (
        (visibility = 'PUBLIC' AND status = 'PUBLISHED')
        OR (visibility = 'UNLISTED' AND status = 'PUBLISHED')
        OR (
            EXISTS (
                SELECT 1 FROM public.workspace_members
                WHERE workspace_members.workspace_id = marketplace_resources.workspace_id
                  AND workspace_members.user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Workspace members can manage their published resources"
    ON public.marketplace_resources FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = marketplace_resources.workspace_id
              AND workspace_members.user_id = auth.uid()
        )
    );

-- RLS Policies for marketplace_installations
CREATE POLICY "Workspace members can view their installations"
    ON public.marketplace_installations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = marketplace_installations.workspace_id
              AND workspace_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Workspace members can manage their installations"
    ON public.marketplace_installations FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = marketplace_installations.workspace_id
              AND workspace_members.user_id = auth.uid()
        )
    );

-- RLS Policies for marketplace_reports
CREATE POLICY "Users can submit marketplace reports"
    ON public.marketplace_reports FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Workspace members can view their own reports"
    ON public.marketplace_reports FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = marketplace_reports.reported_by_workspace_id
              AND workspace_members.user_id = auth.uid()
        )
    );
