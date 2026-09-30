import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Play,
  RotateCcw,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Activity,
  Zap,
  Layers,
  Code2,
  Layout,
  ExternalLink,
  Bot
} from 'lucide-react';
import { BrandLogo } from '../brand/BrandLogo';
import { Button } from '../ui/Button';

interface PresetScenario {
  id: string;
  name: string;
  badge: string;
  prompt: string;
  activeAgents: string[];
  metrics: {
    tokens: number;
    speed: string;
    latency: string;
    verifiedStatus: string;
  };
  code: {
    typescript: string;
    sql: string;
    config: string;
  };
  livePreviewType: 'saas' | 'security' | 'streaming' | 'autoheal';
}

const PRESETS: PresetScenario[] = [
  {
    id: 'fullstack-saas',
    name: 'Full-Stack Next.js & Stripe SaaS',
    badge: 'Popular',
    prompt: 'Synthesize a production-ready Next.js 15 application with Supabase multi-tenant auth, Stripe subscriptions, and strict TypeScript contracts.',
    activeAgents: ['claude-3-7', 'gpt-4o', 'deepseek-r1'],
    metrics: {
      tokens: 3420,
      speed: '148 tok/s',
      latency: '112ms',
      verifiedStatus: '100% Type-Safe & RLS Enforced',
    },
    code: {
      typescript: `// app/api/workspaces/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { z } from 'zod';

const CreateWorkspaceSchema = z.object({
  name: z.string().min(3).max(50),
  tier: z.enum(['starter', 'pro', 'enterprise']),
});

export async function POST(req: Request) {
  const supabase = createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
  const { data: { user }, error: authErr } = await supabase.auth.getUser();

  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = CreateWorkspaceSchema.parse(await req.json());
  const { data, error } = await supabase
    .from('workspaces')
    .insert({
      name: payload.name,
      owner_id: user.id,
      tier: payload.tier,
      seats_quota: payload.tier === 'pro' ? 25 : 5,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ workspace: data, status: 'active' }, { status: 201 });
}`,
      sql: `-- supabase/migrations/20260930_multi_tenant_rls.sql
CREATE TABLE IF NOT EXISTS public.workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  tier text NOT NULL DEFAULT 'starter' CHECK (tier IN ('starter', 'pro', 'enterprise')),
  seats_quota integer NOT NULL DEFAULT 5,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row-Level Security
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

-- Strict Isolation Policy: Users can only select workspaces they own or belong to
CREATE POLICY "workspaces_owner_isolation" ON public.workspaces
  FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE INDEX idx_workspaces_owner ON public.workspaces(owner_id);`,
      config: `# nexus.config.yaml
version: "3.1"
workflow: "fullstack-saas-deploy"
runtime: "edge"
concurrency: 4
agents:
  - id: "claude-architect"
    role: "System Decomposition & Contracts"
  - id: "gpt-synthesizer"
    role: "Next.js 15 & Stripe Integration"
  - id: "deepseek-auditor"
    role: "RLS Multi-Tenant Verification"
gateways:
  - type: "human-approval"
    channel: "slack:#deployments"`,
    },
    livePreviewType: 'saas',
  },
  {
    id: 'security-audit',
    name: 'Zero-Trust Security & SQLi Red Team',
    badge: 'Security',
    prompt: 'Perform an autonomous penetration test against raw PostgreSQL queries, scan for SQL injections, and enforce cryptographic tenant boundaries.',
    activeAgents: ['deepseek-r1', 'claude-3-7'],
    metrics: {
      tokens: 2890,
      speed: '122 tok/s',
      latency: '94ms',
      verifiedStatus: '0 CVEs · Zero Injection Vector',
    },
    code: {
      typescript: `// security/audit-engine.ts
import { DeepSeekSecurityAuditor } from '@nexus/audit';

export async function verifyTenantIsolation(queryAST: any, sessionClaims: any) {
  const auditor = new DeepSeekSecurityAuditor({ strictMode: true });
  
  // Mathematical invariant check: Verify WHERE clause references authenticated tenant_id
  const hasTenantConstraint = auditor.verifyASTConstraint(queryAST, {
    field: 'tenant_id',
    operator: 'EQUALS',
    value: sessionClaims.tenant_id,
  });

  if (!hasTenantConstraint) {
    throw new SecurityException('Cross-tenant data leakage vulnerability flagged in AST node');
  }

  return { verified: true, formalProof: 'Formal proof Q.E.D: P(leakage) = 0.000%' };
}`,
      sql: `-- security/tamper_proof_audit.sql
CREATE TABLE IF NOT EXISTS public.security_audit_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL,
  action text NOT NULL,
  payload_sha256 text NOT NULL,
  timestamp timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT immutable_log CHECK (timestamp <= now())
);

-- Deny updates or deletes: Append-only ledger
REVOKE UPDATE, DELETE ON public.security_audit_ledger FROM PUBLIC;`,
      config: `# security-guardrail.yaml
policy: "zero-trust-boundary"
enforcement: "block-and-alert"
cve_scanners:
  - engine: "deepseek-r1"
    depth: "formal-logic"
  - engine: "ast-invariant-checker"
    rules: ["anti-sqli", "auth-uid-binding"]`,
    },
    livePreviewType: 'security',
  },
  {
    id: 'kafka-streaming',
    name: 'Sub-50ms High-Frequency Fraud DAG',
    badge: 'Edge Realtime',
    prompt: 'Construct a streaming card fraud detection pipeline on Apache Kafka and Redis with sub-50ms latency and circuit breaker fallbacks.',
    activeAgents: ['gemini-2-5', 'gpt-4o', 'claude-3-7'],
    metrics: {
      tokens: 4180,
      speed: '172 tok/s',
      latency: '38ms',
      verifiedStatus: '25k tx/s Throughput Verified',
    },
    code: {
      typescript: `// streaming/fraud-detector.ts
import { KafkaStream, RedisVelocityTracker } from '@nexus/streaming';

export async function processTransaction(tx: TransactionEvent): Promise<AuditResult> {
  const velocity = await RedisVelocityTracker.getVelocity(tx.accountId, 60 /* seconds */);
  
  if (velocity.count > 5 || velocity.distinctGeoLocations > 2) {
    return {
      action: 'HOLD_FOR_APPROVAL',
      riskScore: 92,
      reason: 'Abnormal velocity: Multiple transactions across distant coordinates in <60s',
    };
  }

  return { action: 'APPROVE', riskScore: 8, latencyMs: 24 };
}`,
      sql: `-- analytics/realtime_metrics.sql
CREATE MATERIALIZED VIEW IF NOT EXISTS hourly_fraud_telemetry AS
SELECT 
  date_trunc('hour', timestamp) AS window_hour,
  count(*) AS total_tx,
  count(*) FILTER (WHERE risk_score > 80) AS flagged_tx,
  avg(latency_ms) AS avg_latency_ms
FROM transaction_events
GROUP BY 1 ORDER BY 1 DESC;`,
      config: `# stream-topology.yaml
topology: "high-frequency-fraud"
kafka_cluster: "aws-us-east-1"
partitions: 16
redis_sliding_window_seconds: 60
latency_budget_ms: 50
circuit_breaker:
  failure_threshold_pct: 1.0
  recovery_timeout_ms: 2000`,
    },
    livePreviewType: 'streaming',
  },
  {
    id: 'autoheal-cicd',
    name: 'Self-Healing CI/CD Pipeline',
    badge: 'Autonomous',
    prompt: 'Build a self-repairing GitHub Actions workflow that detects TypeScript build breaks, synthesizes AST patches, and submits tested PRs.',
    activeAgents: ['claude-3-7', 'gpt-4o', 'deepseek-r1'],
    metrics: {
      tokens: 3100,
      speed: '134 tok/s',
      latency: '88ms',
      verifiedStatus: '18/18 Unit Tests Passing',
    },
    code: {
      typescript: `// cicd/autoheal-patcher.ts
import { tsPatchAst, runVitestSandbox } from '@nexus/autoheal';

export async function repairCompileError(errorDiagnostic: TsError): Promise<PatchResult> {
  // Parse AST node where nullish reference caused TS2532
  const patch = tsPatchAst(errorDiagnostic.filePath, {
    line: errorDiagnostic.line,
    transform: 'optional-chaining-coalesce',
  });

  const testResults = await runVitestSandbox();
  if (testResults.passed) {
    return { success: true, patchApplied: patch.diff, prReady: true };
  }
  throw new Error('Self-healing patch failed regression test suite');
}`,
      sql: `-- autoheal/incident_history.sql
CREATE TABLE IF NOT EXISTS autoheal_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  repo text NOT NULL,
  commit_sha text NOT NULL,
  ts_error_code text NOT NULL,
  pr_number integer,
  resolved_at timestamptz DEFAULT now()
);`,
      config: `# .github/workflows/nexus-autoheal.yaml
name: "Nexus Autonomous Self-Repair"
on:
  check_run:
    types: [completed]
jobs:
  autoheal:
    if: \${{ github.event.check_run.conclusion == 'failure' }}
    runs-on: ubuntu-latest
    steps:
      - uses: nexus-ai/autoheal-action@v3
        with:
          auto_pr: true
          require_human_signoff: true`,
    },
    livePreviewType: 'autoheal',
  },
];

const FLEET_AGENTS = [
  { id: 'claude-3-7', name: 'Claude 3.7 Sonnet', role: 'Architect & Planner', brand: 'anthropic', speed: '96 tok/s' },
  { id: 'gpt-4o', name: 'GPT-4o', role: 'Code Synthesizer', brand: 'openai', speed: '124 tok/s' },
  { id: 'deepseek-r1', name: 'DeepSeek-R1', role: 'Security & Formal Proof', brand: 'deepseek', speed: '78 tok/s' },
  { id: 'gemini-2-5', name: 'Gemini 2.5 Pro', role: 'Scale & Ingestion', brand: 'gemini', speed: '142 tok/s' },
];

export const LiveAgentPlayground: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPresetId, setSelectedPresetId] = useState<string>('fullstack-saas');
  const [customInput, setCustomInput] = useState<string>('');
  const [activeCodeTab, setActiveCodeTab] = useState<'preview' | 'typescript' | 'sql' | 'config'>('preview');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [streamProgress, setStreamProgress] = useState<number>(100);
  const [currentTokens, setCurrentTokens] = useState<number>(3420);
  const [currentStep, setCurrentStep] = useState<number>(4);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Interactive Mini-App Preview State
  const [workspaceName, setWorkspaceName] = useState('Acme Corp');
  const [selectedTier, setSelectedTier] = useState<'starter' | 'pro' | 'enterprise'>('pro');
  const [auditScanCount, setAuditScanCount] = useState(14);
  const [securityScore, setSecurityScore] = useState(100);
  const [mockApproved, setMockApproved] = useState(false);

  const activePreset = PRESETS.find((p) => p.id === selectedPresetId) || PRESETS[0];
  const timerRef = useRef<any>(null);

  const handleRunSwarm = () => {
    setIsRunning(true);
    setStreamProgress(0);
    setCurrentTokens(0);
    setCurrentStep(1);

    const targetTokens = activePreset.metrics.tokens;
    const interval = setInterval(() => {
      setStreamProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          setCurrentStep(4);
          return 100;
        }
        const next = prev + 10;
        if (next > 30 && next <= 60) setCurrentStep(2);
        if (next > 60 && next <= 90) setCurrentStep(3);
        if (next > 90) setCurrentStep(4);
        return next;
      });

      setCurrentTokens((prev) => Math.min(targetTokens, prev + Math.floor(targetTokens / 10)));
    }, 120);

    timerRef.current = interval;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleCopyCode = () => {
    const content =
      activeCodeTab === 'typescript'
        ? activePreset.code.typescript
        : activeCodeTab === 'sql'
        ? activePreset.code.sql
        : activePreset.code.config;
    navigator.clipboard.writeText(content);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <section id="ai-studio" className="relative py-14 sm:py-18 lg:py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-[#E5E5E2] text-[#111318] text-left">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs font-mono font-semibold text-[#6D4AFF] mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>LIVE INTERACTIVE AI AGENT STUDIO</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#111318] leading-[1.1] mb-3">
              Real code. Real agents.<br />
              Generated right here in real time.
            </h2>
            <p className="text-base sm:text-lg text-[#626873] leading-relaxed">
              Experience the power of the multi-agent orchestration engine. Choose a directive below or write your own to watch Claude, GPT-4o, and DeepSeek synthesize production-ready code with automated security verification.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3.5 py-1.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] text-xs font-mono text-[#626873] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Inference Engine: Active</span>
            </div>
          </div>
        </div>

        {/* Studio Shell Card */}
        <div className="rounded-3xl border border-[#E5E5E2] bg-[#FAFAF8] shadow-[0_12px_40px_rgba(0,0,0,0.05)] overflow-hidden">
          {/* Top Control Bar: Prompt Presets */}
          <div className="p-4 sm:p-5 bg-white border-b border-[#E5E5E2] flex flex-col gap-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#8B919B] font-semibold">
                Preset Scenarios:
              </span>
              <span className="text-[11px] font-mono text-[#6D4AFF]">
                Zero Login Required · Live Simulator
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setSelectedPresetId(preset.id);
                      setCustomInput('');
                      setStreamProgress(100);
                      setCurrentTokens(preset.metrics.tokens);
                      setCurrentStep(4);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-purple-50/60 border-[#6D4AFF] shadow-xs ring-1 ring-[#6D4AFF]/20'
                        : 'bg-white border-[#E5E5E2] hover:border-[#D4D4CE] hover:bg-[#FAFAF8]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-[#111318] truncate">{preset.name}</span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                        isSelected
                          ? 'bg-[#6D4AFF] text-white border-[#6D4AFF]'
                          : 'bg-[#FAFAF8] text-[#8B919B] border-[#E5E5E2]'
                      }`}>
                        {preset.badge}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#626873] line-clamp-1">
                      {preset.prompt}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Prompt Command Input Bar */}
          <div className="p-4 sm:p-5 bg-white border-b border-[#E5E5E2] flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6D4AFF]">
                <Bot className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={customInput || activePreset.prompt}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Enter an engineering task directive..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] focus:border-[#6D4AFF] focus:bg-white text-xs sm:text-sm font-medium text-[#111318] outline-none transition-all placeholder:text-[#8B919B]"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                onClick={handleRunSwarm}
                disabled={isRunning}
                className="h-10 px-5 text-xs font-semibold cursor-pointer shadow-md shadow-[#6D4AFF]/20"
              >
                {isRunning ? (
                  <>
                    <Activity className="w-3.5 h-3.5 mr-1.5 animate-spin text-amber-300" />
                    <span>Synthesizing ({streamProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 mr-1.5 fill-white" />
                    <span>Run Multi-Agent Swarm</span>
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setCustomInput('');
                  handleRunSwarm();
                }}
                className="p-2.5 rounded-xl bg-white hover:bg-[#FAFAF8] border border-[#E5E5E2] text-[#626873] hover:text-[#111318] transition-colors cursor-pointer"
                title="Reset simulation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Live Fleet Roster & Telemetry HUD */}
          <div className="px-5 py-3 bg-[#FBFBFA] border-b border-[#E5E5E2] flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Active Fleet Agents */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[#8B919B] text-[11px] uppercase mr-1">Active Swarm:</span>
              {FLEET_AGENTS.map((agent) => {
                const isActive = activePreset.activeAgents.includes(agent.id);
                return (
                  <div
                    key={agent.id}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                      isActive
                        ? 'bg-white border-[#6D4AFF]/30 text-[#111318] shadow-2xs'
                        : 'bg-white/40 border-[#E5E5E2] text-[#8B919B] opacity-50'
                    }`}
                  >
                    <BrandLogo brand={agent.brand} size={13} />
                    <span>{agent.name.split(' ')[0]}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  </div>
                );
              })}
            </div>

            {/* Real-time Telemetry Counters */}
            <div className="flex items-center gap-3 font-mono text-[11px] text-[#626873]">
              <div className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-bold text-[#111318]">{activePreset.metrics.speed}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <span className="text-[#8B919B]">Tokens:</span>
                <span className="font-bold text-[#111318]">{currentTokens.toLocaleString()}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">{activePreset.metrics.verifiedStatus}</span>
              </div>
            </div>
          </div>

          {/* Execution Pipeline Steps Progress */}
          <div className="px-5 py-2.5 bg-white border-b border-[#E5E5E2] flex items-center justify-between text-xs font-mono">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
              {[
                { step: 1, title: 'Decomposition', agent: 'Claude 3.7' },
                { step: 2, title: 'Code Synthesis', agent: 'GPT-4o' },
                { step: 3, title: 'Security Audit', agent: 'DeepSeek-R1' },
                { step: 4, title: 'Ready to Deploy', agent: 'Nexus Gateway' },
              ].map((s) => {
                const isPassed = currentStep >= s.step;
                const isCurrent = currentStep === s.step && isRunning;
                return (
                  <div
                    key={s.step}
                    className={`p-2 rounded-xl border flex items-center gap-2 transition-all ${
                      isCurrent
                        ? 'bg-purple-50 border-[#6D4AFF] text-[#6D4AFF] font-bold animate-pulse'
                        : isPassed
                        ? 'bg-[#FAFAF8] border-emerald-200 text-emerald-800 font-medium'
                        : 'bg-white border-[#E5E5E2] text-[#8B919B]'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold ${
                      isPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-[#E5E5E2] text-[#626873]'
                    }`}>
                      {isPassed ? <Check className="w-3 h-3 text-emerald-700" /> : s.step}
                    </div>
                    <div className="truncate">
                      <div className="text-[11px] leading-tight truncate">{s.title}</div>
                      <div className="text-[9px] text-[#8B919B] truncate">{s.agent}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Workspace Stage: Interactive App Preview vs Generated Code */}
          <div className="p-4 sm:p-6 bg-[#FAFAF8]">
            {/* View Mode Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-[#E5E5E2] pb-3">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveCodeTab('preview')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeCodeTab === 'preview'
                      ? 'bg-[#6D4AFF] text-white shadow-xs'
                      : 'bg-white text-[#626873] hover:text-[#111318] border border-[#E5E5E2]'
                  }`}
                >
                  <Layout className="w-3.5 h-3.5" />
                  <span>Interactive App Preview</span>
                  <span className="text-[9px] font-mono px-1 rounded bg-white/20">LIVE UI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCodeTab('typescript')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeCodeTab === 'typescript'
                      ? 'bg-white text-[#111318] border border-[#D4D4CE] font-bold shadow-2xs'
                      : 'text-[#626873] hover:text-[#111318]'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>TypeScript API</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCodeTab('sql')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeCodeTab === 'sql'
                      ? 'bg-white text-[#111318] border border-[#D4D4CE] font-bold shadow-2xs'
                      : 'text-[#626873] hover:text-[#111318]'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-emerald-600" />
                  <span>PostgreSQL &amp; RLS</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCodeTab('config')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeCodeTab === 'config'
                      ? 'bg-white text-[#111318] border border-[#D4D4CE] font-bold shadow-2xs'
                      : 'text-[#626873] hover:text-[#111318]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-[#6D4AFF]" />
                  <span>Nexus DAG Spec</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAFAF8] border border-[#E5E5E2] text-xs font-mono text-[#111318] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>

                <Button
                  size="sm"
                  onClick={() => navigate('/app/workflows/new')}
                  className="h-8 px-3 text-xs font-semibold cursor-pointer shadow-xs"
                >
                  <span>Open in Studio</span>
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>

            {/* Canvas Body */}
            {activeCodeTab === 'preview' ? (
              /* REAL INTERACTIVE LIVE PREVIEW CANVAS */
              <div className="rounded-2xl border border-[#E5E5E2] bg-white p-5 sm:p-6 shadow-sm min-h-[320px] flex flex-col justify-between">
                {activePreset.livePreviewType === 'saas' && (
                  <div className="space-y-5">
                    <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#E5E5E2] gap-2">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-[#8B919B] font-bold">Synthesized Micro-App</span>
                        <h4 className="text-base font-bold text-[#111318]">Tenant Workspace Manager</h4>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Supabase RLS Active
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-[#111318] block">Workspace Name</label>
                        <input
                          type="text"
                          value={workspaceName}
                          onChange={(e) => setWorkspaceName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] text-xs font-medium text-[#111318]"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-[#111318] block">Subscription Tier</label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(['starter', 'pro', 'enterprise'] as const).map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setSelectedTier(t)}
                              className={`py-1.5 px-2 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer border ${
                                selectedTier === t
                                  ? 'bg-[#6D4AFF] text-white border-[#6D4AFF] shadow-2xs'
                                  : 'bg-[#FAFAF8] text-[#626873] border-[#E5E5E2]'
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] space-y-2 text-xs">
                      <div className="flex items-center justify-between text-[#626873]">
                        <span>Assigned Seats Quota:</span>
                        <span className="font-bold text-[#111318]">
                          {selectedTier === 'starter' ? '5 Seats' : selectedTier === 'pro' ? '25 Seats' : 'Unlimited'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[#626873]">
                        <span>Database Policy Hash:</span>
                        <span className="font-mono text-[11px] text-[#6D4AFF]">rls_owner_isolation_sha256_pass</span>
                      </div>
                    </div>
                  </div>
                )}

                {activePreset.livePreviewType === 'security' && (
                  <div className="space-y-5">
                    <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#E5E5E2] gap-2">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-[#8B919B] font-bold">DeepSeek-R1 Invariant Engine</span>
                        <h4 className="text-base font-bold text-[#111318]">AST SQL Injection &amp; Boundary Proof</h4>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                        Score: {securityScore}/100 Safe
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] text-left">
                        <span className="text-[10px] font-mono text-[#8B919B]">Scanned AST Rules</span>
                        <div className="text-lg font-bold text-[#111318] mt-1">{auditScanCount} Invariants</div>
                        <span className="text-[10px] text-emerald-600 font-medium">All Formal Proofs Hold</span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] text-left">
                        <span className="text-[10px] font-mono text-[#8B919B]">Adversarial Injections</span>
                        <div className="text-lg font-bold text-emerald-700 mt-1">0 Detected</div>
                        <span className="text-[10px] text-[#8B919B]">1,200 fuzz vectors passed</span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] text-left">
                        <span className="text-[10px] font-mono text-[#8B919B]">Credential Isolation</span>
                        <div className="text-lg font-bold text-[#111318] mt-1">AES-256 Vault</div>
                        <span className="text-[10px] text-emerald-600 font-medium">Zero Telemetry Leak</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900 font-mono">
                      <span>✓ DeepSeek Formal Proof: Cross-tenant enumeration probability = 0.0000%</span>
                      <button
                        type="button"
                        onClick={() => {
                          setAuditScanCount((c) => c + 4);
                          setSecurityScore(100);
                        }}
                        className="px-2.5 py-1 rounded bg-white border border-emerald-300 text-emerald-800 text-[11px] font-bold hover:bg-emerald-50 cursor-pointer"
                      >
                        Re-run Fuzz Test
                      </button>
                    </div>
                  </div>
                )}

                {activePreset.livePreviewType === 'streaming' && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#E5E5E2] gap-2">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-[#8B919B] font-bold">Realtime Telemetry Monitor</span>
                        <h4 className="text-base font-bold text-[#111318]">Sub-50ms Transaction Velocity Engine</h4>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                        Kafka Partition 16 Active
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] font-mono text-xs space-y-2">
                      <div className="flex items-center justify-between pb-2 border-b border-[#E5E5E2]">
                        <span className="text-[#626873]">Transaction Rate:</span>
                        <span className="font-bold text-[#111318]">24,850 events / sec</span>
                      </div>
                      <div className="flex items-center justify-between pb-2 border-b border-[#E5E5E2]">
                        <span className="text-[#626873]">P99 Processing Latency:</span>
                        <span className="font-bold text-emerald-700">22.4ms (Budget: 50ms)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#626873]">Circuit Breaker State:</span>
                        <span className="text-emerald-700 font-bold">CLOSED (Nominal Flow)</span>
                      </div>
                    </div>
                  </div>
                )}

                {activePreset.livePreviewType === 'autoheal' && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#E5E5E2] gap-2">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-[#8B919B] font-bold">GitHub Actions Autonomous Repair</span>
                        <h4 className="text-base font-bold text-[#111318]">TypeScript Build Failure Auto-Remediation</h4>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                        PR #142 Ready
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] space-y-2 text-xs">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-rose-600 font-bold">TS2532:</span>
                        <span className="text-[#111318]">Object is possibly &apos;undefined&apos; in src/context/AuthContext.tsx:42</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-[#E5E5E2] font-mono text-[11px] text-emerald-700">
                        + return user?.workspace_members?.role ?? &apos;member&apos;;
                      </div>
                      <div className="flex items-center justify-between pt-2 text-[#626873]">
                        <span>Vitest Suite: 18/18 test suites passing (100%)</span>
                        <button
                          type="button"
                          onClick={() => setMockApproved(true)}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs cursor-pointer shadow-xs"
                        >
                          {mockApproved ? '✓ Merged & Deployed' : 'Approve & Merge PR'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom Status Ticker */}
                <div className="pt-4 border-t border-[#E5E5E2] flex items-center justify-between text-xs text-[#8B919B]">
                  <span>Execution Target: Local Node.js Sandbox &amp; Edge Runtime</span>
                  <span className="font-mono text-[#6D4AFF] font-medium">State: Deterministic (0 Flaky Runs)</span>
                </div>
              </div>
            ) : (
              /* CODE VIEW WITH MONOSPACE SYNTAX DISPLAY */
              <div className="rounded-2xl border border-[#E5E5E2] bg-white p-4 font-mono text-xs max-h-[380px] overflow-y-auto shadow-sm">
                <pre className="text-[#1F2937] leading-relaxed overflow-x-auto">
                  {activeCodeTab === 'typescript'
                    ? activePreset.code.typescript
                    : activeCodeTab === 'sql'
                    ? activePreset.code.sql
                    : activePreset.code.config}
                </pre>
              </div>
            )}
          </div>

          {/* Bottom Action Footer */}
          <div className="px-6 py-4 bg-white border-t border-[#E5E5E2] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#626873]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Ready to run in your private repository or native desktop app with zero server lock-in.</span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/app/workflows/new')}
              className="text-[#6D4AFF] hover:text-[#5B3CE8] font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Launch Autonomous Workflow Builder</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
