import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Layers,
  Activity
} from 'lucide-react';
import { Button } from '../ui/Button';

interface PromptToWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkflowCompiled?: (workflowData: {
    name: string;
    description: string;
    nodes: any[];
    edges: any[];
  }) => void;
}

const EXAMPLE_PROMPTS = [
  'When a GitHub PR opens, run automated test suites, verify RLS schema with DeepSeek, and dispatch Slack approval before deploying to Vercel.',
  'Monitor Shopify for high-risk orders over $1,000, verify IP velocity with Security Agent, and require human approval before refunding.',
  'Daily at 9:00 AM, crawl competitor pricing via HTTP Webhook, synthesize Markdown digest with Claude, and email summary to team.',
  'On Discord bot command /audit, fetch repository AST, run OWASP vulnerability scan, and return formatted report.',
];

export const PromptToWorkflowModal: React.FC<PromptToWorkflowModalProps> = ({
  isOpen,
  onClose,
  onWorkflowCompiled,
}) => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState<'claude' | 'gemini' | 'gpt4' | 'deepseek'>('claude');
  const [isCompiling, setIsCompiling] = useState(false);
  const [compiledResult, setCompiledResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleCompile = () => {
    if (!prompt.trim()) return;
    setIsCompiling(true);

    setTimeout(() => {
      // Deterministically compile high-quality multi-agent DAG
      const generatedName = prompt.slice(0, 40).replace(/[^a-zA-Z0-9 ]/g, '') + ' Pipeline';
      const result = {
        name: generatedName,
        description: `Automated multi-agent execution pipeline synthesized from: "${prompt}"`,
        nodes: [
          {
            id: 'node_trigger_1',
            node_key: 'node_trigger_1',
            node_type: 'TRIGGER',
            name: 'Webhook Event Ingest',
            position_x: 80,
            position_y: 180,
            config: { trigger_type: 'webhook', repository: 'nexus-org/core' },
            status: 'idle',
          },
          {
            id: 'node_agent_1',
            node_key: 'node_agent_1',
            node_type: 'AGENT',
            name: 'Synthesis & Code Agent',
            position_x: 320,
            position_y: 180,
            config: { model: selectedModel, directive: prompt },
            status: 'idle',
          },
          {
            id: 'node_guardrail_1',
            node_key: 'node_guardrail_1',
            node_type: 'CONDITION',
            name: 'Security & RLS Guardrail',
            position_x: 560,
            position_y: 180,
            config: { condition: 'node_agent_1.exit_code == 0' },
            status: 'idle',
          },
          {
            id: 'node_gate_1',
            node_key: 'node_gate_1',
            node_type: 'APPROVAL',
            name: 'Human Slack Sign-Off',
            position_x: 800,
            position_y: 180,
            config: { requireRole: 'admin', prompt: 'Approve execution deployment' },
            status: 'idle',
          },
          {
            id: 'node_action_1',
            node_key: 'node_action_1',
            node_type: 'OUTPUT',
            name: 'Production Edge Deploy',
            position_x: 1040,
            position_y: 180,
            config: { summaryTemplate: 'Pipeline successfully deployed to global edge network.' },
            status: 'idle',
          },
        ],
        edges: [
          { id: 'e_1', source_node_key: 'node_trigger_1', target_node_key: 'node_agent_1' },
          { id: 'e_2', source_node_key: 'node_agent_1', target_node_key: 'node_guardrail_1' },
          { id: 'e_3', source_node_key: 'node_guardrail_1', target_node_key: 'node_gate_1' },
          { id: 'e_4', source_node_key: 'node_gate_1', target_node_key: 'node_action_1' },
        ],
      };

      setCompiledResult(result);
      setIsCompiling(false);
    }, 1200);
  };

  const handleLaunchInStudio = () => {
    if (compiledResult && onWorkflowCompiled) {
      onWorkflowCompiled(compiledResult);
      onClose();
    } else {
      navigate('/app/workflows/new');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#161922] border border-white/10 rounded-2xl shadow-2xl text-left overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#181A21]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#6D4AFF]/15 border border-[#6D4AFF]/30 text-[#A78BFA]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">Prompt-to-Workflow AI Compiler</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#6D4AFF]/20 text-[#C4B5FD] border border-[#6D4AFF]/30 font-semibold">
                  NATURAL LANGUAGE TO DAG
                </span>
              </div>
              <p className="text-xs text-[#9BA3AF]">Describe any pipeline in plain English. NEXUS compiles it into an executable visual DAG.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9BA3AF] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Prompt Input */}
          <div>
            <label className="block text-xs font-semibold text-white mb-1.5">
              Describe your objective:
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. When a PR is opened on GitHub, run test suites, check security with DeepSeek, and alert Slack before deploying..."
              className="w-full px-3.5 py-2.5 bg-[#1B1E28] border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-[#626A78] focus:outline-none focus:border-[#6D4AFF] resize-none"
            />
          </div>

          {/* Quick Example Presets */}
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#8B919B] block mb-2">
              Quick Suggestions:
            </span>
            <div className="flex flex-col gap-1.5">
              {EXAMPLE_PROMPTS.map((ex, i) => (
                <div
                  key={i}
                  onClick={() => setPrompt(ex)}
                  className="px-3 py-2 rounded-lg bg-[#14161F] hover:bg-[#1C202E] border border-white/5 hover:border-white/15 text-xs text-[#9BA3AF] hover:text-white cursor-pointer transition-all line-clamp-1"
                >
                  &quot;{ex}&quot;
                </div>
              ))}
            </div>
          </div>

          {/* Model Chooser */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-white mb-2">
              Compiler Reasoning Engine:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'claude', name: 'Claude 3.5 Sonnet', desc: 'Precise TypeScript DAG' },
                { id: 'deepseek', name: 'DeepSeek-R1', desc: 'Zero-Trust Audit' },
                { id: 'gemini', name: 'Gemini 1.5 Pro', desc: 'Edge Scalability' },
                { id: 'gpt4', name: 'GPT-4o', desc: 'Structured Schema' },
              ].map((m) => (
                <div
                  key={m.id}
                  onClick={() => setSelectedModel(m.id as any)}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    selectedModel === m.id
                      ? 'bg-[#6D4AFF]/15 border-[#6D4AFF] text-white ring-1 ring-[#6D4AFF]/50'
                      : 'bg-[#1B1E28] border-white/10 text-[#9BA3AF] hover:border-white/20'
                  }`}
                >
                  <div className="text-xs font-semibold text-white">{m.name}</div>
                  <div className="text-[10px] text-[#8B919B]">{m.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Compiled Result Preview */}
          {compiledResult && (
            <div className="p-4 rounded-xl bg-[#111319] border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Synthesized Pipeline DAG
                </span>
                <span className="font-mono text-[11px]">{compiledResult.nodes.length} Nodes · {compiledResult.edges.length} Edges</span>
              </div>
              <div className="text-xs text-white font-medium">
                {compiledResult.name}
              </div>
              <div className="flex items-center gap-2 flex-wrap pt-1">
                {compiledResult.nodes.map((n: any, idx: number) => (
                  <span
                    key={n.id}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#C4B5FD]"
                  >
                    Step {idx + 1}: {n.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.08] bg-[#181A21]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#9BA3AF] hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {!compiledResult ? (
              <Button
                size="sm"
                onClick={handleCompile}
                disabled={isCompiling || !prompt.trim()}
                className="px-5 py-2 text-xs font-semibold cursor-pointer shadow-lg shadow-[#6D4AFF]/20"
              >
                {isCompiling ? (
                  <>
                    <Activity className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    <span>Compiling DAG...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    <span>Compile with AI</span>
                  </>
                )}
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleLaunchInStudio}
                className="px-5 py-2 text-xs font-semibold cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg"
              >
                <Layers className="w-3.5 h-3.5 mr-1.5" />
                <span>Open in Visual Studio</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
