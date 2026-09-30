import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  X,
  Send,
  Key,
  Activity,
  ArrowRight
} from 'lucide-react';
import { Button } from '../ui/Button';
import { ApiKeysModal } from '../app/ApiKeysModal';
import { PromptToWorkflowModal } from '../workflow/PromptToWorkflowModal';

interface AgentChatMessage {
  id: string;
  role: 'user' | 'agent';
  agentName?: string;
  modelBrand?: string;
  text: string;
  timestamp: string;
  action?: {
    label: string;
    path: string;
  };
}

const DEFAULT_MESSAGES: AgentChatMessage[] = [
  {
    id: 'msg-1',
    role: 'agent',
    agentName: 'NEXUS Autonomous Co-Pilot',
    modelBrand: 'anthropic',
    text: 'Hello! I am your NEXUS Autonomous Co-Pilot powered by the Omni-Swarm engine (Claude 3.5 Sonnet, GPT-4o, Gemini 1.5 Pro, DeepSeek-R1). What would you like to build or orchestrate today?',
    timestamp: 'Just now',
  },
];

export const AgentCommandOrb: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AgentChatMessage[]>(DEFAULT_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [activeModel, setActiveModel] = useState<'claude' | 'gpt4' | 'gemini' | 'deepseek'>('claude');
  const [showKeyVault, setShowKeyVault] = useState(false);
  const [showPromptCompiler, setShowPromptCompiler] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const userPrompt = inputText.trim();
    const userMsg: AgentChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: userPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    setTimeout(() => {
      let agentReplyText = '';
      let action: any = null;

      const lower = userPrompt.toLowerCase();
      if (lower.includes('workflow') || lower.includes('pipeline') || lower.includes('dag')) {
        agentReplyText = `I have analyzed your objective: "${userPrompt}". I recommend a 4-node deterministic DAG with Webhook Trigger -> Code Synthesizer (Claude 3.5) -> Security Guardrail (DeepSeek-R1) -> Edge Deployment. Would you like to compile this directly into the Studio?`;
        action = { label: 'Open in Workflow Studio', path: '/app/workflows/new' };
      } else if (lower.includes('security') || lower.includes('audit') || lower.includes('rls')) {
        agentReplyText = `DeepSeek-R1 Red Team has initiated a zero-trust audit on your prompt. All database queries must enforce explicit workspace_id boundary checks with composite indices to prevent IDOR traversal.`;
        action = { label: 'Inspect Security Docs', path: '/docs' };
      } else if (lower.includes('model') || lower.includes('swarm') || lower.includes('debate')) {
        agentReplyText = `You can run all 4 frontier models simultaneously in the NEXUS Multi-Model Swarm Arena to compare synthesis speeds and build cross-model consensus.`;
        action = { label: 'Launch Swarm Arena', path: '/#swarm' };
      } else {
        agentReplyText = `Synthesized via ${
          activeModel === 'claude' ? 'Claude 3.5 Sonnet' :
          activeModel === 'gpt4' ? 'OpenAI GPT-4o' :
          activeModel === 'gemini' ? 'Gemini 1.5 Pro' : 'DeepSeek-R1'
        }: I am ready to orchestrate your multi-agent team across Supabase, GitHub, Slack, and Vercel connectors.`;
        action = { label: 'Explore Connectors', path: '/app/connectors' };
      }

      const agentReply: AgentChatMessage = {
        id: `agent-${Date.now()}`,
        role: 'agent',
        agentName: activeModel === 'claude' ? 'Claude Architect' :
                   activeModel === 'gpt4' ? 'GPT-4o Synthesizer' :
                   activeModel === 'gemini' ? 'Gemini Strategist' : 'DeepSeek Auditor',
        modelBrand: activeModel === 'claude' ? 'anthropic' :
                    activeModel === 'gpt4' ? 'openai' :
                    activeModel === 'gemini' ? 'google' : 'deepseek',
        text: agentReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action,
      };

      setMessages((prev) => [...prev, agentReply]);
      setIsThinking(false);
    }, 900);
  };

  return (
    <>
      {/* Floating Glowing Neural Orb */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 select-none">
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#181A24] border border-[#6D4AFF]/50 text-white shadow-[0_0_30px_rgba(109,74,255,0.4)] hover:shadow-[0_0_40px_rgba(109,74,255,0.6)] hover:scale-105 transition-all duration-200 cursor-pointer"
            aria-label="Open NEXUS Agent Co-Pilot"
          >
            {/* Animated Glow Halo */}
            <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#6D4AFF] via-[#3B82F6] to-cyan-400 opacity-30 group-hover:opacity-60 blur-sm transition-opacity animate-pulse" />

            <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-[#6D4AFF]/30 border border-[#6D4AFF] text-white">
              <Sparkles className="w-4 h-4 text-[#C4B5FD] animate-spin-slow" />
            </div>

            <div className="relative flex flex-col text-left">
              <span className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
                NEXUS Co-Pilot
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </span>
              <span className="text-[10px] font-mono text-[#9BA3AF]">Press Ctrl+K</span>
            </div>
          </button>
        </div>
      )}

      {/* Interactive Chat Window Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-[95vw] sm:w-[440px] h-[580px] max-h-[90vh] bg-[#14161F] border border-white/15 rounded-2xl shadow-[0_20px_70px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden text-left animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#181B26] border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#6D4AFF]/20 border border-[#6D4AFF]/40 flex items-center justify-center text-[#A78BFA]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">NEXUS Co-Pilot</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    LIVE
                  </span>
                </div>
                <span className="text-[10px] text-[#9BA3AF]">Omni-Swarm Multi-Agent Engine</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowKeyVault(true)}
                className="p-1.5 rounded-lg text-[#9BA3AF] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                title="API Key Vault"
              >
                <Key className="w-3.5 h-3.5 text-amber-400" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-[#9BA3AF] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Model Switcher Bar */}
          <div className="flex items-center gap-1 px-3 py-1.5 bg-[#10121A] border-b border-white/[0.06] overflow-x-auto text-[11px] font-mono">
            {[
              { id: 'claude', name: 'Claude 3.5' },
              { id: 'deepseek', name: 'DeepSeek-R1' },
              { id: 'gpt4', name: 'GPT-4o' },
              { id: 'gemini', name: 'Gemini 1.5' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setActiveModel(m.id as any)}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer shrink-0 ${
                  activeModel === m.id
                    ? 'bg-[#6D4AFF] text-white font-semibold'
                    : 'text-[#8B919B] hover:text-white hover:bg-white/5'
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#11131A] text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                {msg.role === 'agent' && (
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] text-[#9BA3AF]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6D4AFF]" />
                    <span className="font-semibold text-white">{msg.agentName}</span>
                    <span>• {msg.timestamp}</span>
                  </div>
                )}

                <div
                  className={`max-w-[88%] p-3 rounded-2xl leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#6D4AFF] text-white rounded-br-none'
                      : 'bg-[#1C202E] text-[#D1D5DB] border border-white/10 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {msg.action && (
                    <div className="mt-2.5 pt-2 border-t border-white/10">
                      <button
                        onClick={() => {
                          navigate(msg.action!.path);
                          setIsOpen(false);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#6D4AFF]/30 hover:bg-[#6D4AFF]/50 text-white font-semibold text-[11px] transition-colors cursor-pointer"
                      >
                        <span>{msg.action.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex items-center gap-2 text-xs text-[#9BA3AF] p-2">
                <Activity className="w-3.5 h-3.5 animate-spin text-[#6D4AFF]" />
                <span>Thinking & querying models...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Suggestions */}
          <div className="p-2 bg-[#14161F] border-t border-white/[0.06] flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono">
            <button
              onClick={() => setShowPromptCompiler(true)}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#C4B5FD] border border-white/5 flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>Compile Workflow</span>
            </button>

            <button
              onClick={() => {
                setInputText('Run zero-trust security audit on my database schema');
              }}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#9BA3AF] hover:text-white border border-white/5 shrink-0 cursor-pointer"
            >
              Security Audit
            </button>

            <button
              onClick={() => {
                setInputText('Compare GPT-4o vs Claude 3.5 Sonnet on this architecture');
              }}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#9BA3AF] hover:text-white border border-white/5 shrink-0 cursor-pointer"
            >
              Model Debate
            </button>
          </div>

          {/* Input Box */}
          <div className="p-3 bg-[#181B26] border-t border-white/[0.08] flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything or describe a workflow..."
              className="flex-1 px-3 py-2 bg-[#12141C] border border-white/10 rounded-xl text-xs text-white placeholder-[#626A78] focus:outline-none focus:border-[#6D4AFF]"
            />
            <Button
              size="sm"
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="h-8 w-8 p-0 rounded-xl cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ApiKeysModal isOpen={showKeyVault} onClose={() => setShowKeyVault(false)} />
      <PromptToWorkflowModal isOpen={showPromptCompiler} onClose={() => setShowPromptCompiler(false)} />
    </>
  );
};
