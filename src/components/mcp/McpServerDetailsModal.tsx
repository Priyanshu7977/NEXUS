import React, { useState } from 'react';
import {
  X,
  Server,
  Activity,
  ShieldAlert,
  Trash2,
  CheckCircle2,
  Code2,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';
import { McpServerConfig } from '../../types/mcp';
import {
  updateMcpToolPermissions,
  deleteMcpServer,
  pingMcpServer,
} from '../../services/mcpService';

interface McpServerDetailsModalProps {
  isOpen: boolean;
  server: McpServerConfig;
  workspaceId: string;
  onClose: () => void;
  onUpdated: () => void;
}

export const McpServerDetailsModal: React.FC<McpServerDetailsModalProps> = ({
  isOpen,
  server,
  workspaceId,
  onClose,
  onUpdated,
}) => {
  const [enabledTools, setEnabledTools] = useState<string[]>(server.enabled_tools || []);
  const [expandedTool, setExpandedTool] = useState<string | null>(null);
  const [pinging, setPinging] = useState(false);
  const [pingResult, setPingResult] = useState<{ healthy: boolean; latencyMs: number } | null>(null);
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!isOpen) return null;

  const handleToggleTool = async (toolName: string) => {
    const updated = enabledTools.includes(toolName)
      ? enabledTools.filter((t) => t !== toolName)
      : [...enabledTools, toolName];

    setEnabledTools(updated);
    setSavingPermissions(true);
    await updateMcpToolPermissions(workspaceId, server.id, updated);
    setSavingPermissions(false);
    onUpdated();
  };

  const handlePing = async () => {
    setPinging(true);
    const res = await pingMcpServer(workspaceId, server.id);
    setPinging(false);
    setPingResult(res);
    onUpdated();
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to disconnect MCP Server "${server.name}"?`)) {
      return;
    }
    setDeleting(true);
    await deleteMcpServer(workspaceId, server.id);
    setDeleting(false);
    onUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-[#E5E5E2] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#EFEFEA] flex items-center justify-between bg-[#FAFAF8]">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#6D4AFF]/10 border border-[#6D4AFF]/20 flex items-center justify-center">
              <Server className="w-6 h-6 text-[#6D4AFF]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#111318]">{server.name}</h2>
                <span className="font-mono text-xs text-[#6D4AFF] bg-[#6D4AFF]/10 px-2 py-0.5 rounded">
                  mcp:{server.slug}
                </span>
                {server.status === 'connected' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    Connected
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-semibold">
                    Error
                  </span>
                )}
              </div>
              <p className="text-xs text-[#626873] mt-0.5 font-mono truncate max-w-md">
                {server.server_url}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePing}
              disabled={pinging}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAFAF8] text-[#111318] border border-[#E5E5E2] text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
            >
              {pinging ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5 text-[#6D4AFF]" />}
              <span>{pinging ? 'Pinging...' : 'Test Health'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-[#8B919B] hover:text-[#111318] hover:bg-white border border-transparent hover:border-[#E5E5E2] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
          {/* Health & Ping Feedback */}
          {pingResult && (
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                pingResult.healthy
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold">
                  {pingResult.healthy ? 'MCP Protocol Probe Succeeded' : 'Health Probe Failed'}
                </span>
              </div>
              <span className="font-mono">{pingResult.latencyMs}ms latency</span>
            </div>
          )}

          {/* Info Summary Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2]">
              <span className="block text-[10px] uppercase font-mono text-[#8B919B]">Protocol Version</span>
              <span className="text-xs font-bold font-mono text-[#111318]">{server.protocol_version}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2]">
              <span className="block text-[10px] uppercase font-mono text-[#8B919B]">Transport</span>
              <span className="text-xs font-bold font-mono text-[#111318]">{server.transport_type}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2]">
              <span className="block text-[10px] uppercase font-mono text-[#8B919B]">Auth Method</span>
              <span className="text-xs font-bold text-[#111318]">{server.auth_type}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2]">
              <span className="block text-[10px] uppercase font-mono text-[#8B919B]">Active Tools</span>
              <span className="text-xs font-bold text-[#6D4AFF]">
                {enabledTools.length} / {server.capabilities?.length || 0} Enabled
              </span>
            </div>
          </div>

          {/* Discovered Tools List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#626873]">
                Declared MCP Tools & Access Controls
              </h3>
              {savingPermissions && (
                <span className="text-[11px] text-[#6D4AFF] flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                </span>
              )}
            </div>

            <div className="space-y-3">
              {(server.capabilities || []).map((tool) => {
                const isEnabled = enabledTools.includes(tool.name);
                const isExpanded = expandedTool === tool.name;

                return (
                  <div
                    key={tool.name}
                    className="p-4 rounded-xl bg-white border border-[#E5E5E2] hover:border-[#D4D4CE] transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => handleToggleTool(tool.name)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none mt-0.5 ${
                            isEnabled ? 'bg-[#6D4AFF]' : 'bg-[#E5E5E2]'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              isEnabled ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono font-bold text-[#111318]">
                              {tool.name}
                            </span>
                            <span className="text-[10px] font-mono text-[#8B919B]">
                              mcp.{server.slug}.{tool.name}
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
                          <p className="text-xs text-[#626873] mt-1 leading-relaxed">
                            {tool.description}
                          </p>
                          {tool.is_high_risk && tool.risk_reason && (
                            <p className="text-[11px] text-amber-600 font-medium mt-1">
                              Security Note: {tool.risk_reason}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setExpandedTool(isExpanded ? null : tool.name)}
                        className="p-1.5 rounded-lg text-[#8B919B] hover:text-[#111318] hover:bg-[#FAFAF8] transition-colors cursor-pointer"
                        title="View JSON Schema"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Expandable JSON Schema Inspector */}
                    {isExpanded && (
                      <div className="p-3 rounded-lg bg-[#111318] text-white text-[11px] font-mono overflow-x-auto">
                        <div className="flex items-center gap-1.5 text-stone-400 mb-1">
                          <Code2 className="w-3.5 h-3.5" />
                          <span>Input Schema</span>
                        </div>
                        <pre>{JSON.stringify(tool.inputSchema, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#EFEFEA] bg-[#FAFAF8] flex items-center justify-between">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
          >
            {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            <span>Disconnect Server</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#111318] hover:bg-black text-white text-xs font-semibold shadow-sm cursor-pointer transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
