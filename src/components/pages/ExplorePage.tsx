import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Bot,
  Cable,
  GitFork,
  Cpu,
  Radio,
  ShieldCheck,
  CheckCircle2,
  Download,
  Plus,
  Sparkles,
} from 'lucide-react';
import {
  MarketplaceResource,
  MarketplaceResourceType,
} from '../../types/marketplace';
import { getMarketplaceResources } from '../../services/marketplaceService';
import { InstallResourceModal } from '../marketplace/InstallResourceModal';
import { PublishResourceModal } from '../marketplace/PublishResourceModal';

export const ExplorePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') as MarketplaceResourceType | null;

  // Active workspace id fallback
  const workspaceId =
    (typeof window !== 'undefined' && localStorage.getItem('nexus_active_workspace_id')) ||
    'ws_default';

  const [resources, setResources] = useState<MarketplaceResource[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>(initialType || 'ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedVerification, setSelectedVerification] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'name'>('popular');

  // Modals
  const [installTarget, setInstallTarget] = useState<MarketplaceResource | null>(null);
  const [isPublishOpen, setIsPublishOpen] = useState(false);

  useEffect(() => {
    loadResources();
  }, [workspaceId]);

  const loadResources = async () => {
    setLoading(true);
    try {
      const res = await getMarketplaceResources({ workspaceId });
      setResources(res.resources || []);
    } catch (err) {
      console.error('Failed to load marketplace resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    return resources.filter((res) => {
      // Type filter
      if (selectedType !== 'ALL' && res.type !== selectedType) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'ALL' && !res.categories?.includes(selectedCategory)) {
        return false;
      }

      // Verification filter
      if (selectedVerification === 'OFFICIAL' && res.verification_status !== 'OFFICIAL') {
        return false;
      }
      if (
        selectedVerification === 'VERIFIED' &&
        res.verification_status !== 'OFFICIAL' &&
        res.verification_status !== 'VERIFIED'
      ) {
        return false;
      }

      // Search Query
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = res.name.toLowerCase().includes(q);
        const matchSummary = res.summary.toLowerCase().includes(q);
        const matchSlug = res.slug.toLowerCase().includes(q);
        const matchPub = res.publisher?.name.toLowerCase().includes(q);
        const matchTags = res.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchName && !matchSummary && !matchSlug && !matchPub && !matchTags) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'popular') {
        return (b.install_count || 0) - (a.install_count || 0);
      }
      if (sortBy === 'recent') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  };

  const filtered = filterResources();

  const renderTypeIcon = (type: MarketplaceResourceType) => {
    switch (type) {
      case 'AGENT':
        return <Bot className="w-4 h-4 text-[#6D4AFF]" />;
      case 'WORKFLOW':
        return <GitFork className="w-4 h-4 text-indigo-600" />;
      case 'MCP_SERVER':
        return <Cpu className="w-4 h-4 text-emerald-600" />;
      case 'EXTERNAL_AGENT':
        return <Radio className="w-4 h-4 text-amber-600" />;
      case 'CONNECTOR':
      default:
        return <Cable className="w-4 h-4 text-blue-600" />;
    }
  };

  const renderTypeBadge = (type: MarketplaceResourceType) => {
    switch (type) {
      case 'AGENT':
        return 'Agent';
      case 'WORKFLOW':
        return 'Workflow';
      case 'MCP_SERVER':
        return 'MCP Server';
      case 'EXTERNAL_AGENT':
        return 'A2A Agent';
      case 'CONNECTOR':
      default:
        return 'Connector';
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F6F3] text-gray-900 pb-32">
      {/* Top Banner Header */}
      <div className="border-b border-gray-200/80 bg-white pt-24 pb-8 sm:pt-28 sm:pb-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-[#6D4AFF] border border-purple-200/70">
              <Sparkles className="w-3.5 h-3.5" />
              <span>NEXUS Ecosystem Directory</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-950">
              Discovery & Marketplace
            </h1>
            <p className="text-sm text-gray-600 max-w-2xl">
              Explore production-grade AI agents, official external connectors, standard Model Context Protocol servers, and multi-agent workflow pipelines.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPublishOpen(true)}
              className="px-4 py-2.5 bg-gray-950 hover:bg-gray-800 text-white text-xs font-medium rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Publish Resource</span>
            </button>
          </div>
        </div>
      </div>

      {/* Discovery Explorer Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-32 space-y-6">
        {/* Search & Filter Controls */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Search input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search agents, connectors, MCP tools, tags, or publishers..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4AFF]/20 focus:border-[#6D4AFF] transition-all"
              />
            </div>

            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#6D4AFF]/20"
            >
              <option value="ALL">All Categories</option>
              <option value="Code & DevOps">Code & DevOps</option>
              <option value="Security & Compliance">Security & Compliance</option>
              <option value="Productivity">Productivity</option>
              <option value="Cloud & Infrastructure">Cloud & Infrastructure</option>
              <option value="Data & Analytics">Data & Analytics</option>
              <option value="Communication">Communication</option>
            </select>

            {/* Verification Dropdown */}
            <select
              value={selectedVerification}
              onChange={(e) => setSelectedVerification(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#6D4AFF]/20"
            >
              <option value="ALL">All Verification</option>
              <option value="OFFICIAL">Official NEXUS Only</option>
              <option value="VERIFIED">Official & Verified</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full sm:w-auto px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#6D4AFF]/20"
            >
              <option value="popular">Most Installed</option>
              <option value="recent">Recently Added</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>

          {/* Type Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
            {[
              { id: 'ALL', label: 'All Resources' },
              { id: 'AGENT', label: 'AI Agents', icon: Bot },
              { id: 'CONNECTOR', label: 'Connectors', icon: Cable },
              { id: 'WORKFLOW', label: 'Workflows', icon: GitFork },
              { id: 'MCP_SERVER', label: 'MCP Servers', icon: Cpu },
              { id: 'EXTERNAL_AGENT', label: 'A2A External Agents', icon: Radio },
            ].map((pill) => {
              const Icon = pill.icon;
              const isSelected = selectedType === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => setSelectedType(pill.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all ${
                    isSelected
                      ? 'bg-gray-950 text-white font-medium shadow-sm'
                      : 'bg-gray-100/80 hover:bg-gray-200/80 text-gray-700'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  <span>{pill.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-gray-500 px-1">
          <span>Showing {filtered.length} ecosystem resource{filtered.length === 1 ? '' : 's'}</span>
          {(selectedType !== 'ALL' || selectedCategory !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedType('ALL');
                setSelectedCategory('ALL');
                setSelectedVerification('ALL');
                setSearchQuery('');
              }}
              className="text-[#6D4AFF] hover:underline font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Grid of Resources */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-6 h-6 border-2 border-[#6D4AFF]/20 border-t-[#6D4AFF] rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-500">Querying verified ecosystem registry...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto text-gray-400 border border-gray-100">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-medium text-gray-900">No matching resources found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              No published resources match your current query and filters. Try adjusting your search term
              or publish the first one!
            </p>
            <div className="pt-2">
              <button
                onClick={() => setIsPublishOpen(true)}
                className="px-4 py-2 bg-gray-950 text-white text-xs font-medium rounded-xl hover:bg-gray-800 transition-colors"
              >
                Publish a Resource
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="h-full bg-white rounded-2xl border border-gray-200/80 hover:border-gray-300 transition-all p-5 shadow-sm hover:shadow flex flex-col justify-between group min-w-0"
              >
                <div className="space-y-3 flex-1 flex flex-col">
                  {/* Top Row: Type & Verification Badge */}
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 text-gray-700 border border-gray-200 shrink-0">
                      {renderTypeIcon(item.type)}
                      <span>{renderTypeBadge(item.type)}</span>
                    </div>

                    {item.verification_status === 'OFFICIAL' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#6D4AFF] bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100 shrink-0">
                        <ShieldCheck className="w-3 h-3" />
                        Official
                      </span>
                    ) : item.verification_status === 'VERIFIED' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 shrink-0">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="text-[11px] text-gray-400 font-mono shrink-0">v{item.version}</span>
                    )}
                  </div>

                  {/* Title & Publisher */}
                  <div className="min-w-0">
                    <Link
                      to={`/explore/${item.slug}`}
                      className="text-base font-semibold text-gray-950 hover:text-[#6D4AFF] transition-colors line-clamp-1 break-words block"
                    >
                      {item.name}
                    </Link>
                    <p className="text-[11px] text-gray-500 pt-0.5 truncate">
                      by{' '}
                      <span className="font-medium text-gray-700">
                        {item.publisher?.name || 'NEXUS Community'}
                      </span>
                    </p>
                  </div>

                  {/* Summary */}
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed break-words">
                    {item.summary}
                  </p>

                  {/* Required Connectors */}
                  {item.required_connectors.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] uppercase font-semibold text-gray-400">Needs:</span>
                      {item.required_connectors.map((c) => (
                        <span
                          key={c}
                          className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-50 text-amber-800 border border-amber-200/60 break-words"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Tags */}
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-auto pt-2">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md text-[10px] bg-gray-100 text-gray-600 break-words"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Footer: Installs and Actions */}
                <div className="pt-4 mt-auto border-t border-gray-100 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-gray-500 shrink-0">
                    <span className="font-mono font-medium text-gray-800">{item.install_count}</span>{' '}
                    install{item.install_count === 1 ? '' : 's'}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to={`/explore/${item.slug}`}
                      className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Details
                    </Link>
                    <button
                      onClick={() => setInstallTarget(item)}
                      className="px-3.5 py-1.5 text-xs font-medium bg-gray-950 hover:bg-gray-800 text-white rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>Install</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <InstallResourceModal
        isOpen={!!installTarget}
        resource={installTarget}
        workspaceId={workspaceId}
        onClose={() => setInstallTarget(null)}
        onInstalled={() => {
          loadResources();
        }}
      />

      <PublishResourceModal
        isOpen={isPublishOpen}
        workspaceId={workspaceId}
        onClose={() => setIsPublishOpen(false)}
        onPublished={() => {
          loadResources();
        }}
      />
    </div>
  );
};
