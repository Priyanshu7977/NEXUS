import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../brand/BrandLogo';
import { 
  Cpu, 
  Play, 
  Check, 
  RefreshCw,
  ArrowUpRight
} from 'lucide-react';

interface ModelPersona {
  id: string;
  slug: string;
  name: string;
  provider: 'anthropic' | 'openai' | 'deepseek' | 'gemini' | 'meta';
  roleTitle: string;
  strengths: string;
  latencyMs: number;
  tokensPerSec: number;
  byokSupported: boolean;
  samplePrompt: string;
  sampleOutput: string;
}

const TOP_MODELS: ModelPersona[] = [
  {
    id: 'claude',
    slug: 'claude-planner-agent',
    name: 'Claude 3.7 Sonnet',
    provider: 'anthropic',
    roleTitle: 'Lead Architect & Task Decomposition',
    strengths: 'Extended thinking, complex systems design, multi-file refactoring',
    latencyMs: 140,
    tokensPerSec: 88,
    byokSupported: true,
    samplePrompt: 'Design microservice decomposition plan for high-throughput billing engine.',
    sampleOutput: '✓ Generated 4 DAG steps with deterministic contract boundaries and retry policies.',
  },
  {
    id: 'openai',
    slug: 'gpt4o-code-agent',
    name: 'OpenAI GPT-4o / o3-mini',
    provider: 'openai',
    roleTitle: 'Core Code Synthesis & Tool Calling',
    strengths: 'Multimodal execution, high-precision JSON tool schemas, TypeScript SDK',
    latencyMs: 110,
    tokensPerSec: 115,
    byokSupported: true,
    samplePrompt: 'Implement Postgres adapter with pooling, idempotency header, and health checks.',
    sampleOutput: '✓ Generated typed TypeScript adapter with zero-allocation buffer parser.',
  },
  {
    id: 'deepseek',
    slug: 'deepseek-security-auditor',
    name: 'DeepSeek R1',
    provider: 'deepseek',
    roleTitle: 'Formal Logic & Security Verification',
    strengths: 'Deep reasoning, mathematical proofs, AST vulnerability scanning',
    latencyMs: 165,
    tokensPerSec: 74,
    byokSupported: true,
    samplePrompt: 'Audit generated SQL statements for subtle injection and race conditions.',
    sampleOutput: '✓ Passed: No SQLi detected. Transaction isolation level verified as REPEATABLE READ.',
  },
  {
    id: 'gemini',
    slug: 'gemini-multimodal-analyst',
    name: 'Google Gemini 2.5 Pro',
    provider: 'gemini',
    roleTitle: '1M+ Context & Multimodal Vision',
    strengths: 'Full codebase context ingestion, video/image UI regression audits',
    latencyMs: 95,
    tokensPerSec: 132,
    byokSupported: true,
    samplePrompt: 'Compare Figma UI screenshot against rendered DOM for pixel perfection.',
    sampleOutput: '✓ 99.4% visual alignment. Verified responsive grid layout on 320px to 1440px.',
  },
  {
    id: 'llama',
    slug: 'llama-edge-dispatcher',
    name: 'Meta Llama 3.3 70B (Groq)',
    provider: 'meta',
    roleTitle: 'Sub-Second Edge Telemetry & Triage',
    strengths: 'Ultra-low latency streaming (<50ms), self-hostable open weights',
    latencyMs: 42,
    tokensPerSec: 280,
    byokSupported: true,
    samplePrompt: 'Triage incoming webhook payload and route to appropriate agent lane.',
    sampleOutput: '✓ Classified payload in 38ms. Dispatched execution event to Slack connector.',
  },
];

export const MultiAiShowcase: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<ModelPersona>(TOP_MODELS[0]);
  const [simulating, setSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);

  const runSimulation = () => {
    setSimulating(true);
    setSimulationStep(1);

    const s2 = setTimeout(() => setSimulationStep(2), 900);
    const s3 = setTimeout(() => setSimulationStep(3), 1800);
    const s4 = setTimeout(() => setSimulationStep(4), 2700);
    const sEnd = setTimeout(() => {
      setSimulationStep(5);
      setSimulating(false);
    }, 3600);

    return () => {
      clearTimeout(s2);
      clearTimeout(s3);
      clearTimeout(s4);
      clearTimeout(sEnd);
    };
  };

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white border-t border-[#E5E5E2] text-left">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="max-w-3xl mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs font-mono font-semibold text-[#6D4AFF] mb-3">
            <Cpu className="w-3.5 h-3.5" />
            <span>TOP AI APIs · MULTI-MODEL COLLABORATION</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#111318] mb-3">
            Every top AI model working as one cohesive team
          </h2>
          <p className="text-sm sm:text-base text-[#626873] leading-relaxed">
            Why settle for one AI provider? In NEXUS, you can connect your API keys for Anthropic, OpenAI, Google, DeepSeek, and Groq on Web and Desktop. Each model takes on the role it excels at most.
          </p>
        </div>

        {/* 2-Column Interactive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Model Selector List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-[#8B919B] font-semibold mb-2">
              Select AI Engine:
            </div>
            {TOP_MODELS.map((model) => {
              const isSelected = selectedModel.id === model.id;
              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => setSelectedModel(model)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#FAFAF8] border-[#6D4AFF] shadow-sm'
                      : 'bg-white border-[#E5E5E2] hover:border-[#D4D4CE] hover:bg-[#FAFAF8]/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-white border border-[#E5E5E2] flex items-center justify-center shrink-0 shadow-2xs">
                      <BrandLogo brand={model.provider} size={18} />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-[#111318] truncate">
                          {model.name}
                        </span>
                        {model.byokSupported && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-50 text-[#6D4AFF] border border-purple-200">
                            BYOK
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#626873] truncate block mt-0.5">
                        {model.roleTitle}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-mono font-semibold text-[#111318] block">
                      {model.latencyMs}ms
                    </span>
                    <span className="text-[10px] font-mono text-[#8B919B]">
                      {model.tokensPerSec} tok/s
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Live Model Inspector & Simulation Stage */}
          <div className="lg:col-span-7 space-y-6">
            {/* Model Detail Card */}
            <div className="p-6 rounded-3xl bg-[#FAFAF8] border border-[#E5E5E2] shadow-sm space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E5E5E2]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[#E5E5E2] flex items-center justify-center shadow-2xs">
                    <BrandLogo brand={selectedModel.provider} size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-[#111318]">
                        {selectedModel.name}
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active Lane
                      </span>
                    </div>
                    <p className="text-xs text-[#626873] mt-0.5">{selectedModel.roleTitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono text-xs text-[#626873]">
                  <div className="px-3 py-1.5 rounded-xl bg-white border border-[#E5E5E2]">
                    Speed: <span className="text-[#111318] font-bold">{selectedModel.tokensPerSec} tok/s</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-white border border-[#E5E5E2]">
                    Latency: <span className="text-[#111318] font-bold">{selectedModel.latencyMs}ms</span>
                  </div>
                </div>
              </div>

              {/* Strengths */}
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#8B919B] font-semibold block mb-1">
                  Core Specialization:
                </span>
                <p className="text-xs sm:text-sm text-[#111318] font-medium leading-relaxed">
                  {selectedModel.strengths}
                </p>
              </div>

              {/* Sample Execution Box */}
              <div className="rounded-2xl bg-[#111318] text-white p-4 font-mono text-xs space-y-2 border border-[#242833]">
                <div className="flex items-center justify-between text-[#8B919B] text-[10px] pb-2 border-b border-[#242833]">
                  <span>Autonomous Task Simulation</span>
                  <span>Input &rarr; Output</span>
                </div>
                <div className="text-[#A4ABB8]">
                  <span className="text-[#6D4AFF] font-bold">&gt; Prompt: </span>
                  {selectedModel.samplePrompt}
                </div>
                <div className="text-emerald-400 pt-1">
                  <span className="text-white font-bold">&gt; Response: </span>
                  {selectedModel.sampleOutput}
                </div>
              </div>

              {/* Live Multi-Model Pipeline Trigger & Direct Registry Link */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                <Link
                  to={`/explore/${selectedModel.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6D4AFF] hover:text-[#5E3CE6] transition-colors"
                >
                  <span>View {selectedModel.name} Specs in Registry</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>

                <button
                  type="button"
                  disabled={simulating}
                  onClick={runSimulation}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6D4AFF] hover:bg-[#5E3CE6] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {simulating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Simulating Step {simulationStep}/4...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Run Multi-Model Pipeline</span>
                    </>
                  )}
                </button>
              </div>

              {/* Simulation Stepper */}
              {simulationStep > 0 && (
                <div className="p-3.5 rounded-xl bg-white border border-[#E5E5E2] space-y-2 text-xs font-mono">
                  <div className={`flex items-center gap-2 ${simulationStep >= 1 ? 'text-[#111318] font-semibold' : 'text-[#8B919B]'}`}>
                    <span className="w-4 h-4 rounded-full bg-purple-100 text-[#6D4AFF] flex items-center justify-center text-[10px]">1</span>
                    <span>Claude 3.7: Decomposed architecture into 3 microservice interfaces</span>
                    {simulationStep >= 1 && <Check className="w-3 h-3 text-emerald-500 ml-auto" />}
                  </div>
                  <div className={`flex items-center gap-2 ${simulationStep >= 2 ? 'text-[#111318] font-semibold' : 'text-[#8B919B]'}`}>
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">2</span>
                    <span>GPT-4o: Synthesized TypeScript SDK and MCP tool bindings</span>
                    {simulationStep >= 2 && <Check className="w-3 h-3 text-emerald-500 ml-auto" />}
                  </div>
                  <div className={`flex items-center gap-2 ${simulationStep >= 3 ? 'text-[#111318] font-semibold' : 'text-[#8B919B]'}`}>
                    <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">3</span>
                    <span>DeepSeek R1: Formally audited SQL queries &amp; concurrency invariants</span>
                    {simulationStep >= 3 && <Check className="w-3 h-3 text-emerald-500 ml-auto" />}
                  </div>
                  <div className={`flex items-center gap-2 ${simulationStep >= 4 ? 'text-[#111318] font-semibold' : 'text-[#8B919B]'}`}>
                    <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px]">4</span>
                    <span>Gemini 2.5: Scanned 1M token context &amp; verified UI layout integrity</span>
                    {simulationStep >= 4 && <Check className="w-3 h-3 text-emerald-500 ml-auto" />}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
