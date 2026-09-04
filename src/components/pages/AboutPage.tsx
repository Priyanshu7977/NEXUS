import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../public/PageHeader';
import { Button } from '../ui/Button';
import { 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  Activity, 
  Terminal, 
  GitFork 
} from 'lucide-react';

const PRINCIPLES = [
  {
    number: '01',
    title: 'Open & Transparent',
    description: 'The core orchestration engine and connector specifications are open, extensible, and self-hostable. We reject proprietary walled gardens and runtime lock-in.',
    icon: GitFork,
    color: 'text-[#6D4AFF]',
    bg: 'bg-purple-50 border-purple-100'
  },
  {
    number: '02',
    title: 'Composable Primitives',
    description: 'Complex automated workflows should be assembled from modular building blocks: specialized agents, standardized tool drivers, and deterministic DAG pipelines.',
    icon: Layers,
    color: 'text-[#3B82F6]',
    bg: 'bg-blue-50 border-blue-100'
  },
  {
    number: '03',
    title: 'Explicit Permissions',
    description: 'Autonomous systems must have bounded authority. Sensitive write actions require explicit verification and human confirmation before dispatch.',
    icon: ShieldCheck,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-100'
  },
  {
    number: '04',
    title: 'Complete Observability',
    description: 'Black-box execution is unacceptable in production. Every agent prompt turn, tool call parameter, token consumption metric, and latency trace is visible in real time.',
    icon: Activity,
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-100'
  },
  {
    number: '05',
    title: 'Developer-First',
    description: 'Designed from day one for engineers who write code. We provide strong TypeScript types, standardized APIs, and predictable state machines.',
    icon: Terminal,
    color: 'text-[#111318]',
    bg: 'bg-neutral-100 border-neutral-200'
  }
];

export const AboutPage: React.FC = () => {
  return (
    <div className="pb-24 px-4 sm:px-6 lg:px-8 text-left">
      {/* Header */}
      <PageHeader
        badge="About NEXUS"
        badgeIcon={<Sparkles className="w-3.5 h-3.5" />}
        title="Building the infrastructure for agents that"
        highlightedTitle="work together."
        description="AI is moving from single prompts toward systems of autonomous agents that can plan, use tools, and complete multi-step work across real software."
      />

      <div className="max-w-4xl mx-auto">
        {/* Editorial Story Block */}
        <div className="p-8 sm:p-12 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm mb-20">
          <h3 className="text-xl sm:text-2xl font-bold text-[#111318] mb-4">
            Why we are building NEXUS
          </h3>

          <div className="space-y-4 text-xs sm:text-sm text-[#626873] leading-relaxed">
            <p>
              The first wave of AI showed us that models can generate text and code when prompted. But real engineering and digital work does not happen in a chat box. Real work requires inspecting repositories, running test suites, verifying database schemas, drafting pull requests, deploying preview branches, and notifying teammates.
            </p>
            <p>
              When multiple AI agents attempt to solve complex problems together, they quickly run into coordination friction: uncoordinated tool calls, state drift, credential leakage, and lack of deterministic rollback.
            </p>
            <p>
              <strong className="text-[#111318]">NEXUS is being built as the orchestration layer</strong> connecting specialized AI agents to external services, tools, and workflows with strict permission boundaries, live telemetry, and human oversight.
            </p>
          </div>
        </div>

        {/* 5 Core Principles */}
        <div className="mb-20">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-[#111318] mb-2">
              Our guiding principles
            </h3>
            <p className="text-xs sm:text-sm text-[#626873]">
              The core values shaping every architectural decision in NEXUS.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {PRINCIPLES.map((principle) => {
              const Icon = principle.icon;
              return (
                <div
                  key={principle.number}
                  className="p-6 rounded-2xl bg-white border border-[#E5E5E2] hover:border-[#D4D4CE] transition-all shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-xl ${principle.bg} ${principle.color} border flex items-center justify-center`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-mono font-bold text-[#8B919B]">
                        {principle.number}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-[#111318] mb-2">
                      {principle.title}
                    </h4>

                    <p className="text-xs text-[#626873] leading-relaxed">
                      {principle.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA Block */}
        <div className="p-8 sm:p-10 rounded-2xl bg-[#111318] text-white border border-[#252A34] text-center shadow-sm">
          <h3 className="text-xl sm:text-2xl font-bold mb-2">
            Build the next generation of AI agent workflows.
          </h3>
          <p className="text-xs sm:text-sm text-[#9BA3AF] max-w-xl mx-auto mb-6 leading-relaxed">
            Join developers building autonomous, permissioned, and verifiable multi-agent systems on NEXUS.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/signup">
              <Button size="md" withArrow>
                Start Free Today
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
