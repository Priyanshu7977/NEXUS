import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { getWorkspaceUsageMetrics } from '../../services/observabilityService';
import { UsageSummary } from '../../types/observability';
import {
  Bot,
  Network,
  Clock,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

export const UsagePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentWorkspace } = useAuth();
  const workspaceId = currentWorkspace?.id || 'default-workspace';

  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d' | 'all'>('30d');
  const [metrics, setMetrics] = useState<UsageSummary | null>(null);

  const loadMetrics = async () => {
    try {
      const data = await getWorkspaceUsageMetrics(workspaceId, timeRange);
      setMetrics(data);
    } catch (err) {
      console.error('[NEXUS UsagePage] Error loading metrics:', err);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, [workspaceId, timeRange]);

  const timeRangeOptions = [
    { id: 'today', label: 'Today' },
    { id: '7d', label: 'Last 7 Days' },
    { id: '30d', label: 'Last 30 Days' },
    { id: 'all', label: 'All Time' },
  ] as const;

  const totalRuns = (metrics?.total_workflow_runs || 0) + (metrics?.total_agent_runs || 0);
  const avgWfDuration =
    metrics?.total_workflow_runs && metrics.total_workflow_runs > 0
      ? (metrics.total_duration_ms / metrics.total_workflow_runs / 1000).toFixed(1)
      : null;

  return (
    <div className="flex flex-col gap-8 text-left max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111318] mb-1">
            Usage & Execution Observability
          </h2>
          <p className="text-sm text-[#626873]">
            Telemetry calculated strictly from persisted workspace executions and tool calls.
          </p>
        </div>

        {/* Time Range Filter (Prompt Section 33) */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white border border-[#E5E5E2] shadow-xs">
          {timeRangeOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setTimeRange(opt.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                timeRange === opt.id
                  ? 'bg-[#111318] text-white'
                  : 'text-[#626873] hover:text-[#111318] hover:bg-[#FAFAF8]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Plan Summary Banner */}
      <div className="p-6 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-[10px] font-mono font-semibold text-[#6D4AFF] uppercase tracking-wider mb-2 border border-purple-200">
            CURRENT WORKSPACE PLAN
          </div>
          <h3 className="text-lg font-bold text-[#111318] mb-0.5">
            Developer Workspace (Local & Cloud Hybrid)
          </h3>
          <p className="text-xs text-[#626873]">
            Unrestricted multi-agent pipelines, MCP tools, and external A2A interoperability.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => navigate('/pricing')}>
            <span>Plan Details</span>
            <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>

      {/* Primary Execution Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Workflow Executions (Prompt Section 34) */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#8B919B] uppercase">Workflow Runs</span>
              <Network className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-[#111318] mb-1">
              {metrics?.total_workflow_runs ?? 0}
            </div>
            <div className="text-[11px] text-[#626873]">
              {metrics && metrics.total_workflow_runs > 0 ? (
                <span>
                  {metrics.successful_workflow_runs} completed • {metrics.failed_workflow_runs} failed
                </span>
              ) : (
                'No execution data yet.'
              )}
            </div>
          </div>
          <div className="pt-3 border-t border-[#EFEFEA] text-[10px] font-mono text-[#8B919B]">
            Avg: {avgWfDuration ? `${avgWfDuration}s per run` : '—'}
          </div>
        </div>

        {/* Agent Executions (Prompt Section 35) */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#8B919B] uppercase">Agent Runs</span>
              <Bot className="w-4 h-4 text-[#6D4AFF]" />
            </div>
            <div className="text-2xl font-bold text-[#111318] mb-1">
              {metrics?.total_agent_runs ?? 0}
            </div>
            <div className="text-[11px] text-[#626873]">
              {metrics && metrics.total_agent_runs > 0 ? (
                <span>
                  {metrics.successful_agent_runs} completed • {metrics.failed_agent_runs} failed
                </span>
              ) : (
                'No execution data yet.'
              )}
            </div>
          </div>
          <div className="pt-3 border-t border-[#EFEFEA] text-[10px] font-mono text-[#8B919B]">
            {metrics?.total_tool_calls || 0} tool calls executed
          </div>
        </div>

        {/* Compute Duration */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#8B919B] uppercase">Total Runtime</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-[#111318] mb-1 font-mono">
              {metrics && metrics.total_duration_ms > 0
                ? `${(metrics.total_duration_ms / 1000).toFixed(1)}s`
                : '0.0s'}
            </div>
            <div className="text-[11px] text-[#626873]">
              Cumulative execution time
            </div>
          </div>
          <div className="pt-3 border-t border-[#EFEFEA] text-[10px] font-mono text-[#8B919B]">
            Across {totalRuns} total runs
          </div>
        </div>

        {/* Model Tokens (Prompt Section 32 & 36: No fake tokens!) */}
        <div className="p-5 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#8B919B] uppercase">Token Telemetry</span>
              <Sparkles className="w-4 h-4 text-[#3B82F6]" />
            </div>
            <div className="text-2xl font-bold text-[#111318] mb-1 font-mono">
              {metrics?.has_real_token_data && metrics.tokens_used
                ? metrics.tokens_used.toLocaleString()
                : 'Usage unavailable'}
            </div>
            <div className="text-[11px] text-[#626873]">
              {metrics?.has_real_token_data
                ? 'Measured from provider telemetry'
                : 'Provider token counts not emitted'}
            </div>
          </div>
          <div className="pt-3 border-t border-[#EFEFEA] text-[10px] font-mono text-[#8B919B]">
            Zero fabricated estimation
          </div>
        </div>
      </div>

      {/* Model Provider Breakdown (Prompt Section 32) */}
      <div className="p-6 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm">
        <h3 className="text-sm font-bold text-[#111318] mb-1">
          AI Model Provider Distribution
        </h3>
        <p className="text-xs text-[#626873] mb-4">
          Models leveraged across workspace agents and workflow reasoning nodes.
        </p>

        {metrics && Object.keys(metrics.models_used).length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.entries(metrics.models_used).map(([modelName, count]) => (
              <div
                key={modelName}
                className="p-3.5 rounded-xl border border-[#E5E5E2] bg-[#FAFAF8] text-xs flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-[#111318] truncate">{modelName}</div>
                  <div className="text-[11px] font-mono text-[#8B919B]">Active Agent Worker</div>
                </div>
                <div className="text-right font-mono font-bold text-[#111318]">
                  {count} {count === 1 ? 'run' : 'runs'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-[#8B919B] bg-[#FAFAF8] rounded-xl border border-[#E5E5E2]">
            No model invocation data recorded for this time period.
          </div>
        )}
      </div>
    </div>
  );
};
