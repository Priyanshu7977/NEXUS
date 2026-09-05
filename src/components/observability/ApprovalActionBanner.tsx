import React, { useState } from 'react';
import { LiveApprovalState } from '../../types/observability';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { resumeWorkflowExecution } from '../../runtime/workflowEngine';
import { ShieldAlert, CheckCircle2, XCircle, Clock, ShieldCheck, Loader2 } from 'lucide-react';

interface ApprovalActionBannerProps {
  workspaceId: string;
  executionId: string;
  approval: LiveApprovalState;
  onDecisionSubmitted?: () => void;
}

export const ApprovalActionBanner: React.FC<ApprovalActionBannerProps> = ({
  workspaceId,
  executionId,
  approval,
  onDecisionSubmitted,
}) => {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isWaiting = approval.status === 'waiting';
  const isApproved = approval.status === 'approved';
  const isRejected = approval.status === 'rejected';

  const handleDecision = async (decision: 'approved' | 'rejected') => {
    setSubmitting(true);
    setError(null);
    try {
      await resumeWorkflowExecution({
        workspaceId,
        executionId,
        nodeKey: approval.node_key,
        decision: decision === 'approved' ? 'approve' : 'reject',
        notes: feedback || undefined,
        decidedBy: user?.name || user?.email || 'Admin Reviewer',
        userId: user?.id || 'admin_user',
      });
      if (onDecisionSubmitted) {
        onDecisionSubmitted();
      }
    } catch (err: any) {
      console.error('[NEXUS ApprovalActionBanner] Error resolving approval:', err);
      setError(err.message || 'Failed to submit approval decision.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isApproved) {
    return (
      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-emerald-800">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <span className="font-bold">{approval.title}</span> — Approved
            {approval.resolved_at && (
              <span className="text-[11px] text-emerald-700 font-mono ml-2">
                at {new Date(approval.resolved_at).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
          APPROVED
        </span>
      </div>
    );
  }

  if (isRejected) {
    return (
      <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-red-800">
          <XCircle className="w-5 h-5 text-red-600 shrink-0" />
          <div>
            <span className="font-bold">{approval.title}</span> — Rejected
            {approval.resolved_at && (
              <span className="text-[11px] text-red-700 font-mono ml-2">
                at {new Date(approval.resolved_at).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold">
          REJECTED
        </span>
      </div>
    );
  }

  if (!isWaiting) return null;

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/80 border-2 border-amber-300 text-left shadow-sm animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 border border-amber-300 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-200/60 text-amber-900 uppercase tracking-wider mb-1">
              ACTION REQUIRED
            </div>
            <h3 className="text-base font-bold text-[#111318]">
              {approval.title}
            </h3>
            <p className="text-xs text-[#626873] mt-1 leading-relaxed max-w-xl">
              {approval.description}
            </p>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            WAITING
          </span>
          <div className="text-[11px] text-[#8B919B] font-mono mt-1">
            Required: {approval.require_role?.toUpperCase() || 'ADMIN'}
          </div>
        </div>
      </div>

      {/* Context preview */}
      {approval.context && (
        <div className="mb-4 p-3.5 rounded-xl bg-white/80 border border-amber-200 text-xs">
          <div className="text-[11px] font-mono font-semibold text-[#8B919B] mb-1">
            EXECUTION CONTEXT SUMMARY
          </div>
          <div className="text-[#111318] leading-relaxed font-mono text-[11px] whitespace-pre-wrap">
            {typeof approval.context.summary === 'string'
              ? approval.context.summary
              : JSON.stringify(approval.context, null, 2)}
          </div>
        </div>
      )}

      {/* Feedback input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Optional reviewer notes or compliance sign-off rationale..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          disabled={submitting}
          className="w-full h-9 px-3 text-xs bg-white rounded-lg border border-amber-300 text-[#111318] placeholder-[#8B919B] outline-none focus:border-[#6D4AFF]"
        />
      </div>

      {error && (
        <div className="mb-3 text-xs font-semibold text-red-600">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          onClick={() => handleDecision('approved')}
          disabled={submitting}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
        >
          {submitting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
          ) : (
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
          )}
          Approve & Continue
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleDecision('rejected')}
          disabled={submitting}
          className="border-red-200 text-red-700 hover:bg-red-50 font-semibold"
        >
          <XCircle className="w-3.5 h-3.5 mr-1 text-red-600" />
          Reject Execution
        </Button>
      </div>
    </div>
  );
};
