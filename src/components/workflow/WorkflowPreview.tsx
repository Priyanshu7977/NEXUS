import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, 
  Settings2, 
  FileCode, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  GitCommit,
  Bot,
  Shield,
  UserCheck,
  Rocket,
  CheckCircle2,
  LucideIcon
} from 'lucide-react';
import { Button } from '../ui/Button';

interface WorkflowNodeItem {
  id: string;
  type: 'trigger' | 'agent' | 'verification' | 'guardrail' | 'gate' | 'action';
  title: string;
  subtitle: string;
  status: 'COMPLETED' | 'RUNNING' | 'WAITING' | 'PREVIEW';
  details: string;
}

const NODE_ICONS: Record<string, LucideIcon> = {
  trigger: GitCommit,
  agent: Bot,
  verification: CheckCircle2,
  guardrail: Shield,
  gate: UserCheck,
  action: Rocket
};

export const WorkflowPreview: React.FC = () => {
  const [activeNodeId, setActiveNodeId] = useState<string>('wf-code');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isYamlOpen, setIsYamlOpen] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const handleRunPreview = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    const nodeIds = ['wf-trigger', 'wf-code', 'wf-test', 'wf-security', 'wf-gate', 'wf-deploy'];
    let stepIndex = 0;
    setActiveNodeId(nodeIds[0]);

    const interval = setInterval(() => {
      stepIndex++;
      if (stepIndex < nodeIds.length) {
        setActiveNodeId(nodeIds[stepIndex]);
      } else {
        clearInterval(interval);
        setIsSimulating(false);
      }
    }, 700);
  };

  const nodes: WorkflowNodeItem[] = [
    {
      id: 'wf-trigger',
      type: 'trigger',
      title: 'GitHub Push',
      subtitle: 'Webhook · main branch',
      status: 'COMPLETED',
      details: 'Triggered by commit #84f291: Add workspace RLS schema migration'
    },
    {
      id: 'wf-code',
      type: 'agent',
      title: 'Code Agent',
      subtitle: 'Synthesis & generation',
      status: isSimulating && activeNodeId === 'wf-code' ? 'RUNNING' : 'COMPLETED',
      details: 'Synthesized TypeScript interfaces and verified Supabase client singleton (0 errors)'
    },
    {
      id: 'wf-test',
      type: 'agent',
      title: 'Test Agent',
      subtitle: 'Automated test suite',
      status: isSimulating && activeNodeId === 'wf-test' ? 'RUNNING' : 'COMPLETED',
      details: 'Ran 14 unit test suites, lint checks, and typecheck builds in ephemeral sandbox (100% passed)'
    },
    {
      id: 'wf-security',
      type: 'guardrail',
      title: 'Security Agent',
      subtitle: 'RLS & vulnerability audit',
      status: isSimulating && activeNodeId === 'wf-security' ? 'RUNNING' : 'COMPLETED',
      details: 'Scanned 6 RLS policies: zero credential leaks, SQL injections, or boundary bypasses'
    },
    {
      id: 'wf-gate',
      type: 'gate',
      title: 'Human Approval',
      subtitle: 'Release sign-off gate',
      status: isSimulating && activeNodeId === 'wf-gate' ? 'RUNNING' : 'COMPLETED',
      details: 'Verified and approved by release engineering lead (@priyanshu)'
    },
    {
      id: 'wf-deploy',
      type: 'action',
      title: 'Deploy',
      subtitle: 'Vercel production deploy',
      status: isSimulating && activeNodeId === 'wf-deploy' ? 'RUNNING' : 'COMPLETED',
      details: 'Deployed verified production build to global edge network with 0 downtime (200 OK)'
    }
  ];

  const activeNode = nodes.find((n) => n.id === activeNodeId) || nodes[1];

  return (
    <section id="workflow" className="relative py-14 sm:py-18 lg:py-20 px-4 sm:px-6 lg:px-8 bg-[#111318] text-[#F5F7FA]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="max-w-3xl mb-10 lg:mb-12 text-left">
          <span className="text-xs font-mono uppercase tracking-wider text-[#6D4AFF] block mb-2 font-semibold">
            Workflow Builder
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.1] mb-4">
            Build workflows visually.
          </h2>
          <p className="text-base sm:text-lg text-[#9BA3AF] leading-relaxed">
            Construct multi-agent execution pipelines using an intuitive node canvas. Connect triggers, models, automated verifications, and human approval gates.
          </p>
        </div>

        {/* Workflow Studio Canvas Card */}
        <div className="rounded-2xl border border-white/10 bg-[#15171C] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden">
          {/* Top Canvas Bar */}
          <div className="flex flex-wrap items-center justify-between px-5 py-3.5 border-b border-white/[0.08] bg-[#181A21]/90 gap-3 text-left">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#6D4AFF]" />
              <span className="text-sm font-semibold text-white">
                ci-orchestration.workflow
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#9BA3AF]">
                DAG ENGINE
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsYamlOpen(!isYamlOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors border ${
                  isYamlOpen
                    ? 'bg-[#6D4AFF]/20 border-[#6D4AFF]/40 text-white'
                    : 'bg-white/5 border-white/10 text-[#9BA3AF] hover:text-white'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>YAML</span>
              </button>

              <Link
                to="/docs"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-[#9BA3AF] hover:text-white transition-colors"
                aria-label="Workflow Configuration Docs"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Settings</span>
              </Link>

              <Button
                size="sm"
                onClick={handleRunPreview}
                className="h-8 text-xs cursor-pointer"
                disabled={isSimulating}
              >
                <Play className={`w-3 h-3 mr-1 fill-white ${isSimulating ? 'animate-spin' : ''}`} />
                <span>{isSimulating ? 'Simulating...' : 'Run Preview'}</span>
              </Button>
            </div>
          </div>

          {/* Mobile Swipe Guidance Banner */}
          <div className="sm:hidden flex items-center justify-between px-4 py-2 bg-[#181A21] border-b border-white/[0.08] text-[10px] font-mono text-[#9BA3AF]">
            <span>DAG Pipeline Canvas</span>
            <span className="text-[#6D4AFF]">← Swipe horizontally →</span>
          </div>

          {/* Canvas Viewport */}
          <div className="relative min-h-[380px] sm:min-h-[420px] p-4 sm:p-10 overflow-x-auto touch-pan-x overscroll-x-contain bg-grid-dark bg-[#111318]">
            {/* Zoom Controls HUD */}
            <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-[#181A21]/90 border border-white/10 p-1 rounded-lg backdrop-blur-md z-20 text-[#9BA3AF]">
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 10, 70))}
                className="p-1.5 hover:text-white hover:bg-white/5 rounded"
                aria-label="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono px-1.5">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 10, 130))}
                className="p-1.5 hover:text-white hover:bg-white/5 rounded"
                aria-label="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(100)}
                className="p-1.5 hover:text-white hover:bg-white/5 rounded border-l border-white/10"
                aria-label="Reset Zoom"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Node Chain */}
            <div
              className="relative min-w-[940px] flex items-center justify-between py-12 transition-transform duration-150"
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'left center' }}
            >
              {/* Connecting Cable Line */}
              <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-emerald-500/40 via-[#6D4AFF]/40 to-[#3B82F6]/40 -z-0" />

              {nodes.map((node, index) => {
                const IconComponent = NODE_ICONS[node.type] || Bot;
                const isSelected = node.id === activeNodeId;

                const statusColor = {
                  COMPLETED: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                  RUNNING: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
                  WAITING: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                  PREVIEW: 'text-[#8B919B] bg-white/5 border-white/10',
                }[node.status];

                return (
                  <div key={node.id} className="relative z-10 flex flex-col items-center">
                    <div
                      onClick={() => setActiveNodeId(node.id)}
                      className={`w-40 p-4 rounded-xl border transition-all duration-150 cursor-pointer text-left ${
                        isSelected
                          ? 'bg-[#1C1F26] border-[#6D4AFF] shadow-[0_0_20px_rgba(109,74,255,0.25)] scale-105'
                          : 'bg-[#181A21] border-white/10 hover:border-white/20 hover:bg-[#1C1F26]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white">
                          <IconComponent className="w-3.5 h-3.5 text-[#6D4AFF]" />
                        </div>
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${statusColor}`}>
                          {node.status}
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-white mb-0.5 truncate">
                        {node.title}
                      </div>

                      <div className="text-[10px] text-[#9BA3AF] truncate mb-2">
                        {node.subtitle}
                      </div>

                      <div className="flex items-center justify-between text-[9px] font-mono text-[#626A78] pt-2 border-t border-white/[0.06]">
                        <span>in: [event]</span>
                        <span>out: [state]</span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-[#626A78] mt-3">
                      Step 0{index + 1}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* YAML Preview Drawer */}
            {isYamlOpen && (
              <div className="absolute inset-x-0 bottom-0 max-h-60 bg-[#0E1015]/98 border-t border-white/10 p-4 font-mono text-xs text-[#9BA3AF] overflow-y-auto z-30 text-left">
                <div className="flex items-center justify-between mb-2 text-[11px] text-white border-b border-white/10 pb-1">
                  <span>ci-orchestration.nexus.yaml</span>
                  <span className="text-emerald-400">SCHEMA VALID</span>
                </div>
                <pre className="text-emerald-300/90 leading-relaxed">
{`name: ci-orchestration
trigger:
  event: github.push
  branch: main
pipeline:
  - id: code_agent
    type: code-generator
  - id: test_agent
    needs: [code_agent]
    type: test-suite-runner
  - id: security_agent
    needs: [test_agent]
    type: rls-security-auditor
  - id: human_approval
    needs: [security_agent]
    gate: slack-dispatch
  - id: deploy_target
    needs: [human_approval]
    action: vercel-deployment`}
                </pre>
              </div>
            )}
          </div>

          {/* Bottom Status Info */}
          <div className="px-6 py-3 bg-[#181A21] border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#9BA3AF] text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[#626A78]">Selected Step:</span>
              <span className="text-white font-semibold">{activeNode.title}</span>
              <span className="text-[#626A78]">({activeNode.details})</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-[#626A78]">Deterministic DAG Pipeline</span>
              <Link
                to="/signup"
                className="text-xs font-semibold text-[#6D4AFF] hover:text-[#8264FF] transition-colors inline-flex items-center gap-1"
              >
                Open in Studio →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
