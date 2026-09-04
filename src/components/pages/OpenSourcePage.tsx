import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../public/PageHeader';
import { Button } from '../ui/Button';
import { 
  Cpu, 
  Cloud, 
  GitFork, 
  Check, 
  Code2 
} from 'lucide-react';
import { BrandLogo } from '../brand/BrandLogo';

export const OpenSourcePage: React.FC = () => {
  return (
    <div className="pb-24 px-4 sm:px-6 lg:px-8 text-left">
      {/* Header */}
      <PageHeader
        badge="NEXUS Open Source"
        badgeIcon={<GitFork className="w-3.5 h-3.5" />}
        title="Open by"
        highlightedTitle="design."
        description="The NEXUS core architecture is designed to be open, extensible, and self-hostable. Build on a transparent foundation you fully control."
      />

      <div className="max-w-6xl mx-auto">
        {/* Core vs Cloud Visual Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          {/* NEXUS CORE */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6D4AFF] border border-purple-100 flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#FAFAF8] border border-[#E5E5E2] text-[10px] font-mono text-[#626873] uppercase tracking-wider font-semibold">
                  SELF-HOSTABLE CORE
                </span>
              </div>

              <h3 className="text-xl font-bold text-[#111318] mb-1">
                NEXUS Core
              </h3>
              <p className="text-xs text-[#626873] leading-relaxed mb-6">
                The open-source agent runtime, DAG orchestrator, and connector interfaces. Free to inspect, modify, and host on your own infrastructure.
              </p>

              <div className="space-y-3 pt-6 border-t border-[#EFEFEA] mb-8">
                <div className="text-[10px] uppercase tracking-wider text-[#8B919B] font-mono font-semibold">
                  Core Attributes:
                </div>
                {[
                  '100% open-source runtime engine',
                  'Self-hostable via Docker or Kubernetes',
                  'Local-first tool execution and test sandboxes',
                  'Pluggable connector interface for custom APIs',
                  'Extensible LLM adapters (Ollama, vLLM, API providers)',
                  'Zero telemetry lock-in or proprietary protocols'
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-xs text-[#111318]">
                    <div className="w-4 h-4 rounded-full bg-purple-50 text-[#6D4AFF] flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BrandLogo brand="github" size={18} />
                <span className="text-xs font-semibold text-[#111318]">GitHub Repository</span>
              </div>
              <span className="text-[11px] font-mono text-[#8B919B]">Coming Soon</span>
            </div>
          </div>

          {/* NEXUS CLOUD */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#3B82F6] border border-blue-100 flex items-center justify-center">
                  <Cloud className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[10px] font-mono text-blue-700 uppercase tracking-wider font-semibold">
                  MANAGED PLATFORM
                </span>
              </div>

              <h3 className="text-xl font-bold text-[#111318] mb-1">
                NEXUS Cloud
              </h3>
              <p className="text-xs text-[#626873] leading-relaxed mb-6">
                Fully managed orchestration infrastructure with automated OAuth key handling, multi-user workspaces, high-throughput queues, and live observability.
              </p>

              <div className="space-y-3 pt-6 border-t border-[#EFEFEA] mb-8">
                <div className="text-[10px] uppercase tracking-wider text-[#8B919B] font-mono font-semibold">
                  Platform Features:
                </div>
                {[
                  'Zero infrastructure setup or maintenance',
                  'Managed OAuth & AES-256 token encryption',
                  'High-availability distributed DAG execution queues',
                  'Multi-user team workspaces with audit logs',
                  'Real-time execution telemetry and trace history',
                  'Instant webhooks & trigger ingress endpoints'
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-xs text-[#111318]">
                    <div className="w-4 h-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link to="/signup" className="w-full">
              <Button size="md" className="w-full justify-center" withArrow>
                Start on NEXUS Cloud
              </Button>
            </Link>
          </div>
        </div>

        {/* Extensibility & Self-Hosting Highlights */}
        <div className="p-8 sm:p-10 rounded-2xl bg-[#111318] text-white border border-[#252A34] mb-20 shadow-sm">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#6D4AFF]/20 text-[#6D4AFF] text-[10px] font-mono font-semibold uppercase tracking-wider mb-3">
              <Code2 className="w-3 h-3 text-[#6D4AFF]" />
              EXTENSIBILITY FIRST
            </div>
            <h3 className="text-2xl font-bold mb-2">
              Never locked into a single AI provider or runner.
            </h3>
            <p className="text-xs sm:text-sm text-[#9BA3AF] leading-relaxed mb-8">
              We believe the infrastructure connecting AI agents must remain transparent and modular. You can write custom tool drivers in TypeScript or Python, run local LLMs with Ollama, or connect private enterprise APIs behind your own VPC.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="p-4 rounded-xl bg-[#15171C] border border-[#252A34]">
                <h4 className="text-sm font-bold text-white mb-1">Custom Runners</h4>
                <p className="text-xs text-[#9BA3AF] leading-relaxed">
                  Execute agents in local Docker containers, AWS ECS tasks, or WebAssembly micro-runtimes.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#15171C] border border-[#252A34]">
                <h4 className="text-sm font-bold text-white mb-1">Model Agnostic</h4>
                <p className="text-xs text-[#9BA3AF] leading-relaxed">
                  Switch between Claude, GPT-4o, Gemini, or self-hosted models per agent node in the workflow.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#15171C] border border-[#252A34]">
                <h4 className="text-sm font-bold text-white mb-1">Open Protocol</h4>
                <p className="text-xs text-[#9BA3AF] leading-relaxed">
                  Export workflow topologies and trace logs in standard OpenTelemetry and JSON-DAG formats.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center max-w-xl mx-auto">
          <h3 className="text-xl font-bold text-[#111318] mb-2">
            Join the developer ecosystem
          </h3>
          <p className="text-xs text-[#626873] mb-6">
            Get early access to our architecture discussions and developer preview builds.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/developers">
              <Button variant="secondary" size="md">
                Developer Overview
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="md" withArrow>
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
