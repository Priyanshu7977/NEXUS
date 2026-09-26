import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { BrandLogo } from '../brand/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { getAgentById, setAgentStatus, getAgentExecutions } from '../../services/agentService';
import { Agent, AgentExecution } from '../../types/agent';
import { RunAgentModal } from '../agents/RunAgentModal';
import { 
  Bot, 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  Activity, 
  AlertCircle,
  Sliders,
  Shield,
  Wrench,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight
} from 'lucide-react';

export const AgentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentWorkspace } = useAuth();

  const [agent, setAgent] = useState<Agent | null>(null);
  const [executions, setExecutions] = useState<AgentExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Overview' | 'Instructions' | 'Tools' | 'Limits' | 'History'>('Overview');
  const [runModalOpen, setRunModalOpen] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const loadAgentData = useCallback(async () => {
    if (!id || !currentWorkspace?.id) return;
    try {
      const { agent: found } = await getAgentById(currentWorkspace.id, id);
      setAgent(found);

      if (found) {
        const { executions: execs } = await getAgentExecutions(currentWorkspace.id, id);
        setExecutions(execs);
      }
    } catch (err) {
      console.error('[NEXUS AgentDetailPage] Error loading agent:', err);
    } finally {
      setLoading(false);
    }
  }, [id, currentWorkspace?.id]);

  useEffect(() => {
    loadAgentData();
  }, [loadAgentData]);

  const handleToggleStatus = async () => {
    if (!agent || !currentWorkspace?.id) return;
    const nextStatus = agent.status === 'active' ? 'paused' : 'active';
    setStatusUpdating(true);
    try {
      await setAgentStatus(currentWorkspace.id, agent.id, nextStatus);
      setAgent((prev) => (prev ? { ...prev, status: nextStatus } : null));
    } catch (err) {
      console.error('[NEXUS AgentDetailPage] Status toggle error:', err);
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-[#8B919B]">
        Loading agent details...
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-[#E5E5E2] text-center max-w-lg mx-auto mt-8 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-[#FAFAF8] border border-[#E5E5E2] text-[#8B919B] flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-[#111318] mb-1">
          Agent not found
        </h3>
        <p className="text-xs text-[#626873] mb-6">
          The requested agent ID does not exist in this workspace.
        </p>
        <Button size="sm" onClick={() => navigate('/app/agents')}>
          Return to Agents
        </Button>
      </div>
    );
  }

  const tabs = [
    { id: 'Overview', label: 'Overview' },
    { id: 'Instructions', label: 'Instructions' },
    { id: 'Tools', label: `Tools (${(agent.tools || []).length})` },
    { id: 'Limits', label: 'Limits & Security' },
    { id: 'History', label: `Execution History (${executions.length})` },
  ] as const;

  return (
    <div className="flex flex-col gap-8 text-left max-w-5xl mx-auto pb-12">
      {/* Top Breadcrumb Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/app/agents')}
          className="inline-flex items-center gap-2 text-xs font-medium text-[#626873] hover:text-[#111318] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Agents</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleStatus}
            disabled={statusUpdating}
            className="px-3 py-1.5 rounded-xl border border-[#E5E5E2] bg-white hover:bg-[#FAFAF8] text-xs font-medium text-[#111318] transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            {agent.status === 'active' ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-600" />
                <span>Pause Agent</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                <span>Activate Agent</span>
              </>
            )}
          </button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/app/agents/new?edit=${agent.id}`)}
          >
            Edit Configuration
          </Button>

          <Button
            size="sm"
            onClick={() => setRunModalOpen(true)}
            disabled={agent.status === 'paused' || agent.status === 'archived'}
          >
            <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
            <span>Run Agent</span>
          </Button>
        </div>
      </div>

      {/* Main Agent Header Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-[#6D4AFF] border border-purple-100 flex items-center justify-center shrink-0">
            <Bot className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 mb-1 flex-wrap">
              <h1 className="text-2xl font-bold text-[#111318]">
                {agent.name}
              </h1>
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full border uppercase ${
                  agent.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : agent.status === 'paused'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-[#FAFAF8] text-[#8B919B] border-[#E5E5E2]'
                }`}
              >
                {agent.status === 'active' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
                {agent.status}
              </span>
            </div>
            <p className="text-xs text-[#6D4AFF] font-medium mb-1">
              {agent.role || 'Specialized Agent'}
            </p>
            <p className="text-xs text-[#626873] max-w-2xl leading-relaxed">
              {agent.description || 'No description provided.'}
            </p>
          </div>
        </div>

        <div className="flex sm:flex-col items-end gap-2 text-right shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#EFEFEA]">
          <div className="text-[10px] font-mono text-[#8B919B]">
            Model:{' '}
            <span className="text-[#111318] font-bold uppercase">{agent.model_provider}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#FAFAF8] px-2.5 py-1 rounded-lg border border-[#E5E5E2]">
            <BrandLogo brand={agent.model_provider} size={14} />
            <span className="text-[11px] font-mono text-[#111318] font-medium">
              {agent.model_name}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 border-b border-[#E5E5E2] pb-px overflow-x-auto">
        {tabs.map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                isSelected
                  ? 'border-[#6D4AFF] text-[#6D4AFF] font-bold'
                  : 'border-transparent text-[#626873] hover:text-[#111318]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 flex flex-col gap-6">
            <div className="p-6 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm">
              <h3 className="text-sm font-bold text-[#111318] mb-2">
                System Directive & Objective
              </h3>
              <p className="text-xs text-[#626873] leading-relaxed mb-4">
                {agent.description || 'Executes delegated intelligence instructions using authorized tools.'}
              </p>
              <div className="p-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] text-xs font-mono text-[#111318] leading-relaxed whitespace-pre-wrap">
                {agent.instructions}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#111318]">
                  Permitted Tools & Capabilities ({(agent.tools || []).length})
                </h3>
                <Link
                  to={`/app/agents/new?edit=${agent.id}`}
                  className="text-xs text-[#6D4AFF] hover:underline font-medium"
                >
                  Manage Tools
                </Link>
              </div>

              {(agent.tools || []).length === 0 ? (
                <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] text-xs text-[#8B919B] text-center">
                  No tools currently permitted. This agent will operate in pure reasoning mode.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
                  {(agent.tools || []).map((t) => (
                    <div
                      key={t.capability}
                      className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] flex items-center justify-between text-xs min-w-0 h-full gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Wrench className="w-3.5 h-3.5 text-[#6D4AFF] shrink-0" />
                        <span className="font-semibold text-[#111318] font-mono text-[11px] truncate">
                          {t.capability}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                        Authorized
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="p-6 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm">
              <h3 className="text-sm font-bold text-[#111318] mb-3">
                Execution Parameters
              </h3>
              <div className="flex flex-col gap-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#EFEFEA]">
                  <span className="text-[#626873]">Model Provider</span>
                  <span className="font-semibold text-[#111318] uppercase text-[10px]">{agent.model_provider}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-[#EFEFEA]">
                  <span className="text-[#626873]">Model Name</span>
                  <span className="font-semibold text-[#111318] font-mono text-[10px]">{agent.model_name}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-[#EFEFEA]">
                  <span className="text-[#626873]">Temperature</span>
                  <span className="font-semibold text-[#111318] font-mono">{agent.temperature}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-[#EFEFEA]">
                  <span className="text-[#626873]">Max Steps</span>
                  <span className="font-semibold text-[#111318] font-mono">{agent.max_steps} steps</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#626873]">Max Runtime</span>
                  <span className="font-semibold text-[#111318] font-mono">{agent.max_runtime_seconds}s</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAFAF8] border border-[#E5E5E2]">
              <div className="flex items-center gap-2 text-xs font-bold text-[#111318] mb-1">
                <Shield className="w-4 h-4 text-[#6D4AFF]" />
                <span>Workspace Isolation</span>
              </div>
              <p className="text-[11px] text-[#626873] leading-relaxed">
                Executions are strictly restricted to this workspace and its authorized connector sessions.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Instructions' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-[#111318]">
              System Directives
            </h3>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/app/agents/new?edit=${agent.id}`)}
            >
              Edit Instructions
            </Button>
          </div>
          <p className="text-xs text-[#626873] mb-4">
            System prompt instructions passed to {agent.model_provider} on every reasoning execution.
          </p>
          <pre className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] text-xs font-mono text-[#111318] whitespace-pre-wrap leading-relaxed">
            {agent.instructions}
          </pre>
        </div>
      )}

      {activeTab === 'Tools' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-[#111318]">
              Granted Tool Capabilities
            </h3>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/app/agents/new?edit=${agent.id}`)}
            >
              Configure Tools
            </Button>
          </div>
          <p className="text-xs text-[#626873] mb-6">
            Services and API capabilities this agent has permission to invoke during reasoning cycles.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(agent.tools || []).map((tool) => (
              <div
                key={tool.capability}
                className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-[#111318] font-mono mb-0.5">
                    {tool.capability}
                  </h4>
                  <p className="text-[11px] text-[#626873]">
                    Connector: <span className="font-semibold uppercase">{tool.connector_id}</span> · Mode: {tool.permission_mode}
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Limits' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm flex flex-col gap-6">
          <div>
            <h3 className="text-base font-bold text-[#111318] mb-1">
              Limits & Security Policy
            </h3>
            <p className="text-xs text-[#626873]">
              Safety guardrails governing runtime timeouts, reasoning step budgets, and workspace boundaries.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#111318] mb-1">
                <Sliders className="w-3.5 h-3.5 text-[#6D4AFF]" />
                <span>Max Steps</span>
              </div>
              <p className="text-[11px] text-[#626873] mb-3">Hard iteration ceiling per execution.</p>
              <span className="text-sm font-mono font-bold text-[#111318]">{agent.max_steps} steps</span>
            </div>

            <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#111318] mb-1">
                <Clock className="w-3.5 h-3.5 text-[#6D4AFF]" />
                <span>Runtime Timeout</span>
              </div>
              <p className="text-[11px] text-[#626873] mb-3">Maximum duration before automatic halt.</p>
              <span className="text-sm font-mono font-bold text-[#111318]">{agent.max_runtime_seconds} seconds</span>
            </div>

            <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#111318] mb-1">
                <Shield className="w-3.5 h-3.5 text-[#6D4AFF]" />
                <span>Secret Isolation</span>
              </div>
              <p className="text-[11px] text-[#626873] mb-3">Tokens decrypted in-memory only.</p>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                AES-256 GCM Protected
              </span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'History' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#111318]">
                Execution Records
              </h3>
              <p className="text-xs text-[#626873]">
                Traces and results produced by this agent.
              </p>
            </div>

            <Button size="sm" onClick={() => setRunModalOpen(true)}>
              <Play className="w-3.5 h-3.5 mr-1 fill-current" />
              Run Agent
            </Button>
          </div>

          {executions.length === 0 ? (
            <div className="p-12 rounded-2xl bg-white border border-[#E5E5E2] text-center flex flex-col items-center justify-center shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] text-[#8B919B] flex items-center justify-center mb-3">
                <Activity className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[#111318] mb-1">
                No executions recorded yet.
              </h4>
              <p className="text-xs text-[#626873] max-w-sm mb-5 leading-relaxed">
                Click "Run Agent" to test this agent with a live prompt and inspect its reasoning traces.
              </p>
              <Button size="sm" onClick={() => setRunModalOpen(true)}>
                Run your first execution
              </Button>
            </div>
          ) : (
            <div className="rounded-2xl bg-white border border-[#E5E5E2] overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E5E5E2] bg-[#FAFAF8] text-[11px] font-mono uppercase tracking-wider text-[#8B919B]">
                    <th className="py-3 px-4 font-semibold">Time</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Input Query</th>
                    <th className="py-3 px-4 font-semibold">Duration</th>
                    <th className="py-3 px-4 font-semibold">Steps</th>
                    <th className="py-3 px-4 text-right">Trace</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFEFEA]">
                  {executions.map((exec) => (
                    <tr
                      key={exec.id}
                      onClick={() => navigate(`/app/activity/${exec.id}`)}
                      className="hover:bg-[#FAFAF8] transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-mono text-[#8B919B] whitespace-nowrap">
                        {new Date(exec.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {exec.status === 'completed' ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            completed
                          </span>
                        ) : exec.status === 'limit_reached' ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <AlertCircle className="w-3 h-3" />
                            limit_reached
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                            <XCircle className="w-3 h-3" />
                            {exec.status}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#111318] max-w-xs truncate font-medium">
                        {exec.input}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#626873]">
                        {(exec.duration_ms / 1000).toFixed(2)}s
                      </td>
                      <td className="py-3 px-4 font-mono text-[#626873]">
                        {exec.steps_used}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span className="text-[#6D4AFF] group-hover:underline inline-flex items-center gap-0.5 font-medium">
                          Inspect <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Run Agent Modal */}
      <RunAgentModal
        isOpen={runModalOpen}
        agent={agent}
        onClose={() => setRunModalOpen(false)}
        onExecutionCompleted={async () => {
          await loadAgentData();
        }}
      />
    </div>
  );
};
