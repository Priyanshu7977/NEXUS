import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  ChevronRight, 
  Bot, 
  Cable, 
  Workflow, 
  Terminal, 
  ShieldCheck, 
  Construction, 
  ExternalLink 
} from 'lucide-react';

interface DocSection {
  category: string;
  items: { id: string; title: string; badge?: string }[];
}

const DOC_SECTIONS: DocSection[] = [
  {
    category: 'GETTING STARTED',
    items: [
      { id: 'intro', title: 'Introduction' },
      { id: 'quickstart', title: 'Quickstart Guide' },
      { id: 'concepts', title: 'Core Concepts' },
    ]
  },
  {
    category: 'AGENTS',
    items: [
      { id: 'creating-agents', title: 'Creating an Agent' },
      { id: 'agent-tools', title: 'Tool Definitions' },
      { id: 'agent-memory', title: 'Context & Memory' },
      { id: 'agent-permissions', title: 'Permission Guards' },
    ]
  },
  {
    category: 'CONNECTORS',
    items: [
      { id: 'connectors-overview', title: 'Connectors Overview' },
      { id: 'github-connector', title: 'GitHub Integration', badge: 'LIVE' },
      { id: 'oauth-protocol', title: 'OAuth 2.0 Flow' },
      { id: 'api-keys', title: 'API Key Security' },
      { id: 'connector-sdk', title: 'Connector SDK' },
    ]
  },
  {
    category: 'WORKFLOWS',
    items: [
      { id: 'workflow-builder', title: 'Workflow Builder' },
      { id: 'dag-triggers', title: 'Event Triggers' },
      { id: 'actions-gates', title: 'Actions & Verification' },
      { id: 'conditions', title: 'Branching Conditions' },
    ]
  },
  {
    category: 'DEVELOPERS',
    items: [
      { id: 'api-reference', title: 'API Reference' },
      { id: 'sdk-reference', title: 'TypeScript / Python SDK' },
      { id: 'webhooks', title: 'Webhooks' },
      { id: 'examples', title: 'Example Architectures' },
    ]
  }
];

export const DocsPage: React.FC = () => {
  const [activeDocId, setActiveDocId] = useState('intro');
  const [searchFilter, setSearchFilter] = useState('');

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 text-left max-w-7xl mx-auto">
      {/* Top Breadcrumb & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E5E2] mb-8">
        <div className="flex items-center gap-2 text-xs font-mono text-[#8B919B]">
          <Link to="/" className="hover:text-[#111318] transition-colors">NEXUS</Link>
          <span>/</span>
          <span className="text-[#111318] font-semibold">Docs</span>
          <span>/</span>
          <span className="text-[#6D4AFF]">Overview</span>
        </div>

        <div className="relative max-w-sm w-full">
          <Search className="w-3.5 h-3.5 text-[#8B919B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search documentation topics..."
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-white border border-[#E5E5E2] focus:border-[#6D4AFF] text-xs text-[#111318] placeholder:text-[#8B919B] outline-none shadow-sm transition-colors"
          />
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {DOC_SECTIONS.map((section) => {
            const filteredItems = section.items.filter((i) =>
              i.title.toLowerCase().includes(searchFilter.toLowerCase())
            );

            if (filteredItems.length === 0) return null;

            return (
              <div key={section.category}>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#8B919B] font-semibold mb-2 px-2">
                  {section.category}
                </div>
                <div className="space-y-0.5">
                  {filteredItems.map((item) => {
                    const isSelected = activeDocId === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveDocId(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                          isSelected
                            ? 'bg-[#111318] text-white shadow-sm'
                            : 'text-[#626873] hover:text-[#111318] hover:bg-white'
                        }`}
                      >
                        <span className="truncate">{item.title}</span>
                        {item.badge ? (
                          <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                            isSelected ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {item.badge}
                          </span>
                        ) : (
                          isSelected && <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Content Canvas */}
        <div className="lg:col-span-3 space-y-8">
          {/* Main Title & Tagline */}
          <div className="pb-6 border-b border-[#E5E5E2]">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#E5E5E2] text-xs font-mono text-[#626873] shadow-sm mb-3">
              <BookOpen className="w-3.5 h-3.5 text-[#6D4AFF]" />
              <span>Developer Reference & Guides</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#111318] tracking-tight mb-2">
              NEXUS Documentation
            </h1>
            <p className="text-sm sm:text-base text-[#626873] leading-relaxed">
              Everything you need to configure agent pipelines, write custom tool connectors, and orchestrate verifiable workflows.
            </p>
          </div>

          {/* Under Construction Notice Card */}
          <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
              <Construction className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900 mb-1">
                Documentation is actively being authored
              </h3>
              <p className="text-xs text-amber-800/90 leading-relaxed mb-3">
                NEXUS is currently in active development. As core runtime modules and developer SDKs are completed, comprehensive API references, guides, and interactive code samples will be published here.
              </p>
              <div className="flex items-center gap-3">
                <Link
                  to="/changelog"
                  className="text-xs font-semibold text-amber-900 underline hover:text-amber-950 flex items-center gap-1"
                >
                  <span>View Development Changelog</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Architectural Overview Topic Cards */}
          <div>
            <h3 className="text-lg font-bold text-[#111318] mb-4">
              Core Architectural Pillars
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-[#E5E5E2] hover:border-[#D4D4CE] transition-all shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#6D4AFF] border border-purple-100 flex items-center justify-center mb-3">
                  <Bot className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-[#111318] mb-1">
                  1. Specialized Agent Primitives
                </h4>
                <p className="text-xs text-[#626873] leading-relaxed">
                  Agents in NEXUS are treated as scoped execution units with bounded system instructions, dedicated context memory, and explicit tool allowances.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E5E5E2] hover:border-[#D4D4CE] transition-all shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#3B82F6] border border-blue-100 flex items-center justify-center mb-3">
                  <Cable className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-[#111318] mb-1">
                  2. Unified Connector Architecture
                </h4>
                <p className="text-xs text-[#626873] leading-relaxed">
                  Third-party services plug in via a standardized interface. OAuth tokens are encrypted at rest with AES-256 GCM and never exposed to agent system prompts.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E5E5E2] hover:border-[#D4D4CE] transition-all shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-3">
                  <Workflow className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-[#111318] mb-1">
                  3. Deterministic DAG Execution
                </h4>
                <p className="text-xs text-[#626873] leading-relaxed">
                  Workflows organize multi-agent collaboration as Directed Acyclic Graphs with parallel branches, human approval gates, and state rollback checkpoints.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E5E5E2] hover:border-[#D4D4CE] transition-all shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-neutral-100 text-[#111318] border border-neutral-200 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-[#111318] mb-1">
                  4. Explicit Permission Boundaries
                </h4>
                <p className="text-xs text-[#626873] leading-relaxed">
                  Granular action matrices prevent unintended side effects. Read operations can run autonomously while destructive operations strictly require human approval.
                </p>
              </div>
            </div>
          </div>

          {/* Quickstart Conceptual Walkthrough */}
          <div className="p-6 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm">
            <h3 className="text-base font-bold text-[#111318] mb-3 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#6D4AFF]" />
              <span>Quickstart Overview (In Design)</span>
            </h3>

            <div className="space-y-4 text-xs text-[#626873] leading-relaxed">
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#FAFAF8] border border-[#E5E5E2] text-[#111318] font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <strong className="text-[#111318] block mb-0.5">Connect your tools</strong>
                  Link your development services (e.g. GitHub repositories) in your workspace settings.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#FAFAF8] border border-[#E5E5E2] text-[#111318] font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <strong className="text-[#111318] block mb-0.5">Define agent roles</strong>
                  Configure specialized agents with scoped instructions, model parameters, and allowed tool capabilities.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#FAFAF8] border border-[#E5E5E2] text-[#111318] font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <strong className="text-[#111318] block mb-0.5">Assemble & execute DAG</strong>
                  Compose a workflow pipeline, attach event triggers, and monitor real-time execution telemetry.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
