import React, { useState } from 'react';
import {
  X,
  Bot,
  Key,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Link2,
} from 'lucide-react';
import { ProtocolAuthType } from '../../types/database';
import { AgentCard } from '../../types/a2a';
import { discoverAgentCard, registerExternalAgent } from '../../services/externalAgentService';

interface AddExternalAgentModalProps {
  isOpen: boolean;
  workspaceId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddExternalAgentModal: React.FC<AddExternalAgentModalProps> = ({
  isOpen,
  workspaceId,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [endpointUrl, setEndpointUrl] = useState('https://nexus-compliance-agent.internal');
  const [agentCardUrl, setAgentCardUrl] = useState('');
  const [description, setDescription] = useState('');
  const [authType, setAuthType] = useState<ProtocolAuthType>('none');
  const [headerName, setHeaderName] = useState('Authorization');
  const [authToken, setAuthToken] = useState('');
  const [timeoutMs, setTimeoutMs] = useState(30000);

  // Discovery state
  const [discovering, setDiscovering] = useState(false);
  const [discoveredCard, setDiscoveredCard] = useState<AgentCard | null>(null);
  const [discoveryError, setDiscoveryError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleFetchCard = async () => {
    if (!endpointUrl) {
      setDiscoveryError('Please provide a valid agent endpoint URL.');
      return;
    }

    setDiscovering(true);
    setDiscoveryError(null);

    const res = await discoverAgentCard(
      endpointUrl,
      agentCardUrl || undefined,
      authType,
      headerName,
      authToken
    );

    setDiscovering(false);

    if (!res.success || !res.card) {
      setDiscoveryError(res.error || 'Failed to retrieve Agent Card.');
      return;
    }

    setDiscoveredCard(res.card);
    if (!name && res.card.name) {
      setName(res.card.name);
    }
    if (!description && res.card.description) {
      setDescription(res.card.description);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !endpointUrl || !discoveredCard) return;

    setSaving(true);
    const res = await registerExternalAgent({
      workspace_id: workspaceId,
      name,
      description,
      endpoint_url: endpointUrl,
      agent_card_url: agentCardUrl || undefined,
      auth_type: authType,
      header_name: headerName,
      auth_token: authToken,
      timeout_ms: timeoutMs,
    });

    setSaving(false);

    if (res.error) {
      setDiscoveryError(res.error);
    } else {
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E5E5E2] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-[#EFEFEA] flex items-center justify-between bg-[#FAFAF8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
              <Bot className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#111318]">Connect External Agent (A2A)</h2>
              <p className="text-xs text-[#626873]">
                Agent-to-Agent protocol integration via published Agent Card
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#8B919B] hover:text-[#111318] hover:bg-white border border-transparent hover:border-[#E5E5E2] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
          {/* Endpoint URL & Handshake */}
          <div>
            <label className="block text-xs font-semibold text-[#111318] mb-1.5">
              Agent Service Endpoint URL <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={endpointUrl}
                onChange={(e) => setEndpointUrl(e.target.value)}
                placeholder="https://agent.example.com or http://localhost:8888"
                className="flex-1 h-10 px-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] focus:border-[#6D4AFF] text-xs font-mono text-[#111318] placeholder:text-[#8B919B] outline-none shadow-sm transition-colors"
              />
              <button
                type="button"
                onClick={handleFetchCard}
                disabled={discovering || !endpointUrl}
                className="px-4 h-10 rounded-xl bg-[#111318] hover:bg-black text-white text-xs font-semibold shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
              >
                {discovering ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
                <span>{discovering ? 'Fetching...' : 'Fetch Agent Card'}</span>
              </button>
            </div>
            <p className="text-[11px] text-[#8B919B] mt-1.5">
              NEXUS probes <code className="font-mono bg-stone-100 px-1 py-0.5 rounded">/.well-known/agent.json</code> to discover declared skills, schemas, and provider certification.
            </p>
          </div>

          {/* Agent Card URL (Optional override) */}
          <div>
            <label className="block text-xs font-semibold text-[#111318] mb-1.5">
              Custom Agent Card Path <span className="text-[#8B919B] font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={agentCardUrl}
              onChange={(e) => setAgentCardUrl(e.target.value)}
              placeholder="Defaults to /.well-known/agent.json"
              className="w-full h-10 px-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] focus:border-[#6D4AFF] text-xs font-mono text-[#111318] placeholder:text-[#8B919B] outline-none shadow-sm transition-colors"
            />
          </div>

          {/* Name & Timeout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#111318] mb-1.5">
                Display Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Enterprise Compliance Agent"
                className="w-full h-10 px-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] focus:border-[#6D4AFF] text-xs text-[#111318] placeholder:text-[#8B919B] outline-none shadow-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111318] mb-1.5">
                Timeout (ms)
              </label>
              <input
                type="number"
                value={timeoutMs}
                onChange={(e) => setTimeoutMs(Number(e.target.value))}
                className="w-full h-10 px-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] focus:border-[#6D4AFF] text-xs font-mono text-[#111318] outline-none shadow-sm transition-colors"
              />
            </div>
          </div>

          {/* Authentication */}
          <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#111318] flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#6D4AFF]" />
                Authentication / Secret
              </span>
              <select
                value={authType}
                onChange={(e) => setAuthType(e.target.value as ProtocolAuthType)}
                className="text-xs px-2.5 py-1 rounded-lg bg-white border border-[#E5E5E2] text-[#111318] outline-none"
              >
                <option value="none">No Authentication</option>
                <option value="bearer">Bearer Token</option>
                <option value="api_key">API Key Header</option>
                <option value="custom_header">Custom Header</option>
              </select>
            </div>

            {authType !== 'none' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {(authType === 'api_key' || authType === 'custom_header') && (
                  <div>
                    <label className="block text-[11px] font-medium text-[#626873] mb-1">
                      Header Name
                    </label>
                    <input
                      type="text"
                      value={headerName}
                      onChange={(e) => setHeaderName(e.target.value)}
                      placeholder="X-API-Key"
                      className="w-full h-9 px-3 rounded-lg bg-white border border-[#E5E5E2] text-xs font-mono text-[#111318] outline-none"
                    />
                  </div>
                )}
                <div className={authType === 'bearer' ? 'col-span-2' : ''}>
                  <label className="block text-[11px] font-medium text-[#626873] mb-1">
                    Secret Key / Token (Encrypted with AES-256 GCM)
                  </label>
                  <input
                    type="password"
                    value={authToken}
                    onChange={(e) => setAuthToken(e.target.value)}
                    placeholder="Enter secret token..."
                    className="w-full h-9 px-3 rounded-lg bg-white border border-[#E5E5E2] text-xs font-mono text-[#111318] outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Feedback & Error Messages */}
          {discoveryError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{discoveryError}</span>
            </div>
          )}

          {/* Discovered Agent Card Preview */}
          {discoveredCard && (
            <div className="p-4 rounded-xl bg-white border border-[#6D4AFF]/30 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-[#111318]">
                    Verified Agent Card (v{discoveredCard.version})
                  </span>
                </div>
                {discoveredCard.provider?.organization && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {discoveredCard.provider.organization}
                  </span>
                )}
              </div>

              <p className="text-xs text-[#626873] leading-relaxed">
                {discoveredCard.description}
              </p>

              <div className="pt-2 border-t border-[#EFEFEA] space-y-2">
                <span className="block text-[11px] font-bold text-[#111318]">
                  Exposed Skills ({discoveredCard.skills.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {discoveredCard.skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="p-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E5E2] text-xs"
                    >
                      <span className="font-mono font-bold text-[#111318] block">{skill.name}</span>
                      <span className="text-[11px] text-[#626873] line-clamp-2 mt-0.5">
                        {skill.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#EFEFEA] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#626873] hover:text-[#111318] hover:bg-[#FAFAF8] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !name || !endpointUrl || !discoveredCard}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{saving ? 'Registering...' : 'Register External Agent'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
