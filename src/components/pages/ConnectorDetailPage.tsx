import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BrandLogo } from '../brand/BrandLogo';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { getConnectorById } from '../../connectors/registry';
import { ConnectorDefinition } from '../../types/connector';
import { ConnectorConnection } from '../../types/database';
import { 
  getWorkspaceConnections, 
  disconnectConnector 
} from '../../services/connectorService';
import { 
  isGitHubConfigured, 
  getGitHubAuthUrl 
} from '../../services/githubService';
import { 
  ArrowLeft, 
  Shield, 
  FolderGit2, 
  AlertCircle,
  Trash2
} from 'lucide-react';
import { RepositoryListModal } from '../connectors/RepositoryListModal';
import { VercelProjectsModal } from '../connectors/VercelProjectsModal';
import { DisconnectDialog } from '../connectors/DisconnectDialog';
import { ConnectorSetupModal } from '../connectors/ConnectorSetupModal';
import { vercelAdapter } from '../../connectors/adapters/vercelAdapter';

export const ConnectorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentWorkspace } = useAuth();

  const [connector, setConnector] = useState<ConnectorDefinition | null>(null);
  const [connection, setConnection] = useState<ConnectorConnection | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [reposModalOpen, setReposModalOpen] = useState(false);
  const [vercelProjectsModalOpen, setVercelProjectsModalOpen] = useState(false);
  const [disconnectModalOpen, setDisconnectModalOpen] = useState(false);
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [disconnectLoading, setDisconnectLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const found = getConnectorById(id);
    setConnector(found || null);

    const loadConn = async () => {
      if (currentWorkspace?.id && found) {
        try {
          const { connections } = await getWorkspaceConnections(currentWorkspace.id);
          const active = connections.find((c) => c.connector_id === id && c.status === 'connected');
          setConnection(active || null);
        } catch (err) {
          console.error('[NEXUS Connector Detail] Error loading connection:', err);
        }
      }
      setLoading(false);
    };

    loadConn();
  }, [id, currentWorkspace?.id]);

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-[#8B919B]">
        Loading connector details...
      </div>
    );
  }

  if (!connector) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-[#E5E5E2] text-center max-w-lg mx-auto mt-8 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-[#FAFAF8] border border-[#E5E5E2] text-[#8B919B] flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-[#111318] mb-1">
          Connector not found
        </h3>
        <p className="text-xs text-[#626873] mb-6">
          The requested connector ID is not registered in the NEXUS ecosystem.
        </p>
        <Button size="sm" onClick={() => navigate('/app/connectors')}>
          Return to Connectors
        </Button>
      </div>
    );
  }

  const isConnected = Boolean(connection);
  const isConfigured = connector.id === 'github' ? isGitHubConfigured() : (connector.id === 'vercel' ? vercelAdapter.isConfigured() : true);

  const handleConnect = () => {
    if (connector.id === 'github') {
      if (!isGitHubConfigured()) {
        setSetupModalOpen(true);
        return;
      }
      if (currentWorkspace?.id) {
        try {
          const authUrl = getGitHubAuthUrl(currentWorkspace.id);
          window.location.href = authUrl;
        } catch {
          setSetupModalOpen(true);
        }
      }
    } else {
      setSetupModalOpen(true);
    }
  };

  const handleConfirmDisconnect = async () => {
    if (!currentWorkspace?.id || !connector) return;
    setDisconnectLoading(true);
    try {
      await disconnectConnector(currentWorkspace.id, connector.id);
      setConnection(null);
      setDisconnectModalOpen(false);
    } catch (err) {
      console.error('[NEXUS] Disconnect failed:', err);
    } finally {
      setDisconnectLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 text-left max-w-5xl mx-auto pb-12">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/app/connectors')}
          className="inline-flex items-center gap-2 text-xs font-medium text-[#626873] hover:text-[#111318] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Connectors</span>
        </button>

        <div className="text-xs font-mono text-[#8B919B]">
          Category: <span className="text-[#111318] font-bold">{connector.category}</span>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#FAFAF8] border border-[#E5E5E2] flex items-center justify-center shrink-0 shadow-xs">
            <BrandLogo brand={connector.brand} size={32} />
          </div>
          <div>
            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
              <h1 className="text-2xl font-bold text-[#111318]">
                {connector.name}
              </h1>
              {isConnected ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Connected
                </span>
              ) : isConfigured ? (
                <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  Ready to Connect
                </span>
              ) : (
                <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                  Setup Required
                </span>
              )}
            </div>
            <p className="text-sm text-[#626873] max-w-2xl leading-relaxed">
              {connector.description}
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          {isConnected ? (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (connector.id === 'vercel') {
                    setVercelProjectsModalOpen(true);
                  } else {
                    setReposModalOpen(true);
                  }
                }}
              >
                <FolderGit2 className="w-4 h-4 mr-1.5" />
                {connector.id === 'vercel' ? 'Browse Projects' : 'Browse Repos'}
              </Button>
              <button
                onClick={() => setDisconnectModalOpen(true)}
                className="p-2 rounded-xl text-red-600 hover:bg-red-50 border border-red-200 transition-colors cursor-pointer"
                title="Disconnect service"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Button size="md" onClick={handleConnect} withArrow>
              Connect {connector.name}
            </Button>
          )}
        </div>
      </div>

      {/* Connected Account Banner if Active */}
      {isConnected && connection && (
        <div className="p-6 rounded-2xl bg-[#FAFAF8] border border-[#E5E5E2] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {connection.provider_avatar_url && (
              <img
                src={connection.provider_avatar_url}
                alt={connection.provider_account_name}
                className="w-10 h-10 rounded-full border border-[#E5E5E2]"
              />
            )}
            <div>
              <div className="text-sm font-bold text-[#111318]">
                Linked as @{connection.provider_account_name}
              </div>
              <div className="text-xs text-[#626873]">
                {connection.metadata?.name || 'Authorized Personal Account'} · Access Token Encrypted (AES-256 GCM)
              </div>
            </div>
          </div>

          <div className="text-xs text-[#8B919B] font-mono">
            Connected on {new Date(connection.created_at).toLocaleDateString()}
          </div>
        </div>
      )}

      {/* Capabilities & Permissions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Capabilities */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm flex flex-col justify-between h-full min-w-0">
          <div className="flex-1 flex flex-col min-w-0">
            <h3 className="text-base font-bold text-[#111318] mb-1">
              Connector Capabilities
            </h3>
            <p className="text-xs text-[#626873] mb-5">
              Actions and endpoints supported by the NEXUS {connector.name} integration.
            </p>

            <div className="flex flex-col gap-3">
              {connector.capabilities.map((cap) => (
                <div
                  key={cap.name}
                  className="p-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] flex items-center justify-between min-w-0 gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-[#111318] mb-0.5 truncate">
                      {cap.name}
                    </div>
                    <div className="text-[11px] text-[#626873] break-words">
                      {cap.description}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold shrink-0 ml-2 ${
                      cap.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-white text-[#8B919B] border border-[#E5E5E2]'
                    }`}
                  >
                    {cap.status === 'active' ? 'Available' : 'Supported'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Security & Scopes */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm flex flex-col justify-between h-full min-w-0">
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-[#6D4AFF] shrink-0" />
              <h3 className="text-base font-bold text-[#111318] truncate">
                Security & Scopes
              </h3>
            </div>
            <p className="text-xs text-[#626873] mb-5">
              Granular access tokens are encrypted at rest using AES-256 GCM.
            </p>

            <div className="flex flex-col gap-3">
              {connector.requiredScopes.map((scope) => (
                <div
                  key={scope}
                  className="p-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] flex items-center justify-between min-w-0 gap-2"
                >
                  <span className="font-mono text-xs text-[#111318] font-semibold truncate">{scope}</span>
                  <span className="text-[10px] font-mono text-[#6D4AFF] bg-purple-50 px-2 py-0.5 rounded border border-purple-200 shrink-0">
                    Required Scope
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-auto border-t border-[#EFEFEA] text-[11px] text-[#8B919B] leading-relaxed break-words">
            NEXUS will only use granted scopes to fulfill instructions explicitly delegated by authorized agents in your workspace.
          </div>
        </div>
      </div>

      {/* Modals */}
      {connection && connector.id === 'github' && (
        <RepositoryListModal
          isOpen={reposModalOpen}
          connection={connection}
          onClose={() => setReposModalOpen(false)}
        />
      )}

      {connection && connector.id === 'vercel' && (
        <VercelProjectsModal
          isOpen={vercelProjectsModalOpen}
          connection={connection}
          onClose={() => setVercelProjectsModalOpen(false)}
        />
      )}

      <DisconnectDialog
        isOpen={disconnectModalOpen}
        connectorName={connector.name}
        brand={connector.brand}
        accountName={connection?.provider_account_name || 'Account'}
        loading={disconnectLoading}
        onConfirm={handleConfirmDisconnect}
        onClose={() => setDisconnectModalOpen(false)}
      />

      <ConnectorSetupModal
        isOpen={setupModalOpen}
        connectorId={connector.id}
        onClose={() => setSetupModalOpen(false)}
        onConnected={async () => {
          if (currentWorkspace?.id) {
            const { connections } = await getWorkspaceConnections(currentWorkspace.id);
            const active = connections.find((c) => c.connector_id === id && c.status === 'connected');
            setConnection(active || null);
          }
        }}
      />
    </div>
  );
};
