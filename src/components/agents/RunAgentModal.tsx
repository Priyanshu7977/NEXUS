import React, { useState } from 'react';
import { Agent, AgentExecution, AgentExecutionEvent } from '../../types/agent';
import { executeAgent } from '../../runtime/agentRuntime';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../brand/BrandLogo';
import { Button } from '../ui/Button';
import { 
  X, 
  Play, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Wrench, 
  Sparkles, 
  Copy, 
  Check, 
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface RunAgentModalProps {
  isOpen: boolean;
  agent: Agent;
  onClose: () => void;
  onExecutionCompleted?: (execution: AgentExecution) => void;
}

export const RunAgentModal: React.FC<RunAgentModalProps> = ({
  isOpen,
  agent,
  onClose,
  onExecutionCompleted,
}) => {
  const { currentWorkspace } = useAuth();

  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [events, setEvents] = useState<AgentExecutionEvent[]>([]);
  const [execution, setExecution] = useState<AgentExecution | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const suggestedPrompts = [
    'What repositories do I have and what are they used for?',
    'List all my GitHub repositories with their primary languages and star counts.',
    'Summarize my GitHub account activity and project focus.',
  ];

  const handleRun = async () => {
    if (!inputPrompt.trim() || !currentWorkspace?.id || isRunning) return;

    setIsRunning(true);
    setEvents([]);
    setExecution(null);

    try {
      const result = await executeAgent({
        workspaceId: currentWorkspace.id,
        agentId: agent.id,
        input: inputPrompt.trim(),
        onEvent: (ev) => {
          setEvents((prev) => [...prev, ev]);
        },
      });

      setExecution(result);
      if (onExecutionCompleted) {
        onExecutionCompleted(result);
      }
    } catch (err: any) {
      console.error('[NEXUS RunAgent] Execution error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = () => {
    if (execution?.output) {
      navigator.clipboard.writeText(execution.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 text-left">
      <div className="w-full max-w-3xl bg-white rounded-2xl border border-[#E5E5E2] shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#EFEFEA] flex items-center justify-between bg-[#FAFAF8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#E5E5E2] flex items-center justify-center shadow-xs">
              <BrandLogo brand={agent.model_provider} size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#111318]">
                  Run Agent: {agent.name}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-50 text-[#6D4AFF] border border-purple-200 uppercase font-semibold">
                  {agent.model_provider}/{agent.model_name}
                </span>
              </div>
              <p className="text-xs text-[#626873]">
                {agent.role || 'Specialized intelligence worker'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isRunning}
            className="p-2 rounded-xl text-[#8B919B] hover:text-[#111318] hover:bg-white transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6 flex-1">
          {/* Prompt Input Area */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-[#111318] flex items-center justify-between">
              <span>Task Instruction / User Prompt</span>
              <span className="text-[11px] font-mono text-[#8B919B]">
                Max steps: {agent.max_steps} · Timeout: {agent.max_runtime_seconds}s
              </span>
            </label>

            <textarea
              rows={3}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              disabled={isRunning}
              placeholder="e.g. What repositories are available in my connected GitHub account?"
              className="w-full p-3.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] focus:border-[#6D4AFF] focus:bg-white text-xs text-[#111318] placeholder:text-[#8B919B] outline-none transition-colors resize-none disabled:opacity-60"
            />

            {/* Quick Suggestions */}
            {!execution && !isRunning && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] text-[#8B919B] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#6D4AFF]" />
                  Suggested:
                </span>
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setInputPrompt(prompt)}
                    className="text-[11px] text-[#626873] bg-[#FAFAF8] hover:bg-[#F0F0EC] hover:text-[#111318] px-2.5 py-1 rounded-lg border border-[#E5E5E2] transition-colors cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Live Execution Stream */}
          {(isRunning || events.length > 0) && (
            <div className="p-4 rounded-xl bg-[#111318] text-white border border-[#252836] flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#252836]">
                <div className="flex items-center gap-2">
                  {isRunning ? (
                    <Loader2 className="w-4 h-4 text-[#6D4AFF] animate-spin" />
                  ) : execution?.status === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  )}
                  <span className="text-xs font-mono font-bold uppercase tracking-wider">
                    {isRunning ? 'Execution in Progress...' : `Status: ${execution?.status || 'Finished'}`}
                  </span>
                </div>

                {execution && (
                  <span className="text-[11px] font-mono text-[#8B919B]">
                    Latency: {(execution.duration_ms / 1000).toFixed(2)}s · Steps: {execution.steps_used}
                  </span>
                )}
              </div>

              {/* Event Log Lines */}
              <div className="flex flex-col gap-1.5 max-h-44 overflow-y-auto font-mono text-xs pr-1">
                {events.map((ev, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px] leading-relaxed">
                    <span className="text-[#8B919B] shrink-0">
                      [{new Date(ev.created_at).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                    </span>
                    {ev.event_type === 'TOOL_CALL' ? (
                      <span className="text-amber-400 flex items-center gap-1">
                        <Wrench className="w-3 h-3" />
                        {ev.message}
                      </span>
                    ) : ev.event_type === 'TOOL_RESULT' ? (
                      <span className="text-emerald-400">✓ {ev.message}</span>
                    ) : ev.event_type === 'AGENT_FAILED' || ev.event_type === 'LIMIT_REACHED' ? (
                      <span className="text-red-400">✕ {ev.message}</span>
                    ) : (
                      <span className="text-[#C5C8D4]">{ev.message}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Execution Result Box */}
          {execution && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#111318]">
                  Agent Response
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 text-xs text-[#626873] hover:text-[#111318] cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <Link
                    to={`/app/activity/${execution.id}`}
                    target="_blank"
                    className="inline-flex items-center gap-0.5 text-xs text-[#6D4AFF] hover:underline font-medium"
                  >
                    <span>View Trace</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {execution.error ? (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 leading-relaxed flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold mb-1">Execution Failed</div>
                    <div>{execution.error}</div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] text-xs text-[#111318] leading-relaxed whitespace-pre-wrap font-sans">
                  {execution.output}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[#EFEFEA] bg-[#FAFAF8] flex items-center justify-between">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isRunning}
          >
            Close
          </Button>

          <Button
            size="md"
            onClick={handleRun}
            disabled={isRunning || !inputPrompt.trim()}
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-1.5 fill-current" />
                Run Agent
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
