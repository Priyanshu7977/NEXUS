import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Key,
  Cable,
  GitFork,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Lock,
  Cpu,
  Activity,
  Layers,
  ShieldAlert,
} from 'lucide-react';
import { BrandLogo } from '../brand/BrandLogo';

interface PlatformStep {
  stepNumber: string;
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  actionLabel: string;
  actionLink: string;
  tags: string[];
}

export const PlatformOverviewSection: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const steps: PlatformStep[] = [
    {
      stepNumber: '01',
      id: 'byok-keys',
      badge: 'Zero Markup · Client Encrypted',
      title: 'Connect Top AI APIs (BYOK)',
      subtitle: 'Bring your own API keys for Anthropic, OpenAI, DeepSeek, Google, and Groq.',
      description:
        'NEXUS never marks up inference costs or routes your tokens through hidden intermediary proxies. Your API keys are encrypted client-side using AES-256 and stored in your local browser vault or native desktop keychain. You pay providers directly at raw API rates.',
      icon: Key,
      actionLabel: 'Configure API Keys',
      actionLink: '/settings/api-keys',
      tags: ['AES-256 Vault', 'Direct Provider Billing', 'Web & Desktop Sync'],
    },
    {
      stepNumber: '02',
      id: 'connectors-mcp',
      badge: 'Open Standards · Tool Calling',
      title: 'Plug In Tools & MCP Servers',
      subtitle: 'Connect GitHub, Vercel, Supabase, Linear, and Model Context Protocol servers.',
      description:
        'Empower your AI agents with real hands. Wire up repository webhooks, Postgres databases with Row-Level Security, cloud infrastructure, and any standard MCP server. Agents can parse AST diffs, query schemas, run terminal commands, and create pull requests.',
      icon: Cable,
      actionLabel: 'Browse Connectors & MCP',
      actionLink: '/app/connectors',
      tags: ['Model Context Protocol (MCP)', 'Bi-directional Webhooks', '100+ Integrations'],
    },
    {
      stepNumber: '03',
      id: 'workflows-dag',
      badge: 'Multi-Agent Collaboration',
      title: 'Compose Multi-Agent Workflows',
      subtitle: 'Orchestrate Claude, GPT-4o, DeepSeek, and Gemini in visual DAG pipelines.',
      description:
        'Assign each engineering phase to the AI engine that excels at it most. Claude 3.7 decomposes complex objectives into deterministic DAG tasks; GPT-4o synthesizes type-safe code; DeepSeek R1 mathematically audits AST security invariants; Gemini 2.5 verifies monorepo consistency.',
      icon: GitFork,
      actionLabel: 'Open Workflow Studio',
      actionLink: '/app/workflows',
      tags: ['Visual DAG Canvas', 'Parallel Fork/Join', 'Topological Dependency Engine'],
    },
    {
      stepNumber: '04',
      id: 'observability-gate',
      badge: 'Security & Governance',
      title: 'Execute with Human Approval & Observability',
      subtitle: 'Role-based sign-off gates, live token streams, and tamper-proof audit trails.',
      description:
        'Destructive actions like database migrations or production releases pause at customizable Human Approval Gates until an authorized engineer signs off. Monitor streaming output, latency metrics, and cryptographic SHA-256 provenance logs in real time.',
      icon: ShieldCheck,
      actionLabel: 'Inspect Mission Control',
      actionLink: '/app/audit-logs',
      tags: ['Human-in-the-Loop', 'SHA-256 Provenance', 'Step-Level Token Stream'],
    },
  ];

  const currentStep = steps[activeStepIndex];

  return (
    <section id="how-it-works" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white border-t border-[#E5E5E2] text-left">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="max-w-3xl mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs font-mono font-semibold text-[#6D4AFF] mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>HOW NEXUS WORKS · END-TO-END APPLICATION OVERVIEW</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#111318] mb-3">
            From API keys to autonomous production workflows
          </h2>
          <p className="text-sm sm:text-base text-[#626873] leading-relaxed">
            NEXUS provides a unified desktop and web workspace where the world's most capable AI models collaborate securely across your development tools and cloud infrastructure.
          </p>
        </div>

        {/* 4-Step Interactive Stepper Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 mb-8">
          {steps.map((st, idx) => {
            const isSelected = activeStepIndex === idx;
            const Icon = st.icon;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => setActiveStepIndex(idx)}
                className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#FAFAF8] border-[#6D4AFF] shadow-sm ring-1 ring-[#6D4AFF]/20'
                    : 'bg-white border-[#E5E5E2] hover:border-[#D4D4CE] hover:bg-[#FAFAF8]/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-mono text-xs font-bold ${isSelected ? 'text-[#6D4AFF]' : 'text-[#8B919B]'}`}>
                    STEP {st.stepNumber}
                  </span>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-[#6D4AFF] text-white' : 'bg-[#FAFAF8] border border-[#E5E5E2] text-[#626873]'
                  }`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="font-semibold text-xs sm:text-sm text-[#111318] leading-tight truncate">
                  {st.title.split('(')[0].trim()}
                </div>
                <div className="text-[11px] text-[#8B919B] truncate mt-1">
                  {st.badge}
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Step Detail & Interactive Visual Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Deep Step Walkthrough */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-[#FAFAF8] border border-[#E5E5E2] flex flex-col justify-between shadow-sm">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white border border-[#E5E5E2] text-[11px] font-mono font-semibold text-[#6D4AFF] mb-4">
                <span>STAGE {currentStep.stepNumber} OF 04</span>
                <span>•</span>
                <span>{currentStep.badge}</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111318] mb-2">
                {currentStep.title}
              </h3>

              <p className="text-sm font-medium text-[#626873] mb-4">
                {currentStep.subtitle}
              </p>

              <p className="text-xs sm:text-sm text-[#626873] leading-relaxed mb-6">
                {currentStep.description}
              </p>

              {/* Step Highlights */}
              <div className="space-y-2.5 mb-6">
                {currentStep.tags.map((tag) => (
                  <div key={tag} className="flex items-center gap-2 text-xs text-[#111318] font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{tag}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Action Link */}
            <div className="pt-4 border-t border-[#E5E5E2] flex items-center justify-between">
              <Link
                to={currentStep.actionLink}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6D4AFF] hover:bg-[#5E3CE6] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                <span>{currentStep.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <span className="text-xs font-mono text-[#8B919B]">
                NEXUS Runtime v3.7
              </span>
            </div>
          </div>

          {/* Right Column: Interactive Visual Simulator for the Active Step */}
          <div className="lg:col-span-6 rounded-3xl bg-[#111318] border border-[#242833] p-5 sm:p-6 text-white flex flex-col justify-between shadow-lg">
            {/* Stage Visual: Step 1 (BYOK Vault) */}
            {activeStepIndex === 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#242833] text-xs font-mono text-[#8B919B]">
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-white font-semibold">Client-Side Key Vault</span>
                  </div>
                  <span className="text-emerald-400">AES-256 GCM</span>
                </div>

                <div className="space-y-2.5 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-[#1A1D24] border border-[#2A2E3B] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <BrandLogo brand="anthropic" size={16} />
                      <span className="text-white">Anthropic API Key</span>
                    </div>
                    <span className="text-[#8B919B]">sk-ant-api03-••••••••••••</span>
                    <span className="text-emerald-400 text-[10px] bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">CONNECTED</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#1A1D24] border border-[#2A2E3B] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <BrandLogo brand="openai" size={16} />
                      <span className="text-white">OpenAI API Key</span>
                    </div>
                    <span className="text-[#8B919B]">sk-proj-••••••••••••</span>
                    <span className="text-emerald-400 text-[10px] bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">CONNECTED</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#1A1D24] border border-[#2A2E3B] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <BrandLogo brand="deepseek" size={16} />
                      <span className="text-white">DeepSeek API Key</span>
                    </div>
                    <span className="text-[#8B919B]">sk-ds-••••••••••••</span>
                    <span className="text-emerald-400 text-[10px] bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">CONNECTED</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#1A1D24] border border-[#2A2E3B] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <BrandLogo brand="gemini" size={16} />
                      <span className="text-white">Google AI Studio Key</span>
                    </div>
                    <span className="text-[#8B919B]">AIzaSy••••••••••••</span>
                    <span className="text-emerald-400 text-[10px] bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">CONNECTED</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#171A21] border border-[#242833] text-[11px] text-[#8B919B] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Zero telemetry or keys transmitted to third parties. Verified offline ready.</span>
                </div>
              </div>
            )}

            {/* Stage Visual: Step 2 (MCP & Connectors) */}
            {activeStepIndex === 1 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#242833] text-xs font-mono text-[#8B919B]">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-[#6D4AFF]" />
                    <span className="text-white font-semibold">Active MCP Server Mesh</span>
                  </div>
                  <span className="text-[#6D4AFF]">Protocol v2024-11-05</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-[#1A1D24] border border-[#2A2E3B] space-y-1">
                    <div className="flex items-center gap-2 text-white font-bold">
                      <BrandLogo brand="github" size={14} />
                      <span>GitHub MCP</span>
                    </div>
                    <p className="text-[10px] text-[#8B919B]">AST Diffing, PR Comments, CI Webhooks</p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#1A1D24] border border-[#2A2E3B] space-y-1">
                    <div className="flex items-center gap-2 text-white font-bold">
                      <BrandLogo brand="supabase" size={14} />
                      <span>Supabase MCP</span>
                    </div>
                    <p className="text-[10px] text-[#8B919B]">Postgres Schemas, RLS Policies, Realtime</p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#1A1D24] border border-[#2A2E3B] space-y-1">
                    <div className="flex items-center gap-2 text-white font-bold">
                      <BrandLogo brand="vercel" size={14} />
                      <span>Vercel MCP</span>
                    </div>
                    <p className="text-[10px] text-[#8B919B]">Preview Environments, Edge Deployments</p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#1A1D24] border border-[#2A2E3B] space-y-1">
                    <div className="flex items-center gap-2 text-white font-bold">
                      <BrandLogo brand="linear" size={14} />
                      <span>Linear MCP</span>
                    </div>
                    <p className="text-[10px] text-[#8B919B]">Issue Clustering, Roadmaps, Sprint Sync</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#171A21] border border-[#242833] text-[11px] font-mono text-emerald-400">
                  &gt; [MCP_RUNTIME] 18 tools discovered across 4 connected protocol daemons.
                </div>
              </div>
            )}

            {/* Stage Visual: Step 3 (Visual DAG Pipelines) */}
            {activeStepIndex === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#242833] text-xs font-mono text-[#8B919B]">
                  <div className="flex items-center gap-2">
                    <GitFork className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-white font-semibold">DAG Execution Pipeline</span>
                  </div>
                  <span className="text-blue-400">Multi-Model Orchestrator</span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-[#1A1D24] border border-[#6D4AFF]/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BrandLogo brand="anthropic" size={14} />
                      <span className="text-white">Node 1: Claude 3.7 DAG Planner</span>
                    </div>
                    <span className="text-[10px] text-emerald-400">DONE (142ms)</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#1A1D24] border border-blue-500/50 flex items-center justify-between ml-4">
                    <div className="flex items-center gap-2">
                      <BrandLogo brand="openai" size={14} />
                      <span className="text-white">Node 2: GPT-4o Code Synthesizer</span>
                    </div>
                    <span className="text-[10px] text-emerald-400">DONE (118ms)</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#1A1D24] border border-amber-500/50 flex items-center justify-between ml-4">
                    <div className="flex items-center gap-2">
                      <BrandLogo brand="deepseek" size={14} />
                      <span className="text-white">Node 3: DeepSeek R1 Security Auditor</span>
                    </div>
                    <span className="text-[10px] text-emerald-400">VERIFIED (164ms)</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#1A1D24] border border-purple-500/50 flex items-center justify-between ml-8">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-white">Node 4: Human Approval Checkpoint</span>
                    </div>
                    <span className="text-[10px] text-amber-400 animate-pulse">AWAITING ADMIN</span>
                  </div>
                </div>
              </div>
            )}

            {/* Stage Visual: Step 4 (Human Gate & Observability) */}
            {activeStepIndex === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#242833] text-xs font-mono text-[#8B919B]">
                  <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-white font-semibold">Live Mission Control & Observability</span>
                  </div>
                  <span className="text-emerald-400">Tamper-Proof Audit</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#1A1D24] border border-purple-500/30 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white flex items-center gap-2">
                      <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
                      Production Deployment Sign-Off Required
                    </span>
                    <span className="text-[10px] font-mono text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800">
                      ADMIN ROLE
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A4ABB8] font-mono">
                    Target: Vercel Production Release (v1.2.0) with PostgreSQL RLS migrations.
                  </p>
                  <div className="flex items-center gap-2 pt-1 font-mono text-xs">
                    <button type="button" className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px]">
                      Approve & Deploy
                    </button>
                    <button type="button" className="px-3 py-1 rounded-lg bg-rose-950 text-rose-300 border border-rose-800 text-[11px]">
                      Reject
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#171A21] border border-[#242833] text-xs font-mono space-y-1">
                  <div className="text-[#8B919B] text-[10px] uppercase">Cryptographic Audit Record</div>
                  <div className="text-emerald-400 truncate">sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069</div>
                  <div className="text-[#8B919B] text-[10px]">Verified: Zero secrets leaked • Nonce verified • AST signed</div>
                </div>
              </div>
            )}

            {/* Bottom Platform Status Indicator */}
            <div className="pt-4 border-t border-[#242833] flex items-center justify-between text-xs font-mono text-[#8B919B]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>NEXUS DESKTOP & WEB SYNC ACTIVE</span>
              </div>
              <span className="text-white">BYOK MODE: ON</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
