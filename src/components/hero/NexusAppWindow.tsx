import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  FileCode,
  Folder,
  GitBranch,
  Terminal,
  ExternalLink,
  Code2
} from 'lucide-react';
import { BrandLogo } from '../brand/BrandLogo';

interface WorkflowScenario {
  id: string;
  tabLabel: string;
  taskTitle: string;
  userPrompt: string;
  branch: string;
  fileTree: Array<{ name: string; type: 'file' | 'folder'; active?: boolean; status?: 'modified' | 'added' }>;
  agents: Array<{
    name: string;
    model: string;
    brand: 'anthropic' | 'openai' | 'deepseek' | 'gemini';
    role: string;
    message: string;
    status: string;
  }>;
  codeDiff: {
    filename: string;
    language: string;
    lines: Array<{ type: 'context' | 'added' | 'removed'; text: string; num: number }>;
  };
  terminalOutput: string;
}

const SCENARIOS: WorkflowScenario[] = [
  {
    id: 'team-invites',
    tabLabel: '1. Team Invites & RLS',
    taskTitle: 'Team Workspace Invites with Supabase RLS',
    userPrompt: 'Add team workspace member invites with cryptographically signed tokens and strict Supabase Row-Level Security.',
    branch: 'feat/team-invitations',
    fileTree: [
      { name: 'src', type: 'folder' },
      { name: 'auth/invite.ts', type: 'file', active: true, status: 'added' },
      { name: 'types/database.ts', type: 'file', status: 'modified' },
      { name: 'supabase', type: 'folder' },
      { name: 'migrations/004_invites.sql', type: 'file', status: 'added' },
      { name: 'tests/invites.test.ts', type: 'file', status: 'added' },
    ],
    agents: [
      {
        name: 'Claude 3.7',
        model: 'Claude 3.7 Sonnet',
        brand: 'anthropic',
        role: 'Architect',
        message: 'Decomposed invitation lifecycle: defined token expiry (48h), database constraints, and transactional rollback boundaries.',
        status: 'Contract verified',
      },
      {
        name: 'GPT-4o',
        model: 'OpenAI GPT-4o',
        brand: 'openai',
        role: 'Synthesizer',
        message: 'Wrote type-safe invite creation server action with Zod payload validation and transactional database insertion.',
        status: 'Generated 84 lines',
      },
      {
        name: 'DeepSeek-R1',
        model: 'DeepSeek-R1',
        brand: 'deepseek',
        role: 'Security Auditor',
        message: 'Audited RLS policy: verified only users with role "owner" or "admin" can issue invites. Zero privilege escalation possible.',
        status: 'Security certified',
      },
    ],
    codeDiff: {
      filename: 'src/auth/invite.ts',
      language: 'typescript',
      lines: [
        { type: 'context', text: 'import { createServerClient } from "@supabase/ssr";', num: 1 },
        { type: 'context', text: 'import { z } from "zod";', num: 2 },
        { type: 'added', text: 'export async function createWorkspaceInvite(workspaceId: string, email: string) {', num: 3 },
        { type: 'added', text: '  const supabase = createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);', num: 4 },
        { type: 'added', text: '  const token = crypto.randomUUID();', num: 5 },
        { type: 'added', text: '  const expiresAt = new Date(Date.now() + 48 * 3600 * 1000); // 48h validity', num: 6 },
        { type: 'added', text: '  const { data, error } = await supabase.from("workspace_invites").insert({', num: 7 },
        { type: 'added', text: '    workspace_id: workspaceId, email, token, expires_at: expiresAt', num: 8 },
        { type: 'added', text: '  }).select().single();', num: 9 },
        { type: 'added', text: '  if (error) throw new Error(error.message);', num: 10 },
        { type: 'added', text: '  return { success: true, inviteId: data.id };', num: 11 },
        { type: 'context', text: '}', num: 12 },
      ],
    },
    terminalOutput: '✓ vitest run tests/invites.test.ts · 6/6 tests passing (142ms) · 0 vulnerabilities',
  },
  {
    id: 'fraud-pipeline',
    tabLabel: '2. Sub-50ms Fraud DAG',
    taskTitle: 'Sub-50ms Transaction Fraud Detection Pipeline',
    userPrompt: 'Build a streaming card fraud detection pipeline on Apache Kafka and Redis with circuit breaker fallback under 50ms.',
    branch: 'perf/fraud-detection-stream',
    fileTree: [
      { name: 'src', type: 'folder' },
      { name: 'streaming/velocity.ts', type: 'file', active: true, status: 'modified' },
      { name: 'streaming/kafka.ts', type: 'file', status: 'modified' },
      { name: 'config/circuit-breaker.yaml', type: 'file', status: 'added' },
      { name: 'benchmarks/p99.bench.ts', type: 'file', status: 'added' },
    ],
    agents: [
      {
        name: 'GPT-4o',
        model: 'OpenAI GPT-4o',
        brand: 'openai',
        role: 'Stream Engineer',
        message: 'Implemented sliding-window transaction velocity tracker in Redis with atomic multi-key pipelines.',
        status: 'Throughput verified',
      },
      {
        name: 'Claude 3.7',
        model: 'Claude 3.7 Sonnet',
        brand: 'anthropic',
        role: 'Fault Tolerance',
        message: 'Integrated circuit breaker: on Redis connection timeouts >15ms, gracefully fail open to async manual review.',
        status: 'Zero dropped transactions',
      },
      {
        name: 'DeepSeek-R1',
        model: 'DeepSeek-R1',
        brand: 'deepseek',
        role: 'Adversarial Audit',
        message: 'Tested proxy carding botnet scenarios: confirmed geo-velocity heuristics correctly flag distributed attacks.',
        status: 'Fuzzing passed',
      },
    ],
    codeDiff: {
      filename: 'src/streaming/velocity.ts',
      language: 'typescript',
      lines: [
        { type: 'context', text: 'export async function checkVelocity(accountId: string, amount: number) {', num: 28 },
        { type: 'removed', text: '-  const total = await redis.get(`tx:${accountId}`);', num: 29 },
        { type: 'added', text: '+  // Sliding-window velocity check via atomic Redis pipeline (<4ms)', num: 29 },
        { type: 'added', text: '+  const now = Date.now();', num: 30 },
        { type: 'added', text: '+  const windowStart = now - 60_000; // 60-second window', num: 31 },
        { type: 'added', text: '+  const count = await redis.zcount(`tx_velocity:${accountId}`, windowStart, now);', num: 32 },
        { type: 'added', text: '+  if (count > 5) return { allow: false, reason: "VELOCITY_EXCEEDED" };', num: 33 },
        { type: 'context', text: '   return { allow: true, latencyMs: 3.2 };', num: 34 },
        { type: 'context', text: '}', num: 35 },
      ],
    },
    terminalOutput: '✓ Benchmark: 28,400 events/sec · P99 latency: 18.2ms · Circuit breaker: Nominal',
  },
  {
    id: 'ci-autoheal',
    tabLabel: '3. Self-Healing Build Patch',
    taskTitle: 'Autonomous TypeScript Build Repair',
    userPrompt: 'Intercept TypeScript build failures on pull requests, synthesize semantic AST patches, and verify test suites.',
    branch: 'fix/autoheal-pr-89',
    fileTree: [
      { name: 'src', type: 'folder' },
      { name: 'context/AuthContext.tsx', type: 'file', active: true, status: 'modified' },
      { name: 'api/client.ts', type: 'file', status: 'modified' },
      { name: '.github/workflows/ci.yml', type: 'file', status: 'modified' },
    ],
    agents: [
      {
        name: 'DeepSeek-R1',
        model: 'DeepSeek-R1',
        brand: 'deepseek',
        role: 'Diagnostics',
        message: 'Isolated TS2532 compilation error: object possibly "undefined" in AuthContext workspace member resolution.',
        status: 'Root cause identified',
      },
      {
        name: 'GPT-4o',
        model: 'OpenAI GPT-4o',
        brand: 'openai',
        role: 'Patch Synthesizer',
        message: 'Applied AST nullish coalescing transform with optional chaining fallback.',
        status: 'Patch synthesized',
      },
      {
        name: 'Claude 3.7',
        model: 'Claude 3.7 Sonnet',
        brand: 'anthropic',
        role: 'Regression Auditor',
        message: 'Ran full integration test suite: verified the patch does not break downstream workspace permission queries.',
        status: '18/18 test suites pass',
      },
    ],
    codeDiff: {
      filename: 'src/context/AuthContext.tsx',
      language: 'typescript',
      lines: [
        { type: 'context', text: 'export function useWorkspaceRole() {', num: 40 },
        { type: 'context', text: '  const { user } = useAuth();', num: 41 },
        { type: 'removed', text: '-  return user.workspace_members.role;', num: 42 },
        { type: 'added', text: '+  // Self-healed: Safe navigation operator prevents TS2532 runtime crash', num: 42 },
        { type: 'added', text: '+  return user?.workspace_members?.role ?? "member";', num: 43 },
        { type: 'context', text: '}', num: 44 },
      ],
    },
    terminalOutput: '✓ TypeScript compiler: 0 errors · 18/18 test suites passed · PR #89 automatically verified',
  },
];

export const NexusAppWindow: React.FC = () => {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [activeView, setActiveView] = useState<'diff' | 'conversation'>('diff');
  const [isCopied, setIsCopied] = useState(false);

  const scenario = SCENARIOS[selectedScenarioIndex];

  const handleCopyCode = () => {
    const text = scenario.codeDiff.lines.map((l) => l.text).join('\n');
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto rounded-2xl border border-[#D4D4CE] bg-white shadow-[0_24px_70px_rgba(0,0,0,0.08)] overflow-hidden text-left">
      {/* 1. Realistic macOS Window Chrome Bar */}
      <div className="px-4 py-3 bg-[#F6F6F3] border-b border-[#E5E5E2] flex items-center justify-between select-none">
        {/* Left: Window Traffic Light Dots */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
            <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
            <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
          </div>
          <span className="ml-3 text-xs font-mono text-[#626873] hidden sm:inline flex items-center gap-1.5">
            <GitBranch className="w-3 h-3 text-[#6D4AFF]" />
            <span>nexus-workspace · {scenario.branch}</span>
          </span>
        </div>

        {/* Center: Scenario Switcher Tabs */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#E5E5E2] shadow-2xs">
          {SCENARIOS.map((sc, idx) => (
            <button
              key={sc.id}
              type="button"
              onClick={() => setSelectedScenarioIndex(idx)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedScenarioIndex === idx
                  ? 'bg-[#111318] text-white font-semibold shadow-xs'
                  : 'text-[#626873] hover:text-[#111318] hover:bg-[#FAFAF8]'
              }`}
            >
              {sc.tabLabel}
            </button>
          ))}
        </div>

        {/* Right: Active Model Indicators */}
        <div className="hidden md:flex items-center gap-2 text-xs font-mono text-[#626873]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[#111318] font-semibold">3 Models Connected</span>
        </div>
      </div>

      {/* 2. Natural User Prompt Directive Banner */}
      <div className="px-5 py-3 bg-[#FAFAF8] border-b border-[#E5E5E2] flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="font-mono text-[#8B919B] uppercase font-bold shrink-0">Objective:</span>
          <span className="font-semibold text-[#111318] truncate">
            &quot;{scenario.userPrompt}&quot;
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveView(activeView === 'diff' ? 'conversation' : 'diff')}
            className="px-2.5 py-1 rounded-lg bg-white border border-[#E5E5E2] text-xs font-medium text-[#111318] hover:bg-[#FAFAF8] transition-colors cursor-pointer shadow-2xs"
          >
            {activeView === 'diff' ? 'View Agent Discussion' : 'View Code Diff'}
          </button>
        </div>
      </div>

      {/* 3. Main Split-Pane Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[340px]">
        {/* Left Column: Real File Tree (25% width on desktop) */}
        <div className="lg:col-span-3 border-r border-[#E5E5E2] bg-[#FAF9F6] p-3 text-xs font-mono flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-bold text-[#8B919B] uppercase tracking-wider px-2 py-1 mb-1">
              Repository Files
            </div>
            <div className="space-y-0.5">
              {scenario.fileTree.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    item.active
                      ? 'bg-white font-bold text-[#111318] shadow-2xs border border-[#E5E5E2]'
                      : 'text-[#626873] hover:text-[#111318] hover:bg-black/[0.02]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {item.type === 'folder' ? (
                      <Folder className="w-3.5 h-3.5 text-[#8B919B] shrink-0" />
                    ) : (
                      <FileCode className="w-3.5 h-3.5 text-[#6D4AFF] shrink-0" />
                    )}
                    <span className="truncate">{item.name}</span>
                  </div>
                  {item.status && (
                    <span
                      className={`text-[9px] font-bold uppercase px-1 rounded ${
                        item.status === 'added' ? 'text-emerald-700 bg-emerald-50' : 'text-blue-700 bg-blue-50'
                      }`}
                    >
                      {item.status === 'added' ? '+A' : 'M'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#E5E5E2] px-2 text-[11px] text-[#8B919B] space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Git Index: Clean</span>
            </div>
            <div className="text-[10px]">Auto-rollback enabled</div>
          </div>
        </div>

        {/* Right Column: Code Diff or Agent Conversation (75% width on desktop) */}
        <div className="lg:col-span-9 bg-white flex flex-col justify-between">
          {activeView === 'diff' ? (
            /* Authentic Code Diff Viewer */
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#EFEFEA] mb-3 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-[#6D4AFF]" />
                    <span className="font-bold text-[#111318]">{scenario.codeDiff.filename}</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      +9 additions
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#FAFAF8] hover:bg-[#F2F2EE] border border-[#E5E5E2] text-xs font-mono text-[#111318] transition-colors cursor-pointer"
                  >
                    {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : null}
                    <span>{isCopied ? 'Copied' : 'Copy Diff'}</span>
                  </button>
                </div>

                <div className="font-mono text-xs leading-relaxed space-y-0.5 overflow-x-auto">
                  {scenario.codeDiff.lines.map((line, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start px-2 py-0.5 rounded ${
                        line.type === 'added'
                          ? 'bg-emerald-50/80 text-emerald-950 font-medium'
                          : line.type === 'removed'
                          ? 'bg-rose-50/80 text-rose-900'
                          : 'text-[#626873]'
                      }`}
                    >
                      <span className="select-none text-[#8B919B] w-6 shrink-0 text-right pr-2 text-[10px]">
                        {line.num}
                      </span>
                      <pre className="font-mono text-xs whitespace-pre overflow-x-auto flex-1">{line.text}</pre>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Multi-Agent Collaborative Discussion */
            <div className="p-4 sm:p-5 flex-1 space-y-3">
              <div className="text-xs font-mono text-[#8B919B] uppercase font-bold pb-2 border-b border-[#EFEFEA]">
                Collaborative Agent Execution Log
              </div>
              {scenario.agents.map((ag, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white border border-[#E5E5E2] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <BrandLogo brand={ag.brand} size={15} />
                  </div>
                  <div className="flex-1 min-w-0 text-xs">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#111318]">{ag.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-50 text-[#6D4AFF] border border-purple-200">
                          {ag.role}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-700 font-semibold">{ag.status}</span>
                    </div>
                    <p className="text-[#626873] leading-relaxed">{ag.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Integrated Terminal Output */}
          <div className="px-5 py-2.5 bg-[#F6F6F3] border-t border-[#E5E5E2] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-[#111318]">
              <Terminal className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">{scenario.terminalOutput}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0 text-[11px] text-[#626873]">
              <span>Memory: 142MB</span>
              <span>•</span>
              <span className="text-emerald-700 font-semibold">100% Deterministic</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Approval & Actions Bar */}
      <div className="px-5 py-3.5 bg-[#FAFAF8] border-t border-[#E5E5E2] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#626873]">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Every agent proposed change is verified against unit tests before committing.</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyCode}
            className="px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E2] hover:bg-[#FAFAF8] text-[#111318] font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
          >
            Copy Code
          </button>
          <a
            href="/signup"
            className="px-3.5 py-1.5 rounded-lg bg-[#6D4AFF] hover:bg-[#5E3CE6] text-white font-semibold text-xs transition-colors inline-flex items-center gap-1 shadow-sm"
          >
            <span>Run on Your Repo</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
