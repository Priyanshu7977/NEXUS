import React, { useState } from 'react';
import {
  X,
  Bot,
  Activity,
  Trash2,
  CheckCircle2,
  Code2,
  Loader2,
  Play,
  Sparkles,
} from 'lucide-react';
import { ExternalAgentConfig } from '../../types/a2a';
import {
  deleteExternalAgent,
  pingExternalAgent,
  invokeExternalAgent,
} from '../../services/externalAgentService';

interface ExternalAgentDetailsModalProps {
  isOpen: boolean;
  agent: ExternalAgentConfig;
  workspaceId: string;
  onClose: () => void;
  onUpdated: () => void;
}

export const ExternalAgentDetailsModal: React.FC<ExternalAgentDetailsModalProps> = ({
  isOpen,
  agent,
  workspaceId,
  onClose,
  onUpdated,
}) => {
  const [pinging, setPinging] = useState(false);
  const [pingResult, setPingResult] = useState<{ healthy: boolean; latencyMs: number } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Test Invocation State
  const [selectedSkill, setSelectedSkill] = useState<string>(
    agent.agent_card?.skills?.[0]?.id || 'compliance_audit'
  );
  const [testPayload, setTestPayload] = useState<string>(
    JSON.stringify(
      {
        repository: 'nexus/orchestrator-core',
        target_env: 'production',
        scan_results: { critical_count: 0, high_count: 0, status: 'PASSED' },
      },
      null,
      2
    )
  );
  const [invoking, setInvoking] = useState(false);
  const [invocationOutput, setInvocationOutput] = useState<any | null>(null);
  const [invocationError, setInvocationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePing = async () => {
    setPinging(true);
    const res = await pingExternalAgent(workspaceId, agent.id);
    setPinging(false);
    setPingResult(res);
    onUpdated();
  };

  const handleTestInvoke = async () => {
    setInvoking(true);
    setInvocationOutput(null);
    setInvocationError(null);

    try {
      let parsedInput = {};
      try {
        parsedInput = JSON.parse(testPayload);
      } catch {
        parsedInput = { input: testPayload };
      }

      const res = await invokeExternalAgent(workspaceId, agent.id, {
        skill: selectedSkill,
        input: parsedInput,
      });

      if (res.status === 'failed') {
        setInvocationError(res.error || 'Execution returned failure');
      } else {
        setInvocationOutput(res);
      }
    } catch (err: any) {
      setInvocationError(err.message || 'Invocation failed');
    } finally {
      setInvoking(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Disconnect External Agent "${agent.name}"?`)) {
      return;
    }
    setDeleting(true);
    await deleteExternalAgent(workspaceId, agent.id);
    setDeleting(false);
    onUpdated();
    onClose();
  };

  const card = agent.agent_card || { skills: [], version: '0.1.0' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-[#E5E5E2] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-[#EFEFEA] flex items-center justify-between bg-[#FAFAF8]">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
              <Bot className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#111318]">{agent.name}</h2>
                <span className="font-mono text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  a2a:{agent.slug}
                </span>
                {agent.status === 'active' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    Active
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold">
                    {agent.status}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#626873] mt-0.5 font-mono truncate max-w-md">
                {agent.endpoint_url}
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
              {pinging ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5 text-blue-600" />}
              <span>{pinging ? 'Probing...' : 'Ping Liveness'}</span>
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
          {/* Health probe feedback */}
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
                  {pingResult.healthy ? 'A2A Protocol Liveness Probe Succeeded' : 'Probe Failed'}
                </span>
              </div>
              <span className="font-mono">{pingResult.latencyMs}ms latency</span>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2]">
              <span className="block text-[10px] uppercase font-mono text-[#8B919B]">Agent Version</span>
              <span className="text-xs font-bold font-mono text-[#111318]">v{card.version || '1.0.0'}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2]">
              <span className="block text-[10px] uppercase font-mono text-[#8B919B]">Protocol</span>
              <span className="text-xs font-bold font-mono text-[#111318]">A2A {agent.protocol_version}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2]">
              <span className="block text-[10px] uppercase font-mono text-[#8B919B]">Provider</span>
              <span className="text-xs font-bold text-[#111318] truncate block">
                {card.provider?.name || 'Autonomous Agent'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2]">
              <span className="block text-[10px] uppercase font-mono text-[#8B919B]">Available Skills</span>
              <span className="text-xs font-bold text-blue-600">
                {card.skills?.length || 0} Skills
              </span>
            </div>
          </div>

          {/* Description */}
          {agent.description && (
            <p className="text-xs text-[#626873] leading-relaxed">
              {agent.description}
            </p>
          )}

          {/* Declared Skills */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#626873]">
              Declared Skills & Capabilities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(card.skills || []).map((skill) => (
                <div
                  key={skill.id}
                  className="p-3.5 rounded-xl bg-white border border-[#E5E5E2] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-[#111318]">
                      {skill.name}
                    </span>
                    <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                      {skill.id}
                    </span>
                  </div>
                  <p className="text-xs text-[#626873] leading-relaxed">
                    {skill.description}
                  </p>
                  {skill.tags && (
                    <div className="flex items-center gap-1 flex-wrap pt-1">
                      {skill.tags.map((t) => (
                        <span key={t} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#FAFAF8] text-[#8B919B]">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Live Interactive Task Runner */}
          <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#111318] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Live Skill Execution Test
              </span>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="text-xs px-2.5 py-1 rounded-lg bg-white border border-[#E5E5E2] text-[#111318] outline-none"
              >
                {(card.skills || []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#626873] mb-1">
                JSON Task Input
              </label>
              <textarea
                rows={4}
                value={testPayload}
                onChange={(e) => setTestPayload(e.target.value)}
                className="w-full p-3 rounded-lg bg-white border border-[#E5E5E2] text-xs font-mono text-[#111318] outline-none shadow-inner"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleTestInvoke}
                disabled={invoking}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
              >
                {invoking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{invoking ? 'Executing...' : 'Invoke Skill'}</span>
              </button>
            </div>

            {/* Execution Result */}
            {invocationError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {invocationError}
              </div>
            )}

            {invocationOutput && (
              <div className="p-3 rounded-lg bg-[#111318] text-white text-[11px] font-mono overflow-x-auto space-y-1">
                <div className="flex items-center justify-between text-stone-400 border-b border-stone-800 pb-1 mb-2">
                  <span className="flex items-center gap-1">
                    <Code2 className="w-3.5 h-3.5" />
                    Invocation Output ({invocationOutput.metrics?.duration_ms}ms)
                  </span>
                  <span className="text-emerald-400 font-bold">{invocationOutput.status}</span>
                </div>
                <pre>{JSON.stringify(invocationOutput.output, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#EFEFEA] bg-[#FAFAF8] flex items-center justify-between">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
          >
            {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            <span>Disconnect Agent</span>
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
