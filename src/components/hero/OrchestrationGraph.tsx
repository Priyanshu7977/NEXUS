import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../brand/BrandLogo';
import { NexusLogo } from '../layout/Navbar';
import { Check, ArrowUpRight } from 'lucide-react';

interface AiModelNode {
  id: string;
  name: string;
  provider: 'anthropic' | 'openai' | 'deepseek' | 'gemini';
  modelBadge: string;
  role: string;
  status: 'Planning' | 'Executing' | 'Verifying' | 'Streaming';
  latency: string;
  tokensPerSec: number;
  link: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const OrchestrationGraph: React.FC = () => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [liveTokenCount, setLiveTokenCount] = useState(14820);

  // Live token animation
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTokenCount((prev) => prev + Math.floor(Math.random() * 28) + 12);
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  const models: AiModelNode[] = [
    {
      id: 'claude',
      name: 'Claude 3.7 Sonnet',
      provider: 'anthropic',
      modelBadge: 'Reasoning & Planning',
      role: 'Decomposes goals into deterministic DAG tasks',
      status: 'Planning',
      latency: '142ms',
      tokensPerSec: 88,
      link: '/explore/claude-planner-agent',
      position: 'top-left',
    },
    {
      id: 'openai',
      name: 'OpenAI GPT-4o',
      provider: 'openai',
      modelBadge: 'Code & Tools Agent',
      role: 'Synthesizes code & invokes MCP integrations',
      status: 'Executing',
      latency: '118ms',
      tokensPerSec: 114,
      link: '/explore/gpt4o-code-agent',
      position: 'top-right',
    },
    {
      id: 'deepseek',
      name: 'DeepSeek R1',
      provider: 'deepseek',
      modelBadge: 'Formal Math & Audit',
      role: 'Verifies logic proofs, security & AST invariants',
      status: 'Verifying',
      latency: '164ms',
      tokensPerSec: 72,
      link: '/explore/deepseek-security-auditor',
      position: 'bottom-left',
    },
    {
      id: 'gemini',
      name: 'Google Gemini 2.5',
      provider: 'gemini',
      modelBadge: '1M+ Context & Vision',
      role: 'Scans full repository context & multimodal assets',
      status: 'Streaming',
      latency: '95ms',
      tokensPerSec: 130,
      link: '/explore/gemini-multimodal-analyst',
      position: 'bottom-right',
    },
  ];

  return (
    <div className="relative w-full rounded-2xl bg-white border border-[#E5E5E2] shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden p-3 sm:p-5 select-none text-left">
      {/* Background Architectural Grid Pattern */}
      <div className="absolute inset-0 bg-dots-light opacity-70 pointer-events-none" />

      {/* Top Bar Indicator */}
      <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#EFEFEA] mb-3 sm:mb-4 text-[11px] font-mono text-[#8B919B]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-[#111318]">MULTI-AI COLLABORATION RUNTIME</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden xs:inline">BYOK Enabled</span>
          <span className="text-[#6D4AFF] font-semibold">{liveTokenCount.toLocaleString()} tok/min</span>
        </div>
      </div>

      {/* Grid Canvas Layout (Eliminates all overlapping, whitespace gaps, and clipping) */}
      <div className="relative min-h-[320px] sm:min-h-[340px] lg:min-h-[330px] xl:min-h-[360px] flex flex-col justify-between">
        {/* SVG Connection Lines for sm+ screens */}
        <svg className="hidden sm:block absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <linearGradient id="multiAiActiveLine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6D4AFF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Top-Left to Center */}
          <line x1="25%" y1="24%" x2="50%" y2="50%" stroke="#E5E5E2" strokeWidth="1.5" strokeDasharray="3 3" />
          {/* Top-Right to Center */}
          <line x1="75%" y1="24%" x2="50%" y2="50%" stroke="#E5E5E2" strokeWidth="1.5" strokeDasharray="3 3" />
          {/* Bottom-Left to Center */}
          <line x1="25%" y1="76%" x2="50%" y2="50%" stroke="#E5E5E2" strokeWidth="1.5" strokeDasharray="3 3" />
          {/* Bottom-Right to Center */}
          <line x1="75%" y1="76%" x2="50%" y2="50%" stroke="#E5E5E2" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Animated Flow Pulse to active node */}
          <circle cx="50%" cy="50%" r="42" fill="none" stroke="#6D4AFF" strokeWidth="1" opacity="0.2" className="animate-ping" />
        </svg>

        {/* Top Row: Claude (Left) & GPT-4o (Right) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 relative z-10">
          {/* Node 1: Claude 3.7 Sonnet */}
          <Link
            to={models[0].link}
            onMouseEnter={() => setHoveredNode(models[0].id)}
            onMouseLeave={() => setHoveredNode(null)}
            className={`p-3 rounded-xl bg-white border transition-all duration-200 shadow-2xs group cursor-pointer ${
              hoveredNode === models[0].id
                ? 'border-[#6D4AFF] shadow-sm -translate-y-0.5'
                : 'border-[#E5E5E2] hover:border-[#D4D4CE]'
            }`}
          >
            <div className="flex items-center justify-between gap-1.5 mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#FAFAF8] border border-[#E5E5E2] flex items-center justify-center shrink-0">
                  <BrandLogo brand={models[0].provider} size={14} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#111318] group-hover:text-[#6D4AFF] transition-colors">
                    {models[0].name}
                  </h4>
                  <span className="text-[10px] font-mono text-[#8B919B] block">
                    {models[0].modelBadge}
                  </span>
                </div>
              </div>
              <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-purple-50 text-[#6D4AFF] border border-purple-200 shrink-0">
                {models[0].latency}
              </span>
            </div>
            <p className="text-[11px] text-[#626873] leading-snug line-clamp-2">
              {models[0].role}
            </p>
          </Link>

          {/* Node 2: OpenAI GPT-4o */}
          <Link
            to={models[1].link}
            onMouseEnter={() => setHoveredNode(models[1].id)}
            onMouseLeave={() => setHoveredNode(null)}
            className={`p-3 rounded-xl bg-white border transition-all duration-200 shadow-2xs group cursor-pointer ${
              hoveredNode === models[1].id
                ? 'border-[#6D4AFF] shadow-sm -translate-y-0.5'
                : 'border-[#E5E5E2] hover:border-[#D4D4CE]'
            }`}
          >
            <div className="flex items-center justify-between gap-1.5 mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#FAFAF8] border border-[#E5E5E2] flex items-center justify-center shrink-0">
                  <BrandLogo brand={models[1].provider} size={14} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#111318] group-hover:text-[#6D4AFF] transition-colors">
                    {models[1].name}
                  </h4>
                  <span className="text-[10px] font-mono text-[#8B919B] block">
                    {models[1].modelBadge}
                  </span>
                </div>
              </div>
              <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                {models[1].latency}
              </span>
            </div>
            <p className="text-[11px] text-[#626873] leading-snug line-clamp-2">
              {models[1].role}
            </p>
          </Link>
        </div>

        {/* Center Nexus Orchestration Bus Badge */}
        <div className="my-2 sm:my-3 flex items-center justify-center relative z-20">
          <Link
            to="/explore"
            onMouseEnter={() => setHoveredNode('core')}
            onMouseLeave={() => setHoveredNode(null)}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#111318] hover:bg-[#1C1F26] text-white border border-[#22262F] shadow-md transition-all duration-200 hover:border-[#6D4AFF]/80 group cursor-pointer"
          >
            <NexusLogo size={16} dark />
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold tracking-tight text-white">NEXUS Multi-Model Bus</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#6D4AFF] animate-ping" />
              </div>
              <span className="text-[10px] font-mono text-[#8B919B]">A2A Inter-Agent Protocol • &lt;10ms Sync</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#8B919B] group-hover:text-[#6D4AFF] transition-colors" />
          </Link>
        </div>

        {/* Bottom Row: DeepSeek R1 (Left) & Gemini 2.5 (Right) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 relative z-10">
          {/* Node 3: DeepSeek R1 */}
          <Link
            to={models[2].link}
            onMouseEnter={() => setHoveredNode(models[2].id)}
            onMouseLeave={() => setHoveredNode(null)}
            className={`p-3 rounded-xl bg-white border transition-all duration-200 shadow-2xs group cursor-pointer ${
              hoveredNode === models[2].id
                ? 'border-[#6D4AFF] shadow-sm -translate-y-0.5'
                : 'border-[#E5E5E2] hover:border-[#D4D4CE]'
            }`}
          >
            <div className="flex items-center justify-between gap-1.5 mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#FAFAF8] border border-[#E5E5E2] flex items-center justify-center shrink-0">
                  <BrandLogo brand={models[2].provider} size={14} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#111318] group-hover:text-[#6D4AFF] transition-colors">
                    {models[2].name}
                  </h4>
                  <span className="text-[10px] font-mono text-[#8B919B] block">
                    {models[2].modelBadge}
                  </span>
                </div>
              </div>
              <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                {models[2].latency}
              </span>
            </div>
            <p className="text-[11px] text-[#626873] leading-snug line-clamp-2">
              {models[2].role}
            </p>
          </Link>

          {/* Node 4: Google Gemini 2.5 */}
          <Link
            to={models[3].link}
            onMouseEnter={() => setHoveredNode(models[3].id)}
            onMouseLeave={() => setHoveredNode(null)}
            className={`p-3 rounded-xl bg-white border transition-all duration-200 shadow-2xs group cursor-pointer ${
              hoveredNode === models[3].id
                ? 'border-[#6D4AFF] shadow-sm -translate-y-0.5'
                : 'border-[#E5E5E2] hover:border-[#D4D4CE]'
            }`}
          >
            <div className="flex items-center justify-between gap-1.5 mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#FAFAF8] border border-[#E5E5E2] flex items-center justify-center shrink-0">
                  <BrandLogo brand={models[3].provider} size={14} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#111318] group-hover:text-[#6D4AFF] transition-colors">
                    {models[3].name}
                  </h4>
                  <span className="text-[10px] font-mono text-[#8B919B] block">
                    {models[3].modelBadge}
                  </span>
                </div>
              </div>
              <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                {models[3].latency}
              </span>
            </div>
            <p className="text-[11px] text-[#626873] leading-snug line-clamp-2">
              {models[3].role}
            </p>
          </Link>
        </div>
      </div>

      {/* Bottom Status Footer */}
      <div className="pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-[#EFEFEA] flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-[11px] text-[#8B919B] font-mono">
        <div className="flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>Autonomous A2A Protocol · Deterministic Orchestration</span>
        </div>
        <div className="flex items-center gap-2 font-sans font-medium text-[#626873]">
          <span>Web &amp; Desktop Unified</span>
        </div>
      </div>
    </div>
  );
};
