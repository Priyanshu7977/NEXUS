import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandLogo } from '../brand/BrandLogo';
import {
  Search,
  FolderGit2,
  Settings2,
  Plus,
  Key,
  ArrowUpRight,
  Server,
  Bot,
  Layers,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAllConnectors } from '../../connectors/registry';
import { ConnectorDefinition } from '../../types/connector';
import { ConnectorConnection } from '../../types/database';
import { McpServerConfig } from '../../types/mcp';
import { ExternalAgentConfig } from '../../types/a2a';
import {
  getWorkspaceConnections,
  disconnectConnector,
} from '../../services/connectorService';
import {
  isGitHubConfigured,
  getGitHubAuthUrl,
} from '../../services/githubService';
import { getWorkspaceMcpServers } from '../../services/mcpService';
import { getWorkspaceExternalAgents } from '../../services/externalAgentService';

import { ConnectorDetailsModal } from '../connectors/ConnectorDetailsModal';
import { RepositoryListModal } from '../connectors/RepositoryListModal';
import { VercelProjectsModal } from '../connectors/VercelProjectsModal';
import { DisconnectDialog } from '../connectors/DisconnectDialog';
import { ConnectorSetupModal } from '../connectors/ConnectorSetupModal';
import { AddMcpServerModal } from '../mcp/AddMcpServerModal';
import { McpServerDetailsModal } from '../mcp/McpServerDetailsModal';
import { AddExternalAgentModal } from '../a2a/AddExternalAgentModal';
import { ExternalAgentDetailsModal } from '../a2a/ExternalAgentDetailsModal';
import { vercelAdapter } from '../../connectors/adapters/vercelAdapter';

type ActiveTab = 'native' | 'mcp' | 'a2a';

export const ConnectorsPage: React.FC = () => {
  const { currentWorkspace } = useAuth();
  const navigate = useNavigate();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>('native');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Loaded data
  const [connections, setConnections] = useState<ConnectorConnection[]>([]);
  const [mcpServers, setMcpServers] = useState<McpServerConfig[]>([]);
  const [externalAgents, setExternalAgents] = useState<ExternalAgentConfig[]>([]);

  // Native Modals state
  const [selectedConnector, setSelectedConnector] = useState<ConnectorDefinition | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [reposModalOpen, setReposModalOpen] = useState(false);
  const [vercelProjectsModalOpen, setVercelProjectsModalOpen] = useState(false);
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [setupConnectorId, setSetupConnectorId] = useState<string>('github');
  const [disconnectModalOpen, setDisconnectModalOpen] = useState(false);
  const [disconnectLoading, setDisconnectLoading] = useState(false);

  // MCP Modals state
  const [addMcpModalOpen, setAddMcpModalOpen] = useState(false);
  const [selectedMcpServer, setSelectedMcpServer] = useState<McpServerConfig | null>(null);
  const [mcpDetailsModalOpen, setMcpDetailsModalOpen] = useState(false);

  // A2A Modals state
  const [addA2AModalOpen, setAddA2AModalOpen] = useState(false);
  const [selectedExternalAgent, setSelectedExternalAgent] = useState<ExternalAgentConfig | null>(null);
  const [a2aDetailsModalOpen, setA2ADetailsModalOpen] = useState(false);

  const categories = ['All', 'Development', 'AI', 'Data', 'CMS', 'Communication', 'Analytics'] as const;

  const loadAllData = useCallback(async () => {
    if (!currentWorkspace?.id) return;
    try {
      const [connRes, mcpRes, a2aRes] = await Promise.all([
        getWorkspaceConnections(currentWorkspace.id),
        getWorkspaceMcpServers(currentWorkspace.id),
        getWorkspaceExternalAgents(currentWorkspace.id),
      ]);
      setConnections(connRes.connections || []);
      setMcpServers(mcpRes.servers || []);
      setExternalAgents(a2aRes.agents || []);
    } catch (err) {
      console.error('[NEXUS Connectors] Failed to load workspace capabilities:', err);
    }
  }, [currentWorkspace?.id]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const allConnectorsList = getAllConnectors();

  const filteredNative = allConnectorsList.filter((c) => {
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredMcp = mcpServers.filter((s) => {
    return (
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.server_url.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredA2A = externalAgents.filter((a) => {
    return (
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.endpoint_url.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getConnectionForConnector = (connectorId: string): ConnectorConnection | null => {
    return connections.find((c) => c.connector_id === connectorId && c.status === 'connected') || null;
  };

  const handleConnectClick = (e: React.MouseEvent, connector: ConnectorDefinition) => {
    e.stopPropagation();
    if (connector.id === 'github') {
      if (!isGitHubConfigured()) {
        setSetupConnectorId('github');
        setSetupModalOpen(true);
        return;
      }
      if (currentWorkspace?.id) {
        try {
          const authUrl = getGitHubAuthUrl(currentWorkspace.id);
          window.location.href = authUrl;
        } catch {
          setSetupConnectorId('github');
          setSetupModalOpen(true);
        }
      }
    } else if (connector.id === 'vercel') {
      setSetupConnectorId('vercel');
      setSetupModalOpen(true);
    } else {
      navigate(`/app/connectors/${connector.id}`);
    }
  };

  const handleOpenRepos = (e: React.MouseEvent, connector: ConnectorDefinition) => {
    e.stopPropagation();
    setSelectedConnector(connector);
    if (connector.id === 'vercel') {
      setVercelProjectsModalOpen(true);
    } else {
      setReposModalOpen(true);
    }
  };

  const handleConfirmDisconnect = async () => {
    if (!currentWorkspace?.id || !selectedConnector) return;
    setDisconnectLoading(true);
    try {
      await disconnectConnector(currentWorkspace.id, selectedConnector.id);
      await loadAllData();
      setDisconnectModalOpen(false);
      setDetailsModalOpen(false);
      setReposModalOpen(false);
      setVercelProjectsModalOpen(false);
    } catch (err) {
      console.error('[NEXUS Connectors] Disconnect failed:', err);
    } finally {
      setDisconnectLoading(false);
    }
  };

  const activeNativeCount = connections.filter((c) => c.status === 'connected').length;
  const activeMcpCount = mcpServers.filter((s) => s.status === 'connected').length;
  const activeA2ACount = externalAgents.filter((a) => a.status === 'active').length;

  return (
    <div className="flex flex-col gap-8 text-left">
      {/* Header & Status Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111318] mb-1">
            Connectors & Protocols
          </h2>
          <p className="text-sm text-[#626873]">
            Unify native APIs, MCP tool servers, and external A2A agents under NEXUS permission control.
          </p>
        </div>

        {/* Global Capabilities Stats */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <div className="px-3.5 py-1.5 rounded-xl bg-white border border-[#E5E5E2] shadow-xs flex items-center gap-2 text-xs font-medium text-[#111318]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{activeNativeCount + activeMcpCount + activeA2ACount} Active Capabilities</span>
          </div>
        </div>
      </div>

      {/* Main Protocol Tabs */}
      <div className="flex border-b border-[#E5E5E2] gap-8">
        <button
          type="button"
          onClick={() => setActiveTab('native')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors relative ${
            activeTab === 'native'
              ? 'text-[#111318] border-b-2 border-[#111318]'
              : 'text-[#626873] hover:text-[#111318]'
          }`}
        >
          <Layers className="w-4 h-4 text-[#6D4AFF]" />
          <span>Native Connectors</span>
          <span className="px-2 py-0.5 rounded-full bg-stone-100 text-[#626873] text-xs font-mono">
            {activeNativeCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('mcp')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors relative ${
            activeTab === 'mcp'
              ? 'text-[#111318] border-b-2 border-[#111318]'
              : 'text-[#626873] hover:text-[#111318]'
          }`}
        >
          <Server className="w-4 h-4 text-[#6D4AFF]" />
          <span>MCP Tool Servers</span>
          <span className="px-2 py-0.5 rounded-full bg-purple-50 text-[#6D4AFF] text-xs font-mono font-bold">
            {activeMcpCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('a2a')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors relative ${
            activeTab === 'a2a'
              ? 'text-[#111318] border-b-2 border-[#111318]'
              : 'text-[#626873] hover:text-[#111318]'
          }`}
        >
          <Bot className="w-4 h-4 text-blue-600" />
          <span>External Agents (A2A)</span>
          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-mono font-bold">
            {activeA2ACount}
          </span>
        </button>
      </div>

      {/* Controls: Search & Primary Action */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8B919B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'native'
                ? 'Search integrations...'
                : activeTab === 'mcp'
                ? 'Search MCP servers...'
                : 'Search external A2A agents...'
            }
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white border border-[#E5E5E2] focus:border-[#6D4AFF] text-xs text-[#111318] placeholder:text-[#8B919B] outline-none shadow-xs transition-colors"
          />
        </div>

        {/* Tab-Specific Action Buttons or Category Filters */}
        {activeTab === 'native' && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#111318] text-white shadow-xs'
                      : 'bg-white text-[#626873] hover:text-[#111318] hover:bg-[#FAFAF8] border border-[#E5E5E2]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        {activeTab === 'mcp' && (
          <button
            type="button"
            onClick={() => setAddMcpModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#6D4AFF] hover:bg-[#5B3CE6] text-white text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Connect MCP Server</span>
          </button>
        )}

        {activeTab === 'a2a' && (
          <button
            type="button"
            onClick={() => setAddA2AModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Connect External Agent</span>
          </button>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: NATIVE CONNECTORS GRID                                  */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'native' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNative.map((item) => {
            const connection = getConnectionForConnector(item.id);
            const isConnected = Boolean(connection);
            const isLiveConnector = item.id === 'github' || item.id === 'vercel';
            const isConfigured =
              item.id === 'github'
                ? isGitHubConfigured()
                : item.id === 'vercel'
                ? vercelAdapter.isConfigured()
                : false;

            return (
              <div
                key={item.id}
                onClick={() => navigate(`/app/connectors/${item.id}`)}
                className={`p-5 rounded-2xl bg-white border transition-all flex flex-col justify-between cursor-pointer group ${
                  isConnected
                    ? 'border-[#6D4AFF]/40 shadow-[0_4px_20px_rgba(109,74,255,0.06)] ring-1 ring-[#6D4AFF]/10'
                    : 'border-[#E5E5E2] hover:border-[#D4D4CE] hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]'
                }`}
              >
                <div>
                  {/* Card Top Row: Brand & Status Tag */}
                  <div className="flex items-start justify-between mb-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] flex items-center justify-center">
                      <BrandLogo brand={item.brand} size={22} />
                    </div>

                    {isConnected ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        Connected
                      </span>
                    ) : isLiveConnector ? (
                      isConfigured ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          Ready to Connect
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          Setup Required
                        </span>
                      )
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAFAF8] text-[#8B919B] border border-[#EFEFEA]">
                        Coming Soon
                      </span>
                    )}
                  </div>

                  {/* Name & Handle if connected */}
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-[#111318]">{item.name}</h3>
                      {isConnected && connection && (
                        <span className="text-xs font-mono text-[#6D4AFF] font-medium">
                          @{connection.provider_account_name}
                        </span>
                      )}
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-[#8B919B] group-hover:text-[#111318] transition-colors" />
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#626873] leading-relaxed mb-4">{item.description}</p>

                  {/* Connected Metadata Strip */}
                  {isConnected && connection && (
                    <div className="mb-4 p-2.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] flex items-center justify-between text-[11px] text-[#626873]">
                      <div className="flex items-center gap-2">
                        {connection.provider_avatar_url && (
                          <img
                            src={connection.provider_avatar_url}
                            alt={connection.provider_account_name}
                            className="w-5 h-5 rounded-full border border-[#E5E5E2]"
                          />
                        )}
                        <span className="truncate max-w-[120px]">
                          {connection.metadata?.name || connection.provider_account_name}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleOpenRepos(e, item)}
                        className="text-[#6D4AFF] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                      >
                        <FolderGit2 className="w-3 h-3" />
                        <span>{item.id === 'vercel' ? 'Browse Projects' : 'Browse Repos'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-[#EFEFEA] flex items-center justify-between">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#FAFAF8] text-[#8B919B]">
                    {item.category}
                  </span>

                  {isConnected ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/app/connectors/${item.id}`);
                        }}
                        className="px-3 py-1 rounded-lg text-xs font-medium transition-colors bg-[#FAFAF8] hover:bg-[#F4F4F0] text-[#111318] border border-[#E5E5E2] flex items-center gap-1 cursor-pointer"
                      >
                        <Settings2 className="w-3 h-3 text-[#626873]" />
                        Manage
                      </button>
                    </div>
                  ) : isLiveConnector ? (
                    <div className="flex items-center gap-1.5">
                      {!isConfigured && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSetupConnectorId(item.id);
                            setSetupModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors bg-white hover:bg-[#FAFAF8] text-[#626873] border border-[#E5E5E2] flex items-center gap-1 cursor-pointer"
                          title="Configure API credentials"
                        >
                          <Key className="w-3 h-3 text-[#6D4AFF]" />
                          <span className="hidden sm:inline">Token</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleConnectClick(e, item)}
                        className="px-3.5 py-1 rounded-lg text-xs font-medium transition-colors bg-[#111318] hover:bg-black text-white shadow-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Connect
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/app/connectors/${item.id}`);
                      }}
                      className="px-3 py-1 rounded-lg text-xs font-medium transition-colors bg-[#FAFAF8] hover:bg-[#F4F4F0] text-[#8B919B] hover:text-[#111318] border border-[#E5E5E2] cursor-pointer"
                    >
                      Details
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: MCP TOOL SERVERS GRID                                   */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'mcp' && (
        <div>
          {filteredMcp.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white border border-[#E5E5E2] space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#6D4AFF]/10 border border-[#6D4AFF]/20 flex items-center justify-center mx-auto">
                <Server className="w-6 h-6 text-[#6D4AFF]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#111318]">No MCP Tool Servers Connected</h3>
                <p className="text-xs text-[#626873] max-w-md mx-auto mt-1">
                  Connect Model Context Protocol endpoints over Streamable HTTP or SSE to expose external tools to your AI workers with strict permission gates.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAddMcpModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#6D4AFF] hover:bg-[#5B3CE6] text-white text-xs font-semibold shadow-xs inline-flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Connect First MCP Server</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMcp.map((server) => {
                const highRiskCount = (server.capabilities || []).filter((t) => t.is_high_risk).length;

                return (
                  <div
                    key={server.id}
                    onClick={() => {
                      setSelectedMcpServer(server);
                      setMcpDetailsModalOpen(true);
                    }}
                    className="p-5 rounded-2xl bg-white border border-[#E5E5E2] hover:border-[#6D4AFF]/40 hover:shadow-[0_4px_20px_rgba(109,74,255,0.06)] transition-all flex flex-col justify-between cursor-pointer group"
                  >
                    <div>
                      {/* Top row */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-[#6D4AFF]/10 border border-[#6D4AFF]/20 flex items-center justify-center">
                          <Server className="w-5 h-5 text-[#6D4AFF]" />
                        </div>
                        {server.status === 'connected' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            Connected
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-semibold">
                            Error
                          </span>
                        )}
                      </div>

                      {/* Name & Slug */}
                      <div className="mb-1 flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-bold text-[#111318]">{server.name}</h3>
                          <span className="font-mono text-xs text-[#6D4AFF]">mcp:{server.slug}</span>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-[#8B919B] group-hover:text-[#111318] transition-colors" />
                      </div>

                      {/* Description */}
                      <p className="text-xs text-[#626873] leading-relaxed mb-4 line-clamp-2">
                        {server.description || 'Model Context Protocol JSON-RPC tool server.'}
                      </p>

                      {/* Tools Strip */}
                      <div className="mb-4 p-2.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] flex items-center justify-between text-[11px]">
                        <span className="text-[#626873] font-medium">
                          {server.enabled_tools?.length || 0} / {server.capabilities?.length || 0} Tools Enabled
                        </span>
                        {highRiskCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700">
                            <ShieldAlert className="w-3 h-3 text-amber-600" />
                            {highRiskCount} High Risk
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-3 border-t border-[#EFEFEA] flex items-center justify-between">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-50 text-[#6D4AFF]">
                        {server.transport_type}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMcpServer(server);
                          setMcpDetailsModalOpen(true);
                        }}
                        className="px-3 py-1 rounded-lg text-xs font-medium transition-colors bg-[#FAFAF8] hover:bg-[#F4F4F0] text-[#111318] border border-[#E5E5E2] flex items-center gap-1 cursor-pointer"
                      >
                        <Settings2 className="w-3 h-3 text-[#626873]" />
                        Manage
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: EXTERNAL AGENTS (A2A) GRID                             */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'a2a' && (
        <div>
          {filteredA2A.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white border border-[#E5E5E2] space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto">
                <Bot className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#111318]">No External A2A Agents Connected</h3>
                <p className="text-xs text-[#626873] max-w-md mx-auto mt-1">
                  Connect third-party autonomous agents that implement the Agent-to-Agent protocol and publish Agent Cards with verified skill declarations.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAddA2AModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs inline-flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Connect First External Agent</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredA2A.map((agent) => {
                const skillsCount = agent.agent_card?.skills?.length || 0;
                const providerName = agent.agent_card?.provider?.name || 'Autonomous Agent';

                return (
                  <div
                    key={agent.id}
                    onClick={() => {
                      setSelectedExternalAgent(agent);
                      setA2ADetailsModalOpen(true);
                    }}
                    className="p-5 rounded-2xl bg-white border border-[#E5E5E2] hover:border-blue-400 hover:shadow-[0_4px_20px_rgba(37,99,235,0.06)] transition-all flex flex-col justify-between cursor-pointer group"
                  >
                    <div>
                      {/* Top row */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
                          <Bot className="w-5 h-5 text-blue-600" />
                        </div>
                        {agent.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            Active
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold">
                            {agent.status}
                          </span>
                        )}
                      </div>

                      {/* Name & Slug */}
                      <div className="mb-1 flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-bold text-[#111318]">{agent.name}</h3>
                          <span className="font-mono text-xs text-blue-600">a2a:{agent.slug}</span>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-[#8B919B] group-hover:text-[#111318] transition-colors" />
                      </div>

                      {/* Description */}
                      <p className="text-xs text-[#626873] leading-relaxed mb-4 line-clamp-2">
                        {agent.description || 'Agent-to-Agent autonomous worker.'}
                      </p>

                      {/* Skills Strip */}
                      <div className="mb-4 p-2.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] flex items-center justify-between text-[11px]">
                        <span className="text-[#626873] font-medium truncate max-w-[140px]">
                          By {providerName}
                        </span>
                        <span className="font-mono font-bold text-blue-600">
                          {skillsCount} {skillsCount === 1 ? 'Skill' : 'Skills'}
                        </span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-3 border-t border-[#EFEFEA] flex items-center justify-between">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                        A2A v{agent.protocol_version}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedExternalAgent(agent);
                          setA2ADetailsModalOpen(true);
                        }}
                        className="px-3 py-1 rounded-lg text-xs font-medium transition-colors bg-[#FAFAF8] hover:bg-[#F4F4F0] text-[#111318] border border-[#E5E5E2] flex items-center gap-1 cursor-pointer"
                      >
                        <Settings2 className="w-3 h-3 text-[#626873]" />
                        Manage
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODALS                                                        */}
      {/* ------------------------------------------------------------- */}

      {/* Native Modals */}
      {selectedConnector && (
        <ConnectorDetailsModal
          isOpen={detailsModalOpen}
          connector={selectedConnector}
          connection={getConnectionForConnector(selectedConnector.id)}
          onClose={() => setDetailsModalOpen(false)}
          onViewRepositories={() => {
            setDetailsModalOpen(false);
            if (selectedConnector.id === 'vercel') {
              setVercelProjectsModalOpen(true);
            } else {
              setReposModalOpen(true);
            }
          }}
          onRequestDisconnect={() => {
            setDisconnectModalOpen(true);
          }}
        />
      )}

      {selectedConnector && getConnectionForConnector(selectedConnector.id) && (
        <RepositoryListModal
          isOpen={reposModalOpen}
          connection={getConnectionForConnector(selectedConnector.id)!}
          onClose={() => setReposModalOpen(false)}
        />
      )}

      {selectedConnector && getConnectionForConnector(selectedConnector.id) && (
        <VercelProjectsModal
          isOpen={vercelProjectsModalOpen}
          connection={getConnectionForConnector(selectedConnector.id)!}
          onClose={() => setVercelProjectsModalOpen(false)}
        />
      )}

      {selectedConnector && (
        <DisconnectDialog
          isOpen={disconnectModalOpen}
          connectorName={selectedConnector.name}
          brand={selectedConnector.brand}
          accountName={getConnectionForConnector(selectedConnector.id)?.provider_account_name || 'Account'}
          loading={disconnectLoading}
          onConfirm={handleConfirmDisconnect}
          onClose={() => setDisconnectModalOpen(false)}
        />
      )}

      <ConnectorSetupModal
        isOpen={setupModalOpen}
        connectorId={setupConnectorId}
        onClose={() => setSetupModalOpen(false)}
        onConnected={async () => {
          await loadAllData();
        }}
      />

      {/* MCP Modals */}
      {currentWorkspace?.id && (
        <AddMcpServerModal
          isOpen={addMcpModalOpen}
          workspaceId={currentWorkspace.id}
          onClose={() => setAddMcpModalOpen(false)}
          onSuccess={async () => {
            await loadAllData();
          }}
        />
      )}

      {selectedMcpServer && currentWorkspace?.id && (
        <McpServerDetailsModal
          isOpen={mcpDetailsModalOpen}
          server={selectedMcpServer}
          workspaceId={currentWorkspace.id}
          onClose={() => setMcpDetailsModalOpen(false)}
          onUpdated={async () => {
            await loadAllData();
          }}
        />
      )}

      {/* A2A Modals */}
      {currentWorkspace?.id && (
        <AddExternalAgentModal
          isOpen={addA2AModalOpen}
          workspaceId={currentWorkspace.id}
          onClose={() => setAddA2AModalOpen(false)}
          onSuccess={async () => {
            await loadAllData();
          }}
        />
      )}

      {selectedExternalAgent && currentWorkspace?.id && (
        <ExternalAgentDetailsModal
          isOpen={a2aDetailsModalOpen}
          agent={selectedExternalAgent}
          workspaceId={currentWorkspace.id}
          onClose={() => setA2ADetailsModalOpen(false)}
          onUpdated={async () => {
            await loadAllData();
          }}
        />
      )}
    </div>
  );
};
