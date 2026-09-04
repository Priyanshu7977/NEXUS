import React, { useState } from 'react';
import { Button } from '../ui/Button';
import {
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  X,
  ShieldAlert,
  GitCommit,
  Network,
  Bot,
} from 'lucide-react';
import { Workflow, WorkflowExecution, WorkflowExecutionEvent } from '../../types/workflow';
import { executeWorkflow } from '../../runtime/workflowEngine';
import { ApprovalActionModal } from './ApprovalActionModal';

interface RunWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  workflow: Workflow;
  onExecutionCompleted?: (execution: WorkflowExecution) => void;
}

export const RunWorkflowModal: React.FC<RunWorkflowModalProps> = ({
  isOpen,
  onClose,
  workspaceId,
  workflow,
  onExecutionCompleted,
}) => {
  const [repository, setRepository] = useState(
    workflow.trigger_config?.defaultRepo || workflow.trigger_config?.repository || 'facebook/react'
  );
  const [branch, setBranch] = useState('main');
  const [inputNote, setInputNote] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [execution, setExecution] = useState<WorkflowExecution | null>(null);
  const [events, setEvents] = useState<WorkflowExecutionEvent[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  if (!isOpen) return null;

  const handleRun = async () => {
    setIsRunning(true);
    setErrorMessage(null);
    setEvents([]);
    setExecution(null);

    try {
      const triggerData = {
        repository,
        branch,
        input: inputNote || `Execute pipeline for ${repository} on branch ${branch}`,
        triggered_by: 'NEXUS Studio User',
        timestamp: new Date().toISOString(),
      };

      const result = await executeWorkflow({
        workspaceId,
        workflowId: workflow.id,
        triggerData,
        onEvent: (event) => {
          setEvents((prev) => [...prev, event]);
        },
      });

      setExecution(result);

      if (result.status === 'waiting_for_approval') {
        // Paused on approval gate
      } else if (onExecutionCompleted) {
        onExecutionCompleted(result);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Execution failed unexpectedly.');
    } finally {
      setIsRunning(false);
    }
  };

  const isWaitingApproval = execution?.status === 'waiting_for_approval';
  const isCompleted = execution?.status === 'completed';
  const isFailed = execution?.status === 'failed';

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl border border-[#E5E5E2] shadow-2xl max-w-2xl w-full overflow-hidden text-left flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#EFEFEA] flex items-center justify-between bg-[#FAFAF8]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6D4AFF] border border-purple-200 flex items-center justify-center shrink-0 shadow-sm">
                <Network className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#111318]">
                  Run Workflow: {workflow.name}
                </h3>
                <p className="text-xs text-[#626873]">
                  {workflow.nodes.length} nodes configured · Trigger: {workflow.trigger_type}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-[#8B919B] hover:text-[#111318] rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-6">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Input form if not currently running / before first run */}
            {!isRunning && !execution && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#111318] mb-1.5 flex items-center gap-1.5">
                      <GitCommit className="w-3.5 h-3.5 text-[#6D4AFF]" /> Target Repository
                    </label>
                    <input
                      type="text"
                      value={repository}
                      onChange={(e) => setRepository(e.target.value)}
                      placeholder="owner/repo (e.g. facebook/react)"
                      className="w-full h-10 px-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] text-xs text-[#111318] outline-none focus:border-[#6D4AFF] shadow-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#111318] mb-1.5">
                      Git Branch / Ref
                    </label>
                    <input
                      type="text"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder="main"
                      className="w-full h-10 px-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] text-xs text-[#111318] outline-none focus:border-[#6D4AFF] shadow-sm font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111318] mb-1.5">
                    Execution Instructions / Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={inputNote}
                    onChange={(e) => setInputNote(e.target.value)}
                    placeholder="Specific directives or parameters for this execution run..."
                    className="w-full p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] text-xs text-[#111318] outline-none focus:border-[#6D4AFF] shadow-sm resize-none"
                  />
                </div>
              </div>
            )}

            {/* Status Banner when Paused for Approval */}
            {isWaitingApproval && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-900">
                      Workflow Paused: Human Approval Required
                    </h4>
                    <p className="text-[11px] text-amber-700">
                      Execution reached gate node <span className="font-mono">{execution.current_node_key}</span>.
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => setShowApprovalModal(true)}
                  className="bg-amber-600 hover:bg-amber-700 text-white shrink-0 text-xs shadow-sm"
                >
                  Review & Approve →
                </Button>
              </div>
            )}

            {/* Live Execution Timeline / Event Logs */}
            {(isRunning || events.length > 0) && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-[#111318] flex items-center gap-2">
                    <Bot className="w-3.5 h-3.5 text-[#6D4AFF]" />
                    <span>Live Execution Progress</span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    {isRunning && (
                      <span className="flex items-center gap-1 text-blue-600 font-semibold">
                        <Loader2 className="w-3 h-3 animate-spin" /> RUNNING
                      </span>
                    )}
                    {isWaitingApproval && (
                      <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        WAITING FOR APPROVAL
                      </span>
                    )}
                    {isCompleted && (
                      <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        COMPLETED ({(execution.duration_ms / 1000).toFixed(1)}s)
                      </span>
                    )}
                    {isFailed && (
                      <span className="text-red-700 font-semibold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                        FAILED
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#111318] text-white border border-[#252836] font-mono text-[11px] max-h-56 overflow-y-auto flex flex-col gap-2">
                  {events.map((ev, idx) => (
                    <div key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-[#8B919B] shrink-0 text-[10px]">
                        [{ev.event_type.replace(/_/g, ' ')}]
                      </span>
                      <span
                        className={
                          ev.event_type.includes('COMPLETED')
                            ? 'text-emerald-400'
                            : ev.event_type.includes('FAILED')
                            ? 'text-red-400'
                            : ev.event_type.includes('APPROVAL')
                            ? 'text-amber-400'
                            : 'text-gray-300'
                        }
                      >
                        {ev.message}
                      </span>
                    </div>
                  ))}
                  {isRunning && (
                    <div className="flex items-center gap-2 text-[#8B919B] text-[10px] animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin text-[#6D4AFF]" />
                      <span>Orchestrating agent reasoning & tools...</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Execution Output Preview */}
            {isCompleted && execution?.output_data && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-left">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 mb-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Workflow Execution Succeeded</span>
                </div>
                <div className="text-xs text-emerald-800 leading-relaxed font-mono">
                  {typeof execution.output_data.summary === 'string'
                    ? execution.output_data.summary
                    : JSON.stringify(execution.output_data.summary, null, 2)}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-[#EFEFEA] bg-[#FAFAF8] flex items-center justify-between gap-3">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={isRunning}>
              Close
            </Button>

            {!execution || isFailed ? (
              <Button
                size="sm"
                onClick={handleRun}
                disabled={isRunning}
                className="bg-[#6D4AFF] hover:bg-[#5B3CE8] text-white"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    <span>Executing Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 mr-1.5 text-emerald-300" />
                    <span>Start Execution</span>
                  </>
                )}
              </Button>
            ) : isWaitingApproval ? (
              <Button
                size="sm"
                onClick={() => setShowApprovalModal(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <ShieldAlert className="w-3.5 h-3.5 mr-1.5" />
                Review Approval Gate
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => {
                  setExecution(null);
                  setEvents([]);
                }}
                className="bg-[#111318] text-white"
              >
                <Clock className="w-3.5 h-3.5 mr-1.5" />
                Run Again
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Embedded Approval Modal if Triggered */}
      {showApprovalModal && execution && (
        <ApprovalActionModal
          isOpen={showApprovalModal}
          onClose={() => setShowApprovalModal(false)}
          workspaceId={workspaceId}
          execution={execution}
          onDecisionCompleted={(updated) => {
            setExecution(updated);
            setShowApprovalModal(false);
            if (onExecutionCompleted) {
              onExecutionCompleted(updated);
            }
          }}
        />
      )}
    </>
  );
};
