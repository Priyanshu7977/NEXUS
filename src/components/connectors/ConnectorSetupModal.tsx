import React, { useState } from 'react';
import { BrandLogo } from '../brand/BrandLogo';
import { X, Key, ExternalLink, Copy, Check, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { getGitHubRedirectUri } from '../../services/githubService';
import { connectWithToken, connectVercelWithToken, connectGenericConnectorWithToken } from '../../services/connectorService';
import { getConnectorById } from '../../connectors/registry';
import { useAuth } from '../../context/AuthContext';

interface ConnectorSetupModalProps {
  isOpen: boolean;
  connectorId?: string;
  onClose: () => void;
  onConnected: () => void;
}

export const ConnectorSetupModal: React.FC<ConnectorSetupModalProps> = ({
  isOpen,
  connectorId = 'github',
  onClose,
  onConnected,
}) => {
  const { currentWorkspace } = useAuth();
  const [activeTab, setActiveTab] = useState<'oauth' | 'pat'>('pat');
  const [patToken, setPatToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedUri, setCopiedUri] = useState(false);

  if (!isOpen) return null;

  const isVercel = connectorId === 'vercel';
  const isGitHub = connectorId === 'github';
  const connDef = getConnectorById(connectorId);
  const connectorName = connDef?.name || (isVercel ? 'Vercel' : (isGitHub ? 'GitHub' : connectorId));
  const connectorBrand = connDef?.brand || (isVercel ? 'vercel' : 'github');
  const redirectUri = getGitHubRedirectUri();

  const handleCopyUri = () => {
    navigator.clipboard.writeText(redirectUri);
    setCopiedUri(true);
    setTimeout(() => setCopiedUri(false), 2000);
  };

  const handlePatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patToken.trim()) {
      setError(`Please provide credentials or an access token for ${connectorName}.`);
      return;
    }

    if (!currentWorkspace?.id) {
      setError('Workspace not loaded. Please select a workspace.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = isVercel
        ? await connectVercelWithToken(currentWorkspace.id, patToken.trim())
        : isGitHub
        ? await connectWithToken(currentWorkspace.id, patToken.trim())
        : await connectGenericConnectorWithToken(currentWorkspace.id, connectorId, patToken.trim());

      if (res.error) {
        setError(res.error);
      } else {
        setPatToken('');
        onConnected();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-white border border-[#E5E5E2] rounded-2xl p-6 shadow-[0_16px_40px_rgba(0,0,0,0.12)] text-left flex flex-col max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EFEFEA] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] flex items-center justify-center">
              <BrandLogo brand={connectorBrand} size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111318]">
                Configure {connectorName} Integration
              </h3>
              <p className="text-xs text-[#626873]">
                {isVercel
                  ? 'Connect via Vercel Personal Access Token to enable deployments'
                  : isGitHub
                  ? 'Connect via Personal Access Token or configure OAuth App keys'
                  : `Securely save ${connectorName} credentials into your encrypted workspace vault`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8B919B] hover:text-[#111318] hover:bg-[#FAFAF8] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher (only for GitHub) */}
        {!isVercel && (
          <div className="flex items-center gap-2 p-1 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] mb-5">
            <button
              type="button"
              onClick={() => { setActiveTab('pat'); setError(''); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'pat'
                  ? 'bg-white text-[#111318] shadow-sm'
                  : 'text-[#626873] hover:text-[#111318]'
              }`}
            >
              <Key className="w-3.5 h-3.5 text-[#6D4AFF]" />
              Personal Access Token (Instant)
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('oauth'); setError(''); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'oauth'
                  ? 'bg-white text-[#111318] shadow-sm'
                  : 'text-[#626873] hover:text-[#111318]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              GitHub OAuth App Setup
            </button>
          </div>
        )}

        {/* Tab 1: Personal Access Token / API Key Form */}
        {(activeTab === 'pat' || !isGitHub) && (
          <form onSubmit={handlePatSubmit} className="flex flex-col gap-4">
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 leading-relaxed">
              {isVercel ? (
                <>
                  <span className="font-semibold">Quick Start:</span> Create a Vercel Personal Access Token from your Vercel Account Settings to deploy projects directly.
                </>
              ) : isGitHub ? (
                <>
                  <span className="font-semibold">Quick Start:</span> Generate a GitHub Personal Access Token (classic) with <code className="px-1 py-0.5 rounded bg-blue-100/80 font-mono text-[11px]">repo</code> and <code className="px-1 py-0.5 rounded bg-blue-100/80 font-mono text-[11px]">read:user</code> scopes to connect immediately.
                </>
              ) : (
                <>
                  <span className="font-semibold">Quick Start:</span> Provide your {connectorName} API key or access token. Credentials are AES-256 encrypted and stored securely in your workspace vault.
                </>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#111318] mb-1.5">
                {isVercel
                  ? 'Vercel Access Token'
                  : isGitHub
                  ? 'GitHub Token (Personal Access Token)'
                  : `${connectorName} API Key / Token`}
              </label>
              <input
                type="password"
                value={patToken}
                onChange={(e) => setPatToken(e.target.value)}
                placeholder={
                  isVercel
                    ? 'vercel_pat_xxxxxxxxxxxxxxxxxxxx'
                    : isGitHub
                    ? 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
                    : `sk_${connectorId}_xxxxxxxxxxxxxxxxxxxxxxxx`
                }
                className="w-full h-10 px-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] focus:border-[#6D4AFF] focus:bg-white text-xs font-mono text-[#111318] placeholder:text-[#8B919B] outline-none transition-colors"
              />
              <div className="flex items-center justify-between mt-1.5 text-[11px] text-[#8B919B]">
                <span>Token is encrypted using AES-256 before storage.</span>
                {isGitHub && (
                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo,read:user&description=NEXUS+Agent+Orchestration"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#6D4AFF] hover:underline flex items-center gap-0.5 font-medium"
                  >
                    Generate Token <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {isVercel && (
                  <a
                    href="https://vercel.com/account/tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#6D4AFF] hover:underline flex items-center gap-0.5 font-medium"
                  >
                    Generate Token <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EFEFEA] mt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[#626873] hover:text-[#111318] hover:bg-[#FAFAF8] border border-[#E5E5E2] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={loading || !patToken.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    Validating...
                  </>
                ) : (
                  `Connect ${connectorName}`
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Tab 2: Full OAuth App Setup Guide (GitHub only) */}
        {activeTab === 'oauth' && !isVercel && (
          <div className="flex flex-col gap-4 text-xs text-[#626873]">
            <p className="leading-relaxed">
              To enable 1-click GitHub OAuth logins for your entire team across workspaces, register an OAuth App in your GitHub organization or developer settings.
            </p>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2]">
                <div className="font-semibold text-[#111318] mb-1">
                  1. Authorization Callback URL
                </div>
                <p className="text-[11px] text-[#8B919B] mb-2">
                  Paste this exact URL in your GitHub OAuth App settings:
                </p>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#E5E5E2] font-mono text-[11px] text-[#111318]">
                  <span className="truncate mr-2">{redirectUri}</span>
                  <button
                    type="button"
                    onClick={handleCopyUri}
                    className="p-1 rounded text-[#626873] hover:text-[#111318] hover:bg-[#FAFAF8] transition-colors flex items-center gap-1 text-[10px]"
                  >
                    {copiedUri ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-sans">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="font-sans">Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2]">
                <div className="font-semibold text-[#111318] mb-1">
                  2. Add Environment Variables in .env
                </div>
                <p className="text-[11px] text-[#8B919B] mb-2">
                  Add the generated Client ID and Client Secret to your project root <code className="font-mono text-[#111318]">.env</code>:
                </p>
                <pre className="p-2.5 rounded-lg bg-[#111318] text-[#F5F7FA] font-mono text-[11px] overflow-x-auto">
{`VITE_GITHUB_CLIENT_ID=your_github_client_id
VITE_GITHUB_CLIENT_SECRET=your_github_client_secret
VITE_CONNECTOR_ENCRYPTION_KEY=32_character_random_secret_key`}
                </pre>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#EFEFEA] mt-2">
              <a
                href="https://github.com/settings/applications/new"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#6D4AFF] hover:underline flex items-center gap-1 font-medium"
              >
                Open GitHub Developer Settings <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-[#111318] text-white hover:bg-black transition-colors"
              >
                Close Guide
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

