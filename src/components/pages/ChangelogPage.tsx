import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../public/PageHeader';
import { Button } from '../ui/Button';
import { History } from 'lucide-react';

interface MilestoneItem {
  id: string;
  version: string;
  date: string;
  title: string;
  status: 'COMPLETED' | 'NEXT' | 'PLANNED';
  description: string;
  highlights: string[];
}

const MILESTONES: MilestoneItem[] = [
  {
    id: 'phase-next-agent-runtime',
    version: 'Phase 4',
    date: 'Up Next',
    title: 'Autonomous Agent Runtime Engine',
    status: 'NEXT',
    description: 'Execution layer for specialized agents with bounded tool execution, prompt memory schemas, and structured JSON outputs.',
    highlights: [
      'Modular agent executor supporting multiple LLM backends (Anthropic, Gemini, OpenAI)',
      'Deterministic tool invocation pipeline with schema validation',
      'Step-by-step latency tracking and token consumption metrics',
      'Scoped workspace memory and context injection'
    ]
  },
  {
    id: 'phase-3-github-connectors',
    version: 'Phase 3',
    date: 'September 2026',
    title: 'Connector Architecture & Live GitHub Integration',
    status: 'COMPLETED',
    description: 'Built a reusable connector framework with AES-256 GCM token encryption and the first live integration with GitHub for repository inspection.',
    highlights: [
      'Multi-tenant connector_connections table with Row Level Security (RLS)',
      'Standardized connector registry for 14 developer tools and data services',
      'Real GitHub OAuth 2.0 flow with CSRF cryptographic state validation',
      'Live repository explorer with privacy filters and metadata extraction'
    ]
  },
  {
    id: 'phase-2-auth-database',
    version: 'Phase 2',
    date: 'September 2026',
    title: 'Authentication & Database Foundation',
    status: 'COMPLETED',
    description: 'Integrated Supabase PostgreSQL database and secure authentication, personal workspaces, and automated user onboarding triggers.',
    highlights: [
      'Profiles, workspaces, and workspace_members tables with RLS policies',
      'Real user registration, login, session persistence, and password recovery',
      'Protected application routing guarding all /app routes',
      'Workspace switching infrastructure for multi-tenant organizations'
    ]
  },
  {
    id: 'phase-1c-public-website',
    version: 'Phase 1C',
    date: 'September 2026',
    title: 'Complete Multi-Page Public Website',
    status: 'COMPLETED',
    description: 'Expanded NEXUS from a single landing page into a comprehensive product platform website with pricing, developer guides, security, and ecosystem exploration.',
    highlights: [
      'Dedicated explore, pricing, developers, docs, security, and about pages',
      'Unified responsive navigation with Product dropdown and mobile drawer',
      'Credit metering model and feature comparison matrices',
      'Strict brand asset vector integration for all ecosystem partners'
    ]
  },
  {
    id: 'phase-1-homepage',
    version: 'Phase 1 & 1B',
    date: 'September 2026',
    title: 'Product Identity & Editorial Design V3',
    status: 'COMPLETED',
    description: 'Established the NEXUS visual design language, split-screen editorial hero, system orchestration map, and dark technical execution canvas.',
    highlights: [
      'Editorial off-white canvas (#F6F6F3) with dark typography and violet/blue accents',
      'Physical node map and parallel agent collaboration visualizer',
      'Mission Control execution telemetry monitor preview',
      'Vector brand identity system replacing generic placeholder icons'
    ]
  },
  {
    id: 'phase-5-dag-workflows',
    version: 'Phase 5',
    date: 'Planned',
    title: 'Visual DAG Workflow Execution Engine',
    status: 'PLANNED',
    description: 'Orchestrate multi-agent pipelines with visual node graphs, parallel branches, state checkpointing, and human-in-the-loop approval gates.',
    highlights: [
      'Visual DAG builder with node-level dependency graphs',
      'Human verification gates with Slack and email notification triggers',
      'Automatic state rollback on unrecoverable step errors',
      'Execution replay and historical step debugging'
    ]
  },
  {
    id: 'phase-6-open-source',
    version: 'Phase 6',
    date: 'Planned',
    title: 'Open Source Core & Self-Hosted Runner',
    status: 'PLANNED',
    description: 'Publish the open-source NEXUS Core repository with Docker Compose and Helm charts for self-hosted sovereign agent execution.',
    highlights: [
      'Public GitHub repository with Apache 2.0 / MIT licensing',
      'Local CLI runner for running agent pipelines offline with Ollama',
      'OpenTelemetry trace export and Prometheus metrics exporter',
      'Community connector and plugin contribution standard'
    ]
  }
];

export const ChangelogPage: React.FC = () => {
  return (
    <div className="pb-24 px-4 sm:px-6 lg:px-8 text-left">
      {/* Header */}
      <PageHeader
        badge="Build in Public"
        badgeIcon={<History className="w-3.5 h-3.5" />}
        title="NEXUS is being built"
        highlightedTitle="in public."
        description="Follow our development trajectory from foundational architecture to autonomous multi-agent orchestration."
      />

      <div className="max-w-4xl mx-auto">
        {/* Milestones Stream */}
        <div className="relative pl-6 sm:pl-8 border-l-2 border-[#E5E5E2] space-y-12">
          {MILESTONES.map((milestone) => {
            const isCompleted = milestone.status === 'COMPLETED';
            const isNext = milestone.status === 'NEXT';

            return (
              <div key={milestone.id} className="relative group">
                {/* Timeline Dot Indicator */}
                <div
                  className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                    isCompleted
                      ? 'border-emerald-600'
                      : isNext
                      ? 'border-[#6D4AFF] ring-4 ring-[#6D4AFF]/10'
                      : 'border-[#8B919B]'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isCompleted ? 'bg-emerald-600' : isNext ? 'bg-[#6D4AFF] animate-pulse' : 'bg-[#8B919B]'
                    }`}
                  />
                </div>

                {/* Milestone Content Card */}
                <div className="p-6 sm:p-7 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm hover:border-[#D4D4CE] transition-all">
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono font-bold text-[#111318]">
                        {milestone.version}
                      </span>
                      <span className="text-xs text-[#8B919B]">·</span>
                      <span className="text-xs text-[#626873] font-medium">
                        {milestone.date}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold self-start sm:self-auto ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isNext
                          ? 'bg-purple-50 text-[#6D4AFF] border border-purple-200'
                          : 'bg-[#FAFAF8] text-[#8B919B] border border-[#EFEFEA]'
                      }`}
                    >
                      {milestone.status === 'COMPLETED'
                        ? 'Completed'
                        : milestone.status === 'NEXT'
                        ? 'Next Up'
                        : 'Planned'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#111318] mb-2">
                    {milestone.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#626873] leading-relaxed mb-4">
                    {milestone.description}
                  </p>

                  {/* Highlights Bullet points */}
                  <div className="space-y-1.5 pt-4 border-t border-[#EFEFEA]">
                    <div className="text-[10px] uppercase tracking-wider text-[#8B919B] font-mono font-semibold mb-2">
                      Key Highlights:
                    </div>
                    {milestone.highlights.map((item) => (
                      <div key={item} className="flex items-start gap-2 text-xs text-[#111318]">
                        <span className="text-[#6D4AFF] font-bold mt-0.5">•</span>
                        <span className="leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Callout */}
        <div className="mt-16 p-8 rounded-2xl bg-white border border-[#E5E5E2] text-center shadow-sm">
          <h4 className="text-base font-bold text-[#111318] mb-1">
            Have a feature suggestion or connector request?
          </h4>
          <p className="text-xs text-[#626873] max-w-md mx-auto mb-5 leading-relaxed">
            We are designing the platform with an open architecture to accommodate the tools engineers use every day.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/explore" className="w-full sm:w-auto">
              <Button variant="secondary" size="sm" className="w-full sm:w-auto justify-center">
                Explore Ecosystem
              </Button>
            </Link>
            <Link to="/signup" className="w-full sm:w-auto">
              <Button size="sm" withArrow className="w-full sm:w-auto justify-center">
                Join Developer Preview
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
