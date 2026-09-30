import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Play,
  Copy,
  Check,
  CheckCircle2,
  ShieldCheck,
  Code2,
  Layout,
  Monitor,
  Flame,
  Bot,
  Zap,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { BrandLogo } from '../brand/BrandLogo';
import { DesktopAppModal } from '../desktop/DesktopAppModal';

interface DemoPrompt {
  id: string;
  chipLabel: string;
  prompt: string;
  models: Array<{ name: string; brand: 'anthropic' | 'openai' | 'deepseek' | 'gemini'; role: string; contribution: string }>;
  codeSnippet: string;
  previewSummary: string;
  statBadge: string;
}

const DEMO_PROMPTS: DemoPrompt[] = [
  {
    id: 'nextjs-saas',
    chipLabel: '⚡ Build Next.js SaaS with Auth',
    prompt: 'Build a production-ready Next.js 15 SaaS application with Supabase authentication, multi-tenant workspace isolation, and Stripe billing.',
    statBadge: '3 Models Synchronized · 0 Errors',
    models: [
      {
        name: 'Claude 3.7 Sonnet',
        brand: 'anthropic',
        role: 'Architect',
        contribution: 'Decomposed application structure into 3 isolated micro-modules with database contracts.',
      },
      {
        name: 'OpenAI GPT-4o',
        brand: 'openai',
        role: 'Code Synthesizer',
        contribution: 'Generated type-safe Next.js route handlers, Supabase client session logic, and Stripe webhook handler.',
      },
      {
        name: 'DeepSeek-R1',
        brand: 'deepseek',
        role: 'Security Auditor',
        contribution: 'Audited Row-Level Security policies: verified 100% tenant boundary isolation with 0 leakage.',
      },
    ],
    codeSnippet: `// app/api/workspaces/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function POST(req: Request) {
  const supabase = createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, tier } = await req.json();
  const { data } = await supabase.from('workspaces').insert({
    name,
    owner_id: user.id,
    tier: tier || 'starter',
    seats: tier === 'pro' ? 25 : 5,
  }).select().single();

  return NextResponse.json({ workspace: data, status: 'active' }, { status: 201 });
}`,
    previewSummary: 'Multi-Tenant Workspace App: 100% responsive, Supabase RLS policies active, Stripe webhook listener ready.',
  },
  {
    id: 'security-audit',
    chipLabel: '🛡️ DeepSeek Security Audit',
    prompt: 'Run an autonomous penetration test against our database queries to detect SQL injection vulnerabilities and cross-tenant data leaks.',
    statBadge: '0 Vulnerabilities Found · 100% Safe',
    models: [
      {
        name: 'DeepSeek-R1',
        brand: 'deepseek',
        role: 'Security Lead',
        contribution: 'Ran formal AST verification across 24 SQL statements. Proved zero injection vectors exist.',
      },
      {
        name: 'Claude 3.7 Sonnet',
        brand: 'anthropic',
        role: 'Verification Peer',
        contribution: 'Enforced immutable session parameter validation at every HTTP entry point.',
      },
    ],
    codeSnippet: `-- security/verified_rls_policy.sql
-- Enforced by DeepSeek-R1 formal verification engine
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_strict_isolation" ON public.workspaces
  FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Result: Leakage probability under adversarial injection = 0.000%`,
    previewSummary: 'Security Audit Certificate: 24 SQL queries inspected, 0 CVEs detected, Row-Level Security certified.',
  },
  {
    id: 'model-debate',
    chipLabel: '🤖 Claude & GPT-4o Debate',
    prompt: 'Have Claude and GPT-4o compare Redis caching vs Cloudflare Edge KV for global multi-region session persistence.',
    statBadge: 'Golden Consensus Achieved in 1.4s',
    models: [
      {
        name: 'Claude 3.7 Sonnet',
        brand: 'anthropic',
        role: 'Systems Thinker',
        contribution: 'Argued for Cloudflare KV due to sub-15ms worldwide edge read latencies and zero cold-start penalty.',
      },
      {
        name: 'OpenAI GPT-4o',
        brand: 'openai',
        role: 'Realtime Specialist',
        contribution: 'Counter-proposed Redis Upstash for sub-millisecond atomic writes and real-time token rotation.',
      },
      {
        name: 'Consensus Decision',
        brand: 'deepseek',
        role: 'Consensus Arbiter',
        contribution: 'Synthesized hybrid model: Redis for write transactions, replicated to Cloudflare KV for global reads.',
      },
    ],
    codeSnippet: `// hybrid-edge-cache.ts
export async function getSession(token: string) {
  // 1. Check local edge memory cache (<2ms)
  const cached = await edgeKV.get(token);
  if (cached) return JSON.parse(cached);

  // 2. Fallback to global Redis primary for write consistency
  const session = await redisPrimary.get(token);
  if (session) await edgeKV.put(token, JSON.stringify(session), { ttl: 60 });
  return session;
}`,
    previewSummary: 'Hybrid Architecture: Sub-12ms global read latency achieved with 100% write consistency.',
  },
  {
    id: 'landing-page',
    chipLabel: '🚀 Generate Landing Page & Deploy',
    prompt: 'Generate a clean, high-converting landing page with responsive navigation, feature cards, and 1-click Vercel deployment.',
    statBadge: 'Built & Verified in 820ms',
    models: [
      {
        name: 'GPT-4o',
        brand: 'openai',
        role: 'UI Designer',
        contribution: 'Crafted mobile-responsive React components with Tailwind CSS typography and accessible contrast.',
      },
      {
        name: 'Gemini 2.5',
        brand: 'gemini',
        role: 'Asset Inspector',
        contribution: 'Verified visual alignment across 320px mobile to 1440px desktop viewports.',
      },
    ],
    codeSnippet: `// components/LandingHero.tsx
export const LandingHero = () => (
  <div className="py-20 px-6 max-w-5xl mx-auto text-center">
    <h1 className="text-5xl font-bold tracking-tight text-[#111318] mb-4">
      Launch your AI startup in minutes.
    </h1>
    <p className="text-lg text-[#626873] max-w-2xl mx-auto mb-8">
      The all-in-one developer workspace powered by collaborative AI agents.
    </p>
    <button className="px-6 py-3 rounded-xl bg-[#6D4AFF] text-white font-semibold shadow-md">
      Get Started Free →
    </button>
  </div>
);`,
    previewSummary: 'Ready for Edge Deployment: 100/100 Lighthouse performance score verified.',
  },
];

export const Hero: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDemoId, setSelectedDemoId] = useState<string>('nextjs-saas');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'conversation' | 'preview' | 'code'>('conversation');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [desktopModalOpen, setDesktopModalOpen] = useState<boolean>(false);

  const activeDemo = DEMO_PROMPTS.find((d) => d.id === selectedDemoId) || DEMO_PROMPTS[0];

  const handleRunDemo = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
    }, 1200);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeDemo.codeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <section className="relative pt-24 pb-14 sm:pt-28 sm:pb-18 lg:pt-30 lg:pb-22 overflow-hidden bg-gradient-to-b from-[#F6F6F3] via-white to-[#FAFAF8] text-[#111318]">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[380px] bg-gradient-to-b from-[#6D4AFF]/10 via-[#3B82F6]/6 to-transparent blur-[120px] pointer-events-none -z-0" />

      <div className="max-w-6xl mx-auto w-full relative z-10 px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Product Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-xs font-semibold text-[#6D4AFF] mb-6 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#6D4AFF]" />
          <span>The Multi-AI Platform · Claude 3.7 + GPT-4o + DeepSeek Together</span>
        </div>

        {/* Clean, Human Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#111318] leading-[1.08] mb-5 max-w-4xl mx-auto">
          One prompt.<br />
          <span className="text-[#6D4AFF]">Every top AI working for you.</span>
        </h1>

        {/* Clear, Jargon-Free Subtitle */}
        <p className="text-base sm:text-lg lg:text-xl text-[#626873] max-w-2xl mx-auto leading-relaxed mb-8">
          Stop switching between isolated ChatGPT, Claude, and Gemini tabs. NEXUS combines the world&apos;s most capable AI models into one collaborative team that writes code, verifies security, and builds your apps.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-10">
          <Link to="/signup">
            <Button size="lg" withArrow className="h-12 px-6 text-sm font-semibold shadow-lg shadow-[#6D4AFF]/25">
              Start Building Free
            </Button>
          </Link>

          <button
            type="button"
            onClick={() => setDesktopModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 h-12 rounded-xl bg-white hover:bg-[#FAFAF8] border border-[#E5E5E2] hover:border-[#D4D4CE] text-sm font-semibold text-[#111318] transition-all shadow-xs cursor-pointer"
          >
            <Monitor className="w-4 h-4 text-[#6D4AFF]" />
            <span>Get Desktop App</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* FLAGSHIP HERO CENTERPIECE: The Claude / ChatGPT-style NEXUS AI Studio Box */}
        {/* ========================================================================= */}
        <div className="max-w-4xl mx-auto rounded-3xl border border-[#E5E5E2] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden text-left transition-all">
          {/* Top Model Selector Bar (Like Claude / ChatGPT model switch) */}
          <div className="px-4 py-3 bg-[#FAFAF8] border-b border-[#E5E5E2] flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#8B919B] uppercase font-semibold">Active Team:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 text-[#6D4AFF] text-xs font-semibold">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>Swarm Consensus (Recommended)</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-[#E5E5E2] text-xs text-[#626873]">
                  <BrandLogo brand="anthropic" size={13} />
                  <span>Claude 3.7</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-[#E5E5E2] text-xs text-[#626873]">
                  <BrandLogo brand="openai" size={13} />
                  <span>GPT-4o</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-[#E5E5E2] text-xs text-[#626873]">
                  <BrandLogo brand="deepseek" size={13} />
                  <span>DeepSeek R1</span>
                </span>
              </div>
            </div>

            <div className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
              ✓ Ready · Zero Setup
            </div>
          </div>

          {/* Interactive Prompt Command Bar */}
          <div className="p-4 sm:p-5 border-b border-[#E5E5E2] bg-white">
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-[#6D4AFF]">
                <Bot className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={customPrompt || activeDemo.prompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Ask NEXUS to build an app, inspect code, or solve a problem..."
                className="w-full pl-11 pr-28 py-3 rounded-2xl bg-[#FAFAF8] border border-[#E5E5E2] focus:border-[#6D4AFF] focus:bg-white text-xs sm:text-sm font-medium text-[#111318] outline-none transition-all placeholder:text-[#8B919B]"
              />
              <button
                type="button"
                onClick={handleRunDemo}
                disabled={isSimulating}
                className="absolute right-2 px-3.5 py-2 rounded-xl bg-[#6D4AFF] hover:bg-[#5E3CE6] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isSimulating ? (
                  <>
                    <Zap className="w-3.5 h-3.5 animate-spin text-amber-300" />
                    <span>Running...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-white" />
                    <span>Run AI Swarm</span>
                  </>
                )}
              </button>
            </div>

            {/* Clickable Quick Starter Chips */}
            <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 text-xs">
              <span className="text-[#8B919B] font-mono text-[11px] shrink-0 mr-1 hidden sm:inline">Try an example:</span>
              {DEMO_PROMPTS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    setSelectedDemoId(d.id);
                    setCustomPrompt('');
                  }}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 font-medium ${
                    selectedDemoId === d.id && !customPrompt
                      ? 'bg-purple-100 text-[#6D4AFF] font-semibold border border-purple-300 shadow-2xs'
                      : 'bg-[#FAFAF8] hover:bg-[#F2F2EE] text-[#626873] border border-[#E5E5E2]'
                  }`}
                >
                  {d.chipLabel}
                </button>
              ))}
            </div>
          </div>

          {/* Result Output Tabs (Conversation vs Live App Preview vs Generated Code) */}
          <div className="p-4 sm:p-5 bg-[#FAFAF8]">
            {/* View Mode Switcher */}
            <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-[#E5E5E2]">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('conversation')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'conversation'
                      ? 'bg-white text-[#111318] border border-[#D4D4CE] shadow-2xs'
                      : 'text-[#626873] hover:text-[#111318]'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5 text-[#6D4AFF]" />
                  <span>AI Team Conversation</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'preview'
                      ? 'bg-white text-[#111318] border border-[#D4D4CE] shadow-2xs'
                      : 'text-[#626873] hover:text-[#111318]'
                  }`}
                >
                  <Layout className="w-3.5 h-3.5 text-blue-600" />
                  <span>Live App Preview</span>
                  <span className="text-[9px] font-mono px-1 rounded bg-emerald-100 text-emerald-800">INTERACTIVE</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('code')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'code'
                      ? 'bg-white text-[#111318] border border-[#D4D4CE] font-bold shadow-2xs'
                      : 'text-[#626873] hover:text-[#111318]'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Production Code</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 hidden md:inline">
                  {activeDemo.statBadge}
                </span>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#FAFAF8] border border-[#E5E5E2] text-xs font-mono text-[#111318] flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                  title="Copy code"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* TAB CONTENT 1: Friendly Conversational AI Dialogue (Like Claude / ChatGPT) */}
            {activeTab === 'conversation' && (
              <div className="space-y-3 min-h-[220px]">
                {activeDemo.models.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white border border-[#E5E5E2] shadow-2xs flex items-start gap-3 transition-all"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#FAFAF8] border border-[#E5E5E2] flex items-center justify-center shrink-0 mt-0.5">
                      <BrandLogo brand={m.brand} size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-[#111318]">{m.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-50 text-[#6D4AFF] border border-purple-200">
                          {m.role}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-700 ml-auto">✓ Verified</span>
                      </div>
                      <p className="text-xs text-[#475467] leading-relaxed">
                        {m.contribution}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB CONTENT 2: Live Working Mini-App Preview */}
            {activeTab === 'preview' && (
              <div className="p-5 rounded-2xl bg-white border border-[#E5E5E2] shadow-2xs min-h-[220px] flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#EFEFEA]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-[#111318]">Working Application Output</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    Client Sandbox Ready
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] space-y-2">
                  <div className="text-xs font-semibold text-[#111318]">
                    Generated Software Asset:
                  </div>
                  <p className="text-xs text-[#626873] leading-relaxed">
                    {activeDemo.previewSummary}
                  </p>
                  <div className="flex items-center gap-2 pt-2 text-[11px] font-mono text-emerald-700">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Zero security vulnerabilities · 100% Type-Safe TypeScript</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 text-xs text-[#8B919B]">
                  <span>Click &quot;Production Code&quot; tab above to view generated files.</span>
                  <button
                    type="button"
                    onClick={() => navigate('/app/workflows/new')}
                    className="text-[#6D4AFF] hover:underline font-semibold cursor-pointer"
                  >
                    Open in Nexus Workspace Studio →
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: Clean Formatted Code Snippet */}
            {activeTab === 'code' && (
              <div className="p-4 rounded-2xl bg-white border border-[#E5E5E2] shadow-2xs min-h-[220px] font-mono text-xs overflow-x-auto max-h-[300px]">
                <pre className="text-[#1F2937] leading-relaxed">
                  {activeDemo.codeSnippet}
                </pre>
              </div>
            )}
          </div>

          {/* Bottom Reassurance & Immediate Action Bar */}
          <div className="px-5 py-3.5 bg-white border-t border-[#E5E5E2] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#626873]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Tested live by 12,000+ developers. Zero server fees or token markups.</span>
            </div>

            <Link
              to="/signup"
              className="text-[#6D4AFF] hover:text-[#5E3CE6] font-semibold inline-flex items-center gap-1 transition-colors"
            >
              <span>Build your first app with NEXUS free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Feature Highlights Row Under Hero */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[#626873]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Bring Your Own Keys (BYOK) or Free Trial</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Zero Data Storage on Third-Party Servers</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Web Browser &amp; Native Desktop Apps (Mac, Windows, Linux)</span>
          </div>
        </div>
      </div>

      {/* Desktop App Modal */}
      <DesktopAppModal
        isOpen={desktopModalOpen}
        onClose={() => setDesktopModalOpen(false)}
      />
    </section>
  );
};

export default Hero;
