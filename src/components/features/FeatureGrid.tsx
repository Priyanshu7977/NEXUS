import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Cable, Network, Eye, CheckCircle2, ChevronRight } from 'lucide-react';
import { BrandLogo } from '../brand/BrandLogo';

export const FeatureGrid: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const pillars = [
    {
      id: 'connect',
      title: 'Connect',
      subtitle: 'Universal integration layer',
      description: 'Integrate external models, databases, and developer services into unified agent context.',
      icon: Cable,
      accent: '#6D4AFF',
      badges: ['Standardized protocols', 'Credential isolation', 'Tool definitions'],
      renderVisual: () => (
        <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] flex items-center justify-around gap-2">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-[#E5E5E2] shadow-sm">
            <BrandLogo brand="github" size={16} />
            <span className="text-xs font-semibold text-[#111318]">GitHub</span>
          </div>
          <div className="h-[1px] w-6 bg-[#E5E5E2]" />
          <div className="p-2 rounded-lg bg-[#111318] text-white text-xs font-semibold shadow-sm">
            NEXUS Bus
          </div>
          <div className="h-[1px] w-6 bg-[#E5E5E2]" />
          <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-[#E5E5E2] shadow-sm">
            <BrandLogo brand="supabase" size={16} />
            <span className="text-xs font-semibold text-[#111318]">Supabase</span>
          </div>
        </div>
      ),
    },
    {
      id: 'orchestrate',
      title: 'Orchestrate',
      subtitle: 'Dynamic workflow pipelines',
      description: 'Combine specialized agents into sequential or parallel workflows with state preservation and retry policies.',
      icon: Network,
      accent: '#3B82F6',
      badges: ['Parallel execution', 'Conditional routing', 'Approval gates'],
      renderVisual: () => (
        <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#111318]">Pipeline: Code Review & Test</span>
            <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">IN PROGRESS</span>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-1">
            <div className="p-2 rounded bg-white border border-[#E5E5E2] text-[11px] text-center font-medium text-[#111318]">
              Planner
            </div>
            <div className="p-2 rounded bg-blue-50 border border-blue-200 text-[11px] text-center font-semibold text-blue-700">
              Code Agent
            </div>
            <div className="p-2 rounded bg-white border border-[#E5E5E2] text-[11px] text-center font-medium text-[#8B919B]">
              Verify Gate
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'observe',
      title: 'Observe',
      subtitle: 'Complete execution visibility',
      description: 'Audit every agent action, tool invocation, and decision path with real-time trace telemetry.',
      icon: Eye,
      accent: '#10B981',
      badges: ['Trace timelines', 'Prompt & tool logs', 'Execution replay'],
      renderVisual: () => (
        <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] flex flex-col gap-1.5 text-xs font-mono">
          <div className="flex items-center justify-between text-[#626873] border-b border-[#E5E5E2] pb-1.5">
            <span>STEP 03 · TEST AGENT</span>
            <span className="text-emerald-600">PASSED · 412ms</span>
          </div>
          <div className="text-[11px] text-[#111318] pt-1">
            &gt; Ran 14 unit test suites: 14 passed, 0 failed
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="features" className="relative py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-[#F6F6F3]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-start">
          {/* Left Column: Sticky Narrative */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 text-left">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#111318] leading-[1.1] mb-4 sm:mb-6">
              One system.<br />
              Every agent.
            </h2>
            <p className="text-base sm:text-lg text-[#626873] leading-relaxed mb-6 font-normal">
              Stop managing isolated AI tools. NEXUS provides the coordination layer for multi-agent systems — connecting APIs, managing dependencies, and executing deterministic workflows.
            </p>
            <div className="text-xs text-[#8B919B]">
              Universal standard for developer-driven AI orchestration.
            </div>
          </div>

          {/* Right Column: Three Vertically Connected Editorial Cards */}
          <div className="lg:col-span-7 flex flex-col gap-6 relative">
            {/* Connecting Vertical Line */}
            <div className="hidden sm:block absolute left-6 top-8 bottom-8 w-[1px] bg-[#E5E5E2] -z-0" />

            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              const isSelected = activeTab === idx;

              return (
                <div
                  key={pillar.id}
                  onClick={() => setActiveTab(idx)}
                  className={`relative z-10 p-6 sm:p-7 rounded-2xl border transition-all duration-200 cursor-pointer text-left ${
                    isSelected
                      ? 'bg-white border-[#D4D4CE] shadow-[0_8px_24px_rgba(0,0,0,0.05)]'
                      : 'bg-white/80 border-[#E5E5E2] hover:bg-white hover:border-[#D4D4CE]'
                  }`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white"
                      style={{ backgroundColor: pillar.accent }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-[#111318] tracking-tight">
                          {pillar.title}
                        </h3>
                        <ChevronRight
                          className={`w-4 h-4 text-[#8B919B] transition-transform duration-200 ${
                            isSelected ? 'rotate-90 text-[#111318]' : ''
                          }`}
                        />
                      </div>
                      <p className="text-xs font-medium text-[#626873] mt-0.5">
                        {pillar.subtitle}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-[#626873] leading-relaxed mb-5">
                    {pillar.description}
                  </p>

                  {/* Interactive Visual Preview */}
                  <div className="mb-5">{pillar.renderVisual()}</div>

                  {/* Badge Pills & Direct Action */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[#EFEFEA]">
                    <div className="flex flex-wrap gap-2">
                      {pillar.badges.map((b) => (
                        <span
                          key={b}
                          className="inline-flex items-center gap-1.5 text-xs text-[#626873] bg-[#FAFAF8] px-2.5 py-1 rounded-md border border-[#E5E5E2]"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                          <span>{b}</span>
                        </span>
                      ))}
                    </div>

                    {isSelected && (
                      <Link
                        to={
                          pillar.id === 'connect'
                            ? '/explore?tab=connectors'
                            : pillar.id === 'orchestrate'
                            ? '/explore?tab=workflows'
                            : '/security'
                        }
                        className="text-xs font-semibold inline-flex items-center gap-1 hover:underline shrink-0"
                        style={{ color: pillar.accent }}
                      >
                        {pillar.id === 'connect'
                          ? 'Explore Connectors →'
                          : pillar.id === 'orchestrate'
                          ? 'Explore Workflows →'
                          : 'View Telemetry →'}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
