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
  const [activeTab, setActiveTab] = useState<'overview' | 'dependencies' | 'permissions' | 'spec'>('overview');

  // Modals state
  const [isInstallOpen, setIsInstallOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

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
          <ShieldCheck className="w-3 h-3" />
          Official Nexus
        </span>
      );
    }
    if (status === 'VERIFIED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3" />
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
          <span className="text-xs">Loading resource specifications...</span>
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

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-[#F6F6F3] text-gray-900 pt-20 sm:pt-24 pb-28 sm:pb-32">
      {/* Top Breadcrumbs */}
      <div className="border-b border-gray-200/60 bg-white/80 backdrop-blur-md sticky top-16 sm:top-18 z-30">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-gray-500">
            <Link to="/explore" className="hover:text-gray-900 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Discovery Ecosystem</span>
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate max-w-xs">{resource.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {copiedLink ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Link Copied</span>
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-6xl mx-auto px-6 pt-8">
        <div className="bg-white rounded-2xl border border-gray-200/80 p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0 shadow-sm overflow-hidden p-2">
                {resource.icon_url ? (
                  <img src={resource.icon_url} alt={resource.name} className="w-full h-full object-contain" />
                ) : (
                  renderTypeIcon(resource.type)
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl font-semibold tracking-tight text-gray-950">
                    {resource.name}
                  </h1>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200">
                    v{resource.version}
                  </span>
                  {renderVerificationBadge(resource.verification_status)}
                </div>

                <p className="text-sm text-gray-600 max-w-2xl">{resource.summary}</p>

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
                      {resource.install_count}
                    </span>{' '}
                    install{resource.install_count === 1 ? '' : 's'}
                  </div>
                  <span>•</span>
                  <div>License: {resource.license}</div>
                </div>
              </div>
            </div>

            {/* Install CTA */}
            <div className="flex md:flex-col items-center md:items-end gap-3 shrink-0">
              <button
                onClick={() => setIsInstallOpen(true)}
                className="w-full md:w-auto px-6 py-3 bg-[#6D4AFF] hover:bg-[#5835E5] text-white text-sm font-medium rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
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
          <div className="flex items-center gap-6 border-b border-gray-100 mt-8 pt-2">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'dependencies', label: `Dependencies (${resource.required_connectors.length})` },
              { id: 'permissions', label: `Capabilities (${resource.required_capabilities.length})` },
              { id: 'spec', label: 'Specification Inspector' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 text-xs font-medium transition-all relative ${
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Main Column */}
          <div className="md:col-span-2 space-y-6">
            {activeTab === 'overview' && (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-6 shadow-sm">
                <div>
                  <h3 className="text-sm font-semibold text-gray-950 uppercase tracking-wider mb-2">
                    About this Resource
                  </h3>
                  <div className="prose prose-sm text-gray-700 leading-relaxed whitespace-pre-line text-xs font-sans">
                    {resource.description}
                  </div>
                </div>

                {resource.tags.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Tags
                    </h4>
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
            )}

            {activeTab === 'dependencies' && (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-950 uppercase tracking-wider">
                  Required Connectors & Credentials
                </h3>
                <p className="text-xs text-gray-500">
                  This resource interacts with the following external platforms. Verify connector status
                  in your workspace before running.
                </p>

                {resource.required_connectors.length === 0 ? (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3 text-xs text-gray-600">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Self-contained. No external connectors or API tokens required.</span>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    {resource.required_connectors.map((connectorId) => (
                      <div
                        key={connectorId}
                        className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                            <Cable className="w-4 h-4 text-gray-700" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-900 capitalize">
                              {connectorId} Integration
                            </p>
                            <p className="text-[11px] text-gray-500">
                              Requires authenticated connection in Workspace Settings.
                            </p>
                          </div>
                        </div>

                        <Link
                          to="/app/connectors"
                          className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <span>Manage Connectors</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'permissions' && (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-950 uppercase tracking-wider">
                  Capabilities & Sandboxed Permissions
                </h3>
                <p className="text-xs text-gray-500">
                  NEXUS guarantees workspace isolation. Below are the precise capabilities declared
                  in this resource's manifest.
                </p>

                <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                  {resource.required_capabilities.map((cap) => (
                    <div key={cap} className="p-3.5 bg-white flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Lock className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-mono text-xs text-gray-900">{cap}</span>
                      </div>
                      <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 font-medium">
                        Allowed via Sandbox
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'spec' && (
              <div className="bg-[#111318] rounded-2xl border border-gray-800 p-6 space-y-4 shadow-lg text-white font-mono text-xs">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-[#6D4AFF]" />
                    <span className="text-gray-300">Exported Spec JSON</span>
                  </div>
                  <span className="text-[11px] text-gray-500">Read-Only Manifest</span>
                </div>
                <pre className="overflow-x-auto text-emerald-400 max-h-96 p-2 leading-relaxed">
                  {JSON.stringify(resource.spec, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Publisher Profile */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-4 shadow-sm">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Publisher
              </h4>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#6D4AFF] font-bold text-sm">
                  {resource.publisher?.name?.charAt(0) || 'N'}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-gray-900">
                      {resource.publisher?.name || 'NEXUS Community'}
                    </p>
                  </div>
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

            {/* Metadata Card */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-3 shadow-sm text-xs">
              <h4 className="font-semibold text-gray-500 uppercase tracking-wider text-[11px]">
                Metadata
              </h4>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Type</span>
                <span className="font-mono text-gray-900 font-medium">{resource.type}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Version</span>
                <span className="font-mono text-gray-900">v{resource.version}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Visibility</span>
                <span className="font-mono text-gray-900">{resource.visibility}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Published</span>
                <span className="text-gray-900">
                  {new Date(resource.created_at).toLocaleDateString()}
                </span>
              </div>
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
