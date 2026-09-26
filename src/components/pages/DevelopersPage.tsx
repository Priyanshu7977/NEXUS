import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { ApiExplorer } from '../developers/ApiExplorer';
import { 
  Terminal, 
  Cable, 
  Workflow, 
  Webhook, 
  Cpu, 
  Copy, 
  Check, 
  ShieldCheck,
  Zap,
  Key,
  Layers,
  FileCode,
  Package,
  ExternalLink
} from 'lucide-react';

type SectionId = 
  | 'overview'
  | 'explorer'
  | 'auth'
  | 'sdk'
  | 'webhooks'
  | 'agent-dev'
  | 'connector-dev'
  | 'recipes'
  | 'changelog';

export const DevelopersPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SectionId>('overview');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const copyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const SECTIONS: { id: SectionId; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: '1. Platform Overview', icon: <Cpu className="w-4 h-4" /> },
    { id: 'explorer', label: '2. API Explorer & Reference', icon: <Terminal className="w-4 h-4" /> },
    { id: 'auth', label: '3. Auth & Scopes', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'sdk', label: '4. TypeScript SDK', icon: <Package className="w-4 h-4" /> },
    { id: 'webhooks', label: '5. Webhooks & Signing', icon: <Webhook className="w-4 h-4" /> },
    { id: 'agent-dev', label: '6. Agent Development', icon: <FileCode className="w-4 h-4" /> },
    { id: 'connector-dev', label: '7. Connector Development', icon: <Cable className="w-4 h-4" /> },
    { id: 'recipes', label: '8. Real-World Recipes', icon: <Workflow className="w-4 h-4" /> },
    { id: 'changelog', label: '9. Changelog & Versioning', icon: <Layers className="w-4 h-4" /> },
  ];

  return (
    <div className="pt-20 sm:pt-24 pb-20 px-4 sm:px-6 lg:px-8 text-left max-w-7xl mx-auto min-h-[calc(100vh-4rem)] flex flex-col w-full">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-[#8B919B] pb-6 border-b border-[#E5E5E2] mb-8">
        <Link to="/" className="hover:text-[#111318] transition-colors">NEXUS</Link>
        <span>/</span>
        <span className="text-[#111318] font-semibold">Developers</span>
        <span>/</span>
        <span className="text-[#6D4AFF]">Platform & SDK</span>
      </div>

      {/* Hero Header */}
      <div className="mb-10 text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs font-mono text-[#6D4AFF] shadow-2xs mb-4">
          <Terminal className="w-3.5 h-3.5" />
          <span>DEVELOPER PLATFORM & PUBLIC API</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111318] tracking-tight mb-3">
          Build & Orchestrate Agents with Code
        </h1>
        <p className="text-base text-[#626873] max-w-3xl leading-relaxed">
          NEXUS is fully programmable. Trigger multi-agent workflows, stream real-time execution telemetry, build custom tools, and verify incoming webhook signatures using our typed TypeScript SDK and REST API.
        </p>

        <div className="flex flex-wrap items-center gap-3 mt-6">
          <Link to="/app/settings">
            <Button size="sm">
              <Key className="w-3.5 h-3.5 mr-1.5" />
              <span>Get API Key</span>
            </Button>
          </Link>
          <a
            href="/api/v1/openapi.json"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#E5E5E2] hover:border-[#D4D4CE] text-xs font-semibold text-[#111318] transition-colors shadow-2xs"
          >
            <span>OpenAPI 3.1 Spec</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#8B919B]" />
          </a>
          <div className="text-xs font-mono text-[#8B919B] bg-[#FAFAF8] px-3 py-2 rounded-xl border border-[#E5E5E2]">
            npm install @nexus/sdk
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-[#E5E5E2] mb-8 scrollbar-none">
        {SECTIONS.map((sec) => {
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => setActiveSection(sec.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#111318] text-white shadow-xs'
                  : 'text-[#626873] hover:text-[#111318] hover:bg-[#FAFAF8]'
              }`}
            >
              {sec.icon}
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Section Content */}
      <div className="space-y-12">
        {/* SECTION 1: OVERVIEW */}
        {activeSection === 'overview' && (
          <div className="space-y-8">
            <div className="p-8 rounded-2xl bg-[#FAFAF8] border border-[#E5E5E2]">
              <h2 className="text-xl font-bold text-[#111318] mb-2">Architectural Overview</h2>
              <p className="text-xs sm:text-sm text-[#626873] leading-relaxed mb-6">
                External applications and automated pipelines interact with NEXUS through an authenticated, rate-limited, and scoped public API layer. The public API bypasses UI layers and triggers the exact same zero-second execution runtime engines as the authenticated dashboard.
              </p>

              {/* Diagram */}
              <div className="p-5 rounded-xl bg-[#111318] text-white font-mono text-xs overflow-x-auto border border-neutral-800">
                <pre className="text-emerald-400 leading-relaxed whitespace-pre">
{`+-----------------------------------------------------------------------------------+
|                           EXTERNAL APPLICATIONS & CLIENTS                         |
|   [ @nexus/sdk (Node/Browser) ]    [ curl / CI/CD ]    [ Webhook Consumers ]      |
+------------------------------------------+----------------------------------------+
                                           |  Bearer Token: nxs_live_...
                                           v
+-----------------------------------------------------------------------------------+
|                           NEXUS PUBLIC API GATEWAY (/api/v1)                      |
|  * SHA-256 Auth Check    * Rate Limiter (120 req/m)    * Idempotency-Key Cache    |
|  * Scopes Verification   * SSRF Protection Validator   * Audit Activity Logger    |
+------------------------------------------+----------------------------------------+
                                           |
                   +-----------------------+-----------------------+
                   |                                               |
                   v                                               v
+--------------------------------------+       +------------------------------------+
|         AGENT RUNTIME ENGINE         |       |      MULTI-AGENT WORKFLOW DAG      |
|  * Tool calling & sandbox execution  |       |  * Parallel branching nodes        |
|  * Streaming reasoning loop          |       |  * Human approval checkpoints      |
|  * Connectors (GitHub, Vercel, MCP)  |       |  * Checkpoint state store          |
+--------------------------------------+       +------------------------------------+
                   |                                               |
                   +-----------------------+-----------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                       HMAC-SHA256 WEBHOOK DISPATCH ENGINE                         |
|  * Signed payloads: t=...,v1=...      * SSRF Assertion (Blocks 127.0.0.1, VPC)    |
|  * Exponential backoff retry queue    * Delivery status audit logs                |
+-----------------------------------------------------------------------------------+`}
                </pre>
              </div>
            </div>

            {/* 3 Integration Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
              <div className="h-full p-6 rounded-2xl bg-white border border-[#E5E5E2] shadow-2xs flex flex-col justify-between min-w-0">
                <div className="flex-1">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6D4AFF] border border-purple-100 flex items-center justify-center mb-4 shrink-0">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#111318] mb-1 truncate">1. REST API (/api/v1)</h3>
                  <p className="text-xs text-[#626873] leading-relaxed break-words">
                    Predictable JSON endpoints for programmatic agent invocation, DAG workflow dispatch, execution status polling, and connector inspection.
                  </p>
                </div>
              </div>

              <div className="h-full p-6 rounded-2xl bg-white border border-[#E5E5E2] shadow-2xs flex flex-col justify-between min-w-0">
                <div className="flex-1">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mb-4 shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#111318] mb-1 truncate">2. TypeScript SDK</h3>
                  <p className="text-xs text-[#626873] leading-relaxed break-words">
                    Strongly-typed client package with built-in pollers (<code className="font-mono text-[11px] bg-neutral-100 px-1 py-0.5 rounded break-all">waitForCompletion</code>), error hierarchies, and custom tool/connector factories.
                  </p>
                </div>
              </div>

              <div className="h-full p-6 rounded-2xl bg-white border border-[#E5E5E2] shadow-2xs flex flex-col justify-between min-w-0">
                <div className="flex-1">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-4 shrink-0">
                    <Webhook className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#111318] mb-1 truncate">3. Developer Webhooks</h3>
                  <p className="text-xs text-[#626873] leading-relaxed break-words">
                    Real-time events delivered directly to your server with HMAC-SHA256 signature verification and automatic exponential backoff retries.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: API EXPLORER & REFERENCE */}
        {activeSection === 'explorer' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-[#111318] mb-1">Interactive API Explorer</h2>
              <p className="text-xs text-[#626873]">
                Execute live HTTP requests against the NEXUS runtime and test inputs, headers, and responses.
              </p>
            </div>

            <ApiExplorer />

            {/* REST Endpoint Reference Table */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[#111318]">REST Endpoints Specification</h3>
              <div className="rounded-xl border border-[#E5E5E2] overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAFAF8] border-b border-[#E5E5E2] text-[11px] font-mono uppercase text-[#8B919B]">
                      <th className="py-2.5 px-4">Method</th>
                      <th className="py-2.5 px-4">Endpoint</th>
                      <th className="py-2.5 px-4">Required Scope</th>
                      <th className="py-2.5 px-4">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFEFEA] font-mono text-[11px]">
                    <tr>
                      <td className="py-2.5 px-4 text-emerald-600 font-bold">GET</td>
                      <td className="py-2.5 px-4 text-[#111318]">/api/v1/agents</td>
                      <td className="py-2.5 px-4 text-[#6D4AFF]">agents:read</td>
                      <td className="py-2.5 px-4 text-[#626873] font-sans">List all agents configured in workspace</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 text-emerald-600 font-bold">GET</td>
                      <td className="py-2.5 px-4 text-[#111318]">/api/v1/agents/:id</td>
                      <td className="py-2.5 px-4 text-[#6D4AFF]">agents:read</td>
                      <td className="py-2.5 px-4 text-[#626873] font-sans">Retrieve agent configuration and allowed tools</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 text-blue-600 font-bold">POST</td>
                      <td className="py-2.5 px-4 text-[#111318]">/api/v1/agents/:id/execute</td>
                      <td className="py-2.5 px-4 text-[#6D4AFF]">agents:execute</td>
                      <td className="py-2.5 px-4 text-[#626873] font-sans">Trigger execution with prompt and context</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 text-emerald-600 font-bold">GET</td>
                      <td className="py-2.5 px-4 text-[#111318]">/api/v1/workflows</td>
                      <td className="py-2.5 px-4 text-[#6D4AFF]">workflows:read</td>
                      <td className="py-2.5 px-4 text-[#626873] font-sans">List all DAG workflow pipelines</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 text-blue-600 font-bold">POST</td>
                      <td className="py-2.5 px-4 text-[#111318]">/api/v1/workflows/:id/execute</td>
                      <td className="py-2.5 px-4 text-[#6D4AFF]">workflows:execute</td>
                      <td className="py-2.5 px-4 text-[#626873] font-sans">Dispatch a workflow DAG run</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 text-emerald-600 font-bold">GET</td>
                      <td className="py-2.5 px-4 text-[#111318]">/api/v1/executions</td>
                      <td className="py-2.5 px-4 text-[#6D4AFF]">executions:read</td>
                      <td className="py-2.5 px-4 text-[#626873] font-sans">Query execution history and telemetry</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 text-emerald-600 font-bold">GET</td>
                      <td className="py-2.5 px-4 text-[#111318]">/api/v1/executions/:id</td>
                      <td className="py-2.5 px-4 text-[#6D4AFF]">executions:read</td>
                      <td className="py-2.5 px-4 text-[#626873] font-sans">Get execution status and output</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 text-emerald-600 font-bold">GET</td>
                      <td className="py-2.5 px-4 text-[#111318]">/api/v1/connectors</td>
                      <td className="py-2.5 px-4 text-[#6D4AFF]">agents:read</td>
                      <td className="py-2.5 px-4 text-[#626873] font-sans">List active tools & connectors</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 text-emerald-600 font-bold">GET</td>
                      <td className="py-2.5 px-4 text-[#111318]">/api/v1/activity</td>
                      <td className="py-2.5 px-4 text-[#6D4AFF]">activity:read</td>
                      <td className="py-2.5 px-4 text-[#626873] font-sans">Query workspace audit log</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 text-emerald-600 font-bold">GET</td>
                      <td className="py-2.5 px-4 text-[#111318]">/api/v1/webhooks</td>
                      <td className="py-2.5 px-4 text-[#6D4AFF]">webhooks:read</td>
                      <td className="py-2.5 px-4 text-[#626873] font-sans">List registered webhook endpoints</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 text-blue-600 font-bold">POST</td>
                      <td className="py-2.5 px-4 text-[#111318]">/api/v1/webhooks</td>
                      <td className="py-2.5 px-4 text-[#6D4AFF]">webhooks:write</td>
                      <td className="py-2.5 px-4 text-[#626873] font-sans">Register a new webhook endpoint</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: AUTH & SCOPES */}
        {activeSection === 'auth' && (
          <div className="space-y-8">
            <div className="p-6 rounded-2xl bg-white border border-[#E5E5E2] shadow-2xs">
              <h2 className="text-lg font-bold text-[#111318] mb-2">Authentication Model</h2>
              <p className="text-xs sm:text-sm text-[#626873] leading-relaxed mb-4">
                All requests to the NEXUS Public API must authenticate using a Bearer token in the standard HTTP <code className="font-mono text-xs bg-neutral-100 px-1 py-0.5 rounded">Authorization</code> header.
              </p>

              <div className="p-4 rounded-xl bg-[#111318] text-white font-mono text-xs mb-6">
                <code>Authorization: Bearer nxs_live_9fa82b4c10de5e78a2f091cb45091a2e</code>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2]">
                  <h4 className="font-bold text-[#111318] mb-1">Key Lifecycle & Hashing</h4>
                  <p className="text-[#626873] leading-relaxed">
                    API keys are prefixed with <code className="font-mono text-[#6D4AFF]">nxs_live_</code> followed by 32 hexadecimal characters. Keys are hashed with SHA-256 before storage; the raw secret is only displayed once upon creation.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2]">
                  <h4 className="font-bold text-[#111318] mb-1">Rate Limiting</h4>
                  <p className="text-[#626873] leading-relaxed">
                    Standard workspaces have a baseline limit of <strong>120 requests per minute</strong>. When exceeded, the API returns HTTP 429 with standard headers: <code className="font-mono text-[11px]">Retry-After: 60</code>.
                  </p>
                </div>
              </div>
            </div>

            {/* Scope Matrix */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[#111318]">Granular Scopes Matrix</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { scope: 'agents:read', desc: 'Query agent configurations, allowed tools, and system prompt metadata' },
                  { scope: 'agents:execute', desc: 'Trigger autonomous execution runs of configured AI agents' },
                  { scope: 'workflows:read', desc: 'Inspect DAG workflow topologies, node parameters, and triggers' },
                  { scope: 'workflows:execute', desc: 'Dispatch multi-agent DAG pipeline executions' },
                  { scope: 'executions:read', desc: 'Access execution telemetry, logs, node checkpoints, and final outputs' },
                  { scope: 'activity:read', desc: 'Query workspace audit trail, security events, and member actions' },
                  { scope: 'webhooks:read', desc: 'List configured developer webhook delivery endpoints' },
                  { scope: 'webhooks:write', desc: 'Register, test, or delete webhook notification URLs' },
                ].map((s) => (
                  <div key={s.scope} className="p-4 rounded-xl bg-white border border-[#E5E5E2] flex items-start gap-3">
                    <ShieldCheck className="w-4 h-4 text-[#6D4AFF] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-mono text-xs font-bold text-[#111318]">{s.scope}</span>
                      <p className="text-xs text-[#626873] mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: TYPESCRIPT SDK */}
        {activeSection === 'sdk' && (
          <div className="space-y-8">
            <div className="p-6 rounded-2xl bg-white border border-[#E5E5E2] shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-bold text-[#111318]">Official TypeScript SDK</h2>
                  <p className="text-xs text-[#626873]">Package: <code className="font-mono text-xs font-bold text-[#6D4AFF]">@nexus/sdk</code></p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 px-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] font-mono text-xs text-[#111318]">
                    npm install @nexus/sdk
                  </div>
                  <button
                    type="button"
                    onClick={() => copyCode('npm-install', 'npm install @nexus/sdk')}
                    className="p-2 rounded-xl border border-[#E5E5E2] hover:bg-[#FAFAF8] cursor-pointer"
                  >
                    {copiedSnippet === 'npm-install' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-[#8B919B]" />}
                  </button>
                </div>
              </div>

              {/* Code Sample */}
              <div className="rounded-xl bg-[#111318] p-4 text-white font-mono text-xs overflow-x-auto border border-neutral-800">
                <pre className="text-emerald-400 leading-relaxed whitespace-pre">
{`import { NexusClient } from '@nexus/sdk';

const nexus = new NexusClient({
  apiKey: process.env.NEXUS_API_KEY!,
});

// 1. Trigger agent execution
const execution = await nexus.agents.execute('agent-code-reviewer', {
  prompt: 'Analyze PR #89 for security vulnerabilities and race conditions.',
  context: {
    repo: 'nexus-core/runtime',
    prNumber: 89
  }
}, {
  idempotencyKey: 'idem_pr89_review_v1' // Guarantees single execution
});

console.log(\`Execution started: \${execution.id}\`);

// 2. Await completion with real-time status updates
const result = await nexus.executions.waitForCompletion(execution.id, {
  pollIntervalMs: 1500,
  timeoutMs: 60000,
  onUpdate: (exec) => {
    console.log(\`[Polling] Execution status: \${exec.status}\`);
  }
});

console.log('Final Agent Result:', result.output);`}
                </pre>
              </div>
            </div>

            {/* Error Handling Hierarchy */}
            <div className="p-6 rounded-2xl bg-[#FAFAF8] border border-[#E5E5E2]">
              <h3 className="text-base font-bold text-[#111318] mb-2">SDK Error Hierarchy</h3>
              <p className="text-xs text-[#626873] mb-4">
                The SDK maps all HTTP error codes to typed exception classes with request ID correlation:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-white border border-[#E5E5E2]">
                  <span className="font-mono font-bold text-red-600">NexusAuthenticationError (401)</span>
                  <p className="text-[#626873] mt-1">Invalid, missing, or revoked API key.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-[#E5E5E2]">
                  <span className="font-mono font-bold text-amber-600">NexusPermissionError (403)</span>
                  <p className="text-[#626873] mt-1">API key lacks the required scope for this operation.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-[#E5E5E2]">
                  <span className="font-mono font-bold text-purple-600">NexusNotFoundError (404)</span>
                  <p className="text-[#626873] mt-1">Agent, workflow, or execution ID was not found.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-[#E5E5E2]">
                  <span className="font-mono font-bold text-blue-600">NexusRateLimitError (429)</span>
                  <p className="text-[#626873] mt-1">Includes <code className="font-mono text-[10px]">retryAfterSeconds</code> property for backoff.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5: WEBHOOKS & SIGNING */}
        {activeSection === 'webhooks' && (
          <div className="space-y-8">
            <div className="p-6 rounded-2xl bg-white border border-[#E5E5E2] shadow-2xs">
              <h2 className="text-lg font-bold text-[#111318] mb-2">Developer Webhooks & HMAC Verification</h2>
              <p className="text-xs sm:text-sm text-[#626873] leading-relaxed mb-4">
                NEXUS signs all outgoing webhook event payloads using HMAC-SHA256. The signature is sent in the <code className="font-mono text-xs bg-neutral-100 px-1 py-0.5 rounded">X-NEXUS-Signature</code> header with format: <code className="font-mono text-xs font-bold text-[#6D4AFF]">t=timestamp,v1=signature</code>.
              </p>

              {/* Express / Node.js verification example */}
              <div className="rounded-xl bg-[#111318] p-4 text-white font-mono text-xs overflow-x-auto border border-neutral-800 mb-6">
                <pre className="text-emerald-400 leading-relaxed whitespace-pre">
{`import express from 'express';
import { verifyNexusWebhook } from '@nexus/sdk';

const app = express();
// Note: webhook signature check requires the raw unparsed body string!
app.use(express.raw({ type: 'application/json' }));

app.post('/webhooks/nexus', (req, res) => {
  const signature = req.headers['x-nexus-signature'];
  const rawBody = req.body.toString('utf-8');
  const webhookSecret = process.env.NEXUS_WEBHOOK_SECRET!;

  // 1. Verify cryptographic signature & timestamp tolerance (5 min)
  const isValid = verifyNexusWebhook(rawBody, signature as string, webhookSecret);
  if (!isValid) {
    console.error('Invalid signature or expired timestamp!');
    return res.status(401).send('Invalid signature');
  }

  // 2. Process typed event
  const event = JSON.parse(rawBody);
  console.log(\`Received valid event \${event.type} for execution \${event.data?.execution_id}\`);

  res.status(200).json({ received: true });
});`}
                </pre>
              </div>

              {/* SSRF & Retries */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-red-50/50 border border-red-200">
                  <h4 className="font-bold text-red-900 mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-red-600" />
                    <span>SSRF Protection Layer</span>
                  </h4>
                  <p className="text-red-800 leading-relaxed">
                    Webhook URLs are strictly validated prior to dispatch. Localhost (<code className="font-mono text-[10px]">127.0.0.1</code>), cloud metadata (<code className="font-mono text-[10px]">169.254.169.254</code>), and private RFC 1918 subnets are unconditionally blocked.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200">
                  <h4 className="font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-blue-600" />
                    <span>Retry Strategy</span>
                  </h4>
                  <p className="text-blue-800 leading-relaxed">
                    If your server returns a non-2xx status or times out, NEXUS retries delivery up to 3 times using exponential backoff (1s, 5s, 25s) before marking the delivery as failed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 6: AGENT DEVELOPMENT */}
        {activeSection === 'agent-dev' && (
          <div className="space-y-8">
            <div className="p-6 rounded-2xl bg-white border border-[#E5E5E2] shadow-2xs">
              <h2 className="text-lg font-bold text-[#111318] mb-2">Custom Agent Definition</h2>
              <p className="text-xs sm:text-sm text-[#626873] leading-relaxed mb-4">
                Define specialized AI agents programmatically with scoped instructions, dedicated context memory, and restricted tool permissions.
              </p>

              <div className="rounded-xl bg-[#111318] p-4 text-white font-mono text-xs overflow-x-auto border border-neutral-800 mb-6">
                <pre className="text-emerald-400 leading-relaxed whitespace-pre">
{`import { defineAgent } from '@nexus/sdk';

export const securityAuditor = defineAgent({
  name: 'Security Auditor',
  role: 'Vulnerability Detection Specialist',
  description: 'Audits PR AST diffs and verifies OWASP compliance.',
  instructions: \`You are an enterprise security engineer.
When given a code diff, scan for:
- SQL/Command injections
- Hardcoded secrets and bearer tokens
- Unsanitized HTML or eval usage
- Insecure direct object references (IDOR)\`,
  model: 'gemini-1.5-pro',
  tools: [
    'github.read_files',
    'semgrep.scan',
    'vault.lookup_known_hashes'
  ],
  permissions: {
    allowWrite: false, // Read-only assurance
    requireApproval: ['github.create_pull_request_comment']
  }
});`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 7: CONNECTOR DEVELOPMENT */}
        {activeSection === 'connector-dev' && (
          <div className="space-y-8">
            <div className="p-6 rounded-2xl bg-white border border-[#E5E5E2] shadow-2xs">
              <h2 className="text-lg font-bold text-[#111318] mb-2">Custom Connector Definition</h2>
              <p className="text-xs sm:text-sm text-[#626873] leading-relaxed mb-4">
                Build native connectors that expose internal databases, private microservices, or custom third-party APIs as tools to NEXUS agents.
              </p>

              <div className="rounded-xl bg-[#111318] p-4 text-white font-mono text-xs overflow-x-auto border border-neutral-800 mb-6">
                <pre className="text-emerald-400 leading-relaxed whitespace-pre">
{`import { defineConnector, defineTool } from '@nexus/sdk';

export const postgresConnector = defineConnector({
  name: 'Production Postgres',
  version: '1.0.0',
  description: 'Read-only cluster connector for analytical queries.',
  category: 'Databases',
  auth: {
    type: 'api_key',
    fields: [
      { name: 'connection_string', label: 'Connection URL', type: 'password', required: true }
    ]
  },
  capabilities: [
    {
      name: 'query_read_only',
      description: 'Execute a SELECT statement against the reporting replica',
      requiresApproval: false,
      handler: async (credentials, { sql }) => {
        // Enforce SELECT-only statement guard
        if (!/^\\s*SELECT/i.test(sql)) {
          throw new Error('Only SELECT queries are permitted in this connector.');
        }
        return executeQuery(credentials.connection_string, sql);
      }
    }
  ]
});`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 8: REAL-WORLD RECIPES */}
        {activeSection === 'recipes' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#111318] mb-1">Production Workflows & Recipes</h2>
              <p className="text-xs text-[#626873]">
                Battle-tested architectural patterns ready to deploy into your existing developer toolchain.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Recipe 1 */}
              <div className="p-5 rounded-2xl bg-white border border-[#E5E5E2] shadow-2xs">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-purple-50 text-[#6D4AFF] font-bold text-xs flex items-center justify-center">1</span>
                  <h3 className="text-sm font-bold text-[#111318]">Automated PR Triage & Code Review</h3>
                </div>
                <p className="text-xs text-[#626873] leading-relaxed mb-3">
                  GitHub Webhook opens PR &rarr; NEXUS triggers Reviewer Agent &rarr; AST diff parsed &rarr; Security scan &rarr; Automated PR comment posted with suggested fixes.
                </p>
                <div className="p-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E5E2] font-mono text-[10px] text-[#111318]">
                  Trigger: GitHub pull_request.opened &middot; Agent: Security Sentinel
                </div>
              </div>

              {/* Recipe 2 */}
              <div className="p-5 rounded-2xl bg-white border border-[#E5E5E2] shadow-2xs">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center">2</span>
                  <h3 className="text-sm font-bold text-[#111318]">Incident Auto-Remediation & Sentry</h3>
                </div>
                <p className="text-xs text-[#626873] leading-relaxed mb-3">
                  Sentry webhook reports 500 spike &rarr; Diagnostic Agent inspects stack trace & commit diff &rarr; Pauses at Approval Gate &rarr; Rolls back Vercel deployment if approved.
                </p>
                <div className="p-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E5E2] font-mono text-[10px] text-[#111318]">
                  Trigger: Sentry issue.created &middot; Gate: Human Sign-off
                </div>
              </div>

              {/* Recipe 3 */}
              <div className="p-5 rounded-2xl bg-white border border-[#E5E5E2] shadow-2xs">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 font-bold text-xs flex items-center justify-center">3</span>
                  <h3 className="text-sm font-bold text-[#111318]">Slack DevOps Command Bot</h3>
                </div>
                <p className="text-xs text-[#626873] leading-relaxed mb-3">
                  Developer issues <code className="font-mono text-[10px]">/nexus deploy staging</code> &rarr; SDK executes workflow DAG &rarr; Verifies test coverage &rarr; Emits real-time Slack thread updates.
                </p>
                <div className="p-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E5E2] font-mono text-[10px] text-[#111318]">
                  SDK: nexus.workflows.execute() &middot; Channel: #devops-ops
                </div>
              </div>

              {/* Recipe 4 */}
              <div className="p-5 rounded-2xl bg-white border border-[#E5E5E2] shadow-2xs">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-amber-50 text-amber-600 font-bold text-xs flex items-center justify-center">4</span>
                  <h3 className="text-sm font-bold text-[#111318]">Multi-Agent Content Pipeline</h3>
                </div>
                <p className="text-xs text-[#626873] leading-relaxed mb-3">
                  Brief ingested &rarr; Researcher Agent gathers citations &rarr; Drafter Agent composes article &rarr; Fact-checker verifies claims &rarr; SEO Optimizer formats markdown.
                </p>
                <div className="p-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E5E2] font-mono text-[10px] text-[#111318]">
                  DAG Nodes: 4 Agents &middot; Execution: Sequential & Parallel
                </div>
              </div>

              {/* Recipe 5 */}
              <div className="p-5 rounded-2xl bg-white border border-[#E5E5E2] shadow-2xs md:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-neutral-100 text-[#111318] font-bold text-xs flex items-center justify-center">5</span>
                  <h3 className="text-sm font-bold text-[#111318]">Customer Support Ticket Escalation</h3>
                </div>
                <p className="text-xs text-[#626873] leading-relaxed mb-3">
                  Customer opens priority support ticket &rarr; Triage Agent checks user account status via Postgres connector &rarr; Classifies sentiment & severity &rarr; Auto-drafts response or notifies engineering on-call.
                </p>
                <div className="p-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E5E2] font-mono text-[10px] text-[#111318]">
                  Integration: Zendesk Webhook + Database Tool + Slack Alert
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 9: CHANGELOG & VERSIONING */}
        {activeSection === 'changelog' && (
          <div className="space-y-8">
            <div className="p-6 rounded-2xl bg-white border border-[#E5E5E2] shadow-2xs">
              <h2 className="text-lg font-bold text-[#111318] mb-2">API Versioning & Stability Policy</h2>
              <p className="text-xs sm:text-sm text-[#626873] leading-relaxed mb-4">
                NEXUS public APIs adhere to semantic versioning at the URI level (<code className="font-mono text-xs bg-neutral-100 px-1 py-0.5 rounded">/api/v1</code>). We guarantee backward compatibility for all stable v1 endpoints. Any breaking change will be announced with a minimum 12-month deprecation window and released under <code className="font-mono text-xs bg-neutral-100 px-1 py-0.5 rounded">/api/v2</code>.
              </p>

              <div className="border-t border-[#E5E5E2] pt-6 space-y-6">
                <div className="flex items-start gap-4">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    v1.0.0 (Phase 10)
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-[#111318] mb-1">Developer Platform & Public API Launch</h4>
                    <ul className="text-xs text-[#626873] space-y-1 list-disc list-inside">
                      <li>Public REST API gateway (<code className="font-mono text-[11px]">/api/v1/*</code>) with Bearer token authentication.</li>
                      <li>Official TypeScript SDK package (<code className="font-mono text-[11px]">@nexus/sdk</code>) with <code className="font-mono text-[11px]">waitForCompletion</code> helper.</li>
                      <li>Developer webhooks with HMAC-SHA256 signatures, SSRF validation, and exponential backoff.</li>
                      <li>Granular 8-scope authorization matrix and 120 req/min rate limiter.</li>
                      <li>Idempotency support via <code className="font-mono text-[11px]">Idempotency-Key</code> HTTP header.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
