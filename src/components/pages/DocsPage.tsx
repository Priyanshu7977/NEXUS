import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  ChevronRight, 
  Terminal
} from 'lucide-react';
import { Button } from '../ui/Button';

interface DocSection {
  category: string;
  items: { id: string; title: string; badge?: string }[];
}

const DOC_SECTIONS: DocSection[] = [
  {
    category: 'GETTING STARTED',
    items: [
      { id: 'intro', title: '1. Platform Introduction' },
      { id: 'quickstart', title: '2. Quickstart Guide' },
      { id: 'architecture', title: '3. Architecture Overview' },
    ]
  },
  {
    category: 'CORE RUNTIME',
    items: [
      { id: 'agent-runtime', title: '4. Agent Runtime & Tools' },
      { id: 'workflow-engine', title: '5. Multi-Agent DAG Engine' },
      { id: 'connectors', title: '6. Connector Ecosystem & OAuth' },
    ]
  },
  {
    category: 'INTEROPERABILITY & SECURITY',
    items: [
      { id: 'mcp-a2a', title: '7. MCP & A2A Protocols' },
      { id: 'security-governance', title: '8. Security & Workspace Governance' },
      { id: 'observability', title: '9. Mission Control & Observability' },
    ]
  },
  {
    category: 'DEVELOPER API & SDK',
    items: [
      { id: 'api-reference', title: '10. Public API Reference (/api/v1)' },
      { id: 'sdk-guide', title: '11. TypeScript SDK Guide' },
      { id: 'deployment-best-practices', title: '12. Production Deployment' },
    ]
  }
];

export const DocsPage: React.FC = () => {
  const [activeDocId, setActiveDocId] = useState('intro');
  const [searchFilter, setSearchFilter] = useState('');

  return (
    <div className="pt-20 sm:pt-24 pb-20 px-4 sm:px-6 lg:px-8 text-left max-w-7xl mx-auto min-h-[calc(100vh-4rem)] flex flex-col w-full">
      {/* Top Breadcrumb & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E5E2] mb-8">
        <div className="flex items-center gap-2 text-xs font-mono text-[#8B919B]">
          <Link to="/" className="hover:text-[#111318] transition-colors">NEXUS</Link>
          <span>/</span>
          <span className="text-[#111318] font-semibold">Docs</span>
          <span>/</span>
          <span className="text-[#6D4AFF]">Documentation</span>
        </div>

        <div className="relative max-w-sm w-full">
          <Search className="w-3.5 h-3.5 text-[#8B919B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search all 12 doc chapters..."
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-white border border-[#E5E5E2] focus:border-[#6D4AFF] text-xs text-[#111318] placeholder:text-[#8B919B] outline-none shadow-2xs transition-colors"
          />
        </div>
      </div>

      {/* Mobile Chapter Selector (Visible only on < lg) */}
      <div className="lg:hidden mb-6 p-3 rounded-xl bg-white border border-[#E5E5E2] shadow-2xs">
        <label className="block text-[10px] font-mono uppercase tracking-wider text-[#8B919B] font-semibold mb-1.5">
          Jump to Documentation Chapter:
        </label>
        <select
          value={activeDocId}
          onChange={(e) => setActiveDocId(e.target.value)}
          className="w-full h-10 px-3 rounded-lg bg-[#FAFAF8] border border-[#E5E5E2] text-xs font-semibold text-[#111318] focus:border-[#6D4AFF] outline-none cursor-pointer"
        >
          {DOC_SECTIONS.map((sec) => (
            <optgroup key={sec.category} label={sec.category}>
              {sec.items.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.title}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar (Desktop / Laptop) */}
        <div className="hidden lg:block lg:col-span-1 space-y-6">
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
                            ? 'bg-[#111318] text-white shadow-xs'
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
        <div className="lg:col-span-3 space-y-8 min-w-0">
          {/* CHAPTER 1: INTRO */}
          {activeDocId === 'intro' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[#E5E5E2]">
                <span className="text-xs font-mono text-[#6D4AFF] font-bold">CHAPTER 01</span>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#111318] mt-1 mb-2">Platform Introduction</h1>
                <p className="text-sm text-[#626873] leading-relaxed">
                  NEXUS is an enterprise AI agent orchestration and universal protocol platform designed for high-consequence engineering, security, and operations workflows.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E5E5E2] shadow-2xs space-y-3 text-xs leading-relaxed text-[#626873]">
                <h3 className="text-sm font-bold text-[#111318]">Why NEXUS?</h3>
                <p>
                  Most AI frameworks treat agents as black-box chat bots without determinism, security boundaries, or rollback controls. When deploying agents into production CI/CD pipelines or cloud infrastructure, uncontrolled actions create catastrophic risks.
                </p>
                <p>
                  NEXUS solves this with four foundational principles:
                </p>
                <ul className="list-disc list-inside space-y-1 text-[#111318] font-medium">
                  <li><strong>Deterministic DAG Execution:</strong> Workflows define precise dependencies, checkpoints, and fallbacks.</li>
                  <li><strong>Human Approval Gates:</strong> Destructive operations (git pushes, deployments) pause until explicitly approved.</li>
                  <li><strong>Universal Tool Protocols:</strong> Seamlessly interoperate with Model Context Protocol (MCP) and Agent-to-Agent (A2A).</li>
                  <li><strong>Zero-Second Programmatic Invocation:</strong> External systems trigger the exact same execution engine via typed SDKs and REST APIs.</li>
                </ul>
              </div>
            </div>
          )}

          {/* CHAPTER 2: QUICKSTART */}
          {activeDocId === 'quickstart' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[#E5E5E2]">
                <span className="text-xs font-mono text-[#6D4AFF] font-bold">CHAPTER 02</span>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#111318] mt-1 mb-2">Quickstart Guide</h1>
                <p className="text-sm text-[#626873]">Get up and running with NEXUS in less than 5 minutes.</p>
              </div>

              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-[#E5E5E2] shadow-2xs">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-[#6D4AFF] text-white font-bold text-xs flex items-center justify-center">1</span>
                    <h3 className="text-sm font-bold text-[#111318]">Install the TypeScript SDK</h3>
                  </div>
                  <pre className="p-3 rounded-xl bg-[#111318] text-emerald-400 font-mono text-xs overflow-x-auto">
npm install @nexus/sdk
                  </pre>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#E5E5E2] shadow-2xs">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-[#6D4AFF] text-white font-bold text-xs flex items-center justify-center">2</span>
                    <h3 className="text-sm font-bold text-[#111318]">Generate an API Key</h3>
                  </div>
                  <p className="text-xs text-[#626873] mb-2">
                    Navigate to <Link to="/app/settings" className="text-[#6D4AFF] underline font-semibold">Settings &rarr; API Keys</Link> in your NEXUS workspace, select the required scopes (e.g. <code className="font-mono bg-neutral-100 px-1 py-0.5 rounded">agents:execute</code>), and copy your key.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#E5E5E2] shadow-2xs">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-[#6D4AFF] text-white font-bold text-xs flex items-center justify-center">3</span>
                    <h3 className="text-sm font-bold text-[#111318]">Trigger an Agent Execution</h3>
                  </div>
                  <pre className="p-3 rounded-xl bg-[#111318] text-emerald-400 font-mono text-xs overflow-x-auto">
{`import { NexusClient } from '@nexus/sdk';

const nexus = new NexusClient({ apiKey: process.env.NEXUS_API_KEY! });
const execution = await nexus.agents.execute('agent-code-reviewer', {
  prompt: 'Check src/index.ts for potential memory leaks.'
});
const result = await nexus.executions.waitForCompletion(execution.id);
console.log(result.output);`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* CHAPTER 3: ARCHITECTURE */}
          {activeDocId === 'architecture' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[#E5E5E2]">
                <span className="text-xs font-mono text-[#6D4AFF] font-bold">CHAPTER 03</span>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#111318] mt-1 mb-2">Architecture Overview</h1>
                <p className="text-sm text-[#626873]">Deep dive into the 5 core layers of NEXUS.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-white border border-[#E5E5E2]">
                  <h4 className="font-bold text-[#111318] mb-1">1. Interface Layer</h4>
                  <p className="text-[#626873]">React UI, Public REST Gateway (<code className="font-mono">/api/v1</code>), and typed TypeScript SDK.</p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-[#E5E5E2]">
                  <h4 className="font-bold text-[#111318] mb-1">2. Runtime Orchestration</h4>
                  <p className="text-[#626873]">Workflow DAG Engine with topological sort, cycle detection, and checkpoint state store.</p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-[#E5E5E2]">
                  <h4 className="font-bold text-[#111318] mb-1">3. Protocol & Tool Bus</h4>
                  <p className="text-[#626873]">Unified MCP Bridge, A2A Router, and sandboxed native connector registry.</p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-[#E5E5E2]">
                  <h4 className="font-bold text-[#111318] mb-1">4. Security & Governance</h4>
                  <p className="text-[#626873]">RBAC, token hashing, SSRF guards, rate limiters, and approval checkpoints.</p>
                </div>
              </div>
            </div>
          )}

          {/* CHAPTER 4: AGENT RUNTIME */}
          {activeDocId === 'agent-runtime' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[#E5E5E2]">
                <span className="text-xs font-mono text-[#6D4AFF] font-bold">CHAPTER 04</span>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#111318] mt-1 mb-2">Agent Runtime & Tool Execution</h1>
                <p className="text-sm text-[#626873]">How agents reason, execute tools, and maintain state.</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E5E5E2] shadow-2xs text-xs text-[#626873] space-y-3">
                <p>
                  Each agent execution operates inside a sandboxed session. The agent receives a prompt, inspects its allowed tool registry, generates thoughts and tool call requests, evaluates tool outputs, and repeats until achieving the goal or reaching execution limits.
                </p>
                <div className="p-3 bg-[#FAFAF8] rounded-xl border border-[#E5E5E2] font-mono text-[11px] text-[#111318]">
                  Lifecycle: Ingest Prompt &rarr; LLM Reasoning &rarr; Tool Call &rarr; Approval Check (if destructive) &rarr; Sandbox Output &rarr; Final Synthesized Result.
                </div>
              </div>
            </div>
          )}

          {/* CHAPTER 5: WORKFLOW ENGINE */}
          {activeDocId === 'workflow-engine' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[#E5E5E2]">
                <span className="text-xs font-mono text-[#6D4AFF] font-bold">CHAPTER 05</span>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#111318] mt-1 mb-2">Multi-Agent DAG Engine</h1>
                <p className="text-sm text-[#626873]">Directed Acyclic Graphs for deterministic multi-agent collaboration.</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E5E5E2] shadow-2xs text-xs text-[#626873] space-y-3">
                <p>
                  Workflows organize multiple specialized agents into DAGs. Nodes can run sequentially or in parallel based on edge dependencies. If any node fails or is rejected at a human approval gate, execution safely halts and logs the snapshot.
                </p>
              </div>
            </div>
          )}

          {/* CHAPTER 6: CONNECTORS */}
          {activeDocId === 'connectors' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[#E5E5E2]">
                <span className="text-xs font-mono text-[#6D4AFF] font-bold">CHAPTER 06</span>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#111318] mt-1 mb-2">Connector Ecosystem & OAuth</h1>
                <p className="text-sm text-[#626873]">Securely integrate external SaaS and developer infrastructure.</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E5E5E2] shadow-2xs text-xs text-[#626873] space-y-3">
                <p>
                  Connectors (GitHub, Vercel, Slack, Sentry) authenticate using AES-256 GCM encrypted tokens stored in PostgreSQL. Secrets are injected at runtime into isolated tool runners and never exposed in prompts or logs.
                </p>
              </div>
            </div>
          )}

          {/* CHAPTER 7: MCP & A2A */}
          {activeDocId === 'mcp-a2a' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[#E5E5E2]">
                <span className="text-xs font-mono text-[#6D4AFF] font-bold">CHAPTER 07</span>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#111318] mt-1 mb-2">MCP & A2A Interoperability</h1>
                <p className="text-sm text-[#626873]">Universal protocols for tools and inter-agent communication.</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E5E5E2] shadow-2xs text-xs text-[#626873] space-y-3">
                <p>
                  NEXUS natively bridges external Model Context Protocol (MCP) servers using SSE or stdio transports. Agents can also discover and invoke peer agents across organizations via the Agent-to-Agent (A2A) protocol.
                </p>
              </div>
            </div>
          )}

          {/* CHAPTER 8: SECURITY */}
          {activeDocId === 'security-governance' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[#E5E5E2]">
                <span className="text-xs font-mono text-[#6D4AFF] font-bold">CHAPTER 08</span>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#111318] mt-1 mb-2">Security, Governance & Workspaces</h1>
                <p className="text-sm text-[#626873]">Enterprise grade access controls, rate limiting, and SSRF defenses.</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E5E5E2] shadow-2xs text-xs text-[#626873] space-y-3">
                <p>
                  Workspaces provide strict cryptographic and tenant isolation. Roles (Owner, Admin, Member, Viewer) govern permissions, while API keys enforce scoped access tokens. All outbound webhooks pass strict SSRF assertions.
                </p>
              </div>
            </div>
          )}

          {/* CHAPTER 9: OBSERVABILITY */}
          {activeDocId === 'observability' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[#E5E5E2]">
                <span className="text-xs font-mono text-[#6D4AFF] font-bold">CHAPTER 09</span>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#111318] mt-1 mb-2">Mission Control & Observability</h1>
                <p className="text-sm text-[#626873]">Real-time execution telemetry, node timelines, and audit logs.</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E5E5E2] shadow-2xs text-xs text-[#626873] space-y-3">
                <p>
                  Track active agent runs live in Mission Control. Inspect node transition times, step token counts, and sanitized outputs. Audit logs record every configuration and role change.
                </p>
              </div>
            </div>
          )}

          {/* CHAPTER 10: PUBLIC API */}
          {activeDocId === 'api-reference' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[#E5E5E2]">
                <span className="text-xs font-mono text-[#6D4AFF] font-bold">CHAPTER 10</span>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#111318] mt-1 mb-2">Public API Reference (/api/v1)</h1>
                <p className="text-sm text-[#626873]">Comprehensive endpoint specifications and request/response models.</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E5E5E2] shadow-2xs text-xs space-y-4">
                <p className="text-[#626873]">
                  All endpoints return standard envelopes: <code className="font-mono bg-neutral-100 px-1 py-0.5 rounded">{`{ "data": ..., "request_id": "req_..." }`}</code> on success, or <code className="font-mono bg-neutral-100 px-1 py-0.5 rounded">{`{ "error": { "code": "...", "message": "..." } }`}</code> on failure.
                </p>
                <div className="flex items-center gap-3">
                  <Link to="/developers">
                    <Button size="sm">
                      <Terminal className="w-3.5 h-3.5 mr-1.5" />
                      <span>Launch Interactive API Explorer</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* CHAPTER 11: SDK */}
          {activeDocId === 'sdk-guide' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[#E5E5E2]">
                <span className="text-xs font-mono text-[#6D4AFF] font-bold">CHAPTER 11</span>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#111318] mt-1 mb-2">TypeScript SDK Guide</h1>
                <p className="text-sm text-[#626873]">Best practices for integrating @nexus/sdk into your apps.</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E5E5E2] shadow-2xs text-xs space-y-4">
                <pre className="p-4 rounded-xl bg-[#111318] text-emerald-400 font-mono overflow-x-auto">
{`import { NexusClient, defineTool } from '@nexus/sdk';

const nexus = new NexusClient({ apiKey: 'nxs_live_...' });

// Query agents
const agents = await nexus.agents.list();

// Dispatch workflow
const run = await nexus.workflows.execute('wf-triage', {
  triggerData: { branch: 'main' }
});`}
                </pre>
              </div>
            </div>
          )}

          {/* CHAPTER 12: DEPLOYMENT */}
          {activeDocId === 'deployment-best-practices' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[#E5E5E2]">
                <span className="text-xs font-mono text-[#6D4AFF] font-bold">CHAPTER 12</span>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#111318] mt-1 mb-2">Production Deployment & Best Practices</h1>
                <p className="text-sm text-[#626873]">Operational checklists for deploying NEXUS in enterprise environments.</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E5E5E2] shadow-2xs text-xs text-[#626873] space-y-3">
                <ul className="list-disc list-inside space-y-2 text-[#111318]">
                  <li><strong>Never commit API keys:</strong> Inject <code className="font-mono text-[#6D4AFF]">NEXUS_API_KEY</code> through environment variables or secret vaults.</li>
                  <li><strong>Always verify webhook signatures:</strong> Use <code className="font-mono text-[#6D4AFF]">verifyNexusWebhook</code> with the raw body to prevent tampering.</li>
                  <li><strong>Supply Idempotency Keys:</strong> Always provide <code className="font-mono text-[#6D4AFF]">Idempotency-Key</code> for automated CI/CD dispatches to prevent duplicate runs.</li>
                  <li><strong>Configure Approval Gates:</strong> Ensure sensitive production workflows require human verification before destructive steps.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
