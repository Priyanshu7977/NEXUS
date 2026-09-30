import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  ChevronRight, 
  Terminal,
  Copy,
  Check
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
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const handleCopyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  return (
    <div className="pt-20 sm:pt-24 pb-20 px-4 sm:px-6 lg:px-8 text-left max-w-7xl mx-auto min-h-[calc(100vh-4rem)] flex flex-col w-full">
      {/* Top Breadcrumb & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E5E2] mb-8">
        <div className="flex items-center gap-2 text-xs font-mono text-[#8B919B]">
          <Link to="/" className="hover:text-[#111318] transition-colors">NEXUS</Link>
          <span>/</span>
          <span className="text-[#111318] font-semibold">Docs</span>
          <span>/</span>
          <span className="text-[#6D4AFF]">Documentation Hub</span>
        </div>

        <div className="relative max-w-sm w-full">
          <Search className="w-3.5 h-3.5 text-[#8B919B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search all 12 chapters, APIs, schemas..."
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-white border border-[#E5E5E2] focus:border-[#6D4AFF] text-xs text-[#111318] placeholder:text-[#8B919B] outline-none shadow-2xs transition-colors"
          />
        </div>
      </div>

      {/* Mobile Chapter Selector */}
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
        {/* Left Sidebar */}
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

          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FAFAF8] to-purple-50/40 border border-[#E5E5E2] space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#111318]">
              <Terminal className="w-4 h-4 text-[#6D4AFF]" />
              <span>Interactive Console</span>
            </div>
            <p className="text-[11px] text-[#626873] leading-relaxed">
              Test live API calls, execute test runs, and inspect real-time responses in the developer sandbox.
            </p>
            <Link to="/developers" className="inline-block pt-1">
              <Button size="sm" variant="secondary" className="text-xs h-8">
                Open API Explorer →
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-3 space-y-8 min-w-0">
          {/* CHAPTER 1: INTRO */}
          {activeDocId === 'intro' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[#E5E5E2]">
                <span className="text-xs font-mono text-[#6D4AFF] font-bold">CHAPTER 01</span>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#111318] mt-1 mb-2">Platform Introduction</h1>
                <p className="text-sm text-[#626873] leading-relaxed">
                  NEXUS is an enterprise-grade multi-agent orchestration and universal execution platform designed for high-consequence engineering, security, and cloud operations.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-[#E5E5E2] shadow-2xs space-y-4 text-xs leading-relaxed text-[#626873]">
                <h3 className="text-base font-bold text-[#111318]">The Multi-AI Orchestration Paradigm</h3>
                <p>
                  Modern software development requires specialized cognitive models. Single-LLM setups suffer from hallucinations, lack of verification boundaries, and context bloat. NEXUS connects best-of-breed frontier models into deterministic, collaborative teams:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] space-y-1">
                    <span className="font-bold text-[#111318] block">Claude 3.7 Sonnet (Anthropic)</span>
                    <span className="text-[#8B919B] text-[11px]">Hybrid reasoning, complex architectural decomposition, and DAG workflow planning.</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] space-y-1">
                    <span className="font-bold text-[#111318] block">GPT-4o & o3-mini (OpenAI)</span>
                    <span className="text-[#8B919B] text-[11px]">Sub-second code synthesis, AST refactoring, and deterministic tool function calling.</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] space-y-1">
                    <span className="font-bold text-[#111318] block">DeepSeek R1 (DeepSeek)</span>
                    <span className="text-[#8B919B] text-[11px]">Formal cryptographic verification, SQL/RLS invariant audits, and AST security proofs.</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] space-y-1">
                    <span className="font-bold text-[#111318] block">Gemini 2.5 Pro (Google)</span>
                    <span className="text-[#8B919B] text-[11px]">1M+ token context ingestion, full repository diff analysis, and multimodal verification.</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-[#111318] pt-2">Core Architectural Principles</h3>
                <ul className="list-disc list-inside space-y-2 text-[#111318]">
                  <li><strong>Deterministic DAG Execution:</strong> Workflows define topological dependencies, parallel execution splits, and rollback checkpoints.</li>
                  <li><strong>Zero Markup BYOK (Bring Your Own Key):</strong> You pay model providers directly at raw API rates. Your API keys are encrypted client-side using AES-256 before storage.</li>
                  <li><strong>Non-Bypassable Human Gates:</strong> Production deployments, database schema migrations, and privileged API dispatches pause until an authorized admin explicitly signs off.</li>
                  <li><strong>Open Protocol Compatibility:</strong> Native support for the Model Context Protocol (MCP v2024-11-05) and Agent-to-Agent (A2A) protocol.</li>
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
                <p className="text-sm text-[#626873]">Deploy and execute your first multi-agent workflow in under 5 minutes.</p>
              </div>

              <div className="space-y-4">
                <div className="p-6 rounded-2xl bg-white border border-[#E5E5E2] shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#6D4AFF] text-white font-bold text-xs flex items-center justify-center">1</span>
                    <h3 className="text-sm font-bold text-[#111318]">Configure Top AI API Keys (BYOK)</h3>
                  </div>
                  <p className="text-xs text-[#626873]">
                    Go to <Link to="/settings/api-keys" className="text-[#6D4AFF] underline font-semibold">Settings &rarr; API Keys</Link> or the client vault. Add your API keys for Anthropic, OpenAI, or Google. Your keys are immediately encrypted in AES-256 GCM.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-[#E5E5E2] shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#6D4AFF] text-white font-bold text-xs flex items-center justify-center">2</span>
                    <h3 className="text-sm font-bold text-[#111318]">Install the NEXUS TypeScript SDK</h3>
                  </div>
                  <div className="relative">
                    <pre className="p-3.5 rounded-xl bg-[#111318] text-emerald-400 font-mono text-xs overflow-x-auto">
npm install @nexus/sdk
                    </pre>
                    <button
                      onClick={() => handleCopyCode('sdk-install', 'npm install @nexus/sdk')}
                      className="absolute right-3 top-3 p-1 rounded-md bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                    >
                      {copiedCodeId === 'sdk-install' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-[#E5E5E2] shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#6D4AFF] text-white font-bold text-xs flex items-center justify-center">3</span>
                    <h3 className="text-sm font-bold text-[#111318]">Dispatch a Collaborative Workflow</h3>
                  </div>
                  <div className="relative">
                    <pre className="p-4 rounded-xl bg-[#111318] text-[#F5F7FA] font-mono text-xs overflow-x-auto leading-relaxed">
{`import { NexusClient } from '@nexus/sdk';

// Initialize with your workspace API key
const client = new NexusClient({
  apiKey: process.env.NEXUS_API_KEY!,
  endpoint: 'http://127.0.0.1:5180/api/v1'
});

// Run a multi-agent CI/CD pipeline
const execution = await client.workflows.run('ci-orchestration', {
  inputs: {
    repository: 'Priyanshu7977/NEXUS',
    branch: 'main',
    objective: 'Implement authenticated workspaces with RLS policies'
  }
});

console.log('Execution started:', execution.id);
const result = await client.workflows.pollUntilComplete(execution.id);
console.log('Pipeline result:', result.status, result.outputs);`}
                    </pre>
                    <button
                      onClick={() => handleCopyCode('sdk-example', `import { NexusClient } from '@nexus/sdk';\nconst client = new NexusClient({ apiKey: process.env.NEXUS_API_KEY! });\nconst execution = await client.workflows.run('ci-orchestration', { inputs: { repository: 'Priyanshu7977/NEXUS', branch: 'main' } });`)}
                      className="absolute right-3 top-3 p-1 rounded-md bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                    >
                      {copiedCodeId === 'sdk-example' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
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
                <p className="text-sm text-[#626873]">Deep dive into the 5 core architectural layers of NEXUS.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-5 rounded-2xl bg-white border border-[#E5E5E2] space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#111318]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#6D4AFF]" />
                    <span>1. Universal Interface Layer</span>
                  </div>
                  <p className="text-[#626873] leading-relaxed">
                    React web application, Progressive Web App (PWA), Electron native desktop wrapper, REST API Gateway (<code className="font-mono bg-neutral-100 px-1 py-0.5 rounded">/api/v1</code>), and typed TypeScript/Python SDKs.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#E5E5E2] space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#111318]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
                    <span>2. Deterministic DAG Engine</span>
                  </div>
                  <p className="text-[#626873] leading-relaxed">
                    Topological sorting engine with cycle detection, parallel fork/join synchronization, retry exponential backoff, and checkpointed state snapshots.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#E5E5E2] space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#111318]">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>3. Protocol & Tool Bus</span>
                  </div>
                  <p className="text-[#626873] leading-relaxed">
                    Model Context Protocol (MCP) bridge (stdio, SSE, HTTP, WebSocket) and Agent-to-Agent (A2A) protocol router supporting tool discovery and JSON-RPC 2.0 streaming.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#E5E5E2] space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#111318]">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>4. Security & Cryptographic Vault</span>
                  </div>
                  <p className="text-[#626873] leading-relaxed">
                    AES-256 GCM client & server token vault, SSRF validation filters, prompt injection guards, and cryptographic SHA-256 execution provenance logs.
                  </p>
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
                <p className="text-sm text-[#626873]">How autonomous agents reason, execute tools, and maintain ephemeral memory.</p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-[#E5E5E2] shadow-2xs text-xs space-y-4 leading-relaxed text-[#626873]">
                <h3 className="text-sm font-bold text-[#111318]">Agent Lifecycle Loop</h3>
                <p>
                  Every agent execution in NEXUS runs inside an isolated context sandbox. The runtime manages:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-[#111318]">
                  <li><strong>Prompt Ingestion:</strong> Resolves system instructions, workspace constraints, and upstream inputs.</li>
                  <li><strong>Tool Discovery:</strong> Populates authorized tool schemas from connected MCP servers and native integrations.</li>
                  <li><strong>Structured Tool Calling:</strong> The model generates structured function invocations (e.g., <code className="font-mono text-[#6D4AFF]">git.readFile</code>, <code className="font-mono text-[#6D4AFF]">postgres.runQuery</code>).</li>
                  <li><strong>Security Assertion:</strong> Verifies that requested tools comply with the agent's permission boundaries and do not violate policy rules.</li>
                  <li><strong>Execution & Synthesis:</strong> Executes tool runners, streams output back into context, and produces final signed outputs.</li>
                </ol>

                <h3 className="text-sm font-bold text-[#111318] pt-2">Agent Specification Schema</h3>
                <pre className="p-3.5 rounded-xl bg-[#111318] text-[#F5F7FA] font-mono text-[11px] overflow-x-auto">
{`name: gpt4o-code-agent
model: openai:gpt-4o
system_directive: |
  You are an expert full-stack TypeScript and PostgreSQL engineer.
  Always generate type-safe code with unit tests.
tools:
  - github.repositories.read
  - github.repositories.write
  - supabase.sql.query
constraints:
  max_iterations: 12
  timeout_seconds: 180`}
                </pre>
              </div>
            </div>
          )}

          {/* CHAPTER 5: WORKFLOW ENGINE */}
          {activeDocId === 'workflow-engine' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[#E5E5E2]">
                <span className="text-xs font-mono text-[#6D4AFF] font-bold">CHAPTER 05</span>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#111318] mt-1 mb-2">Multi-Agent DAG Engine</h1>
                <p className="text-sm text-[#626873]">Topological execution, parallel fork/join synchronization, and state management.</p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-[#E5E5E2] shadow-2xs text-xs space-y-4 leading-relaxed text-[#626873]">
                <h3 className="text-sm font-bold text-[#111318]">Workflow DAG Specification (YAML)</h3>
                <p>
                  Workflows describe execution graphs declaratively. Nodes specify dependencies via <code className="font-mono text-[#6D4AFF]">needs: [...]</code>. The engine calculates parallel execution tiers using Kahn's algorithm:
                </p>

                <pre className="p-4 rounded-xl bg-[#111318] text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed">
{`version: '1.0'
name: ci-orchestration
trigger:
  type: github_webhook
  event: pull_request.opened
nodes:
  - id: planner
    type: agent
    agent_id: claude-planner-agent
  - id: code_synthesis
    type: agent
    needs: [planner]
    agent_id: gpt4o-code-agent
  - id: security_audit
    type: agent
    needs: [code_synthesis]
    agent_id: deepseek-security-auditor
  - id: human_signoff
    type: approval_gate
    needs: [security_audit]
    role_required: admin
  - id: deploy_vercel
    type: connector_action
    needs: [human_signoff]
    action: vercel.deployments.create`}
                </pre>

                <h3 className="text-sm font-bold text-[#111318] pt-2">Failure Recovery & Checkpoints</h3>
                <p>
                  If any node throws an unhandled error, the DAG engine halts downstream executions while preserving completed step artifacts in PostgreSQL. Workflows can be resumed from the exact failed node without re-running earlier steps.
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
                <p className="text-sm text-[#626873]">Native SaaS integrations, token vaults, and webhook management.</p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-[#E5E5E2] shadow-2xs text-xs space-y-4 leading-relaxed text-[#626873]">
                <h3 className="text-sm font-bold text-[#111318]">Supported Integrations</h3>
                <p>
                  NEXUS includes out-of-the-box native adapters for developer services:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono text-[11px]">
                  <div className="p-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E5E2]">GitHub (OAuth/PAT)</div>
                  <div className="p-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E5E2]">Vercel Deployments</div>
                  <div className="p-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E5E2]">Supabase Postgres</div>
                  <div className="p-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E5E2]">Docker Containers</div>
                  <div className="p-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E5E2]">MongoDB Atlas</div>
                  <div className="p-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E5E2]">Slack Dispatch</div>
                </div>

                <h3 className="text-sm font-bold text-[#111318] pt-2">Credential Security</h3>
                <p>
                  Tokens are never stored in plaintext. They are encrypted using AES-256 GCM with unique per-workspace initialization vectors (IV). When tool execution begins, the token is decrypted in ephemeral memory and scrubbed immediately after the API call completes.
                </p>
              </div>
            </div>
          )}

          {/* CHAPTER 7: MCP & A2A */}
          {activeDocId === 'mcp-a2a' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[#E5E5E2]">
                <span className="text-xs font-mono text-[#6D4AFF] font-bold">CHAPTER 07</span>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#111318] mt-1 mb-2">MCP & A2A Protocols</h1>
                <p className="text-sm text-[#626873]">Connecting Model Context Protocol servers and decentralized agent federations.</p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-[#E5E5E2] shadow-2xs text-xs space-y-4 leading-relaxed text-[#626873]">
                <h3 className="text-sm font-bold text-[#111318]">Model Context Protocol (MCP v2024-11-05)</h3>
                <p>
                  NEXUS acts as both an MCP Host and Client. You can attach any MCP server using four standard transports:
                </p>
                <ul className="list-disc list-inside space-y-1 text-[#111318]">
                  <li><strong>Streamable HTTP:</strong> RESTful chunked transfer for remote MCP hosts.</li>
                  <li><strong>Server-Sent Events (SSE):</strong> Persistent unidirectional event streams for cloud services.</li>
                  <li><strong>stdio:</strong> Local process standard input/output daemon for desktop tools.</li>
                  <li><strong>WebSocket:</strong> Full-duplex bidirectional RPC for low-latency tool streaming.</li>
                </ul>

                <h3 className="text-sm font-bold text-[#111318] pt-2">Agent-to-Agent (A2A) Federation</h3>
                <p>
                  Agents across different workspaces or organizations discover each other via cryptographic DID endpoints. A planner in Workspace A can securely delegate an audit subtask to a specialized auditor agent in Workspace B.
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
                <p className="text-sm text-[#626873]">Enterprise tenant isolation, SSRF prevention, and role-based access control.</p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-[#E5E5E2] shadow-2xs text-xs space-y-4 leading-relaxed text-[#626873]">
                <h3 className="text-sm font-bold text-[#111318]">Role-Based Access Control (RBAC)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse border border-[#E5E5E2]">
                    <thead>
                      <tr className="bg-[#FAFAF8] border-b border-[#E5E5E2] font-semibold text-[#111318]">
                        <th className="p-2.5">Role</th>
                        <th className="p-2.5">API Keys</th>
                        <th className="p-2.5">Workflows</th>
                        <th className="p-2.5">Human Gate Sign-off</th>
                        <th className="p-2.5">Audit Logs</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFEFEA] text-[11px]">
                      <tr>
                        <td className="p-2.5 font-bold">Owner</td>
                        <td className="p-2.5 text-emerald-600">Full Access</td>
                        <td className="p-2.5 text-emerald-600">Full Access</td>
                        <td className="p-2.5 text-emerald-600">Yes</td>
                        <td className="p-2.5 text-emerald-600">Yes</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold">Admin</td>
                        <td className="p-2.5 text-emerald-600">Manage</td>
                        <td className="p-2.5 text-emerald-600">Manage</td>
                        <td className="p-2.5 text-emerald-600">Yes</td>
                        <td className="p-2.5 text-emerald-600">Yes</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold">Member</td>
                        <td className="p-2.5 text-amber-600">Read-Only</td>
                        <td className="p-2.5 text-emerald-600">Execute</td>
                        <td className="p-2.5 text-rose-600">No</td>
                        <td className="p-2.5 text-amber-600">View Only</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-sm font-bold text-[#111318] pt-2">SSRF Defense Layer</h3>
                <p>
                  All outbound agent webhooks and connector calls are routed through an IP parser that drops private IPv4 ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 127.0.0.0/8) and cloud metadata addresses (169.254.169.254).
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
                <p className="text-sm text-[#626873]">Real-time execution telemetry, OpenTelemetry trace export, and audit trails.</p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-[#E5E5E2] shadow-2xs text-xs space-y-4 leading-relaxed text-[#626873]">
                <h3 className="text-sm font-bold text-[#111318]">Step-Level Trace Telemetry</h3>
                <p>
                  Every execution generates structured spans conforming to the OpenTelemetry Semantic Conventions for AI systems. Traces capture:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-[#111318]">
                  <li><strong>Prompt / Input Tokens:</strong> Exact token consumption per step and provider.</li>
                  <li><strong>Wall-Clock Latency:</strong> Nanosecond timestamps for tool calling and LLM inference.</li>
                  <li><strong>Decision Justification:</strong> Model thought chains captured before tool invocations.</li>
                  <li><strong>Cryptographic Hash:</strong> SHA-256 digest of input parameters and emitted artifacts.</li>
                </ul>
              </div>
            </div>
          )}

          {/* CHAPTER 10: PUBLIC API */}
          {activeDocId === 'api-reference' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-[#E5E5E2]">
                <span className="text-xs font-mono text-[#6D4AFF] font-bold">CHAPTER 10</span>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#111318] mt-1 mb-2">Public API Reference (/api/v1)</h1>
                <p className="text-sm text-[#626873]">REST endpoints for headless automation, CI/CD, and external orchestration.</p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-[#E5E5E2] shadow-2xs text-xs space-y-4">
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] space-y-1.5 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">POST</span>
                      <span className="text-xs text-[#111318] font-bold">/api/v1/workflows/:id/run</span>
                    </div>
                    <p className="text-[11px] text-[#626873] font-sans">
                      Dispatches a workflow execution DAG. Requires <code className="font-mono text-[#6D4AFF]">workflows:run</code> scope.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] space-y-1.5 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">GET</span>
                      <span className="text-xs text-[#111318] font-bold">/api/v1/executions/:id</span>
                    </div>
                    <p className="text-[11px] text-[#626873] font-sans">
                      Retrieves live status, current active node, and streaming trace telemetry.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] space-y-1.5 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">POST</span>
                      <span className="text-xs text-[#111318] font-bold">/api/v1/approvals/:id/decide</span>
                    </div>
                    <p className="text-[11px] text-[#626873] font-sans">
                      Resolves a waiting human gate with <code className="font-mono">approved</code> or <code className="font-mono">rejected</code> status.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link to="/developers">
                    <Button size="sm" withArrow>
                      Launch Interactive API Explorer
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
                <h1 className="text-2xl sm:text-3xl font-bold text-[#111318] mt-1 mb-2">TypeScript & Python SDK Guide</h1>
                <p className="text-sm text-[#626873]">Strongly-typed clients for building custom AI automation pipelines.</p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-[#E5E5E2] shadow-2xs text-xs space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-[#111318]">
                  <span>Custom Tool Definition with Zod Validation</span>
                  <span className="font-mono text-[#8B919B]">TypeScript</span>
                </div>
                <pre className="p-4 rounded-xl bg-[#111318] text-[#F5F7FA] font-mono text-xs overflow-x-auto leading-relaxed">
{`import { defineTool } from '@nexus/sdk';
import { z } from 'zod';

export const sqlQueryTool = defineTool({
  name: 'db.query',
  description: 'Executes a read-only parameterized query against PostgreSQL',
  parameters: z.object({
    sql: z.string().describe('Parameterized SQL query'),
    params: z.array(z.any()).optional()
  }),
  execute: async ({ sql, params }, context) => {
    // Check security boundary context
    if (sql.toLowerCase().includes('drop table')) {
      throw new Error('Destructive statements forbidden by policy.');
    }
    return await context.db.query(sql, params);
  }
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
                <h1 className="text-2xl sm:text-3xl font-bold text-[#111318] mt-1 mb-2">Production Deployment & DevOps</h1>
                <p className="text-sm text-[#626873]">Operational guide for containerized deployments and high-availability setups.</p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-[#E5E5E2] shadow-2xs text-xs space-y-4 text-[#626873]">
                <h3 className="text-sm font-bold text-[#111318]">Production Environment Checklist</h3>
                <ul className="list-disc list-inside space-y-2 text-[#111318]">
                  <li><strong>BYOK Key Vault:</strong> Ensure <code className="font-mono text-[#6D4AFF]">ENCRYPTION_MASTER_KEY</code> is injected via AWS Secrets Manager or HashiCorp Vault.</li>
                  <li><strong>PostgreSQL Connection Pool:</strong> Configure PgBouncer with a minimum of 20 pooled transaction connections.</li>
                  <li><strong>SSRF Proxy Daemon:</strong> Run outbound agent tool requests through an egress proxy with strict DNS rebinding defense.</li>
                  <li><strong>OpenTelemetry Collector:</strong> Route trace spans to Datadog, Honeycomb, or Grafana Tempo via standard OTLP gRPC.</li>
                </ul>

                <h3 className="text-sm font-bold text-[#111318] pt-2">Docker Compose Quick Reference</h3>
                <pre className="p-3.5 rounded-xl bg-[#111318] text-emerald-400 font-mono text-[11px] overflow-x-auto">
{`services:
  nexus-orchestrator:
    image: nexus/platform:latest
    ports:
      - "5180:5180"
    environment:
      - DATABASE_URL=postgres://nexus:secret@postgres:5432/nexus
      - ENCRYPTION_MASTER_KEY=\${ENCRYPTION_MASTER_KEY}
      - VITE_BYOK_ENABLED=true`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
