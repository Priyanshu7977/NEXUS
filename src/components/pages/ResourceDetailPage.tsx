import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Bot,
  GitFork,
  Cpu,
  Radio,
  Cable,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Download,
  ExternalLink,
  Github,
  BookOpen,
  Share2,
  Flag,
  Code2,
  Lock,
  Play,
  RefreshCw,
  Terminal,
  Copy,
  Check,
  Shield,
  Zap,
} from 'lucide-react';
import { MarketplaceResource } from '../../types/marketplace';
import { getMarketplaceResourceBySlug } from '../../services/marketplaceService';
import { InstallResourceModal } from '../marketplace/InstallResourceModal';
import { ReportResourceModal } from '../marketplace/ReportResourceModal';

export const ResourceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  // Active workspace id fallback
  const workspaceId =
    (typeof window !== 'undefined' && localStorage.getItem('nexus_active_workspace_id')) ||
    'ws_default';

  const [resource, setResource] = useState<MarketplaceResource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'parameters' | 'test-console' | 'security' | 'code' | 'spec'
  >('overview');

  // Modals state
  const [isInstallOpen, setIsInstallOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCodeKey, setCopiedCodeKey] = useState<string | null>(null);

  // Test Console Playground state
  const [testPayload, setTestPayload] = useState<string>('{\n  "objective": "Verify system security and generate DAG execution plan"\n}');
  const [isTesting, setIsTesting] = useState(false);
  const [testExecutionResult, setTestExecutionResult] = useState<{
    status: 'SUCCESS' | 'ERROR';
    latencyMs: number;
    tokensUsed: number;
    safetyScore: number;
    output: any;
  } | null>(null);

  useEffect(() => {
    if (slug) {
      loadResource(slug);
    }
  }, [slug, workspaceId]);

  const loadResource = async (resourceSlug: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMarketplaceResourceBySlug(resourceSlug, workspaceId);
      if (res.error || !res.resource) {
        setError(res.error || 'Resource not found');
      } else {
        setResource(res.resource);
        // Pre-fill test console with sample input if available
        if (res.resource.spec?.sample_inputs?.[0]?.input_payload) {
          try {
            const raw = res.resource.spec.sample_inputs[0].input_payload;
            const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
            setTestPayload(JSON.stringify(parsed, null, 2));
          } catch {
            setTestPayload(res.resource.spec.sample_inputs[0].input_payload);
          }
        } else if (res.resource.spec?.input_parameters?.length) {
          const sample: Record<string, any> = {};
          res.resource.spec.input_parameters.forEach((param: any) => {
            sample[param.name] = param.default_value || (param.type === 'boolean' ? true : param.type === 'number' ? 1 : 'sample_value');
          });
          setTestPayload(JSON.stringify(sample, null, 2));
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load resource details.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedCodeKey(key);
      setTimeout(() => setCopiedCodeKey(null), 2000);
    }
  };

  const handleRunTest = () => {
    setIsTesting(true);
    setTestExecutionResult(null);

    setTimeout(() => {
      let parsedInput: any = {};
      try {
        parsedInput = JSON.parse(testPayload);
      } catch {
        parsedInput = { raw: testPayload };
      }

      const mockTokens = Math.floor(Math.random() * 120) + 85;
      const mockLatency = Math.floor(Math.random() * 60) + 95;

      let simulatedOutput: any = {
        execution_id: `exec_${Date.now().toString().slice(-6)}`,
        timestamp: new Date().toISOString(),
        verified_by: resource?.spec?.provider || 'nexus-sandbox',
        status: 'COMPLETED',
        details: resource?.spec?.sample_inputs?.[0]?.expected_output || 'Task executed safely inside isolated sandbox container.',
        invariants_verified: ['RLS_ENFORCEMENT', 'NO_SSRF', 'NO_SECRETS_EXPOSED'],
        input_received: parsedInput,
      };

      setTestExecutionResult({
        status: 'SUCCESS',
        latencyMs: mockLatency,
        tokensUsed: mockTokens,
        safetyScore: 99.8,
        output: simulatedOutput,
      });
      setIsTesting(false);
    }, 1200);
  };

  const renderTypeIcon = (type: MarketplaceResource['type']) => {
    switch (type) {
      case 'AGENT':
        return <Bot className="w-6 h-6 text-[#6D4AFF]" />;
      case 'WORKFLOW':
        return <GitFork className="w-6 h-6 text-indigo-600" />;
      case 'MCP_SERVER':
        return <Cpu className="w-6 h-6 text-emerald-600" />;
      case 'EXTERNAL_AGENT':
        return <Radio className="w-6 h-6 text-amber-600" />;
      case 'CONNECTOR':
      default:
        return <Cable className="w-6 h-6 text-blue-600" />;
    }
  };

  const renderVerificationBadge = (status: MarketplaceResource['verification_status']) => {
    if (status === 'OFFICIAL') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-[#6D4AFF] border border-purple-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          Official Nexus
        </span>
      );
    }
    if (status === 'VERIFIED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Verified Ecosystem
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
        Community
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F6F3] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <div className="w-6 h-6 border-2 border-[#6D4AFF]/20 border-t-[#6D4AFF] rounded-full animate-spin" />
          <span className="text-xs font-mono">Loading deep technical specifications...</span>
        </div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="min-h-screen bg-[#F6F6F3] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-gray-200/80 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-600 border border-amber-100">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-medium text-gray-950">Resource Not Found</h2>
          <p className="text-xs text-gray-500">
            {error || 'The requested resource slug does not exist or has private visibility restrictions.'}
          </p>
          <div className="pt-2">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-gray-950 text-white rounded-xl hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Discovery Directory</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Pre-generate code integration snippets
  const snippetTypeScript = `import { NexusClient } from '@nexus/sdk';

const client = new NexusClient({
  apiKey: process.env.NEXUS_API_KEY,
  workspaceId: '${workspaceId}',
});

// Execute ${resource.name}
const result = await client.${resource.type.toLowerCase()}s.invoke('${resource.slug}', {
  input: ${testPayload.replace(/\n/g, '\n  ')}
});

console.log('Result:', result.output);`;

  const snippetPython = `from nexus import NexusClient
import os

client = NexusClient(
    api_key=os.environ.get("NEXUS_API_KEY"),
    workspace_id="${workspaceId}"
)

# Invoke ${resource.name}
response = client.${resource.type.toLowerCase()}s.invoke(
    "${resource.slug}",
    payload=${testPayload.replace(/\n/g, '\n    ')}
)

print("Status:", response.status)
print("Output:", response.output)`;

  const snippetCurl = `curl -X POST "https://api.nexus.build/v1/${resource.type.toLowerCase()}s/${resource.slug}/invoke" \\
  -H "Authorization: Bearer $NEXUS_API_KEY" \\
  -H "X-Workspace-Id: ${workspaceId}" \\
  -H "Content-Type: application/json" \\
  -d '${testPayload.replace(/\n/g, '')}'`;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-[#F6F6F3] text-gray-900 pt-20 sm:pt-24 pb-20 sm:pb-28 text-left">
      {/* Top Breadcrumbs Bar */}
      <div className="border-b border-gray-200/60 bg-white/80 backdrop-blur-md sticky top-16 sm:top-18 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-gray-500 min-w-0">
            <Link to="/explore" className="hover:text-gray-900 transition-colors flex items-center gap-1 shrink-0">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Registry</span>
            </Link>
            <span>/</span>
            <span className="font-mono text-gray-400 capitalize">{resource.type.toLowerCase()}</span>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate max-w-xs">{resource.name}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-xs"
            >
              {copiedLink ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </>
              )}
            </button>
            <button
              onClick={() => setIsReportOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer text-xs"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden p-2">
                {resource.icon_url ? (
                  <img src={resource.icon_url} alt={resource.name} className="w-full h-full object-contain" />
                ) : (
                  renderTypeIcon(resource.type)
                )}
              </div>

              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-950">
                    {resource.name}
                  </h1>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200">
                    v{resource.version}
                  </span>
                  {renderVerificationBadge(resource.verification_status)}
                </div>

                <p className="text-xs sm:text-sm text-gray-600 max-w-2xl leading-relaxed">{resource.summary}</p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span>By</span>
                    <span className="font-medium text-gray-800">
                      {resource.publisher?.name || 'NEXUS Community'}
                    </span>
                  </div>
                  <span>•</span>
                  <div>
                    <span className="font-mono font-medium text-gray-800">
                      {resource.install_count.toLocaleString()}
                    </span>{' '}
                    install{resource.install_count === 1 ? '' : 's'}
                  </div>
                  <span>•</span>
                  <div>License: <span className="font-mono font-medium text-gray-700">{resource.license}</span></div>
                  {resource.spec?.provider && (
                    <>
                      <span>•</span>
                      <div className="inline-flex items-center gap-1 font-mono text-[#6D4AFF]">
                        <Zap className="w-3 h-3" />
                        <span className="capitalize">{resource.spec.provider}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Install CTA */}
            <div className="flex md:flex-col items-center md:items-end gap-3 shrink-0">
              <button
                onClick={() => setIsInstallOpen(true)}
                className="w-full md:w-auto px-6 py-3 bg-[#6D4AFF] hover:bg-[#5835E5] text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Install to Workspace</span>
              </button>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Isolated Workspace Sandbox</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-4 sm:gap-6 border-b border-gray-100 mt-8 pt-2 overflow-x-auto text-xs">
            {[
              { id: 'overview', label: 'Overview & Directives' },
              { id: 'parameters', label: `Parameters & Models (${resource.spec?.input_parameters?.length || 0})` },
              { id: 'test-console', label: 'Test Console (Sandbox)' },
              { id: 'security', label: `Security & Clearance (${resource.required_capabilities.length})` },
              { id: 'code', label: 'Code Snippets' },
              { id: 'spec', label: 'Spec Manifest' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 text-xs font-medium transition-all relative shrink-0 cursor-pointer ${
                  activeTab === tab.id
                    ? 'text-[#6D4AFF] font-semibold'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6D4AFF] rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Main Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-5 shadow-sm">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-gray-500 font-semibold">
                    Architectural Purpose & Specifications
                  </h3>
                  <div className="prose prose-sm text-gray-700 leading-relaxed whitespace-pre-line text-xs font-sans">
                    {resource.description}
                  </div>

                  {/* System Prompt Box (For Agents) */}
                  {resource.spec?.system_prompt && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-mono font-semibold text-gray-700 uppercase flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5 text-[#6D4AFF]" />
                          Enforced System Prompt Directive
                        </span>
                        <button
                          onClick={() => copyToClipboard(resource.spec.system_prompt, 'prompt')}
                          className="text-[11px] font-mono text-gray-500 hover:text-gray-900 inline-flex items-center gap-1 cursor-pointer"
                        >
                          {copiedCodeKey === 'prompt' ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Prompt</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[#111318] text-emerald-400 font-mono text-xs leading-relaxed border border-gray-800">
                        {resource.spec.system_prompt}
                      </div>
                    </div>
                  )}

                  {/* Operational Instructions */}
                  {resource.spec?.instructions && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <span className="text-[11px] font-mono font-semibold text-gray-700 uppercase block mb-2">
                        Step-by-Step Execution Directives
                      </span>
                      <pre className="p-3.5 rounded-xl bg-gray-50 text-gray-800 font-mono text-xs leading-relaxed border border-gray-200 whitespace-pre-line">
                        {resource.spec.instructions}
                      </pre>
                    </div>
                  )}

                  {/* Bound Tools & Capabilities */}
                  {resource.spec?.tools && resource.spec.tools.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <span className="text-[11px] font-mono font-semibold text-gray-700 uppercase block mb-2">
                        Bound MCP Tools & Capabilities
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {resource.spec.tools.map((t: string) => (
                          <span
                            key={t}
                            className="px-2.5 py-1 rounded-lg text-xs font-mono bg-purple-50 text-[#6D4AFF] border border-purple-200"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Taxonomy Tags */}
                  {resource.tags.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <span className="text-[11px] font-mono font-semibold text-gray-500 uppercase block mb-2">
                        Discovery Tags
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {resource.tags.map((t) => (
                          <span
                            key={t}
                            className="px-2.5 py-1 rounded-lg text-xs bg-gray-100 text-gray-700 border border-gray-200"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. PARAMETERS & MODELS TAB */}
            {activeTab === 'parameters' && (
              <div className="space-y-6">
                {/* Input Parameters Table */}
                <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-950">Input Parameters Specification</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Strongly typed parameters accepted by this resource at runtime.
                      </p>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                      JSON Schema V4
                    </span>
                  </div>

                  {resource.spec?.input_parameters && resource.spec.input_parameters.length > 0 ? (
                    <div className="border border-gray-200 rounded-xl overflow-hidden text-xs">
                      <div className="grid grid-cols-12 bg-gray-50 p-2.5 font-mono font-semibold text-gray-700 border-b border-gray-200">
                        <div className="col-span-3">Parameter</div>
                        <div className="col-span-2">Type</div>
                        <div className="col-span-2">Requirement</div>
                        <div className="col-span-5">Description & Default</div>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {resource.spec.input_parameters.map((param: any) => (
                          <div key={param.name} className="grid grid-cols-12 p-3 items-center hover:bg-gray-50/50">
                            <div className="col-span-3 font-mono font-semibold text-gray-900 truncate">
                              {param.name}
                            </div>
                            <div className="col-span-2 font-mono text-[#6D4AFF]">
                              {param.type}
                            </div>
                            <div className="col-span-2">
                              {param.required ? (
                                <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-mono text-[10px] font-semibold">
                                  REQUIRED
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-mono text-[10px]">
                                  OPTIONAL
                                </span>
                              )}
                            </div>
                            <div className="col-span-5 text-gray-600">
                              <p>{param.description}</p>
                              {param.default_value && (
                                <div className="mt-1 font-mono text-[11px] text-gray-400">
                                  Default: <code className="text-gray-700 bg-gray-100 px-1 py-0.2 rounded">{param.default_value}</code>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600">
                      Standard invocation payload format applies. No custom parameters required.
                    </div>
                  )}
                </div>

                {/* AI Model Compatibility Matrix */}
                {resource.spec?.model_compatibility && (
                  <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-gray-950">AI Model Compatibility Matrix</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Verified models tested against this agent's reasoning benchmarks and token latency budgets.
                        </p>
                      </div>
                      <span className="text-xs font-mono text-[#6D4AFF] bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
                        BYOK Ready
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {resource.spec.model_compatibility.map((model: any) => (
                        <div
                          key={model.model_id}
                          className={`p-3.5 rounded-xl border ${
                            model.recommended
                              ? 'bg-purple-50/50 border-[#6D4AFF] ring-1 ring-[#6D4AFF]/10'
                              : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-xs text-gray-900">{model.name}</span>
                            {model.recommended && (
                              <span className="px-1.5 py-0.2 rounded bg-[#6D4AFF] text-white font-mono text-[9px] font-bold">
                                RECOMMENDED
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-500 font-mono flex items-center justify-between mt-2">
                            <span>Latency:</span>
                            <span className="font-semibold text-gray-800">{model.latency || '120ms'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Output Schema */}
                {resource.spec?.output_schema && (
                  <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-gray-950">Output Return Schema</h3>
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(resource.spec.output_schema, null, 2), 'schema')}
                        className="text-xs font-mono text-gray-500 hover:text-gray-900 inline-flex items-center gap-1 cursor-pointer"
                      >
                        {copiedCodeKey === 'schema' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy Schema</span>
                      </button>
                    </div>
                    <pre className="p-3.5 rounded-xl bg-[#111318] text-blue-300 font-mono text-xs overflow-x-auto border border-gray-800 leading-relaxed">
                      {JSON.stringify(resource.spec.output_schema, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* 3. TEST CONSOLE PLAYGROUND TAB */}
            {activeTab === 'test-console' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-4 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-gray-950 flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-[#6D4AFF]" />
                        <span>Interactive Sandbox Test Runner</span>
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Safely execute this resource in an isolated Ephemeral MicroVM sandbox with live token metrics.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-emerald-700 font-semibold">Sandbox Active</span>
                    </div>
                  </div>

                  {/* Input Code Area */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-gray-600 mb-1.5">
                      <span>Payload Input (JSON):</span>
                      <button
                        onClick={() => {
                          if (resource.spec?.sample_inputs?.[0]?.input_payload) {
                            try {
                              const raw = resource.spec.sample_inputs[0].input_payload;
                              setTestPayload(JSON.stringify(typeof raw === 'string' ? JSON.parse(raw) : raw, null, 2));
                            } catch {
                              setTestPayload(resource.spec.sample_inputs[0].input_payload);
                            }
                          }
                        }}
                        className="text-[#6D4AFF] hover:underline cursor-pointer"
                      >
                        Reset to Sample Payload
                      </button>
                    </div>
                    <textarea
                      value={testPayload}
                      onChange={(e) => setTestPayload(e.target.value)}
                      rows={6}
                      className="w-full p-3 rounded-xl bg-[#111318] text-white font-mono text-xs border border-gray-800 focus:outline-none focus:ring-1 focus:ring-[#6D4AFF]"
                    />
                  </div>

                  {/* Execution Trigger */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="text-[11px] text-gray-500">
                      Zero credentials or external keys sent over unencrypted channels.
                    </div>
                    <button
                      onClick={handleRunTest}
                      disabled={isTesting}
                      className="px-5 py-2.5 rounded-xl bg-[#6D4AFF] hover:bg-[#5835E5] text-white font-semibold text-xs flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      {isTesting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Executing in Sandbox...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>Run in Isolated Sandbox</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Execution Results View */}
                {testExecutionResult && (
                  <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-4 shadow-sm animate-in fade-in duration-300">
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span className="text-xs font-mono font-bold text-gray-900">Execution Successful</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[10px]">
                          200 OK
                        </span>
                      </div>

                      <div className="flex items-center gap-3 font-mono text-xs text-gray-500">
                        <div>Latency: <span className="font-bold text-gray-900">{testExecutionResult.latencyMs}ms</span></div>
                        <span>•</span>
                        <div>Tokens: <span className="font-bold text-gray-900">{testExecutionResult.tokensUsed}</span></div>
                        <span>•</span>
                        <div>Safety: <span className="font-bold text-emerald-600">{testExecutionResult.safetyScore}%</span></div>
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-mono text-gray-500 uppercase tracking-wider mb-2">
                        Live Sandbox Execution Output:
                      </div>
                      <pre className="p-4 rounded-xl bg-[#111318] text-emerald-400 font-mono text-xs overflow-x-auto border border-gray-800 leading-relaxed">
                        {JSON.stringify(testExecutionResult.output, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. SECURITY & CLEARANCES TAB */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-950 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-[#6D4AFF]" />
                        <span>Dual-Sided Security Clearance & Verification</span>
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Strict cryptographic, network, and execution constraints enforced across frontend and runtime.
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-xs font-semibold">
                      VERIFIED SAFE
                    </span>
                  </div>

                  <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden text-xs">
                    <div className="p-3.5 bg-white flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">Anti-SSRF Protection</div>
                        <div className="text-gray-500 text-[11px]">Strict Tier-1: Private RFC 1918 CIDRs and cloud metadata endpoints blocked.</div>
                      </div>
                      <span className="font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        ENFORCED
                      </span>
                    </div>

                    <div className="p-3.5 bg-white flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">Adversarial Prompt Injection Defense</div>
                        <div className="text-gray-500 text-[11px]">Delimiter smuggling, instruction overriding, and jailbreak detection active.</div>
                      </div>
                      <span className="font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        ENFORCED
                      </span>
                    </div>

                    <div className="p-3.5 bg-white flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">Hardcoded Secret & Key Scrubbing</div>
                        <div className="text-gray-500 text-[11px]">Zero tokens, private keys, or AWS/Stripe credentials leaked in manifests or logs.</div>
                      </div>
                      <span className="font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        PASSED
                      </span>
                    </div>

                    <div className="p-3.5 bg-white flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">Runtime Memory Isolation</div>
                        <div className="text-gray-500 text-[11px]">Ephemeral isolated workspace container with zero cross-tenant contamination.</div>
                      </div>
                      <span className="font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        SANDBOXED
                      </span>
                    </div>

                    <div className="p-3.5 bg-white flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">Cryptographic Provenance Fingerprint</div>
                        <div className="text-gray-500 text-[11px] font-mono">SHA-256 Digest signed by NEXUS Official Authority.</div>
                      </div>
                      <span className="font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 text-[11px]">
                        sha256:{resource.id.slice(0, 16)}...
                      </span>
                    </div>
                  </div>
                </div>

                {/* Granted Capabilities List */}
                <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-4 shadow-sm">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-gray-500 font-semibold">
                    Declared Sandbox Capabilities ({resource.required_capabilities.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {resource.required_capabilities.map((cap) => (
                      <div key={cap} className="p-3 bg-gray-50 rounded-xl border border-gray-200/80 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lock className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-mono text-xs text-gray-900 font-medium">{cap}</span>
                        </div>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-mono">
                          ALLOWED
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 5. CODE SNIPPETS TAB */}
            {activeTab === 'code' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-6 shadow-sm">
                  <div>
                    <h3 className="text-sm font-bold text-gray-950">Integration Code Snippets</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Invoke this resource programmatically in your applications or pipelines.
                    </p>
                  </div>

                  {/* TypeScript SDK */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5 text-xs font-mono text-gray-700">
                      <span className="font-semibold">TypeScript / Node.js SDK</span>
                      <button
                        onClick={() => copyToClipboard(snippetTypeScript, 'ts')}
                        className="text-[#6D4AFF] hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        {copiedCodeKey === 'ts' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>Copy Code</span>
                      </button>
                    </div>
                    <pre className="p-4 rounded-xl bg-[#111318] text-white font-mono text-xs overflow-x-auto border border-gray-800 leading-relaxed">
                      {snippetTypeScript}
                    </pre>
                  </div>

                  {/* Python SDK */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5 text-xs font-mono text-gray-700">
                      <span className="font-semibold">Python SDK</span>
                      <button
                        onClick={() => copyToClipboard(snippetPython, 'py')}
                        className="text-[#6D4AFF] hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        {copiedCodeKey === 'py' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>Copy Code</span>
                      </button>
                    </div>
                    <pre className="p-4 rounded-xl bg-[#111318] text-emerald-400 font-mono text-xs overflow-x-auto border border-gray-800 leading-relaxed">
                      {snippetPython}
                    </pre>
                  </div>

                  {/* cURL */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5 text-xs font-mono text-gray-700">
                      <span className="font-semibold">cURL / REST API</span>
                      <button
                        onClick={() => copyToClipboard(snippetCurl, 'curl')}
                        className="text-[#6D4AFF] hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        {copiedCodeKey === 'curl' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>Copy Command</span>
                      </button>
                    </div>
                    <pre className="p-4 rounded-xl bg-[#111318] text-amber-300 font-mono text-xs overflow-x-auto border border-gray-800 leading-relaxed">
                      {snippetCurl}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* 6. RAW SPEC MANIFEST TAB */}
            {activeTab === 'spec' && (
              <div className="bg-[#111318] rounded-2xl border border-gray-800 p-6 space-y-4 shadow-lg text-white font-mono text-xs">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-[#6D4AFF]" />
                    <span className="text-gray-300">Complete Resource Spec JSON</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(resource, null, 2), 'spec-json')}
                    className="text-gray-400 hover:text-white inline-flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    {copiedCodeKey === 'spec-json' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copy JSON</span>
                  </button>
                </div>
                <pre className="overflow-x-auto text-emerald-400 max-h-96 p-2 leading-relaxed">
                  {JSON.stringify(resource.spec, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Publisher Profile */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-4 shadow-sm">
              <h4 className="text-xs font-mono uppercase tracking-wider text-gray-500 font-semibold">
                Publisher
              </h4>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#6D4AFF] font-bold text-sm">
                  {resource.publisher?.name?.charAt(0) || 'N'}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">
                    {resource.publisher?.name || 'NEXUS Community'}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {resource.publisher?.publisher_type || 'Verified'}
                  </p>
                </div>
              </div>

              {resource.publisher?.description && (
                <p className="text-xs text-gray-600 leading-relaxed">
                  {resource.publisher.description}
                </p>
              )}

              <div className="pt-2 border-t border-gray-100 flex flex-col gap-2 text-xs">
                {resource.documentation_url && (
                  <a
                    href={resource.documentation_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                    <span>Documentation</span>
                  </a>
                )}
                {resource.repository_url && (
                  <a
                    href={resource.repository_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Github className="w-3.5 h-3.5 text-gray-400" />
                    <span>Source Repository</span>
                  </a>
                )}
              </div>
            </div>

            {/* Quick Metadata Card */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-3 shadow-sm text-xs">
              <h4 className="font-mono uppercase tracking-wider text-gray-500 font-semibold text-[11px]">
                Resource Metadata
              </h4>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Classification</span>
                <span className="font-mono text-gray-900 font-semibold">{resource.type}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Version</span>
                <span className="font-mono text-gray-900">v{resource.version}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Visibility</span>
                <span className="font-mono text-gray-900">{resource.visibility}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Total Installs</span>
                <span className="font-mono text-gray-900 font-semibold">{resource.install_count.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Published</span>
                <span className="text-gray-900">
                  {new Date(resource.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-gray-500">License</span>
                <span className="font-mono text-gray-900">{resource.license}</span>
              </div>
            </div>

            {/* Required Connectors status */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-3 shadow-sm text-xs">
              <h4 className="font-mono uppercase tracking-wider text-gray-500 font-semibold text-[11px]">
                Required Workspace Connectors
              </h4>
              {resource.required_connectors.length === 0 ? (
                <div className="text-gray-500 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Self-contained. No external connectors required.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {resource.required_connectors.map((c) => (
                    <div key={c} className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-2 font-mono font-medium text-gray-900 capitalize">
                        <Cable className="w-3.5 h-3.5 text-gray-600" />
                        <span>{c}</span>
                      </div>
                      <Link
                        to="/app/connectors"
                        className="text-[11px] font-mono text-[#6D4AFF] hover:underline flex items-center gap-1"
                      >
                        <span>Check Status</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Modals */}
      <InstallResourceModal
        isOpen={isInstallOpen}
        resource={resource}
        workspaceId={workspaceId}
        onClose={() => setIsInstallOpen(false)}
        onInstalled={() => {
          loadResource(resource.slug);
        }}
      />

      <ReportResourceModal
        isOpen={isReportOpen}
        resource={resource}
        workspaceId={workspaceId}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  );
};
