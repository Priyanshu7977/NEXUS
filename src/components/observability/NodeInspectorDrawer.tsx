import React, { useState, useEffect } from 'react';
import { LiveNodeState, NormalizedExecutionEvent } from '../../types/observability';
import { Button } from '../ui/Button';
import {
  X,
  Bot,
  Wrench,
  ShieldAlert,
  Globe,
  Radio,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  AlertTriangle,
} from 'lucide-react';

interface NodeInspectorDrawerProps {
  node: LiveNodeState | null;
  events: NormalizedExecutionEvent[];
  isOpen: boolean;
  onClose: () => void;
}

export const NodeInspectorDrawer: React.FC<NodeInspectorDrawerProps> = ({
  node,
  events,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'Overview' | 'IO' | 'Events'>('Overview');

  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !node) return null;

  const nodeEvents = events.filter((e) => e.source_id === node.node_key);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getNodeIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'TRIGGER':
        return Radio;
      case 'AGENT':
        return Bot;
      case 'TOOL':
        return Wrench;
      case 'APPROVAL':
        return ShieldAlert;
      case 'DEPLOY':
      case 'DEPLOYMENT':
        return Globe;
      default:
        return Clock;
    }
  };

  const Icon = getNodeIcon(node.type);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-white h-full border-l border-[#E5E5E2] shadow-2xl flex flex-col overflow-hidden text-left animate-in slide-in-from-right duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EFEFEA] bg-[#FAFAF8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#E5E5E2] shadow-xs flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-[#6D4AFF]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#8B919B] uppercase">
                  {node.type}
                </span>
                <span className="text-[11px] font-mono text-[#8B919B]">
                  ({node.node_key})
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#111318] truncate max-w-xs">
                {node.name}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-[#EFEFEA] flex items-center justify-center text-[#626873] hover:text-[#111318] transition-colors cursor-pointer"
              aria-label="Close inspector"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center px-6 border-b border-[#EFEFEA] bg-white gap-4 text-xs font-medium">
          {(['Overview', 'IO', 'Events'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === tab
                  ? 'border-[#6D4AFF] text-[#6D4AFF] font-bold'
                  : 'border-transparent text-[#626873] hover:text-[#111318]'
              }`}
            >
              {tab === 'IO' ? 'Inputs & Outputs' : tab === 'Events' ? `Events (${nodeEvents.length})` : 'Node Overview'}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'Overview' && (
            <>
              {/* Status Grid */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] text-xs">
                <div>
                  <span className="text-[11px] font-medium text-[#8B919B]">Status</span>
                  <div className="font-bold text-[#111318] capitalize mt-0.5 flex items-center gap-1.5">
                    {node.status === 'completed' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : node.status === 'failed' ? (
                      <XCircle className="w-3.5 h-3.5 text-red-600" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                    )}
                    <span>{node.status.replace(/_/g, ' ')}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-medium text-[#8B919B]">Execution Duration</span>
                  <div className="font-mono text-[#111318] mt-0.5">
                    {node.duration_ms ? `${(node.duration_ms / 1000).toFixed(2)}s` : 'Pending'}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-medium text-[#8B919B]">Started At</span>
                  <div className="font-mono text-[11px] text-[#626873] mt-0.5 truncate">
                    {node.started_at ? new Date(node.started_at).toLocaleTimeString() : '—'}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-medium text-[#8B919B]">Completed At</span>
                  <div className="font-mono text-[11px] text-[#626873] mt-0.5 truncate">
                    {node.completed_at ? new Date(node.completed_at).toLocaleTimeString() : '—'}
                  </div>
                </div>
              </div>

              {/* Error Callout if node failed */}
              {node.error && (
                <div className="p-4 rounded-xl bg-red-50/70 border border-red-200 text-xs">
                  <div className="flex items-center gap-2 text-red-800 font-bold mb-1">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>Execution Error</span>
                  </div>
                  <p className="text-red-700 leading-relaxed font-mono text-[11px]">
                    {node.error}
                  </p>
                </div>
              )}

              {/* Node Summary Output */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#111318]">Step Result</span>
                  {node.output_data && (
                    <button
                      onClick={() => handleCopy(JSON.stringify(node.output_data, null, 2))}
                      className="inline-flex items-center gap-1 text-[11px] text-[#6D4AFF] hover:underline cursor-pointer"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy output'}</span>
                    </button>
                  )}
                </div>

                {node.output_data ? (
                  <pre className="p-4 rounded-xl bg-[#111318] text-emerald-400 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-64 border border-gray-800">
                    {JSON.stringify(node.output_data, null, 2)}
                  </pre>
                ) : (
                  <div className="p-6 text-center text-xs text-[#8B919B] bg-[#FAFAF8] rounded-xl border border-[#E5E5E2]">
                    No output generated yet for this step.
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'IO' && (
            <div className="space-y-4 text-xs">
              <div>
                <span className="font-bold text-[#111318] block mb-1.5">Input Arguments & Context</span>
                {node.input_data ? (
                  <pre className="p-3.5 rounded-xl bg-[#FAFAF8] text-[#111318] font-mono text-[11px] leading-relaxed overflow-x-auto border border-[#E5E5E2] max-h-48">
                    {JSON.stringify(node.input_data, null, 2)}
                  </pre>
                ) : (
                  <div className="p-4 text-center text-[#8B919B] bg-[#FAFAF8] rounded-xl border border-[#E5E5E2]">
                    No explicit input recorded.
                  </div>
                )}
              </div>

              <div>
                <span className="font-bold text-[#111318] block mb-1.5">Output Data</span>
                {node.output_data ? (
                  <pre className="p-3.5 rounded-xl bg-[#FAFAF8] text-[#111318] font-mono text-[11px] leading-relaxed overflow-x-auto border border-[#E5E5E2] max-h-60">
                    {JSON.stringify(node.output_data, null, 2)}
                  </pre>
                ) : (
                  <div className="p-4 text-center text-[#8B919B] bg-[#FAFAF8] rounded-xl border border-[#E5E5E2]">
                    Output not available.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'Events' && (
            <div className="space-y-2.5">
              {nodeEvents.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#8B919B] bg-[#FAFAF8] rounded-xl border border-[#E5E5E2]">
                  No events logged for this node.
                </div>
              ) : (
                nodeEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3 rounded-xl border border-[#E5E5E2] bg-white text-xs flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#8B919B]">
                      <span className="font-semibold text-[#111318] uppercase">
                        {ev.event_type}
                      </span>
                      <span>{new Date(ev.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-[#626873] leading-relaxed">{ev.message}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#EFEFEA] bg-[#FAFAF8] flex items-center justify-between text-xs text-[#8B919B]">
          <span className="font-mono">ESC to close</span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
