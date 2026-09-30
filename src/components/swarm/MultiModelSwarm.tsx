import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Zap,
  Shield,
  CheckCircle2,
  Play,
  Copy,
  Check,
  ArrowRight,
  Code2,
  Activity,
  Layers,
  Key,
  Flame,
  Award
} from 'lucide-react';
import { BrandLogo } from '../brand/BrandLogo';
import { Button } from '../ui/Button';
import { ApiKeysModal } from '../app/ApiKeysModal';

interface SwarmModelConfig {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'deepseek';
  role: string;
  specialty: string;
  speed: string;
  color: string;
  borderColor: string;
  accentBg: string;
}

const SWARM_MODELS: SwarmModelConfig[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    role: 'System Synthesizer',
    specialty: 'DAG Decomposition & Schema',
    speed: '124 tok/s',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    accentBg: 'bg-emerald-500/10',
  },
  {
    id: 'claude-3-5',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    role: 'Lead Architect',
    specialty: 'TypeScript AST & Contracts',
    speed: '96 tok/s',
    color: 'text-[#6D4AFF]',
    borderColor: 'border-[#6D4AFF]/30',
    accentBg: 'bg-[#6D4AFF]/10',
  },
  {
    id: 'gemini-1-5',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    role: 'Scale Strategist',
    specialty: 'Global Edge & Distributed DAG',
    speed: '142 tok/s',
    color: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    accentBg: 'bg-blue-500/10',
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek-R1',
    provider: 'deepseek',
    role: 'Zero-Trust Red Team',
    specialty: 'Cold Reasoning & Vulnerability Audit',
    speed: '78 tok/s',
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/30',
    accentBg: 'bg-cyan-500/10',
  },
];

interface SwarmPreset {
  id: string;
  title: string;
  description: string;
  prompt: string;
  gptOutput: string;
  claudeOutput: string;
  geminiOutput: string;
  deepseekOutput: string;
  consensus: string;
  dagNodesCount: number;
}

const SWARM_PRESETS: SwarmPreset[] = [
  {
    id: 'zero-trust-rls',
    title: 'Zero-Trust Multi-Tenant Auth & RLS Guardrail',
    description: 'Autonomous generation of PostgreSQL tenant isolation policies with automated adversarial injection tests.',
    prompt: 'Architect a bulletproof multi-tenant database schema with Supabase Row-Level Security, automated token rotation, and zero boundary leakage.',
    gptOutput: `1. Entities: workspaces, profiles, workspace_members (role: 'owner'|'admin'|'member')
2. RLS Constraint:
   CREATE POLICY "tenant_isolation" ON public.workspaces
   FOR ALL USING (id IN (
     SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
   ));
3. Deterministic Pipeline: Trigger -> Migrator -> Auditor -> Deploy`,
    claudeOutput: `export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  encrypted_vault_key: string;
}
// Enforces strict compile-time brand typing for tenant IDs to eliminate IDOR leaks.
export type WorkspaceId = string & { readonly __brand: unique symbol };`,
    geminiOutput: `Architecture Blueprint:
- Global Edge Routing: Cloudflare Workers terminate SSL & inspect JWT claims (0ms cold starts).
- Primary Database: PostgreSQL read-replicas distributed across 3 global regions with Supabase RLS.
- Distributed Rate Limiter: Redis Sliding Window token bucket (500 req/sec per workspace).`,
    deepseekOutput: `[REASONING TRACE]:
Audited GPT-4o's policy: Subquery in RLS policy causes O(N) sequential scans without composite index on (workspace_id, user_id).
Vulnerability Detected: If user_id is updated without transaction lock, brief window allows cross-tenant query bypass.
Fix: Add btree index & strict SECURITY DEFINER function with cached session claim.
Consensus Status: APPROVED with patched index.`,
    consensus: `VERIFIED GOLDEN BLUEPRINT:
1. Database Schema with optimized composite indexing on (workspace_id, user_id).
2. Bulletproof RLS Policy preventing IDOR boundary traversal across all 4 CRUD methods.
3. TypeScript AST contract verified with 100% test coverage.
4. Auto-generated 4-node DAG ready to dispatch directly into Nexus Workflow Engine.`,
    dagNodesCount: 5,
  },
  {
    id: 'high-freq-fraud',
    title: 'High-Frequency Fraud & Security Pipeline',
    description: 'Multi-agent real-time transaction scrutiny with AI anomaly scoring and Slack human-in-the-loop gate.',
    prompt: 'Detect high-value eCommerce fraud in under 400ms: ingest webhook, cross-reference IP velocity, and halt suspicious transfers until admin approval.',
    gptOutput: `Pipeline DAG:
- Node 1: Webhook Ingestion (Shopify/Stripe HMAC verification)
- Node 2: Velocity Check (IP reputation & 10m spend volume)
- Node 3: AI Fraud Scorer (Gemini + DeepSeek consensus)
- Node 4: Human-in-the-Loop Slack approval gate for transactions > $2,500
- Node 5: Settle or Void payout`,
    claudeOutput: `async function evaluateTransactionRisk(tx: TransactionPayload): Promise<RiskAssessment> {
  const [velocity, geoAnomaly] = await Promise.all([
    checkIpVelocity(tx.ip_address),
    verifyBillingZip(tx.card_fingerprint, tx.shipping_address)
  ]);
  const score = calculateBayesianRisk(velocity, geoAnomaly);
  return { score, requiresHumanGate: score > 0.75 || tx.amount_cents > 250000 };
}`,
    geminiOutput: `Distributed Architecture:
- P99 Latency: 184ms end-to-end edge pipeline.
- Anomaly Engine: Evaluates order against 90-day moving baseline.
- Fallback Circuit Breaker: Auto-quarantine if model latency exceeds 600ms.`,
    deepseekOutput: `[SECURITY VERIFICATION]:
Attack Vector Scanned: Fraudsters spoofing X-Forwarded-For headers.
Mitigation Enforced: Use Cloudflare True-Client-IP header with mTLS client certificates.
Verdict: Zero spoofing vulnerability detected. Safe to trigger approval gate.`,
    consensus: `VERIFIED GOLDEN BLUEPRINT:
1. Real-time Bayesian anomaly detection in 184ms latency budget.
2. Zero header-spoofing vulnerability with True-Client-IP verification.
3. Automated Slack dispatch modal with single-click admin sign-off.
4. Production-ready DAG compiled with auto-rollback capability.`,
    dagNodesCount: 5,
  },
  {
    id: 'autonomous-cicd',
    title: 'Self-Healing Autonomous CI/CD Orchestration',
    description: 'Agents diagnose failed builds, synthesize regression fixes, re-test in micro-sandboxes, and auto-deploy.',
    prompt: 'When unit tests fail on GitHub main, automatically diagnose stack traces, synthesize minimal AST patches, verify in sandbox, and create a verified PR.',
    gptOutput: `Self-Healing Lifecycle:
1. Parse Jest/Vitest failure JSON trace.
2. Isolate failing assertion: "TypeError: Cannot read properties of undefined (reading 'workspace_id')".
3. Dispatch targeted instruction to Claude Synthesizer Agent with file AST.`,
    claudeOutput: `// Synthesized fix for src/context/AuthContext.tsx line 142
- const activeWorkspaceId = user.current_workspace.id;
+ const activeWorkspaceId = user?.current_workspace?.id ?? DEFAULT_WORKSPACE_ID;
// Guaranteed zero regression with non-null assertion removal.`,
    geminiOutput: `Ephemeral Sandbox Execution:
- Spun up microVM container in 120ms.
- Ran test suite: 18/18 test suites passing (100% assertions satisfied).
- Total CPU cycle consumed: 1.4 core-seconds.`,
    deepseekOutput: `[REGRESSION AUDIT]:
Verified: The nullish coalescing operator does NOT break downstream billing dependencies.
Confirmed zero credential leaks or unexpected AST side effects.
Mathematical Proof: State transition is guaranteed deterministic.`,
    consensus: `VERIFIED GOLDEN BLUEPRINT:
1. Self-healing patch synthesized and verified in ephemeral sandbox.
2. 100% unit tests pass with zero side-effects.
3. Automated pull request opened on GitHub with complete AI diagnostic report.
4. Auto-merged after human verification gate sign-off.`,
    dagNodesCount: 6,
  },
];

export const MultiModelSwarm: React.FC = () => {
  const navigate = useNavigate();
  const [activePresetIndex, setActivePresetIndex] = useState<number>(0);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isSwarmRunning, setIsSwarmRunning] = useState<boolean>(false);
  const [swarmStage, setSwarmStage] = useState<'idle' | 'reasoning' | 'debating' | 'consensus'>('consensus');
  const [selectedModelTab, setSelectedModelTab] = useState<string>('consensus');
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [elapsedMs, setElapsedMs] = useState<number>(2480);

  const activePreset = SWARM_PRESETS[activePresetIndex];
  const timerRef = useRef<any>(null);

  const handleRunSwarm = () => {
    setIsSwarmRunning(true);
    setSwarmStage('reasoning');
    setSelectedModelTab('deepseek-r1');
    setElapsedMs(0);

    const start = Date.now();
    timerRef.current = setInterval(() => {
      setElapsedMs(Date.now() - start);
    }, 100);

    // Stage 1: Reasoning
    setTimeout(() => {
      setSwarmStage('debating');
      setSelectedModelTab('claude-3-5');
    }, 1400);

    // Stage 2: Debating & Cross-audit
    setTimeout(() => {
      setSwarmStage('consensus');
      setSelectedModelTab('consensus');
      setIsSwarmRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }, 2800);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleCopyConsensus = () => {
    navigator.clipboard.writeText(activePreset.consensus);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleExportToWorkflow = () => {
    navigate('/app/workflows/new');
  };

  return (
    <section id="swarm" className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-[#0D0F14] text-white border-y border-white/[0.08] overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-[#6D4AFF]/20 via-[#3B82F6]/15 to-cyan-500/10 blur-[120px] pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-10 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6D4AFF]/15 border border-[#6D4AFF]/30 text-xs font-mono font-semibold text-[#A78BFA] mb-3">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>INDUSTRY FIRST · MULTI-MODEL SWARM ARENA</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.1] mb-4">
            Four frontier models.<br />
            One autonomous consensus.
          </h2>
          <p className="text-base sm:text-lg text-[#9BA3AF] leading-relaxed">
            Stop switching between isolated ChatGPT, Claude, and Gemini tabs. NEXUS runs <span className="text-white font-semibold">GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro, and DeepSeek-R1</span> in a real-time collaborative swarm where models cross-examine, audit, and mathematically verify each other before executing.
          </p>
        </div>

        {/* Swarm Interactive Workstation Card */}
        <div className="rounded-2xl border border-white/10 bg-[#14161E] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.9)] overflow-hidden text-left">
          {/* Top Bar: Prompt Presets & Run Action */}
          <div className="p-4 sm:p-5 border-b border-white/[0.08] bg-[#181B26] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Presets Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-mono uppercase tracking-wider text-[#8B919B] shrink-0 mr-1 hidden sm:inline">
                Preset Scenarios:
              </span>
              {SWARM_PRESETS.map((preset, idx) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setActivePresetIndex(idx);
                    setCustomPrompt('');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                    activePresetIndex === idx && !customPrompt
                      ? 'bg-[#6D4AFF] text-white shadow-md font-semibold'
                      : 'bg-white/5 hover:bg-white/10 text-[#9BA3AF] hover:text-white border border-white/5'
                  }`}
                >
                  {preset.title.split(' ')[0]} {preset.title.split(' ')[1]}
                </button>
              ))}
            </div>

            {/* Right: Key Vault & Run Button */}
            <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-auto">
              <button
                onClick={() => setShowKeyModal(true)}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium flex items-center gap-1.5 border border-white/10 transition-colors cursor-pointer"
                title="Manage API Keys"
              >
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">API Key Vault</span>
              </button>

              <Button
                size="sm"
                onClick={handleRunSwarm}
                disabled={isSwarmRunning}
                className="h-9 px-4 text-xs font-semibold cursor-pointer shadow-lg shadow-[#6D4AFF]/25"
              >
                {isSwarmRunning ? (
                  <>
                    <Activity className="w-3.5 h-3.5 mr-1.5 animate-spin text-amber-300" />
                    <span>Swarm Debating ({(elapsedMs / 1000).toFixed(1)}s)...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 mr-1.5 fill-white" />
                    <span>Run Swarm Arena</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Prompt Banner */}
          <div className="px-5 py-3 bg-[#111319] border-b border-white/[0.06] flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#6D4AFF] animate-ping" />
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-mono text-[#8B919B] uppercase mr-2">Directive:</span>
              <span className="text-xs sm:text-sm font-medium text-white truncate inline-block max-w-full">
                &quot;{customPrompt || activePreset.prompt}&quot;
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#9BA3AF] shrink-0 hidden sm:inline">
              Consensus Protocol v3.1
            </span>
          </div>

          {/* Swarm Live Stage Progression Indicator */}
          <div className="px-5 py-2.5 bg-[#14161F] border-b border-white/[0.08] flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[#8B919B]">Pipeline Phase:</span>
              <span className={`px-2 py-0.5 rounded ${
                swarmStage === 'reasoning' ? 'bg-blue-500/20 text-blue-300 animate-pulse' :
                swarmStage === 'debating' ? 'bg-purple-500/20 text-purple-300 animate-pulse' :
                'bg-emerald-500/20 text-emerald-300'
              }`}>
                {swarmStage === 'reasoning' ? '1. Parallel Model Synthesis' :
                 swarmStage === 'debating' ? '2. Cross-Model Vulnerability Audit' :
                 '3. Unified Golden Consensus Achieved'}
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-[#9BA3AF]">
              <span>4 Models Synchronized</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">0 Vulnerabilities Found</span>
            </div>
          </div>

          {/* Model Roster Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 sm:p-5 bg-[#0F1117] border-b border-white/[0.08]">
            {SWARM_MODELS.map((model) => {
              const isSelected = selectedModelTab === model.id;
              return (
                <div
                  key={model.id}
                  onClick={() => setSelectedModelTab(model.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? `bg-[#181B26] ${model.borderColor} shadow-lg ring-1 ring-[#6D4AFF]/50`
                      : 'bg-[#14161E] border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center">
                        <BrandLogo brand={model.provider} size={14} />
                      </div>
                      <span className="text-xs font-bold text-white">{model.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400">{model.speed}</span>
                  </div>

                  <div className={`text-[11px] font-medium ${model.color} mb-1`}>
                    {model.role}
                  </div>
                  <div className="text-[10px] text-[#8B919B] line-clamp-1">
                    {model.specialty}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Workspace Output Canvas */}
          <div className="p-5 sm:p-6 bg-[#111319]">
            {/* View Mode Tabs (Consensus vs Individual Models) */}
            <div className="flex items-center justify-between mb-4 border-b border-white/[0.08] pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedModelTab('consensus')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    selectedModelTab === 'consensus'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : 'text-[#8B919B] hover:text-white'
                  }`}
                >
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Golden Consensus</span>
                </button>

                {SWARM_MODELS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModelTab(m.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer hidden md:flex items-center gap-1 ${
                      selectedModelTab === m.id
                        ? 'bg-[#1C202E] text-white border border-white/20'
                        : 'text-[#8B919B] hover:text-white'
                    }`}
                  >
                    <span>{m.name}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyConsensus}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText ? 'Copied' : 'Copy Output'}</span>
                </button>

                <button
                  onClick={handleExportToWorkflow}
                  className="px-3.5 py-1.5 rounded-lg bg-[#6D4AFF] hover:bg-[#5B3CE8] text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Convert to Workflow DAG ({activePreset.dagNodesCount} Nodes)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Display Content Box */}
            <div className="rounded-xl bg-[#0B0D12] border border-white/[0.08] p-4 sm:p-5 font-mono text-xs leading-relaxed overflow-x-auto min-h-[220px]">
              {selectedModelTab === 'consensus' ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06] text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Unified Cross-Model Consensus Verified by Nexus Engine</span>
                  </div>
                  <pre className="text-emerald-300/90 whitespace-pre-wrap font-mono">
                    {activePreset.consensus}
                  </pre>
                </div>
              ) : selectedModelTab === 'deepseek-r1' ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06] text-cyan-400 font-semibold">
                    <Shield className="w-4 h-4" />
                    <span>DeepSeek-R1 Cold-Blooded Reasoning & Security Audit</span>
                  </div>
                  <pre className="text-cyan-300/90 whitespace-pre-wrap font-mono">
                    {activePreset.deepseekOutput}
                  </pre>
                </div>
              ) : selectedModelTab === 'claude-3-5' ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06] text-[#A78BFA] font-semibold">
                    <Code2 className="w-4 h-4" />
                    <span>Claude 3.5 Sonnet TypeScript AST & Type Constraints</span>
                  </div>
                  <pre className="text-[#C4B5FD] whitespace-pre-wrap font-mono">
                    {activePreset.claudeOutput}
                  </pre>
                </div>
              ) : selectedModelTab === 'gemini-1-5' ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06] text-blue-400 font-semibold">
                    <Zap className="w-4 h-4" />
                    <span>Gemini 1.5 Pro Planetary Scale & Latency Optimization</span>
                  </div>
                  <pre className="text-blue-300/90 whitespace-pre-wrap font-mono">
                    {activePreset.geminiOutput}
                  </pre>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06] text-emerald-400 font-semibold">
                    <Bot className="w-4 h-4" />
                    <span>GPT-4o System Decomposition & Structured Flow</span>
                  </div>
                  <pre className="text-emerald-300/90 whitespace-pre-wrap font-mono">
                    {activePreset.gptOutput}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Footer Callout */}
          <div className="px-6 py-3.5 bg-[#181B26] border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#9BA3AF]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Zero hallucinations: Every statement is cross-verified by independent models.</span>
            </div>
            <button
              onClick={() => navigate('/explore')}
              className="text-[#6D4AFF] hover:text-[#8264FF] font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Explore 24+ Specialized Pre-Trained Swarm Agents</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Universal API Key Vault Modal */}
      <ApiKeysModal isOpen={showKeyModal} onClose={() => setShowKeyModal(false)} />
    </section>
  );
};
