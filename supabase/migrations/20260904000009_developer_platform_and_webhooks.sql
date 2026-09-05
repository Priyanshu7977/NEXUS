-- ====================================================================
-- NEXUS PHASE 10: DEVELOPER PLATFORM, PUBLIC API & WEBHOOKS
-- ====================================================================

-- 1. Developer Webhooks Table
CREATE TABLE IF NOT EXISTS developer_webhooks (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  secret_encrypted TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_developer_webhooks_workspace ON developer_webhooks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_developer_webhooks_status ON developer_webhooks(workspace_id, status);

-- 2. Webhook Deliveries Table
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id TEXT PRIMARY KEY,
  webhook_id TEXT NOT NULL REFERENCES developer_webhooks(id) ON DELETE CASCADE,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  response_status INTEGER,
  response_body TEXT,
  attempt_count INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'failed', 'retrying')),
  delivered_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook ON webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_workspace ON webhook_deliveries(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_event ON webhook_deliveries(event_id);

-- 3. API Idempotency Keys Table
CREATE TABLE IF NOT EXISTS api_idempotency_keys (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  idempotency_key TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  execution_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_idempotency_ws_key ON api_idempotency_keys(workspace_id, idempotency_key);
CREATE INDEX IF NOT EXISTS idx_idempotency_expires ON api_idempotency_keys(expires_at);

-- 4. Enable RLS
ALTER TABLE developer_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_idempotency_keys ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
CREATE POLICY "Users can manage developer webhooks within authorized workspace"
  ON developer_webhooks FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view webhook deliveries within authorized workspace"
  ON webhook_deliveries FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view idempotency records within authorized workspace"
  ON api_idempotency_keys FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );
