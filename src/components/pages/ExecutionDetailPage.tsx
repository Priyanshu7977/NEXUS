import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useExecutionRealtime } from '../../hooks/useExecutionRealtime';
import { LiveExecutionGraph } from '../observability/LiveExecutionGraph';
import { NodeInspectorDrawer } from '../observability/NodeInspectorDrawer';
import { ApprovalActionBanner } from '../observability/ApprovalActionBanner';
import { ExecutionTimeline } from '../observability/ExecutionTimeline';
import { Button } from '../ui/Button';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Loader2,
  Ban,
  Globe,
  ExternalLink,
  RefreshCw,
  Activity,
  AlertCircle,
} from 'lucide-react';

export const ExecutionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentWorkspace } = useAuth();
  const workspaceId = currentWorkspace?.id || 'default-workspace';

  const {
    execution,
    events,
    isLoading,
    isReconnecting,
    elapsedMs,
    cancelExecution,
    refresh,
  } = useExecutionRealtime(workspaceId, id);

  const [selectedNodeKey, setSelectedNodeKey] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    setCancelling(true);
    await cancelExecution();
    setCancelling(false);
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-xs text-[#8B919B] flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-[#6D4AFF]" />
        <span>Loading execution state...</span>
      </div>
    );
  }

  if (!execution && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-[#E5E5E2] text-center max-w-lg mx-auto mt-8 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-[#FAFAF8] border border-[#E5E5E2] text-[#8B919B] flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-[#111318] mb-1">
          Execution not found
        </h3>
        <p className="text-xs text-[#626873] mb-6">
          The requested execution ID could not be located in this workspace.
        </p>
        <Button size="sm" onClick={() => navigate('/app/activity')}>
          Return to Activity
        </Button>
      </div>
    );
  }

  const selectedNode = selectedNodeKey && execution?.nodes ? execution.nodes[selectedNodeKey] : null;

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            COMPLETED
          </span>
        );
      case 'running':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-[#6D4AFF] bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200 animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            RUNNING
          </span>
        );
      case 'waiting_for_approval':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200 animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            WAITING FOR APPROVAL
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-red-600 bg-red-50 px-2.5 py-0.5 rounded border border-red-200">
            <Ban className="w-3.5 h-3.5" />
            CANCELLED
          </span>
        );
      case 'failed':
      default:
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-red-700 bg-red-50 px-2.5 py-0.5 rounded border border-red-200">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            FAILED
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-8 text-left max-w-6xl mx-auto pb-16">
      {/* Top Header / Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-medium text-[#626873] hover:text-[#111318] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            className="p-2 rounded-lg border border-[#E5E5E2] hover:bg-white text-[#626873] transition-colors cursor-pointer"
            title="Refresh status"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Reconnect Banner */}
      {isReconnecting && (
        <div className="p-3 rounded-xl bg-amber-500 text-white text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Connection dropped. Reconnecting to authoritative execution stream...</span>
          </div>
          <button
            onClick={refresh}
            className="underline hover:opacity-80 text-xs cursor-pointer"
          >
            Sync now
          </button>
        </div>
      )}

      {/* Execution Status Bar (Prompt Section 17) */}
      <div className="p-6 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FAFAF8] border border-[#E5E5E2] flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6 text-[#6D4AFF]" />
          </div>

          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-[#111318] tracking-tight">
                {execution?.workflow_name || 'Workflow Execution'}
              </h2>
              {getStatusBadge(execution?.status)}
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-[#8B919B]">
              <span>ID: {execution?.execution_id}</span>
              <span>•</span>
              <span>Started: {new Date(execution?.started_at || '').toLocaleTimeString()}</span>
              <span>•</span>
              <span className="flex items-center gap-1 font-bold text-[#111318]">
                <Clock className="w-3.5 h-3.5 text-[#626873]" />
                {(elapsedMs / 1000).toFixed(1)}s elapsed
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 self-end sm:self-center">
          {execution?.status === 'running' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCancel}
              disabled={cancelling}
              className="border-red-200 text-red-600 hover:bg-red-50 text-xs"
            >
              <Ban className="w-3.5 h-3.5 mr-1" />
              {cancelling ? 'Cancelling...' : 'Cancel Execution'}
            </Button>
          )}
        </div>
      </div>

      {/* Action Required Approval Gate (Prompt Section 15) */}
      {execution?.approval && execution.approval.status === 'waiting' && id && (
        <ApprovalActionBanner
          workspaceId={workspaceId}
          executionId={id}
          approval={execution.approval}
          onDecisionSubmitted={refresh}
        />
      )}

      {/* Vercel Deployment Live Status View (Prompt Section 14) */}
      {execution?.deployment && (
        <div className="p-5 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-sm text-[#111318]">
                  Vercel Production Deployment: {execution.deployment.project_name}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    execution.deployment.status === 'READY'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : execution.deployment.status === 'BUILDING'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {execution.deployment.status}
                </span>
              </div>
              <div className="text-[11px] font-mono text-[#8B919B]">
                ID: {execution.deployment.deployment_id} • Commit: {execution.deployment.commit_sha?.slice(0, 7) || 'HEAD'} • Target: {execution.deployment.target || 'production'}
              </div>
            </div>
          </div>

          {execution.deployment.url && (
            <a
              href={execution.deployment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FAFAF8] hover:bg-[#EFEFEA] text-[#111318] font-mono text-xs border border-[#E5E5E2] transition-colors"
            >
              <span>{execution.deployment.url.replace(/^https?:\/\//, '')}</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#8B919B]" />
            </a>
          )}
        </div>
      )}

      {/* DAG Execution Graph (Prompt Section 8, 9) */}
      <div className="p-6 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#111318]">Execution Graph</h3>
            <p className="text-xs text-[#626873]">
              Click on any node to inspect step arguments, outputs, tool invocations, and duration.
            </p>
          </div>
          <span className="text-[11px] font-mono text-[#8B919B]">
            {Object.keys(execution?.nodes || {}).length} nodes
          </span>
        </div>

        <LiveExecutionGraph
          nodes={execution?.nodes || {}}
          nodeOrder={execution?.node_order || []}
          selectedNodeKey={selectedNodeKey}
          onSelectNode={(key) => setSelectedNodeKey(key)}
        />
      </div>

      {/* Real-Time Event Stream (Prompt Section 4, 18, 19, 20) */}
      <div className="p-6 rounded-2xl bg-white border border-[#E5E5E2] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#111318]">
              Execution Event Stream ({events.length})
            </h3>
            <p className="text-xs text-[#626873]">
              Chronological log of pipeline transitions, tool calls, and model requests.
            </p>
          </div>
        </div>

        <ExecutionTimeline
          events={events}
          onSelectEvent={(ev) => {
            if (ev.source_id && execution?.nodes?.[ev.source_id]) {
              setSelectedNodeKey(ev.source_id);
            }
          }}
        />
      </div>

      {/* Node Inspector Drawer */}
      <NodeInspectorDrawer
        isOpen={Boolean(selectedNodeKey)}
        node={selectedNode}
        events={events}
        onClose={() => setSelectedNodeKey(null)}
      />
    </div>
  );
};
