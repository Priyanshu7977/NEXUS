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
    color: 'text-emerald-700',
    borderColor: 'border-emerald-300',
    accentBg: 'bg-emerald-50',
  },
  {
    id: 'claude-3-5',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    role: 'Lead Architect',
    specialty: 'TypeScript AST & Contracts',
    speed: '96 tok/s',
    color: 'text-[#6D4AFF]',
    borderColor: 'border-purple-300',
    accentBg: 'bg-purple-50',
  },
  {
    id: 'gemini-1-5',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    role: 'Scale Strategist',
    specialty: 'Global Edge & Distributed DAG',
    speed: '142 tok/s',
    color: 'text-blue-700',
    borderColor: 'border-blue-300',
    accentBg: 'bg-blue-50',
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek-R1',
    provider: 'deepseek',
    role: 'Zero-Trust Red Team',
    specialty: 'Cold Reasoning & Vulnerability Audit',
    speed: '78 tok/s',
    color: 'text-cyan-700',
    borderColor: 'border-cyan-300',
    accentBg: 'bg-cyan-50',
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
    gptOutput: `Proposed PostgreSQL Schema & Partitioning:
- CREATE TABLE workspaces (id uuid PRIMARY KEY, tenant_id uuid NOT NULL, created_at timestamptz DEFAULT now());
- CREATE TABLE workspace_members (workspace_id uuid REFERENCES workspaces(id), user_id uuid, role text CHECK (role IN ('owner','admin','member')));
- Enable RLS: ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
- Add Security Boundary: CREATE POLICY tenant_isolation ON workspaces FOR ALL USING (tenant_id = auth.jwt()->>'tenant_id');`,
    claudeOutput: `TypeScript Type-Safety & RLS Validation Layer:
- Strict contract interface defined in src/types/database.ts.
- Guard against SQL injection via parameterized Prisma/Drizzle bindings.
- Verified: RLS policy uses immutable claims from signed JWT payload.
- Recommended AST Check: ensure all client mutations pass through authenticated server action gates.`,
    geminiOutput: `Global Distributed Edge Latency Analysis:
- Recommended edge caching via Cloudflare Workers / Fastly for public workspace metadata (TTL: 60s).
- Query latency projected: 4.2ms p50, 11.8ms p99 across multi-region replica read pools.
- Read-after-write consistency guaranteed via Supabase primary WAL stream.`,
    deepseekOutput: `[ADVERSARIAL RED TEAM AUDIT]:
Vulnerability Flagged: Potential cross-tenant enumeration if JWT tenant_id claim is forged or missing.
Countermeasure Enforced: Added mandatory constraint:
CHECK (auth.uid() IS NOT NULL AND auth.jwt()->>'tenant_id' IS NOT NULL)
Formal Proof: Leakage probability under adversarial injection = 0.000%.`,
    consensus: `VERIFIED GOLDEN BLUEPRINT:
1. Multi-tenant PostgreSQL table structure with row-level security enabled.
2. Tenant boundary policy locked to authenticated JWT claims with DeepSeek zero-leak constraint.
3. Fully-typed TypeScript interfaces generated in src/types/database.ts.
4. Edge replica routing strategy configured for sub-12ms global read latency.`,
    dagNodesCount: 5,
  },
  {
    id: 'high-freq-fraud',
    title: 'High-Frequency Fraud Detection Pipeline',
    description: 'Sub-50ms transaction auditing combining deterministic heuristics with probabilistic LLM risk scoring.',
    prompt: 'Construct a resilient streaming fraud audit DAG that analyzes incoming card transactions under 50ms latency.',
    gptOutput: `Pipeline Architecture:
- Ingestion: Apache Kafka event stream with partition key = account_id.
- Step 1: Redis sliding-window velocity check (transactions in last 60s > 3).
- Step 2: Geo-IP velocity audit (distance > 500km in < 10 minutes).
- Step 3: Probabilistic risk scorer node with fallback bypass.`,
    claudeOutput: `Resilience & Error Boundaries:
- Maximum timeout budget: 35ms per node.
- Circuit breaker pattern configured with exponential backoff.
- Fail-open fallback: flag suspicious transaction for asynchronous manual review rather than blocking user payment.`,
    geminiOutput: `Throughput & Scalability Benchmark:
- Sustained throughput: 25,000 transactions/sec.
- Redis cluster memory overhead: 1.2GB per 1M active sessions.
- AWS Lambda / Cloudflare Workers cold-start mitigations: provisioned concurrency = 50 instances.`,
    deepseekOutput: `[SECURITY AUDIT & ZERO-DAY ADVERSARIAL ANALYSIS]:
Vector Analyzed: Distributed card-testing attacks using randomized proxy IPs.
Mitigation Added: Device fingerprint hash entropy checking + biometric keystroke timing verification.
Status: Threat neutralized.`,
    consensus: `VERIFIED GOLDEN BLUEPRINT:
1. Streaming Kafka DAG with Redis velocity checkpoints (<15ms).
2. Claude circuit breaker pattern ensuring zero dropped payments.
3. DeepSeek distributed bot-net mitigation rule integrated into edge gateway.
4. Human approval review queue automatically populated for risk scores 65-85.`,
    dagNodesCount: 7,
  },
  {
    id: 'ci-cd-autoheal',
    title: 'Autonomous Self-Healing CI/CD Pipeline',
    description: 'Self-repairing build infrastructure that intercepts compile errors, writes AST fixes, and verifies unit tests.',
    prompt: 'Build a self-repairing GitHub Actions workflow that catches TypeScript build failures and generates tested pull requests.',
    gptOutput: `GitHub Actions Orchestration:
- on: push, pull_request
- Run: npm run build
- On failure: Capture error stack trace and trigger NEXUS Webhook /api/v1/workflows/autoheal`,
    claudeOutput: `AST Patch Synthesizer:
- Parse TypeScript compiler error diagnostics (code TS2322, TS2345, TS7006).
- Locate exact line range and AST node in source repository.
- Apply semantic patch with nullish coalescing and optional chaining.`,
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
    <section id="swarm" className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FAFAF8] via-white to-[#F6F6F3] text-[#111318] border-y border-[#E5E5E2] overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-[#6D4AFF]/10 via-[#3B82F6]/8 to-emerald-500/5 blur-[120px] pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-10 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6D4AFF]/10 border border-[#6D4AFF]/25 text-xs font-mono font-semibold text-[#6D4AFF] mb-3">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>INDUSTRY FIRST · MULTI-MODEL SWARM ARENA</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#111318] leading-[1.1] mb-4">
            Four frontier models.<br />
            One autonomous consensus.
          </h2>
          <p className="text-base sm:text-lg text-[#626873] leading-relaxed">
            Stop switching between isolated ChatGPT, Claude, and Gemini tabs. NEXUS runs <span className="text-[#111318] font-semibold">GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro, and DeepSeek-R1</span> in a real-time collaborative swarm where models cross-examine, audit, and mathematically verify each other before executing.
          </p>
        </div>

        {/* Swarm Interactive Workstation Card */}
        <div className="rounded-2xl border border-[#E5E5E2] bg-white shadow-[0_16px_45px_rgba(0,0,0,0.06)] overflow-hidden text-left">
          {/* Top Bar: Prompt Presets & Run Action */}
          <div className="p-4 sm:p-5 border-b border-[#E5E5E2] bg-[#FBFBFA] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
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
                      ? 'bg-[#6D4AFF] text-white shadow-sm font-semibold'
                      : 'bg-white hover:bg-[#F2F2EE] text-[#626873] hover:text-[#111318] border border-[#E5E5E2]'
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
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAFAF8] text-[#111318] text-xs font-medium flex items-center gap-1.5 border border-[#E5E5E2] hover:border-[#D4D4CE] transition-colors cursor-pointer shadow-xs"
                title="Manage API Keys"
              >
                <Key className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">API Key Vault</span>
              </button>

              <Button
                size="sm"
                onClick={handleRunSwarm}
                disabled={isSwarmRunning}
                className="h-9 px-4 text-xs font-semibold cursor-pointer shadow-md shadow-[#6D4AFF]/20"
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
          <div className="px-5 py-3 bg-[#F8F9FA] border-b border-[#EFEFEA] flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#6D4AFF] animate-ping" />
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-mono text-[#8B919B] uppercase mr-2">Directive:</span>
              <span className="text-xs sm:text-sm font-semibold text-[#111318] truncate inline-block max-w-full">
                &quot;{customPrompt || activePreset.prompt}&quot;
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-[#E5E5E2] text-[#626873] shrink-0 hidden sm:inline">
              Consensus Protocol v3.1
            </span>
          </div>

          {/* Swarm Live Stage Progression Indicator */}
          <div className="px-5 py-2.5 bg-[#FBFBFA] border-b border-[#EFEFEA] flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[#8B919B]">Pipeline Phase:</span>
              <span className={`px-2 py-0.5 rounded font-semibold ${
                swarmStage === 'reasoning' ? 'bg-blue-50 border border-blue-200 text-blue-700 animate-pulse' :
                swarmStage === 'debating' ? 'bg-purple-50 border border-purple-200 text-purple-700 animate-pulse' :
                'bg-emerald-50 border border-emerald-200 text-emerald-800'
              }`}>
                {swarmStage === 'reasoning' ? '1. Parallel Model Synthesis' :
                 swarmStage === 'debating' ? '2. Cross-Model Vulnerability Audit' :
                 '3. Unified Golden Consensus Achieved'}
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-[#626873]">
              <span>4 Models Synchronized</span>
              <span>•</span>
              <span className="text-emerald-700 font-bold">0 Vulnerabilities Found</span>
            </div>
          </div>

          {/* Model Roster Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 sm:p-5 bg-[#FAFAF8] border-b border-[#E5E5E2]">
            {SWARM_MODELS.map((model) => {
              const isSelected = selectedModelTab === model.id;
              return (
                <div
                  key={model.id}
                  onClick={() => setSelectedModelTab(model.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? `bg-white border-[#6D4AFF] ring-2 ring-[#6D4AFF]/20 shadow-sm`
                      : 'bg-white/80 border-[#E5E5E2] hover:border-[#D4D4CE] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#F6F6F3] border border-[#E5E5E2] flex items-center justify-center">
                        <BrandLogo brand={model.provider} size={14} />
                      </div>
                      <span className="text-xs font-bold text-[#111318]">{model.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-700 font-semibold">{model.speed}</span>
                  </div>

                  <div className={`text-[11px] font-semibold ${model.color} mb-1`}>
                    {model.role}
                  </div>
                  <div className="text-[10px] text-[#626873] line-clamp-1">
                    {model.specialty}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Workspace Output Canvas */}
          <div className="p-5 sm:p-6 bg-[#F8F9FA]">
            {/* View Mode Tabs (Consensus vs Individual Models) */}
            <div className="flex items-center justify-between mb-4 border-b border-[#E5E5E2] pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedModelTab('consensus')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    selectedModelTab === 'consensus'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs font-bold'
                      : 'text-[#626873] hover:text-[#111318]'
                  }`}
                >
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Golden Consensus</span>
                </button>

                {SWARM_MODELS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModelTab(m.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer hidden md:flex items-center gap-1 ${
                      selectedModelTab === m.id
                        ? 'bg-white text-[#111318] border border-[#D4D4CE] font-bold shadow-2xs'
                        : 'text-[#626873] hover:text-[#111318]'
                    }`}
                  >
                    <span>{m.name}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyConsensus}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#FAFAF8] border border-[#E5E5E2] text-xs font-mono text-[#111318] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText ? 'Copied' : 'Copy Output'}</span>
                </button>

                <button
                  onClick={handleExportToWorkflow}
                  className="px-3.5 py-1.5 rounded-lg bg-[#6D4AFF] hover:bg-[#5B3CE8] text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Convert to Workflow DAG ({activePreset.dagNodesCount} Nodes)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Display Content Box */}
            <div className="rounded-xl bg-white border border-[#E5E5E2] shadow-sm p-4 sm:p-5 font-mono text-xs leading-relaxed overflow-x-auto min-h-[220px]">
              {selectedModelTab === 'consensus' ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#EFEFEA] text-emerald-800 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Unified Cross-Model Consensus Verified by Nexus Engine</span>
                  </div>
                  <pre className="text-[#1F2937] whitespace-pre-wrap font-mono leading-relaxed">
                    {activePreset.consensus}
                  </pre>
                </div>
              ) : selectedModelTab === 'deepseek-r1' ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#EFEFEA] text-cyan-800 font-bold">
                    <Shield className="w-4 h-4 text-cyan-600" />
                    <span>DeepSeek-R1 Cold-Blooded Reasoning & Security Audit</span>
                  </div>
                  <pre className="text-[#1F2937] whitespace-pre-wrap font-mono leading-relaxed">
                    {activePreset.deepseekOutput}
                  </pre>
                </div>
              ) : selectedModelTab === 'claude-3-5' ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#EFEFEA] text-purple-800 font-bold">
                    <Code2 className="w-4 h-4 text-[#6D4AFF]" />
                    <span>Claude 3.5 Sonnet TypeScript AST & Type Constraints</span>
                  </div>
                  <pre className="text-[#1F2937] whitespace-pre-wrap font-mono leading-relaxed">
                    {activePreset.claudeOutput}
                  </pre>
                </div>
              ) : selectedModelTab === 'gemini-1-5' ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#EFEFEA] text-blue-800 font-bold">
                    <Zap className="w-4 h-4 text-blue-600" />
                    <span>Gemini 1.5 Pro Planetary Scale & Latency Optimization</span>
                  </div>
                  <pre className="text-[#1F2937] whitespace-pre-wrap font-mono leading-relaxed">
                    {activePreset.geminiOutput}
                  </pre>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#EFEFEA] text-emerald-800 font-bold">
                    <Bot className="w-4 h-4 text-emerald-600" />
                    <span>GPT-4o System Decomposition & Structured Flow</span>
                  </div>
                  <pre className="text-[#1F2937] whitespace-pre-wrap font-mono leading-relaxed">
                    {activePreset.gptOutput}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Footer Callout */}
          <div className="px-6 py-3.5 bg-[#FBFBFA] border-t border-[#E5E5E2] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#626873]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Zero hallucinations: Every statement is cross-verified by independent models.</span>
            </div>
            <button
              onClick={() => navigate('/explore')}
              className="text-[#6D4AFF] hover:text-[#5B3CE8] font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
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
