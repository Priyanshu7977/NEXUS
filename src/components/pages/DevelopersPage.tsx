import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../public/PageHeader';
import { Button } from '../ui/Button';
import { 
  Code, 
  Terminal, 
  Cable, 
  Workflow, 
  Webhook, 
  Cpu, 
  Copy, 
  Check, 
  ArrowRight
} from 'lucide-react';

const CODE_EXAMPLES = {
  ts: `// NEXUS TypeScript SDK (Conceptual API)
import { NexusClient } from '@nexus/sdk';

const nexus = new NexusClient({
  apiKey: process.env.NEXUS_API_KEY
});

// 1. Define a specialized agent with scoped permissions
const codeReviewAgent = await nexus.agents.create({
  name: 'PR Sentinel',
  model: 'anthropic/claude-3-7-sonnet',
  systemPrompt: 'You are a staff engineer analyzing AST diffs and security lints.',
  tools: [
    nexus.tools.github.readRepository(),
    nexus.tools.github.inspectCommits()
  ],
  permissions: {
    github: {
      repositories: ['nexus-core/runtime'],
      allowWrite: false, // Explicit read-only guard
      requireHumanApproval: ['create_pull_request']
    }
  }
});

// 2. Dispatch a workflow pipeline triggered on webhook
const execution = await nexus.workflows.dispatch({
  pipelineId: 'wf_pr_verification_dag',
  inputs: {
    repository: 'nexus-core/runtime',
    pullRequestId: 142
  }
});

console.log(\`Execution started: \${execution.id}\`);`,

  python: `# NEXUS Python SDK (Conceptual API)
from nexus import NexusClient, PermissionGuard

nexus = NexusClient(api_key="your_nexus_api_key")

# 1. Define a specialized agent with scoped tools
reviewer = nexus.agents.create(
    name="Security Sentinel",
    model="gemini-2.5-flash",
    tools=[
        nexus.tools.github.read_files(),
        nexus.tools.database.query_readonly()
    ],
    permissions=PermissionGuard(
        read_only=True,
        require_approval=["post_comment", "merge_pr"]
    )
)

# 2. Execute workflow synchronously or stream telemetry
for step in reviewer.stream_run(context={"pr_id": 142}):
    print(f"[{step.timestamp}] {step.agent}: {step.status} ({step.latency_ms}ms)")`,

  curl: `# NEXUS REST API (Conceptual)
curl -X POST https://api.nexus.ai/v1/workflows/dispatch \\
  -H "Authorization: Bearer nx_live_xxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "pipeline": "code-review-pipeline",
    "inputs": {
      "repository": "owner/repo",
      "commit": "a3f890b"
    },
    "verification_gates": {
      "require_approval": true
    }
  }'`
};

export const DevelopersPage: React.FC = () => {
  const [activeCodeTab, setActiveCodeTab] = useState<'ts' | 'python' | 'curl'>('ts');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(CODE_EXAMPLES[activeCodeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const devPillars = [
    {
      title: 'Agent SDK',
      badge: 'COMING SOON',
      description: 'Define specialized agent roles, scoped system prompts, memory layers, and permitted tool calling capabilities.',
      icon: Code,
      color: 'text-[#6D4AFF]',
      bg: 'bg-purple-50 border-purple-100'
    },
    {
      title: 'Connector SDK',
      badge: 'COMING SOON',
      description: 'Write custom connectors for internal company APIs, proprietary vector databases, and custom SaaS tools.',
      icon: Cable,
      color: 'text-[#3B82F6]',
      bg: 'bg-blue-50 border-blue-100'
    },
    {
      title: 'Workflow Engine API',
      badge: 'COMING SOON',
      description: 'Trigger, pause, resume, and inspect DAG execution state programmatically from your existing backend services.',
      icon: Workflow,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-100'
    },
    {
      title: 'Webhooks & Events',
      badge: 'COMING SOON',
      description: 'Dispatch agent pipelines automatically when GitHub webhooks, database change streams, or Slack messages occur.',
      icon: Webhook,
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-100'
    },
    {
      title: 'Open Source Core',
      badge: 'ROADMAP',
      description: 'Inspect the agent orchestration protocol, build custom runner plugins, and self-host the runtime.',
      icon: Cpu,
      color: 'text-[#111318]',
      bg: 'bg-neutral-100 border-neutral-200',
      link: '/open-source'
    }
  ];

  return (
    <div className="pb-24 px-4 sm:px-6 lg:px-8 text-left">
      {/* Header */}
      <PageHeader
        badge="NEXUS Developers"
        badgeIcon={<Terminal className="w-3.5 h-3.5" />}
        title="Build on"
        highlightedTitle="NEXUS."
        description="Create specialized agents, connect proprietary tools, and orchestrate intelligent multi-agent pipelines with an open platform designed for developers."
      />

      <div className="max-w-6xl mx-auto">
        {/* Code Preview Hero Section */}
        <div className="mb-20">
          <div className="rounded-2xl bg-[#111318] border border-[#252A34] text-white overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.12)]">
            {/* Terminal Header */}
            <div className="px-5 py-3.5 border-b border-[#252A34] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#15171C]">
              {/* Left: Window Dots & Tabs */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>

                <div className="flex items-center gap-1 bg-[#111318] p-1 rounded-lg border border-[#252A34]">
                  <button
                    type="button"
                    onClick={() => setActiveCodeTab('ts')}
                    className={`px-3 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                      activeCodeTab === 'ts' ? 'bg-[#252A34] text-white font-semibold' : 'text-[#8B919B] hover:text-white'
                    }`}
                  >
                    agent.ts
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCodeTab('python')}
                    className={`px-3 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                      activeCodeTab === 'python' ? 'bg-[#252A34] text-white font-semibold' : 'text-[#8B919B] hover:text-white'
                    }`}
                  >
                    agent.py
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCodeTab('curl')}
                    className={`px-3 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                      activeCodeTab === 'curl' ? 'bg-[#252A34] text-white font-semibold' : 'text-[#8B919B] hover:text-white'
                    }`}
                  >
                    cURL
                  </button>
                </div>
              </div>

              {/* Right: Badge & Copy Button */}
              <div className="flex items-center gap-3 self-end sm:self-auto">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#252A34] text-[#8B919B] border border-white/10 uppercase tracking-wider">
                  CONCEPTUAL SDK · COMING SOON
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-2.5 py-1 rounded-lg text-xs text-[#8B919B] hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-sans text-[11px]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="font-sans text-[11px]">Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Code Body */}
            <div className="p-6 sm:p-8 font-mono text-xs sm:text-sm text-[#F5F7FA] overflow-x-auto leading-relaxed bg-[#111318]">
              <pre>
                <code>{CODE_EXAMPLES[activeCodeTab]}</code>
              </pre>
            </div>

            {/* Footer Strip */}
            <div className="px-6 py-3 bg-[#15171C] border-t border-[#252A34] flex items-center justify-between text-[11px] text-[#8B919B] font-mono">
              <span>Typed schemas · Permission guards · Deterministic execution</span>
              <span className="hidden sm:inline">SDK Preview v0.1-draft</span>
            </div>
          </div>
        </div>

        {/* Developer Pillars Grid */}
        <div className="mb-20">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-[#111318] mb-2">
              Extensible developer primitives
            </h3>
            <p className="text-xs sm:text-sm text-[#626873]">
              Modular layers designed for security, observability, and deterministic multi-agent collaboration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {devPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="p-6 rounded-2xl bg-white border border-[#E5E5E2] hover:border-[#D4D4CE] hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-10 h-10 rounded-xl ${pillar.bg} ${pillar.color} border flex items-center justify-center`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAFAF8] text-[#8B919B] border border-[#EFEFEA]">
                        {pillar.badge}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-[#111318] mb-1.5">
                      {pillar.title}
                    </h4>

                    <p className="text-xs text-[#626873] leading-relaxed mb-6">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#EFEFEA] flex items-center justify-between text-xs text-[#8B919B]">
                    <span>Architecture Layer</span>
                    {pillar.link ? (
                      <Link
                        to={pillar.link}
                        className="text-xs font-semibold text-[#6D4AFF] hover:underline flex items-center gap-1"
                      >
                        <span>Learn more</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    ) : (
                      <span className="text-xs text-[#8B919B]">In Design</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Documentation & Exploration Strip */}
        <div className="p-8 sm:p-10 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] text-[10px] font-mono font-semibold uppercase tracking-wider mb-2">
              DOCUMENTATION PREVIEW
            </div>
            <h3 className="text-xl font-bold text-[#111318] mb-1">
              Read the platform architectural docs.
            </h3>
            <p className="text-xs sm:text-sm text-[#626873] max-w-xl leading-relaxed">
              Explore concepts covering agent memory models, DAG execution topologies, and connector OAuth protocols.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Link to="/docs">
              <Button size="md" withArrow>
                Open Documentation
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
