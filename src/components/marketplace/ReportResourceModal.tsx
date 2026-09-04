import React, { useState } from 'react';
import { X, Flag, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { MarketplaceResource, ReportCategory } from '../../types/marketplace';
import { submitMarketplaceReport } from '../../services/marketplaceService';

interface ReportResourceModalProps {
  isOpen: boolean;
  resource: MarketplaceResource | null;
  workspaceId: string;
  onClose: () => void;
}

export const ReportResourceModal: React.FC<ReportResourceModalProps> = ({
  isOpen,
  resource,
  workspaceId,
  onClose,
}) => {
  const [category, setCategory] = useState<ReportCategory>('SECURITY_VULNERABILITY');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !resource) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (details.trim().length < 10) {
      setErrorMsg('Please describe the issue in at least 10 characters.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await submitMarketplaceReport(workspaceId, resource.id, category, details);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setSubmitted(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-[#FDFCFA]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center border border-red-100">
              <Flag className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-950">Report Resource</h3>
              <p className="text-xs text-gray-500">{resource.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-medium text-gray-900">Report Received</h4>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Thank you for helping keep the NEXUS ecosystem safe. Our security and compliance
                team will review this submission promptly.
              </p>
              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium bg-gray-950 text-white rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                  Report Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ReportCategory)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                >
                  <option value="SECURITY_VULNERABILITY">Security Vulnerability / Exploit</option>
                  <option value="EXPOSED_SECRETS">Exposed Credentials or API Keys</option>
                  <option value="MALICIOUS_BEHAVIOR">Malicious Code / Dangerous Actions</option>
                  <option value="BROKEN_FUNCTIONALITY">Broken Functionality / Invalid Spec</option>
                  <option value="MISLEADING_METADATA">Misleading Metadata / Impersonation</option>
                  <option value="POLICY_VIOLATION">Terms of Service / Policy Violation</option>
                  <option value="OTHER">Other Issue</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                  Issue Details & Reproduction *
                </label>
                <textarea
                  required
                  rows={4}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Provide specific information regarding why this resource violates security, stability, or policy guidelines..."
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50"
                >
                  {submitting ? 'Submitting Report...' : 'Submit Report'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
