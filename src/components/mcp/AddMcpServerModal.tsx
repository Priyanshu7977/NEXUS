import React, { useState } from 'react';
import {
  X,
  Server,
  Key,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Cpu,
  Layers,
} from 'lucide-react';
import { McpTransportType, ProtocolAuthType } from '../../types/database';
import { McpToolDefinition } from '../../types/mcp';
import { testMcpServerConnection, registerMcpServer } from '../../services/mcpService';

interface AddMcpServerModalProps {
  isOpen: boolean;
  workspaceId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddMcpServerModal: React.FC<AddMcpServerModalProps> = ({
  isOpen,
  workspaceId,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [serverUrl, setServerUrl] = useState('https://mcp.nexus-demo.internal');
  const [description, setDescription] = useState('');
  const [transportType, setTransportType] = useState<McpTransportType>('streamable_http');
  const [authType, setAuthType] = useState<ProtocolAuthType>('none');
  const [headerName, setHeaderName] = useState('Authorization');
  const [authToken, setAuthToken] = useState('');

  // Discovery state
  const [testing, setTesting] = useState(false);
  const [discoveredTools, setDiscoveredTools] = useState<McpToolDefinition[]>([]);
  const [enabledTools, setEnabledTools] = useState<Record<string, boolean>>({});
  const [testError, setTestError] = useState<string | null>(null);
  const [protocolVersion, setProtocolVersion] = useState<string>('2024-11-05');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!serverUrl) {
      setTestError('Please enter a valid MCP server endpoint URL.');
      return;
    }

    setTesting(true);
    setTestError(null);

    const res = await testMcpServerConnection(
      serverUrl,
      transportType,
      authType,
      headerName,
      authToken
    );

    setTesting(false);

    if (!res.success) {
      setTestError(res.error || 'Connection failed during MCP handshake.');
      return;
    }

    setDiscoveredTools(res.tools);
    setProtocolVersion(res.protocolVersion);
    if (!name && res.serverInfo?.name) {
      setName(res.serverInfo.name);
    }
    if (!description && res.serverInfo?.description) {
      setDescription(res.serverInfo.description);
    }

    // Default enables safe tools, leaves high-risk unchecked
    const defaultEnabled: Record<string, boolean> = {};
    for (const t of res.tools) {
      defaultEnabled[t.name] = !t.is_high_risk;
    }
    setEnabledTools(defaultEnabled);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !serverUrl) return;

    setSaving(true);
    const selectedTools = Object.entries(enabledTools)
      .filter(([_, isEnabled]) => isEnabled)
      .map(([toolName]) => toolName);

    const res = await registerMcpServer({
      workspace_id: workspaceId,
      name,
      description,
      server_url: serverUrl,
      transport_type: transportType,
      auth_type: authType,
      header_name: headerName,
      auth_token: authToken,
      enabled_tools: selectedTools,
    });

    setSaving(false);

    if (res.error) {
      setTestError(res.error);
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
            <div className="w-10 h-10 rounded-xl bg-[#6D4AFF]/10 border border-[#6D4AFF]/20 flex items-center justify-center">
              <Server className="w-5 h-5 text-[#6D4AFF]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#111318]">Connect MCP Tool Server</h2>
              <p className="text-xs text-[#626873]">
                Model Context Protocol (MCP) JSON-RPC standardized tool integration
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

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
          {/* Server URL & Handshake */}
          <div>
            <label className="block text-xs font-semibold text-[#111318] mb-1.5">
              Server Endpoint URL <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                placeholder="https://mcp.yourdomain.com or http://localhost:8000"
                className="flex-1 h-10 px-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] focus:border-[#6D4AFF] text-xs font-mono text-[#111318] placeholder:text-[#8B919B] outline-none shadow-sm transition-colors"
              />
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing || !serverUrl}
                className="px-4 h-10 rounded-xl bg-[#111318] hover:bg-black text-white text-xs font-semibold shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
              >
                {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Cpu className="w-3.5 h-3.5" />}
                <span>{testing ? 'Probing...' : 'Discover Tools'}</span>
              </button>
            </div>
            <p className="text-[11px] text-[#8B919B] mt-1.5">
              Enter the base endpoint. NEXUS will issue standard MCP <code className="font-mono bg-stone-100 px-1 py-0.5 rounded">initialize</code> and <code className="font-mono bg-stone-100 px-1 py-0.5 rounded">tools/list</code> calls.
            </p>
          </div>

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#111318] mb-1.5">
                Server Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Infrastructure Security MCP"
                className="w-full h-10 px-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] focus:border-[#6D4AFF] text-xs text-[#111318] placeholder:text-[#8B919B] outline-none shadow-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111318] mb-1.5">
                Transport Type
              </label>
              <select
                value={transportType}
                onChange={(e) => setTransportType(e.target.value as McpTransportType)}
                className="w-full h-10 px-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] focus:border-[#6D4AFF] text-xs text-[#111318] outline-none shadow-sm transition-colors"
              >
                <option value="streamable_http">Streamable HTTP (Recommended)</option>
                <option value="sse">Server-Sent Events (SSE)</option>
                <option value="stdio" disabled>stdio (Local daemon only — Coming Soon)</option>
                <option value="websocket" disabled>WebSocket (Coming Soon)</option>
              </select>
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

          {/* Test Feedback / Errors */}
          {testError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{testError}</span>
            </div>
          )}

          {/* Discovered Tools & Permissions Checklist */}
          {discoveredTools.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-[#111318]">
                    Discovered Tools ({discoveredTools.length}) — MCP v{protocolVersion}
                  </span>
                </div>
                <span className="text-[11px] text-[#626873]">
                  Select tools permitted for workspace agent workflows
                </span>
              </div>

              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {discoveredTools.map((tool) => {
                  const isChecked = Boolean(enabledTools[tool.name]);
                  return (
                    <div
                      key={tool.name}
                      onClick={() =>
                        setEnabledTools((prev) => ({
                          ...prev,
                          [tool.name]: !prev[tool.name],
                        }))
                      }
                      className={`p-3 rounded-xl border transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                        isChecked
                          ? 'bg-white border-[#6D4AFF]/40 shadow-xs'
                          : 'bg-[#FAFAF8] border-[#E5E5E2] opacity-75'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-0.5 rounded text-[#6D4AFF] focus:ring-0 cursor-pointer"
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono font-bold text-[#111318]">
                              {tool.name}
                            </span>
                            {tool.is_high_risk ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold">
                                <ShieldAlert className="w-3 h-3 text-amber-600" />
                                HIGH RISK
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                                SAFE
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#626873] mt-0.5 leading-relaxed">
                            {tool.description}
                          </p>
                          {tool.is_high_risk && tool.risk_reason && (
                            <p className="text-[10px] text-amber-600 font-medium mt-1">
                              Warning: {tool.risk_reason}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
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
              disabled={saving || !name || !serverUrl || discoveredTools.length === 0}
              className="px-5 py-2 rounded-xl bg-[#6D4AFF] hover:bg-[#5B3CE6] text-white text-xs font-semibold shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Layers className="w-3.5 h-3.5" />}
              <span>{saving ? 'Connecting...' : 'Save & Enable Server'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
