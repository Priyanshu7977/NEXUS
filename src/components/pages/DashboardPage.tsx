import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { ConnectorConnection } from '../../types/database';
import { getWorkspaceConnections } from '../../services/connectorService';
import { getWorkspaceAgents } from '../../services/agentService';
import { getWorkflows, getWorkflowExecutions } from '../../services/workflowService';
import {
  getWorkspaceActiveExecutions,
  getWorkspacePendingApprovals,
  checkWorkspaceSystemHealth,
} from '../../services/observabilityService';
import { subscribeToWorkspaceExecutions } from '../../services/realtimeExecutionService';
import { LiveExecutionState, WorkspaceSystemHealth } from '../../types/observability';
import { Agent } from '../../types/agent';
import { Workflow, WorkflowExecution } from '../../types/workflow';
import { LiveExecutionModal } from '../observability/LiveExecutionModal';
import {
  Cable,
  Bot,
  Network,
  Activity,
  ArrowRight,
  CheckCircle2,
  ShieldAlert,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, currentWorkspace } = useAuth();
  const navigate = useNavigate();
  const workspaceId = currentWorkspace?.id || 'default-workspace';

  const [connections, setConnections] = useState<ConnectorConnection[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [recentExecutions, setRecentExecutions] = useState<WorkflowExecution[]>([]);
  const [activeExecutions, setActiveExecutions] = useState<LiveExecutionState[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<LiveExecutionState[]>([]);
  const [systemHealth, setSystemHealth] = useState<WorkspaceSystemHealth | null>(null);

  // Live Modal state
  const [liveModalExecutionId, setLiveModalExecutionId] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    if (!currentWorkspace?.id) return;
    try {
      const [
        connRes,
        agentRes,
        wfRes,
        execRes,
        activeExecs,
        approvals,
        health,
      ] = await Promise.all([
        getWorkspaceConnections(workspaceId),
        getWorkspaceAgents(workspaceId),
        getWorkflows(workspaceId),
        getWorkflowExecutions(workspaceId),
        getWorkspaceActiveExecutions(workspaceId),
        getWorkspacePendingApprovals(workspaceId),
        checkWorkspaceSystemHealth(workspaceId),
      ]);

      setConnections(connRes.connections || []);
      setAgents(agentRes.agents || []);
      setWorkflows(wfRes.workflows || []);
      setRecentExecutions((execRes.executions || []).slice(0, 5));
      setActiveExecutions(activeExecs);
      setPendingApprovals(approvals);
      setSystemHealth(health);
    } catch (err) {
      console.error('[NEXUS Dashboard] Error loading dashboard data:', err);
    }
  }, [currentWorkspace?.id, workspaceId]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Real-time workspace subscription
  useEffect(() => {
    if (!workspaceId) return;
    const unsub = subscribeToWorkspaceExecutions(workspaceId, () => {
      loadDashboardData();
    });
    return () => unsub();
  }, [workspaceId, loadDashboardData]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'Developer';
  const connectedCount = connections.filter((c) => c.status === 'connected').length;

  return (
    <div className="flex flex-col gap-8 text-left max-w-6xl mx-auto pb-16">
      {/* Top Banner Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-[10px] font-mono font-semibold text-[#6D4AFF] uppercase tracking-wider mb-2 border border-purple-200">
            NEXUS MISSION CONTROL
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111318]">
            {getGreeting()}, {firstName}.
          </h2>
          <p className="text-sm text-[#626873]">
            Real-time workspace observability and execution orchestration.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadDashboardData}
            className="p-2 rounded-xl bg-white border border-[#E5E5E2] hover:bg-[#FAFAF8] text-[#626873] transition-colors cursor-pointer shadow-xs"
            title="Refresh dashboard state"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Button size="sm" onClick={() => navigate('/app/workflows/new')} withArrow>
            New Workflow
          </Button>
        </div>
      </div>

      {/* 4 Connected Applications Quick Testing Strip */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-50/70 via-stone-50/50 to-indigo-50/70 border border-[#6D4AFF]/25 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-[#111318]">Frontier Autonomous AI Suite Ready</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100/70 text-emerald-800 font-semibold border border-emerald-200">
              4 Apps Connected
            </span>
          </div>
          <p className="text-xs text-[#626873]">
            Orchestrate <strong>GitHub</strong>, <strong>Vercel</strong>, <strong>Supabase</strong>, and <strong>Slack</strong> together or run parallel multi-model arbitration across GPT-4o, Claude 3.5, Gemini & DeepSeek.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={() => navigate('/app/connectors')}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAFAF8] border border-[#E5E5E2] text-xs font-semibold text-[#111318] shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Cable className="w-3.5 h-3.5 text-[#6D4AFF]" />
            <span>Test 4-App Builder</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/swarm')}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAFAF8] border border-[#E5E5E2] text-xs font-semibold text-[#111318] shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Bot className="w-3.5 h-3.5 text-blue-600" />
            <span>Launch Swarm Arena</span>
          </button>

          <button
            type="button"
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
            className="px-3 py-1.5 rounded-xl bg-[#6D4AFF] hover:bg-[#5B3CE8] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Co-Pilot (⌘K)</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: ACTIVE EXECUTIONS (Prompt Section 2 & 3) */}
      {activeExecutions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-ping" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#111318]">
                Active Executions ({activeExecutions.length})
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[#6D4AFF]">Live Streaming</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            {activeExecutions.map((exec) => {
              const isWaiting = exec.status === 'waiting_for_approval';
              return (
                <div
                  key={exec.execution_id}
                  className={`h-full p-5 rounded-2xl bg-white border transition-all shadow-sm flex flex-col justify-between min-w-0 ${
                    isWaiting
                      ? 'border-amber-300 ring-2 ring-amber-300/20'
                      : 'border-purple-300 ring-2 ring-[#6D4AFF]/20'
                  }`}
                >
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between gap-2 mb-2 min-w-0">
                      <span className="text-xs font-mono text-[#8B919B] truncate">
                        ID: {exec.execution_id.slice(0, 8)}...
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border shrink-0 ${
                          isWaiting
                            ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                            : 'bg-purple-50 text-[#6D4AFF] border-purple-200 animate-pulse'
                        }`}
                      >
                        {isWaiting ? (
                          <ShieldAlert className="w-3 h-3 text-amber-600" />
                        ) : (
                          <Loader2 className="w-3 h-3 animate-spin text-[#6D4AFF]" />
                        )}
                        {exec.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#111318] mb-1 truncate">
                      {exec.workflow_name || 'Workflow Pipeline'}
                    </h4>

                    <p className="text-xs text-[#626873] line-clamp-2 mb-4 break-words flex-1">
                      {isWaiting
                        ? 'Paused on human approval gate. Review required before proceeding.'
                        : `Current node: ${exec.current_node_key || 'processing...'}`}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#EFEFEA] flex items-center justify-between text-xs mt-auto">
                    <span className="font-mono text-[#8B919B]">
                      {(exec.duration_ms / 1000).toFixed(1)}s elapsed
                    </span>
                    <Button
                      size="sm"
                      onClick={() => setLiveModalExecutionId(exec.execution_id)}
                      className={isWaiting ? 'bg-amber-600 hover:bg-amber-700 text-white shrink-0' : 'shrink-0'}
                    >
                      {isWaiting ? 'Review Gate →' : 'Watch Live →'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: PENDING APPROVALS NOTIFICATION (Prompt Section 16) */}
      {pendingApprovals.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-300 text-left shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-900 uppercase font-mono tracking-wider">
                Pending Approval Action
              </div>
              <p className="text-xs text-amber-800 mt-0.5">
                {pendingApprovals.length} workflow {pendingApprovals.length === 1 ? 'is' : 'are'} waiting for deployment sign-off.
              </p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => setLiveModalExecutionId(pendingApprovals[0].execution_id)}
            className="bg-amber-600 hover:bg-amber-700 text-white shrink-0"
          >
            Review & Decide →
          </Button>
        </div>
      )}

      {/* SECTION 3: WORKSPACE OVERVIEW STATUS CARDS */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-[#8B919B] mb-3">
          Workspace Telemetry
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
          {/* Connectors */}
          <div className="h-full p-5 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm flex flex-col justify-between min-w-0">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#626873]">Connectors</span>
                <Cable className="w-4 h-4 text-[#3B82F6] shrink-0" />
              </div>
              <div className="text-2xl font-bold text-[#111318] mb-1 truncate">
                {connectedCount} Connected
              </div>
            </div>
            <div className="text-[11px] text-[#8B919B] pt-3 border-t border-[#EFEFEA] flex items-center justify-between mt-auto">
              <span className="truncate">{connections.length} total integrated</span>
              <button
                onClick={() => navigate('/app/connectors')}
                className="text-[#6D4AFF] hover:underline font-medium cursor-pointer shrink-0 ml-1"
              >
                Manage →
              </button>
            </div>
          </div>

          {/* Agents */}
          <div className="h-full p-5 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm flex flex-col justify-between min-w-0">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#626873]">AI Agents</span>
                <Bot className="w-4 h-4 text-[#6D4AFF] shrink-0" />
              </div>
              <div className="text-2xl font-bold text-[#111318] mb-1 truncate">
                {agents.length} Configured
              </div>
            </div>
            <div className="text-[11px] text-[#8B919B] pt-3 border-t border-[#EFEFEA] flex items-center justify-between mt-auto">
              <span className="truncate">{agents.filter((a) => a.status === 'active').length} active workers</span>
              <button
                onClick={() => navigate('/app/agents')}
                className="text-[#6D4AFF] hover:underline font-medium cursor-pointer shrink-0 ml-1"
              >
                View →
              </button>
            </div>
          </div>

          {/* Workflows */}
          <div className="h-full p-5 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm flex flex-col justify-between min-w-0">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#626873]">Workflows</span>
                <Network className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-[#111318] mb-1 truncate">
                {workflows.length} Pipelines
              </div>
            </div>
            <div className="text-[11px] text-[#8B919B] pt-3 border-t border-[#EFEFEA] flex items-center justify-between mt-auto">
              <span className="truncate">{workflows.filter((w) => w.status === 'active').length} ready</span>
              <button
                onClick={() => navigate('/app/workflows')}
                className="text-[#6D4AFF] hover:underline font-medium cursor-pointer shrink-0 ml-1"
              >
                Build →
              </button>
            </div>
          </div>

          {/* Executions */}
          <div className="h-full p-5 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm flex flex-col justify-between min-w-0">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#626873]">Recent Executions</span>
                <Activity className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-[#111318] mb-1 truncate">
                {recentExecutions.length > 0 ? recentExecutions.length : '0'} Recorded
              </div>
            </div>
            <div className="text-[11px] text-[#8B919B] pt-3 border-t border-[#EFEFEA] flex items-center justify-between mt-auto">
              <span className="truncate">{recentExecutions.filter((e) => e.status === 'completed').length} completed</span>
              <button
                onClick={() => navigate('/app/activity')}
                className="text-[#6D4AFF] hover:underline font-medium cursor-pointer shrink-0 ml-1"
              >
                Inspect →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: SYSTEM HEALTH VIEW (Prompt Section 29, 30, 31) */}
      {systemHealth && (
        <div className="p-6 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm">
          <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
            <div>
              <h3 className="text-sm font-bold text-[#111318]">System Operational Health</h3>
              <p className="text-xs text-[#626873]">
                Verified real-time connector, model provider, and protocol capability checks.
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase shrink-0 ${
                systemHealth.status === 'healthy'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              {systemHealth.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-stretch">
            {systemHealth.checks.map((check) => (
              <div
                key={check.id}
                className="h-full p-3.5 rounded-xl border border-[#E5E5E2] bg-[#FAFAF8] text-xs flex flex-col justify-between min-w-0"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5 min-w-0">
                  <span className="font-bold text-[#111318] truncate">{check.name}</span>
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      check.status === 'healthy'
                        ? 'bg-emerald-500'
                        : check.status === 'degraded'
                        ? 'bg-amber-500'
                        : 'bg-gray-400'
                    }`}
                  />
                </div>
                <p className="text-[11px] text-[#626873] leading-relaxed break-words" title={check.message}>
                  {check.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 5: RECENT WORKFLOWS & RECENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Workflows */}
        <div className="p-6 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#111318]">Pipelines & Workflows</h3>
            <button
              onClick={() => navigate('/app/workflows')}
              className="text-xs text-[#6D4AFF] hover:underline font-medium cursor-pointer"
            >
              View all →
            </button>
          </div>

          {workflows.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#8B919B] bg-[#FAFAF8] rounded-xl border border-[#E5E5E2] my-auto">
              No workflows configured yet.
            </div>
          ) : (
            <div className="divide-y divide-[#EFEFEA] -mx-6">
              {workflows.slice(0, 4).map((wf) => (
                <div
                  key={wf.id}
                  onClick={() => navigate(`/app/workflows/${wf.id}`)}
                  className="px-6 py-3.5 flex items-center justify-between hover:bg-[#FAFAF8] transition-colors cursor-pointer"
                >
                  <div className="min-w-0 pr-3">
                    <div className="text-xs font-bold text-[#111318] truncate mb-0.5">
                      {wf.name}
                    </div>
                    <div className="text-[11px] font-mono text-[#8B919B] flex items-center gap-2">
                      <span>Trigger: {wf.trigger_type}</span>
                      <span>•</span>
                      <span>{wf.nodes.length} nodes</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#8B919B] shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Executions Log */}
        <div className="p-6 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#111318]">Execution Activity Log</h3>
            <button
              onClick={() => navigate('/app/activity')}
              className="text-xs text-[#6D4AFF] hover:underline font-medium cursor-pointer"
            >
              All logs →
            </button>
          </div>

          {recentExecutions.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#8B919B] bg-[#FAFAF8] rounded-xl border border-[#E5E5E2] my-auto">
              No executions have run in this workspace yet.
            </div>
          ) : (
            <div className="divide-y divide-[#EFEFEA] -mx-6">
              {recentExecutions.map((exec) => (
                <div
                  key={exec.id}
                  onClick={() => setLiveModalExecutionId(exec.id)}
                  className="px-6 py-3.5 flex items-center justify-between hover:bg-[#FAFAF8] transition-colors cursor-pointer"
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-mono font-bold text-[#111318]">
                        {exec.id.slice(0, 8)}...
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                          exec.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : exec.status === 'waiting_for_approval'
                            ? 'bg-amber-50 text-amber-700 animate-pulse'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {exec.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-[#8B919B]">
                      {new Date(exec.started_at).toLocaleTimeString()} • {(exec.duration_ms / 1000).toFixed(1)}s duration
                    </div>
                  </div>
                  <span className="text-xs text-[#6D4AFF] hover:underline font-medium shrink-0">
                    Inspect →
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Embedded Live Execution Modal */}
      {liveModalExecutionId && (
        <LiveExecutionModal
          isOpen={Boolean(liveModalExecutionId)}
          workspaceId={workspaceId}
          executionId={liveModalExecutionId}
          onClose={() => setLiveModalExecutionId(null)}
          onNavigateToFullPage={(id) => {
            setLiveModalExecutionId(null);
            navigate(`/app/activity/${id}`);
          }}
        />
      )}
    </div>
  );
};
