-- ==============================================================================
-- NEXUS DATABASE MIGRATION — PHASE 8
-- SECURITY + GOVERNANCE + WORKSPACE CONTROL + ROW LEVEL SECURITY
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ENHANCE WORKSPACE MEMBERS TABLE
-- ------------------------------------------------------------------------------
ALTER TABLE public.workspace_members 
  DROP CONSTRAINT IF EXISTS workspace_members_role_check;

ALTER TABLE public.workspace_members 
  ADD CONSTRAINT workspace_members_role_check 
  CHECK (role IN ('owner', 'admin', 'member', 'viewer'));

ALTER TABLE public.workspace_members
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended')),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());

-- ------------------------------------------------------------------------------
-- 2. CREATE API KEYS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  scopes TEXT[] NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS api_keys_workspace_id_idx ON public.api_keys(workspace_id);
CREATE INDEX IF NOT EXISTS api_keys_key_hash_idx ON public.api_keys(key_hash);
CREATE INDEX IF NOT EXISTS api_keys_key_prefix_idx ON public.api_keys(key_prefix);

-- ------------------------------------------------------------------------------
-- 3. CREATE AUDIT LOGS TABLE (APPEND-ONLY)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS audit_logs_workspace_id_idx ON public.audit_logs(workspace_id);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON public.audit_logs(user_id);

-- Immutability enforcement trigger: prohibit UPDATE or DELETE
CREATE OR REPLACE FUNCTION public.enforce_audit_log_immutability()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are append-only and cannot be updated or deleted.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_log_immutability ON public.audit_logs;
CREATE TRIGGER trg_audit_log_immutability
BEFORE UPDATE OR DELETE ON public.audit_logs
FOR EACH ROW EXECUTE FUNCTION public.enforce_audit_log_immutability();

-- ------------------------------------------------------------------------------
-- 4. CREATE WORKSPACE POLICIES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.workspace_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL UNIQUE REFERENCES public.workspaces(id) ON DELETE CASCADE,
  require_approval_for_deployment BOOLEAN NOT NULL DEFAULT true,
  allow_external_agents BOOLEAN NOT NULL DEFAULT true,
  allow_mcp BOOLEAN NOT NULL DEFAULT true,
  allow_marketplace_install BOOLEAN NOT NULL DEFAULT true,
  allow_public_publishing BOOLEAN NOT NULL DEFAULT false,
  max_workflow_runtime INTEGER NOT NULL DEFAULT 300,
  max_workflow_nodes INTEGER NOT NULL DEFAULT 30,
  max_agent_steps INTEGER NOT NULL DEFAULT 25,
  max_tool_calls INTEGER NOT NULL DEFAULT 20,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS workspace_policies_workspace_id_idx ON public.workspace_policies(workspace_id);

-- ------------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) HELPER FUNCTIONS
-- ------------------------------------------------------------------------------

-- Helper: Check if auth.uid() is an active member of the workspace
CREATE OR REPLACE FUNCTION public.is_workspace_member(ws_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = ws_id
      AND user_id = auth.uid()
      AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper: Get user's role in the workspace
CREATE OR REPLACE FUNCTION public.get_workspace_role(ws_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role INTO v_role
  FROM public.workspace_members
  WHERE workspace_id = ws_id
    AND user_id = auth.uid()
    AND status = 'active'
  LIMIT 1;

  RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Enable RLS on all newly created tables
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_policies ENABLE ROW LEVEL SECURITY;

-- API KEYS POLICIES
DROP POLICY IF EXISTS "Members can view workspace API keys" ON public.api_keys;
CREATE POLICY "Members can view workspace API keys"
ON public.api_keys FOR SELECT
TO authenticated
USING (public.is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "Owner and Admin can insert API keys" ON public.api_keys;
CREATE POLICY "Owner and Admin can insert API keys"
ON public.api_keys FOR INSERT
TO authenticated
WITH CHECK (
  public.is_workspace_member(workspace_id)
  AND public.get_workspace_role(workspace_id) IN ('owner', 'admin')
);

DROP POLICY IF EXISTS "Owner and Admin can update API keys" ON public.api_keys;
CREATE POLICY "Owner and Admin can update API keys"
ON public.api_keys FOR UPDATE
TO authenticated
USING (
  public.is_workspace_member(workspace_id)
  AND public.get_workspace_role(workspace_id) IN ('owner', 'admin')
);

-- AUDIT LOGS POLICIES (Append-only)
DROP POLICY IF EXISTS "Members can view workspace audit logs" ON public.audit_logs;
CREATE POLICY "Members can view workspace audit logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING (public.is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.audit_logs;
CREATE POLICY "Authenticated users can insert audit logs"
ON public.audit_logs FOR INSERT
TO authenticated
WITH CHECK (public.is_workspace_member(workspace_id));

-- WORKSPACE POLICIES
DROP POLICY IF EXISTS "Members can view workspace policies" ON public.workspace_policies;
CREATE POLICY "Members can view workspace policies"
ON public.workspace_policies FOR SELECT
TO authenticated
USING (public.is_workspace_member(workspace_id));

DROP POLICY IF EXISTS "Owner and Admin can update workspace policies" ON public.workspace_policies;
CREATE POLICY "Owner and Admin can update workspace policies"
ON public.workspace_policies FOR UPDATE
TO authenticated
USING (
  public.is_workspace_member(workspace_id)
  AND public.get_workspace_role(workspace_id) IN ('owner', 'admin')
);

DROP POLICY IF EXISTS "Owner can insert workspace policies" ON public.workspace_policies;
CREATE POLICY "Owner can insert workspace policies"
ON public.workspace_policies FOR INSERT
TO authenticated
WITH CHECK (
  public.is_workspace_member(workspace_id)
  AND public.get_workspace_role(workspace_id) IN ('owner', 'admin')
);
