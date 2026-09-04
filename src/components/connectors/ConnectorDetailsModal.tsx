import React, { useState } from 'react';
import { ConnectorDefinition } from '../../types/connector';
import { ConnectorConnection } from '../../types/database';
import { BrandLogo } from '../brand/BrandLogo';
import {
  X,
  FolderGit2,
  Trash2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Calendar,
  Radio,
  Layers,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface ConnectorDetailsModalProps {
  isOpen: boolean;
  connector: ConnectorDefinition;
  connection: ConnectorConnection | null;
  onClose: () => void;
  onViewRepositories: () => void;
  onRequestDisconnect: () => void;
}

export const ConnectorDetailsModal: React.FC<ConnectorDetailsModalProps> = ({
  isOpen,
  connector,
  connection,
  onClose,
  onViewRepositories,
  onRequestDisconnect,
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'webhooks'>('overview');

  if (!isOpen) return null;

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Recent';
    try {
      return new Date(isoString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const isConnected = connection && connection.status === 'connected';
  const webhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/webhooks/github`
    : 'https://nexus.app/api/webhooks/github';

  const handleCopyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-white border border-[#E5E5E2] rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.12)] text-left flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#EFEFEA] flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] flex items-center justify-center">
              <BrandLogo brand={connector.brand} size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#111318]">
                  {connector.name} Integration
                </h3>
                {isConnected ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    Connected
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-[#FAFAF8] text-[#8B919B] border border-[#E5E5E2] text-[10px] font-mono">
                    Not Connected
                  </span>
                )}
              </div>
              <p className="text-xs text-[#626873]">
                {connector.description}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#8B919B] hover:text-[#111318] hover:bg-[#FAFAF8] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs for GitHub */}
        {connector.id === 'github' && isConnected && (
          <div className="px-6 flex items-center gap-4 border-b border-[#EFEFEA] bg-[#FAFAF8] text-xs font-semibold text-[#626873]">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'border-[#6D4AFF] text-[#6D4AFF]'
                  : 'border-transparent hover:text-[#111318]'
              }`}
            >
              Overview & Capabilities
            </button>
            <button
              onClick={() => setActiveTab('webhooks')}
              className={`py-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'webhooks'
                  ? 'border-[#6D4AFF] text-[#6D4AFF]'
                  : 'border-transparent hover:text-[#111318]'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Webhooks & Real Events</span>
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === 'webhooks' && connector.id === 'github' ? (
            /* Webhooks & Ingestion Tab */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#111318] flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-[#6D4AFF]" />
                    <span>Webhook Endpoint</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase font-semibold">
                    Ready for events
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={webhookUrl}
                    className="w-full h-9 px-3 rounded-lg bg-white border border-[#E5E5E2] text-xs font-mono text-[#111318] outline-none"
                  />
                  <button
                    onClick={handleCopyWebhookUrl}
                    className="p-2 rounded-lg bg-white border border-[#E5E5E2] hover:bg-[#FAFAF8] text-[#626873] hover:text-[#111318] transition-colors cursor-pointer shrink-0"
                    title="Copy Webhook URL"
                  >
                    {copiedUrl ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-[#626873] leading-relaxed">
                  Configure this URL in your GitHub repository Webhooks settings with Content Type <span className="font-mono text-[#111318]">application/json</span>.
                </p>
              </div>

              {/* Event Subscriptions Matrix */}
              <div className="p-4 rounded-xl bg-white border border-[#E5E5E2] space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-[#8B919B]">
                  Subscribed Event Triggers
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#FAFAF8] border border-[#EFEFEA]">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <div>
                        <span className="font-semibold text-[#111318]">Push Events</span>
                        <p className="text-[11px] text-[#626873]">Triggers on branch commits, merges, and code updates.</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      ACTIVE
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#FAFAF8] border border-[#EFEFEA] opacity-60">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#8B919B]" />
                      <div>
                        <span className="font-semibold text-[#111318]">Pull Requests</span>
                        <p className="text-[11px] text-[#626873]">PR open, synchronize, review request events.</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-[#8B919B] bg-white px-2 py-0.5 rounded border border-[#E5E5E2]">
                      PLANNED
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#FAFAF8] border border-[#EFEFEA] opacity-60">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#8B919B]" />
                      <div>
                        <span className="font-semibold text-[#111318]">Releases</span>
                        <p className="text-[11px] text-[#626873]">Release publication and tagging events.</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-[#8B919B] bg-white px-2 py-0.5 rounded border border-[#E5E5E2]">
                      PLANNED
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Overview & Capabilities Tab */
            <>
              {/* Account Profile Card if connected */}
              {isConnected && (
                <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2]">
                  <div className="text-xs font-semibold text-[#8B919B] uppercase tracking-wider mb-3">
                    Connected Provider Account
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {connection.provider_avatar_url ? (
                        <img
                          src={connection.provider_avatar_url}
                          alt={connection.provider_account_name}
                          className="w-11 h-11 rounded-full border border-[#E5E5E2] object-cover"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-[#111318] text-white flex items-center justify-center font-bold text-sm">
                          {connection.provider_account_name.substring(0, 2).toUpperCase()}
                        </div>
                      )}

                      <div>
                        <h4 className="text-sm font-bold text-[#111318] flex items-center gap-1.5">
                          <span>{connection.metadata?.name || connection.provider_account_name}</span>
                          <span className="text-xs font-mono font-normal text-[#6D4AFF]">
                            @{connection.provider_account_name}
                          </span>
                        </h4>
                        <div className="flex items-center gap-3 text-[11px] text-[#8B919B] mt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Connected {formatDate(connection.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={onViewRepositories}
                      className="hidden sm:flex items-center gap-1.5"
                    >
                      {connector.id === 'vercel' ? (
                        <>
                          <Layers className="w-3.5 h-3.5 text-[#6D4AFF]" />
                          <span>View Projects</span>
                        </>
                      ) : (
                        <>
                          <FolderGit2 className="w-3.5 h-3.5 text-[#6D4AFF]" />
                          <span>View Repositories</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Mobile View Repositories/Projects Button */}
                  <div className="mt-3 sm:hidden">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={onViewRepositories}
                      className="w-full justify-center flex items-center gap-1.5"
                    >
                      <FolderGit2 className="w-3.5 h-3.5 text-[#6D4AFF]" />
                      <span>{connector.id === 'vercel' ? 'View Projects' : 'View Repositories'}</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* Permissions Matrix */}
              <div>
                <h4 className="text-xs font-semibold text-[#8B919B] uppercase tracking-wider mb-2.5">
                  Capabilities & Permissions
                </h4>
                <div className="divide-y divide-[#EFEFEA] rounded-xl border border-[#E5E5E2] bg-white overflow-hidden">
                  {connector.capabilities.map((cap) => {
                    const isCapabilityActive = isConnected && cap.status === 'active';
                    return (
                      <div key={cap.id} className="p-3.5 flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5">
                            {isCapabilityActive ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            ) : (
                              <Clock className="w-4 h-4 text-[#8B919B] flex-shrink-0" />
                            )}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-[#111318]">
                              {cap.name}
                            </div>
                            <p className="text-[11px] text-[#626873] leading-relaxed">
                              {cap.description}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap ${
                            isCapabilityActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-[#FAFAF8] text-[#8B919B] border border-[#E5E5E2]'
                          }`}
                        >
                          {isCapabilityActive ? 'Granted' : 'Planned'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Security Guarantee */}
              <div className="p-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] flex items-start gap-3 text-xs text-[#626873]">
                <ShieldCheck className="w-4 h-4 text-[#6D4AFF] flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px]">
                  Tokens are stored using AES-256 GCM encryption and scoped strictly to workspace members. Access credentials are never shared outside authorized agent task executions.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#FAFAF8] border-t border-[#EFEFEA] flex items-center justify-between">
          {isConnected ? (
            <button
              type="button"
              onClick={onRequestDisconnect}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 hover:border-red-200 border border-transparent transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Disconnect {connector.name}</span>
            </button>
          ) : (
            <span className="text-xs text-[#8B919B]">Available for connection</span>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-white text-[#111318] hover:bg-[#F4F4F0] border border-[#E5E5E2] font-medium text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
