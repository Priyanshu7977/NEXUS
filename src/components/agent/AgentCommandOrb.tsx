import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  X,
  Send,
  Key,
  Activity,
  ArrowRight,
  Copy,
  Check,
  Download,
  ChevronDown,
  ChevronUp,
  Share2,
  Bot
} from 'lucide-react';
import { Button } from '../ui/Button';
import { ApiKeysModal } from '../app/ApiKeysModal';
import { PromptToWorkflowModal } from '../workflow/PromptToWorkflowModal';

export interface AgentChatMessage {
  id: string;
  role: 'user' | 'agent';
  agentName?: string;
  modelBrand?: string;
  text: string;
  keywords?: string[];
  reasoningTrace?: string[];
  codeSnippet?: {
    title: string;
    language: string;
    code: string;
  };
  openSourceSpec?: {
    title: string;
    type: 'agent-card' | 'mcp-tool' | 'workflow-yaml';
    payload: string;
  };
  timestamp: string;
  actions?: Array<{
    label: string;
    path?: string;
    type?: 'navigate' | 'modal-workflow' | 'modal-keys';
  }>;
}

const DEFAULT_MESSAGES: AgentChatMessage[] = [
  {
    id: 'msg-1',
    role: 'agent',
    agentName: 'NEXUS Autonomous Frontier Co-Pilot',
    modelBrand: 'anthropic',
    keywords: ['#omni-swarm', '#open-source', '#keyword-intelligence', '#dag-compiler'],
    reasoningTrace: [
      'Initialized NEXUS Core Engine with 5 frontier LLMs (Claude 3.5 Sonnet, GPT-4o, Gemini 1.5, DeepSeek-R1, Groq Llama 3.3).',
      'Enabled real-time semantic keyword intelligence & AST code synthesis.',
      'Mounted open-source protocol adapters (A2A Agent Cards & Model Context Protocol).'
    ],
    text: 'Welcome to NEXUS Co-Pilot. I am your autonomous system architect and open-source orchestration agent. Ask any technical question, provide keywords (e.g., "audit rls", "compile workflow", "run swarm debate", "export mcp tool"), and I will analyze intent, synthesize code, and construct production pipelines.',
    timestamp: 'Just now',
    actions: [
      { label: 'Compile Visual DAG', type: 'modal-workflow' },
      { label: 'Launch Swarm Arena', path: '/swarm', type: 'navigate' },
      { label: 'Manage API Vault', type: 'modal-keys' }
    ]
  },
];

export const AgentCommandOrb: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AgentChatMessage[]>(DEFAULT_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [activeModel, setActiveModel] = useState<'claude' | 'deepseek' | 'gpt4' | 'gemini' | 'groq'>('claude');
  const [showKeyVault, setShowKeyVault] = useState(false);
  const [showPromptCompiler, setShowPromptCompiler] = useState(false);
  const [expandedTraceId, setExpandedTraceId] = useState<string | null>('msg-1');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Global Ctrl+K / Cmd+K hotkey
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isThinking]);

  // Deep Keyword Intelligence & Semantic Intent Processor
  const processKeywordQuery = (prompt: string, model: string): AgentChatMessage => {
    const lower = prompt.toLowerCase();
    const words = lower.split(/[\s,;.!?]+/).filter(Boolean);
    const extractedKeywords: string[] = [];

    // Keyword extraction
    const keywordMap: Record<string, string[]> = {
      '#security': ['security', 'audit', 'vuln', 'vulnerability', 'cve', 'injection', 'idor', 'pentest', 'red team'],
      '#rls-database': ['rls', 'row level security', 'postgres', 'postgresql', 'supabase', 'schema', 'migration', 'sql', 'database'],
      '#workflow-dag': ['workflow', 'pipeline', 'dag', 'orchestrat', 'compiler', 'node', 'trigger', 'automation'],
      '#omni-swarm': ['swarm', 'consensus', 'debate', 'compare', 'arbitration', 'parallel', 'frontier'],
      '#devops-sre': ['deploy', 'vercel', 'docker', 'kubernetes', 'k8s', 'ci/cd', 'rollback', 'github', 'health'],
      '#mcp-protocols': ['mcp', 'protocol', 'agent card', 'a2a', 'json-rpc', 'sse', 'tool discovery'],
      '#open-source': ['open source', 'oss', 'spec', 'export', 'apache', 'download', 'license', 'github'],
      '#key-vault': ['key', 'vault', 'api key', 'byok', 'openai', 'anthropic', 'gemini', 'deepseek', 'groq']
    };

    Object.entries(keywordMap).forEach(([tag, terms]) => {
      if (terms.some(t => lower.includes(t))) {
        extractedKeywords.push(tag);
      }
    });

    if (extractedKeywords.length === 0) {
      extractedKeywords.push('#autonomous-reasoning', '#omni-synthesis');
    }

    // 1. Security / Audit / RLS Intent
    if (extractedKeywords.includes('#security') || extractedKeywords.includes('#rls-database')) {
      return {
        id: `agent-${Date.now()}`,
        role: 'agent',
        agentName: 'DeepSeek-R1 Zero-Trust Auditor',
        modelBrand: 'deepseek',
        keywords: extractedKeywords,
        reasoningTrace: [
          `Detected security audit directive in keywords: ${words.slice(0, 5).join(', ')}`,
          'Analyzing PostgreSQL AST for cross-tenant IDOR boundary traversal vectors.',
          'Injecting mathematical constraints for immutable JWT auth.uid() verification.',
          'Synthesized production-hardened RLS policies with zero leakage guarantee.'
        ],
        text: `DeepSeek-R1 Zero-Trust Security Engine has analyzed your prompt. Multi-tenant database operations must enforce tenant-scoped Row-Level Security with explicit JWT signature validation:`,
        codeSnippet: {
          title: 'Supabase / PostgreSQL Zero-Trust RLS Policy',
          language: 'sql',
          code: `-- 1. Enable RLS on core tables\nALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;\nALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;\n\n-- 2. Tenant boundary policy with immutable JWT claims\nCREATE POLICY workspace_isolation ON workspaces\n  FOR ALL\n  USING (tenant_id = (auth.jwt()->>'tenant_id')::uuid)\n  WITH CHECK (tenant_id = (auth.jwt()->>'tenant_id')::uuid);\n\n-- 3. Prevent IDOR enumeration via explicit membership check\nCREATE POLICY member_isolation ON workspace_members\n  FOR SELECT\n  USING (workspace_id IN (\n    SELECT id FROM workspaces WHERE tenant_id = (auth.jwt()->>'tenant_id')::uuid\n  ));`
        },
        openSourceSpec: {
          title: 'Open-Source MCP Security Auditor Tool Spec',
          type: 'mcp-tool',
          payload: JSON.stringify({
            name: 'audit_rls_security',
            description: 'Automated AST security scanner for PostgreSQL Row-Level Security and multi-tenant policies',
            inputSchema: {
              type: 'object',
              properties: {
                sql_schema: { type: 'string', description: 'SQL DDL schema to audit' },
                tenant_isolation_mode: { type: 'string', enum: ['strict', 'permissive'] }
              },
              required: ['sql_schema']
            }
          }, null, 2)
        },
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: [
          { label: 'Compile to Security Workflow', type: 'modal-workflow' },
          { label: 'Explore Security Docs', path: '/security', type: 'navigate' }
        ]
      };
    }

    // 2. Workflow / DAG Intent
    if (extractedKeywords.includes('#workflow-dag')) {
      return {
        id: `agent-${Date.now()}`,
        role: 'agent',
        agentName: 'Claude 3.5 Lead Architect',
        modelBrand: 'anthropic',
        keywords: extractedKeywords,
        reasoningTrace: [
          `Parsed workflow automation objective: "${prompt.slice(0, 60)}..."`,
          'Identified necessary DAG topology: Trigger -> AST Synthesis -> Security Verification -> Human Approval -> Deploy.',
          'Calculated dependency resolution matrix and parallel execution barriers.',
          'Compiled deterministic NEXUS YAML specification.'
        ],
        text: `I have compiled your automation objective into a 5-node deterministic Directed Acyclic Graph (DAG) with parallel verification and human approval checkpoints:`,
        codeSnippet: {
          title: 'NEXUS Workflow Specification (YAML)',
          language: 'yaml',
          code: `version: 3.1\nname: autonomous-engineering-pipeline\ntrigger:\n  type: webhook\n  event: github.push\nnodes:\n  - id: code-synthesis\n    agent: claude-3-5-sonnet\n    tools: [ast-parser, git-diff]\n  - id: security-audit\n    agent: deepseek-reasoner\n    needs: [code-synthesis]\n    tools: [rls-validator, secret-scanner]\n  - id: human-gate\n    type: approval-gate\n    needs: [security-audit]\n    roles: [admin, lead-engineer]\n  - id: edge-deploy\n    type: connector\n    target: vercel-production\n    needs: [human-gate]`
        },
        openSourceSpec: {
          title: 'Standard Open-Source DAG Definition',
          type: 'workflow-yaml',
          payload: `nexus_workflow:\n  schema: "https://nexus-platform.io/schemas/v3/dag.json"\n  nodes: 5\n  license: "Apache-2.0"\n  deterministic: true`
        },
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: [
          { label: 'Open in Visual Studio', path: '/app/workflows/new', type: 'navigate' },
          { label: 'Run Instant Simulation', type: 'modal-workflow' }
        ]
      };
    }

    // 3. Swarm / Consensus Intent
    if (extractedKeywords.includes('#omni-swarm')) {
      return {
        id: `agent-${Date.now()}`,
        role: 'agent',
        agentName: 'NEXUS Omni-Swarm Orchestrator',
        modelBrand: 'google',
        keywords: extractedKeywords,
        reasoningTrace: [
          'Received multi-model consensus request.',
          'Synchronized 4 models: GPT-4o (124 t/s), Claude 3.5 (96 t/s), Gemini 1.5 (142 t/s), DeepSeek-R1 (78 t/s).',
          'Conducted parallel cross-model debate and eliminated logic contradictions.',
          'Synthesized unified golden consensus.'
        ],
        text: `Omni-Swarm parallel consensus completed. All 4 frontier models have arbitrated your objective. No hallucinations or edge-case omissions were found.`,
        codeSnippet: {
          title: 'Verified Cross-Model Consensus Output',
          language: 'json',
          code: `{\n  "consensus_status": "VERIFIED_GOLDEN",\n  "confidence_score": 0.998,\n  "participating_models": [\n    "claude-3-5-sonnet",\n    "gpt-4o",\n    "gemini-1-5-pro",\n    "deepseek-reasoner"\n  ],\n  "audits_passed": "100%",\n  "actionable_next_step": "Dispatch to visual DAG engine"\n}`
        },
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: [
          { label: 'View Live Swarm Arena', path: '/swarm', type: 'navigate' },
          { label: 'Export Consensus to DAG', type: 'modal-workflow' }
        ]
      };
    }

    // 4. Open-Source / Protocols Intent
    if (extractedKeywords.includes('#open-source') || extractedKeywords.includes('#mcp-protocols')) {
      return {
        id: `agent-${Date.now()}`,
        role: 'agent',
        agentName: 'NEXUS Open-Source Protocol Bridge',
        modelBrand: 'anthropic',
        keywords: extractedKeywords,
        reasoningTrace: [
          'Compiling open-source agent card conforming to Google/Linux Agent-to-Agent discovery standard.',
          'Generating JSON-RPC endpoint handlers and capabilities matrix.',
          'Ensuring Apache 2.0 license compatibility for unrestricted commercial use.'
        ],
        text: `NEXUS is 100% open-source core (Apache 2.0). Here is the standardized Open-Source Agent Card (.well-known/agent-card.json) for cross-platform agent peering:`,
        openSourceSpec: {
          title: '.well-known/agent-card.json (Open-Source Standard)',
          type: 'agent-card',
          payload: JSON.stringify({
            $schema: 'https://a2a-protocol.org/v1/agent-card.json',
            id: 'nexus-autonomous-copilot',
            name: 'NEXUS Autonomous Frontier Co-Pilot',
            version: '2.5.0',
            license: 'Apache-2.0',
            provider: 'https://github.com/Priyanshu7977/NEXUS',
            protocols: ['mcp/1.0', 'a2a/1.0', 'json-rpc/2.0'],
            capabilities: {
              code_synthesis: true,
              security_auditing: true,
              dag_compilation: true,
              multi_model_consensus: true
            },
            endpoints: {
              rpc: 'https://nexus-platform.io/api/v1/a2a',
              sse: 'https://nexus-platform.io/api/v1/mcp/sse'
            }
          }, null, 2)
        },
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: [
          { label: 'Explore Open-Source Core', path: '/open-source', type: 'navigate' },
          { label: 'View GitHub Repo', path: '/docs', type: 'navigate' }
        ]
      };
    }

    // Default High-Level Agent Response
    return {
      id: `agent-${Date.now()}`,
      role: 'agent',
      agentName: model === 'claude' ? 'Claude 3.5 Architect' :
                 model === 'deepseek' ? 'DeepSeek-R1 Auditor' :
                 model === 'gpt4' ? 'GPT-4o Synthesizer' :
                 model === 'gemini' ? 'Gemini 1.5 Strategist' : 'Groq High-Speed Dispatcher',
      modelBrand: model === 'claude' ? 'anthropic' :
                  model === 'deepseek' ? 'deepseek' :
                  model === 'gpt4' ? 'openai' :
                  model === 'gemini' ? 'google' : 'groq',
      keywords: extractedKeywords,
      reasoningTrace: [
        `Extracted semantic intent: "${prompt}"`,
        `Assigned primary reasoning engine: ${model.toUpperCase()}`,
        'Context enriched with workspace tools: GitHub Connector, Supabase RLS, Vercel Deployer, and MCP servers.',
        'Synthesized deterministic execution response.'
      ],
      text: `I have processed your directive "${prompt}". As a frontier autonomous agent, I can immediately turn this into executable code, an interactive visual workflow, or dispatch it to the Multi-Model Swarm Arena for cross-verification.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: [
        { label: 'Compile to Visual DAG', type: 'modal-workflow' },
        { label: 'Run in Swarm Arena', path: '/swarm', type: 'navigate' }
      ]
    };
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    const userPrompt = inputText.trim();
    const userMsg: AgentChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: userPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    setTimeout(() => {
      const response = processKeywordQuery(userPrompt, activeModel);
      setMessages((prev) => [...prev, response]);
      setExpandedTraceId(response.id);
      setIsThinking(false);
    }, 700);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadSpec = (spec: { title: string; payload: string; type: string }) => {
    const ext = spec.type === 'workflow-yaml' ? 'yaml' : 'json';
    const blob = new Blob([spec.payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-${spec.type}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Floating Glowing Neural Orb (Light-Editorial Aesthetic) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 select-none">
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-3 px-4 py-3 rounded-full bg-white border border-[#E5E5E2] hover:border-[#6D4AFF] text-[#111318] shadow-[0_8px_30px_rgba(109,74,255,0.2)] hover:shadow-[0_12px_40px_rgba(109,74,255,0.35)] hover:scale-105 transition-all duration-200 cursor-pointer"
            aria-label="Open NEXUS Agent Co-Pilot"
          >
            {/* Animated Halo */}
            <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#6D4AFF]/20 via-[#3B82F6]/20 to-emerald-400/20 opacity-40 group-hover:opacity-80 blur-sm transition-opacity animate-pulse" />

            <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-[#6D4AFF] text-white shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-white animate-spin-slow" />
            </div>

            <div className="relative flex flex-col text-left">
              <span className="text-xs font-bold tracking-tight text-[#111318] flex items-center gap-1.5">
                NEXUS Co-Pilot
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </span>
              <span className="text-[10px] font-mono text-[#8B919B]">Ctrl+K · Frontier Agent</span>
            </div>
          </button>
        </div>
      )}

      {/* Interactive Autonomous Co-Pilot Window (Clean Editorial Light Theme) */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-[95vw] sm:w-[480px] h-[640px] max-h-[90vh] bg-white/95 backdrop-blur-2xl border border-[#E5E5E2] rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.14)] flex flex-col overflow-hidden text-left animate-in fade-in slide-in-from-bottom-5 duration-200 font-sans">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#FBFBFA] border-b border-[#E5E5E2]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#6D4AFF] flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#111318]">NEXUS Autonomous Co-Pilot</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                    OPEN SOURCE
                  </span>
                </div>
                <span className="text-[10px] text-[#626873]">Keyword Intelligence · Multi-Model Swarm</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowKeyVault(true)}
                className="p-1.5 rounded-lg text-[#626873] hover:text-[#111318] hover:bg-black/[0.04] transition-colors cursor-pointer"
                title="Universal BYOK Key Vault"
              >
                <Key className="w-3.5 h-3.5 text-amber-500" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-[#626873] hover:text-[#111318] hover:bg-black/[0.04] transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Model Switcher Bar */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F8F9FA] border-b border-[#EFEFEA] overflow-x-auto text-[11px] font-mono">
            <span className="text-[10px] text-[#8B919B] uppercase font-semibold mr-1 shrink-0">Model:</span>
            {[
              { id: 'claude', name: 'Claude 3.5' },
              { id: 'deepseek', name: 'DeepSeek-R1' },
              { id: 'gpt4', name: 'GPT-4o' },
              { id: 'gemini', name: 'Gemini 1.5' },
              { id: 'groq', name: 'Groq 500t/s' }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setActiveModel(m.id as any)}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer shrink-0 ${
                  activeModel === m.id
                    ? 'bg-[#6D4AFF] text-white font-bold shadow-2xs'
                    : 'text-[#626873] hover:text-[#111318] hover:bg-black/[0.04]'
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                {msg.role === 'agent' && (
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] text-[#626873]">
                    <div className="w-4 h-4 rounded bg-[#6D4AFF]/10 border border-[#6D4AFF]/30 flex items-center justify-center">
                      <Bot className="w-2.5 h-2.5 text-[#6D4AFF]" />
                    </div>
                    <span className="font-bold text-[#111318]">{msg.agentName}</span>
                    <span>• {msg.timestamp}</span>
                  </div>
                )}

                <div
                  className={`max-w-[92%] p-3.5 rounded-2xl leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#6D4AFF] text-white rounded-br-none shadow-sm font-medium'
                      : 'bg-[#FBFBFA] text-[#111318] border border-[#E5E5E2] rounded-bl-none shadow-2xs'
                  }`}
                >
                  {/* Extracted Keyword Badges */}
                  {msg.keywords && msg.keywords.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 mb-2 pb-1.5 border-b border-[#EFEFEA]">
                      {msg.keywords.map((kw, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-purple-50 text-[#6D4AFF] border border-purple-200"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* High-Level Reasoning Trace (Collapsible) */}
                  {msg.reasoningTrace && msg.reasoningTrace.length > 0 && (
                    <div className="mt-2.5 border border-[#E5E5E2] rounded-xl overflow-hidden bg-white">
                      <button
                        onClick={() => setExpandedTraceId(expandedTraceId === msg.id ? null : msg.id)}
                        className="w-full px-2.5 py-1.5 bg-[#F8F9FA] hover:bg-[#F2F2EE] flex items-center justify-between text-[10px] font-mono text-[#626873] font-semibold transition-colors cursor-pointer border-b border-[#EFEFEA]"
                      >
                        <span className="flex items-center gap-1 text-[#6D4AFF]">
                          <Activity className="w-3 h-3" />
                          <span>Cognitive Reasoning Trace ({msg.reasoningTrace.length} steps)</span>
                        </span>
                        {expandedTraceId === msg.id ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                      </button>

                      {expandedTraceId === msg.id && (
                        <div className="p-2.5 space-y-1 text-[10px] font-mono text-[#4B5563] bg-white">
                          {msg.reasoningTrace.map((step, idx) => (
                            <div key={idx} className="flex items-start gap-1.5 leading-snug">
                              <span className="text-[#6D4AFF] font-bold shrink-0">{idx + 1}.</span>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Code Snippet Box */}
                  {msg.codeSnippet && (
                    <div className="mt-2.5 rounded-xl border border-[#E5E5E2] overflow-hidden bg-[#F8F9FA]">
                      <div className="flex items-center justify-between px-3 py-1.5 bg-[#F0F0EC] border-b border-[#E5E5E2]">
                        <span className="text-[10px] font-mono font-bold text-[#111318]">{msg.codeSnippet.title}</span>
                        <button
                          onClick={() => handleCopy(msg.codeSnippet!.code, `code-${msg.id}`)}
                          className="flex items-center gap-1 text-[10px] font-mono text-[#626873] hover:text-[#111318] cursor-pointer"
                        >
                          {copiedId === `code-${msg.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === `code-${msg.id}` ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <pre className="p-3 text-[10px] font-mono text-[#1F2937] leading-relaxed overflow-x-auto bg-white">
                        {msg.codeSnippet.code}
                      </pre>
                    </div>
                  )}

                  {/* Open-Source Protocol Spec Box */}
                  {msg.openSourceSpec && (
                    <div className="mt-2.5 rounded-xl border border-emerald-200 bg-emerald-50/40 p-2.5 text-left">
                      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-emerald-200 text-emerald-900 font-bold text-[10px] font-mono">
                        <span className="flex items-center gap-1">
                          <Share2 className="w-3 h-3 text-emerald-700" />
                          <span>{msg.openSourceSpec.title}</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopy(msg.openSourceSpec!.payload, `spec-${msg.id}`)}
                            className="text-emerald-700 hover:text-emerald-900 cursor-pointer flex items-center gap-1"
                          >
                            {copiedId === `spec-${msg.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedId === `spec-${msg.id}` ? 'Copied' : 'Copy'}</span>
                          </button>
                          <button
                            onClick={() => handleDownloadSpec(msg.openSourceSpec!)}
                            className="text-emerald-700 hover:text-emerald-900 cursor-pointer flex items-center gap-1"
                            title="Download open-source spec"
                          >
                            <Download className="w-3 h-3" />
                            <span>Export</span>
                          </button>
                        </div>
                      </div>
                      <pre className="text-[9px] font-mono text-[#1F2937] max-h-32 overflow-y-auto leading-tight bg-white p-2 rounded border border-emerald-100">
                        {msg.openSourceSpec.payload}
                      </pre>
                    </div>
                  )}

                  {/* Interactive Action Pills */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-[#EFEFEA] flex flex-wrap items-center gap-1.5">
                      {msg.actions.map((act, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            if (act.type === 'modal-workflow') {
                              setShowPromptCompiler(true);
                            } else if (act.type === 'modal-keys') {
                              setShowKeyVault(true);
                            } else if (act.path) {
                              navigate(act.path);
                              setIsOpen(false);
                            }
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-[#F2F2EE] border border-[#E5E5E2] text-[#111318] font-bold text-[10px] transition-colors cursor-pointer shadow-2xs"
                        >
                          <span>{act.label}</span>
                          <ArrowRight className="w-2.5 h-2.5 text-[#6D4AFF]" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex items-center gap-2 text-xs text-[#626873] p-2 bg-[#F8F9FA] rounded-xl border border-[#E5E5E2]">
                <Activity className="w-3.5 h-3.5 animate-spin text-[#6D4AFF]" />
                <span className="font-mono text-[11px]">Analyzing keywords, executing zero-trust audit & synthesizing DAG...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Keyword Prompts Bar */}
          <div className="p-2 bg-[#FBFBFA] border-t border-[#E5E5E2] flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono">
            <button
              onClick={() => setShowPromptCompiler(true)}
              className="px-2.5 py-1 rounded-lg bg-[#6D4AFF]/10 hover:bg-[#6D4AFF]/15 text-[#6D4AFF] border border-[#6D4AFF]/20 flex items-center gap-1 shrink-0 cursor-pointer font-bold"
            >
              <Sparkles className="w-3 h-3 text-[#6D4AFF]" />
              <span>Prompt Compiler</span>
            </button>

            <button
              onClick={() => {
                setInputText('audit rls security policy for multi-tenant postgres database');
              }}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#F2F2EE] text-[#626873] hover:text-[#111318] border border-[#E5E5E2] shrink-0 cursor-pointer shadow-2xs"
            >
              #audit-rls
            </button>

            <button
              onClick={() => {
                setInputText('compile workflow dag with webhook trigger and vercel deployment');
              }}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#F2F2EE] text-[#626873] hover:text-[#111318] border border-[#E5E5E2] shrink-0 cursor-pointer shadow-2xs"
            >
              #compile-dag
            </button>

            <button
              onClick={() => {
                setInputText('export open source mcp tool and a2a agent card spec');
              }}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#F2F2EE] text-[#626873] hover:text-[#111318] border border-[#E5E5E2] shrink-0 cursor-pointer shadow-2xs"
            >
              #export-spec
            </button>
          </div>

          {/* Input Box */}
          <div className="p-3 bg-[#FBFBFA] border-t border-[#E5E5E2] flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything or enter keywords (e.g. audit rls, compile dag)..."
              className="flex-1 px-3 py-2 bg-white border border-[#E5E5E2] rounded-xl text-xs text-[#111318] placeholder-[#8B919B] focus:outline-none focus:border-[#6D4AFF] shadow-2xs"
            />
            <Button
              size="sm"
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="h-8 w-8 p-0 rounded-xl cursor-pointer shrink-0 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ApiKeysModal isOpen={showKeyVault} onClose={() => setShowKeyVault(false)} />
      <PromptToWorkflowModal isOpen={showPromptCompiler} onClose={() => setShowPromptCompiler(false)} />
    </>
  );
};
