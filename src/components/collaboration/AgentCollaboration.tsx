import React, { useState } from 'react';
import { Bot, User, CheckCircle2, Terminal, Rocket } from 'lucide-react';
import { BrandLogo } from '../brand/BrandLogo';

export const AgentCollaboration: React.FC = () => {
  const [activeStep, setActiveStep] = useState<string>('code-agent');

  const parallelAgents = [
    {
      id: 'research-agent',
      name: 'Research Agent',
      brand: 'anthropic',
      role: 'Analyzes database dependencies and RLS models',
      status: 'Completed' as const,
      output: 'Indexed 3 target tables: profiles, workspaces, workspace_members.'
    },
    {
      id: 'code-agent',
      name: 'Code Agent',
      brand: 'github',
      role: 'Generates PostgreSQL migrations and client SDK bindings',
      status: 'Active' as const,
      output: 'Created 001_initial_schema.sql and updated AuthContext.tsx.'
    }
  ];

  return (
    <section id="collaboration" className="relative py-14 sm:py-18 lg:py-20 px-4 sm:px-6 lg:px-8 bg-[#FAFAF8] border-y border-[#E5E5E2]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="max-w-3xl mb-10 lg:mb-12 text-left">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#111318] leading-[1.1] mb-4">
            One task.<br />
            A team of agents.
          </h2>
          <p className="text-base sm:text-lg text-[#626873] leading-relaxed">
            Deconstruct complex engineering objectives across specialized autonomous agents that plan, write code, run verification suites, and deploy in concert.
          </p>
        </div>

        {/* Visual Timeline Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left: Orchestration Timeline Tree */}
          <div className="lg:col-span-7 flex flex-col gap-4 relative">
            {/* Step 1: User Request */}
            <div className="p-4 rounded-xl bg-white border border-[#E5E5E2] shadow-sm flex items-center gap-3.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#F6F6F3] border border-[#E5E5E2] flex items-center justify-center shrink-0 text-[#111318]">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-semibold text-[#8B919B] uppercase tracking-wider block">Trigger</span>
                <span className="text-xs sm:text-sm font-medium text-[#111318] break-words">
                  "Implement authenticated user workspaces with RLS policies."
                </span>
              </div>
            </div>

            {/* Connecting Line */}
            <div className="w-[1px] h-4 bg-[#D4D4CE] mx-auto my-[-4px]" />

            {/* Step 2: Planner */}
            <div className="p-4 rounded-xl bg-white border border-[#E5E5E2] shadow-sm flex items-center justify-between min-w-0">
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-lg bg-[#6D4AFF]/10 border border-[#6D4AFF]/20 flex items-center justify-center shrink-0 text-[#6D4AFF]">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-[#111318]">Planner Agent</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded border border-emerald-200 font-medium">COMPLETED</span>
                  </div>
                  <span className="text-xs text-[#626873] block break-words">Decomposes task into database schema, client state, and security boundaries.</span>
                </div>
              </div>
            </div>

            {/* Connecting Fork Lines */}
            <div className="w-[1px] h-4 bg-[#D4D4CE] mx-auto my-[-4px]" />

            {/* Step 3: Parallel Execution Fork */}
            <div className="p-5 rounded-2xl bg-[#F6F6F3] border border-[#E5E5E2] flex flex-col gap-3 min-w-0">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[#626873] uppercase tracking-wider">
                <span>Parallel Subtask Execution</span>
                <span className="text-[#6D4AFF]">2 Concurrent Agents</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
                {parallelAgents.map((ag) => {
                  const isSelected = activeStep === ag.id;
                  return (
                    <div
                      key={ag.id}
                      onClick={() => setActiveStep(ag.id)}
                      className={`h-full p-4 rounded-xl border transition-all duration-150 cursor-pointer text-left flex flex-col justify-between min-w-0 ${
                        isSelected
                          ? 'bg-white border-[#6D4AFF] shadow-sm'
                          : 'bg-white/80 border-[#E5E5E2] hover:bg-white hover:border-[#D4D4CE]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2 min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <BrandLogo brand={ag.name.includes('Code') ? 'github' : 'anthropic'} size={16} />
                          <span className="text-xs font-semibold text-[#111318] truncate">{ag.name}</span>
                        </div>
                        {ag.status === 'Active' ? (
                          <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200 shrink-0 font-medium">RUNNING</span>
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#626873] leading-relaxed break-words flex-1">
                        {ag.role}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Connecting Join Line */}
            <div className="w-[1px] h-4 bg-[#D4D4CE] mx-auto my-[-4px]" />

            {/* Step 4: Verification Gate */}
            <div className="p-4 rounded-xl bg-white border border-[#E5E5E2] shadow-sm flex items-center justify-between min-w-0">
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 text-blue-600">
                  <Terminal className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-[#111318]">Test & Security Gate</span>
                    <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.2 rounded border border-amber-200 font-medium">QUEUED</span>
                  </div>
                  <span className="text-xs text-[#626873] block break-words">Typecheck, RLS policy validation, and automated test run.</span>
                </div>
              </div>
            </div>

            {/* Connecting Line */}
            <div className="w-[1px] h-4 bg-[#D4D4CE] mx-auto my-[-4px]" />

            {/* Step 5: Deployment */}
            <div className="p-4 rounded-xl bg-white border border-[#E5E5E2] shadow-sm flex items-center justify-between min-w-0">
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-lg bg-[#FAFAF8] border border-[#E5E5E2] flex items-center justify-center shrink-0 text-[#111318]">
                  <Rocket className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-semibold text-[#111318] block">Deploy to Staging Preview</span>
                  <p className="text-xs text-[#626873] break-words">Creates preview environment and updates PR with verification log.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Step Detail Inspector Panel */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <div className="p-6 rounded-2xl bg-white border border-[#E5E5E2] shadow-[0_4px_20px_rgba(0,0,0,0.04)] text-left">
              <div className="flex items-center justify-between pb-4 border-b border-[#EFEFEA] mb-4">
                <div>
                  <span className="text-[10px] font-mono text-[#8B919B] uppercase tracking-wider block">Active Agent Inspector</span>
                  <h3 className="text-base font-bold text-[#111318]">
                    {activeStep === 'code-agent' ? 'Code Generation Agent' : 'Research & Analysis Agent'}
                  </h3>
                </div>
                <div className="p-2 rounded-lg bg-[#FAFAF8] border border-[#E5E5E2]">
                  <BrandLogo brand={activeStep === 'code-agent' ? 'github' : 'anthropic'} size={20} />
                </div>
              </div>

              <div className="flex flex-col gap-3 text-xs mb-5">
                <div className="p-3 rounded-lg bg-[#FAFAF8] border border-[#E5E5E2] min-w-0">
                  <span className="text-[10px] font-semibold text-[#8B919B] uppercase block mb-1">Assigned Objective</span>
                  <p className="text-[#111318] leading-relaxed break-words">
                    {activeStep === 'code-agent'
                      ? 'Create database migration for profiles, workspaces, and workspace_members with RLS.'
                      : 'Scan repository for existing auth patterns, Supabase schema references, and types.'}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#111318] text-[#F5F7FA] font-mono text-[11px] leading-relaxed overflow-x-auto">
                  <span className="text-[#8B919B] block mb-1">// Execution Output Trace</span>
                  {activeStep === 'code-agent'
                    ? '> [CodeAgent] Wrote supabase/schema.sql with 6 RLS policies\n> [CodeAgent] Exported Database type in src/types/database.ts\n> [CodeAgent] Compilation: 0 errors'
                    : '> [ResearchAgent] Found 3 dependent components in src/context\n> [ResearchAgent] Verified RLS compatibility with auth.uid()\n> [ResearchAgent] Ready for code synthesis'}
                </div>
              </div>

              <div className="pt-3 border-t border-[#EFEFEA] flex items-center justify-between text-xs text-[#8B919B]">
                <span>Status: In progress</span>
                <span className="font-mono">Time: 1.4s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
