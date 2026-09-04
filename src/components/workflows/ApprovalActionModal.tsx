import React, { useState } from 'react';
import { Button } from '../ui/Button';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  X,
  UserCheck,
} from 'lucide-react';
import { WorkflowExecution } from '../../types/workflow';
import { resumeWorkflowExecution } from '../../runtime/workflowEngine';

interface ApprovalActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  execution: WorkflowExecution;
  onDecisionCompleted?: (updatedExecution: WorkflowExecution) => void;
}

export const ApprovalActionModal: React.FC<ApprovalActionModalProps> = ({
  isOpen,
  onClose,
  workspaceId,
  execution,
  onDecisionCompleted,
}) => {
  const [decisionNotes, setDecisionNotes] = useState('');
  const [reviewerName, setReviewerName] = useState('Security Lead');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const nodeKey = execution.current_node_key || 'node_approval';
  const approvalPrompt =
    execution.context_data?.[nodeKey]?.prompt ||
    execution.context_data?.trigger?.prompt ||
    'Verify security audit results and grant approval to complete pipeline execution.';

  const handleDecision = async (decision: 'approve' | 'reject') => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const updated = await resumeWorkflowExecution({
        workspaceId,
        executionId: execution.id,
        nodeKey,
        decision,
        notes: decisionNotes,
        decidedBy: reviewerName,
      });

      if (onDecisionCompleted) {
        onDecisionCompleted(updated);
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process approval decision.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-[#E5E5E2] shadow-2xl max-w-lg w-full overflow-hidden text-left flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#EFEFEA] flex items-center justify-between bg-[#FAFAF8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0 shadow-sm">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111318]">
                Human Approval Gate
              </h3>
              <p className="text-xs text-[#626873]">
                Workflow paused at node: <span className="font-mono text-[#111318]">{nodeKey}</span>
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

        {/* Content */}
        <div className="p-6 flex flex-col gap-5 max-h-[75vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2]">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#8B919B] mb-1.5 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#6D4AFF]" /> Approval Request Prompt
            </div>
            <p className="text-xs text-[#111318] leading-relaxed font-medium">
              {approvalPrompt}
            </p>
          </div>

          {/* Trigger & Git Metadata Strip */}
          {execution.trigger_data && (
            <div className="p-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] font-mono text-[#8B919B] block">REPOSITORY</span>
                <span className="font-semibold text-[#111318] truncate block">
                  {execution.trigger_data.repository || 'nexus/orchestrator-demo'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#8B919B] block">BRANCH & COMMIT</span>
                <span className="font-mono text-[#6D4AFF] text-[11px] truncate block">
                  {execution.trigger_data.branch || 'main'} · {execution.trigger_data.commit_sha?.slice(0, 7) || 'HEAD'}
                </span>
              </div>
              {execution.trigger_data.sender && (
                <div className="col-span-2 pt-1.5 border-t border-[#EFEFEA] flex items-center justify-between text-[11px] text-[#626873]">
                  <span>Pushed by @{execution.trigger_data.sender}</span>
                  {execution.trigger_data.commit_message && (
                    <span className="truncate max-w-[200px] text-[#8B919B] italic">
                      "{execution.trigger_data.commit_message}"
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Upstream Agent Findings Cards */}
          <div className="space-y-3">
            {execution.context_data?.node_code_analyst && (
              <div className="p-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-[#111318]">Code Analysis Verdict</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                    LOW RISK
                  </span>
                </div>
                <div className="text-xs text-[#626873] leading-relaxed max-h-24 overflow-y-auto font-mono text-[11px] bg-white p-2 rounded-lg border border-[#EFEFEA]">
                  {execution.context_data.node_code_analyst.output || 'Code diff inspected with zero syntax/type errors.'}
                </div>
              </div>
            )}

            {execution.context_data?.node_sec_auditor && (
              <div className="p-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-[#111318]">Security Auditor Verdict</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                    PASSED (0 LEAKS)
                  </span>
                </div>
                <div className="text-xs text-[#626873] leading-relaxed max-h-24 overflow-y-auto font-mono text-[11px] bg-white p-2 rounded-lg border border-[#EFEFEA]">
                  {execution.context_data.node_sec_auditor.output || 'Security audit passed. No plaintext secrets or dangerous dependencies detected.'}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111318] mb-1">
              Reviewer Name / Role
            </label>
            <input
              type="text"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              className="w-full h-9 px-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] text-xs text-[#111318] outline-none focus:border-[#6D4AFF]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111318] mb-1">
              Decision Notes & Feedback (Optional)
            </label>
            <textarea
              rows={2}
              value={decisionNotes}
              onChange={(e) => setDecisionNotes(e.target.value)}
              placeholder="e.g. Verified code analysis and security reports. Approved for Vercel production deployment."
              className="w-full p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] text-xs text-[#111318] outline-none focus:border-[#6D4AFF] resize-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#EFEFEA] bg-[#FAFAF8] flex items-center justify-between gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleDecision('reject')}
            disabled={isProcessing}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            {isProcessing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
            ) : (
              <XCircle className="w-3.5 h-3.5 mr-1.5" />
            )}
            Reject Execution
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => handleDecision('approve')}
              disabled={isProcessing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isProcessing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              )}
              Approve & Resume
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
