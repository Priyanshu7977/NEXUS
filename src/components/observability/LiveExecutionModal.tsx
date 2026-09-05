import React, { useState } from 'react';
import { useExecutionRealtime } from '../../hooks/useExecutionRealtime';
import { LiveExecutionGraph } from './LiveExecutionGraph';
import { NodeInspectorDrawer } from './NodeInspectorDrawer';
import { ApprovalActionBanner } from './ApprovalActionBanner';
import { ExecutionTimeline } from './ExecutionTimeline';
import { Button } from '../ui/Button';
import {
  X,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Loader2,
  Ban,
  Globe,
  ExternalLink,
  RefreshCw,
  Maximize2,
} from 'lucide-react';

interface LiveExecutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  executionId: string;
  onNavigateToFullPage?: (id: string) => void;
}

export const LiveExecutionModal: React.FC<LiveExecutionModalProps> = ({
  isOpen,
  onClose,
  workspaceId,
  executionId,
  onNavigateToFullPage,
}) => {
  const {
    execution,
    events,
    isReconnecting,
    elapsedMs,
    cancelExecution,
    refresh,
  } = useExecutionRealtime(workspaceId, isOpen ? executionId : null);

  const [selectedNodeKey, setSelectedNodeKey] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  if (!isOpen) return null;

  const handleCancelClick = async () => {
    setCancelling(true);
    await cancelExecution();
    setCancelling(false);
  };

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

  const selectedNode = selectedNodeKey && execution?.nodes ? execution.nodes[selectedNodeKey] : null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
        <div className="bg-white rounded-2xl border border-[#E5E5E2] shadow-2xl max-w-5xl w-full h-[90vh] flex flex-col overflow-hidden text-left relative animate-in zoom-in-95 duration-150">
          {/* Top Bar Header */}
          <div className="px-6 py-4 border-b border-[#EFEFEA] bg-[#FAFAF8] flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <div className="truncate">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-base font-bold text-[#111318] truncate">
                    {execution?.workflow_name || 'Workflow Execution'}
                  </h3>
                  {getStatusBadge(execution?.status)}
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-[#8B919B]">
                  <span>ID: {executionId.slice(0, 8)}...</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {(elapsedMs / 1000).toFixed(1)}s elapsed
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {execution?.status === 'running' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCancelClick}
                  disabled={cancelling}
                  className="border-red-200 text-red-600 hover:bg-red-50 text-xs"
                >
                  <Ban className="w-3 h-3 mr-1" />
                  {cancelling ? 'Cancelling...' : 'Cancel Execution'}
                </Button>
              )}

              {onNavigateToFullPage && (
                <button
                  onClick={() => onNavigateToFullPage(executionId)}
                  className="w-8 h-8 rounded-lg hover:bg-[#EFEFEA] flex items-center justify-center text-[#626873] hover:text-[#111318] transition-colors cursor-pointer"
                  title="Open in Full Page"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-[#EFEFEA] flex items-center justify-center text-[#626873] hover:text-[#111318] transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Reconnecting Status Banner */}
          {isReconnecting && (
            <div className="px-6 py-2 bg-amber-500 text-white text-xs font-semibold flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Connection lost. Reconnecting to live execution stream...</span>
              </div>
              <button
                onClick={refresh}
                className="underline hover:opacity-80 text-xs cursor-pointer"
              >
                Force Sync
              </button>
            </div>
          )}

          {/* Body Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Approval Banner if waiting */}
            {execution?.approval && execution.approval.status === 'waiting' && (
              <ApprovalActionBanner
                workspaceId={workspaceId}
                executionId={executionId}
                approval={execution.approval}
                onDecisionSubmitted={refresh}
              />
            )}

            {/* Vercel Deployment Live Status View (Prompt Section 14) */}
            {execution?.deployment && (
              <div className="p-4 rounded-xl bg-white border border-[#E5E5E2] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-[#111318]">
                        Vercel Deployment: {execution.deployment.project_name}
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
                      Commit: {execution.deployment.commit_sha?.slice(0, 7) || 'HEAD'} • Target: {execution.deployment.target || 'production'}
                    </div>
                  </div>
                </div>

                {execution.deployment.url && (
                  <a
                    href={execution.deployment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAFAF8] hover:bg-[#EFEFEA] text-[#111318] font-mono text-xs border border-[#E5E5E2] transition-colors"
                  >
                    <span>{execution.deployment.url.replace(/^https?:\/\//, '')}</span>
                    <ExternalLink className="w-3 h-3 text-[#8B919B]" />
                  </a>
                )}
              </div>
            )}

            {/* Live Execution DAG Graph */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#8B919B] mb-2.5">
                Execution Pipeline Graph
              </div>
              <LiveExecutionGraph
                nodes={execution?.nodes || {}}
                nodeOrder={execution?.node_order || []}
                selectedNodeKey={selectedNodeKey}
                onSelectNode={(key) => setSelectedNodeKey(key)}
              />
            </div>

            {/* Event Stream Timeline */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#8B919B] mb-2.5">
                Real-Time Event Stream ({events.length})
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
          </div>
        </div>
      </div>

      {/* Node Inspector Drawer */}
      <NodeInspectorDrawer
        isOpen={Boolean(selectedNodeKey)}
        node={selectedNode}
        events={events}
        onClose={() => setSelectedNodeKey(null)}
      />
    </>
  );
};
