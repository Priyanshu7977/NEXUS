import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, 
  Pause,
  RotateCcw,
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
  Copy,
  Check,
  Download,
  Terminal,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  LucideIcon
} from 'lucide-react';
import { Button } from '../ui/Button';
import { WorkflowSettingsModal, WorkflowSettingsData, DEFAULT_WORKFLOW_SETTINGS } from '../workflows/WorkflowSettingsModal';

interface WorkflowNodeItem {
  id: string;
  type: 'trigger' | 'agent' | 'verification' | 'guardrail' | 'gate' | 'action';
  title: string;
  subtitle: string;
  details: string;
  model?: string;
  latency?: string;
  logs: string[];
}

const PREVIEW_NODES: WorkflowNodeItem[] = [
  {
    id: 'wf-trigger',
    type: 'trigger',
    title: 'GitHub Push',
    subtitle: 'Webhook · main branch',
    details: 'Triggered by commit #84f291: Add workspace RLS schema migration and multi-tenant isolation',
    latency: '140ms',
    logs: [
      'Webhook received from github.com/nexus-org/nexus-core',
      'Event: push on branch refs/heads/main (#84f291a)',
      'Payload validated with HMAC-SHA256 signature',
      'Dispatched pipeline DAG run #run_9042a'
    ]
  },
  {
    id: 'wf-code',
    type: 'agent',
    title: 'Code Synthesizer',
    subtitle: 'Synthesis & generation',
    model: 'Gemini 1.5 Pro',
    latency: '1.24s',
    details: 'Synthesized TypeScript database interfaces and verified Supabase client singleton (0 linter errors)',
    logs: [
      'Spawning ephemeral agent sandbox node:20-alpine',
      'Prompt: Synthesize TypeScript AST interfaces from supabase/migrations',
      'Generated 4 type definitions in types/database.ts',
      'Static analysis complete: zero compilation errors'
    ]
  },
  {
    id: 'wf-test',
    type: 'agent',
    title: 'Test Suite Runner',
    subtitle: 'Automated test suite',
    model: 'Claude 3.5 Sonnet',
    latency: '1.45s',
    details: 'Ran 18 unit and integration test suites in isolated sandbox (100% passed, 0 flaky tests)',
    logs: [
      'Mounting test volume and environment secrets',
      'Running vitest run --coverage (18 test suites)',
      'Statements: 98.4%, Branches: 95.1%, Functions: 100%',
      'All 142 assertions satisfied in 1,450ms'
    ]
  },
  {
    id: 'wf-security',
    type: 'guardrail',
    title: 'Security Auditor',
    subtitle: 'RLS & CVE vulnerability scan',
    model: 'GPT-4o Security',
    latency: '820ms',
    details: 'Scanned 12 RLS policies & AST dependencies: zero credential leaks or SQL injections found',
    logs: [
      'Scanning PostgreSQL Row-Level Security policies',
      'Validating tenant isolation boundaries for workspace_id',
      'Dependency vulnerability audit: 0 high/critical CVEs',
      'Security verification certified by Nexus Guardrail Engine'
    ]
  },
  {
    id: 'wf-gate',
    type: 'gate',
    title: 'Human Approval',
    subtitle: 'Release sign-off gate',
    latency: '950ms',
    details: 'Dispatched interactive sign-off request to Slack #nexus-releases; approved by @priyanshu',
    logs: [
      'Constructed interactive Slack release block message',
      'Dispatched sign-off notification to #nexus-releases',
      'Received signature approval token from @priyanshu',
      'Gate unlocked; pipeline proceeding to production deployment'
    ]
  },
  {
    id: 'wf-deploy',
    type: 'action',
    title: 'Deploy to Edge',
    subtitle: 'Edge production deployment',
    latency: '860ms',
    details: 'Deployed production build to global edge network with zero downtime (HTTP 200 OK verified)',
    logs: [
      'Syncing optimized bundle to global edge nodes (32 regions)',
      'Executing post-deploy synthetic health check',
      'GET https://nexus-platform.io/api/health -> 200 OK (22ms)',
      'Pipeline execution successfully completed in 5.46s'
    ]
  }
];

const NODE_ICONS: Record<string, LucideIcon> = {
  trigger: GitCommit,
  agent: Bot,
  verification: CheckCircle2,
  guardrail: Shield,
  gate: UserCheck,
  action: Rocket
};

export const WorkflowPreview: React.FC = () => {
  // Navigation & View Mode
  const [viewMode, setViewMode] = useState<'canvas' | 'yaml'>('canvas');
  const [activeNodeId, setActiveNodeId] = useState<string>('wf-code');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isTerminalExpanded, setIsTerminalExpanded] = useState<boolean>(true);
  const [copiedYaml, setCopiedYaml] = useState<boolean>(false);

  // Workflow Settings State
  const [workflowSettings, setWorkflowSettings] = useState<WorkflowSettingsData>(DEFAULT_WORKFLOW_SETTINGS);

  // Interactive Simulation State
  const [simStatus, setSimStatus] = useState<'idle' | 'running' | 'paused' | 'completed'>('idle');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [terminalLogs, setTerminalLogs] = useState<Array<{ timestamp: string; stepTitle: string; text: string; level: string }>>([]);

  const timerRef = useRef<any>(null);
  const stepIntervalRef = useRef<any>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
    };
  }, []);

  // Elapsed timer when running
  useEffect(() => {
    if (simStatus === 'running') {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => +(prev + 0.1).toFixed(1));
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [simStatus]);

  // Step progression handler
  const advanceStep = (nextIndex: number) => {
    if (nextIndex >= PREVIEW_NODES.length) {
      // Completed!
      setSimStatus('completed');
      setActiveNodeId(PREVIEW_NODES[PREVIEW_NODES.length - 1].id);
      setTerminalLogs((prev) => [
        ...prev,
        {
          timestamp: 'DONE',
          stepTitle: 'PIPELINE',
          text: '✓ All 6 pipeline nodes executed deterministically with 0 errors.',
          level: 'SUCCESS',
        },
      ]);
      return;
    }

    setCurrentStepIndex(nextIndex);
    const node = PREVIEW_NODES[nextIndex];
    setActiveNodeId(node.id);

    // Stream logs for this step
    node.logs.forEach((logText, lIdx) => {
      setTimeout(() => {
        setTerminalLogs((prev) => [
          ...prev,
          {
            timestamp: `${(nextIndex * 0.9 + lIdx * 0.2).toFixed(1)}s`,
            stepTitle: node.title,
            text: logText,
            level: lIdx === node.logs.length - 1 ? 'OK' : 'INFO',
          },
        ]);
      }, lIdx * 180);
    });

    // Schedule next node
    stepIntervalRef.current = setTimeout(() => {
      advanceStep(nextIndex + 1);
    }, 1100);
  };

  const handleStartSimulation = () => {
    if (simStatus === 'paused') {
      setSimStatus('running');
      advanceStep(currentStepIndex);
      return;
    }

    // Fresh run
    setSimStatus('running');
    setCurrentStepIndex(0);
    setElapsedSeconds(0);
    setTerminalLogs([
      {
        timestamp: '0.0s',
        stepTitle: 'DAG RUNNER',
        text: `Initializing pipeline execution for branch "${workflowSettings.triggerBranch}"...`,
        level: 'INIT',
      },
    ]);
    advanceStep(0);
  };

  const handlePauseSimulation = () => {
    setSimStatus('paused');
    if (stepIntervalRef.current) clearTimeout(stepIntervalRef.current);
  };

  const handleResetSimulation = () => {
    setSimStatus('idle');
    setCurrentStepIndex(-1);
    setElapsedSeconds(0);
    setActiveNodeId(PREVIEW_NODES[1].id);
    setTerminalLogs([]);
    if (stepIntervalRef.current) clearTimeout(stepIntervalRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const activeNode = PREVIEW_NODES.find((n) => n.id === activeNodeId) || PREVIEW_NODES[1];

  const yamlContent = `name: ${workflowSettings.name}
slug: ${workflowSettings.slug}
version: "3.1"
description: "${workflowSettings.description}"

trigger:
  event: github.push
  branch: ${workflowSettings.triggerBranch}
  filter:
    paths: ["src/**", "supabase/**"]

settings:
  timeout_minutes: ${workflowSettings.executionTimeoutMinutes}
  max_concurrency: ${workflowSettings.maxConcurrency}
  failure_strategy: ${workflowSettings.failureStrategy}
  slack_channel: "${workflowSettings.slackChannel}"
  approval_quorum: ${workflowSettings.approvalQuorum}

pipeline:
  - id: wf-trigger
    type: trigger
    source: github-webhook
    branch: ${workflowSettings.triggerBranch}

  - id: wf-code
    name: Code Synthesizer
    type: agent
    needs: [wf-trigger]
    model: gemini-1.5-pro
    action: generate-typescript-interfaces

  - id: wf-test
    name: Test Suite Runner
    type: agent
    needs: [wf-code]
    model: claude-3-5-sonnet
    command: npm test -- --coverage

  - id: wf-security
    name: Security Auditor
    type: guardrail
    needs: [wf-test]
    model: gpt-4o
    checks: [rls_policy, secret_leak, cve_audit]

  - id: wf-gate
    name: Human Approval
    type: gate
    needs: [wf-security]
    channel: "${workflowSettings.slackChannel}"
    quorum: ${workflowSettings.approvalQuorum}

  - id: wf-deploy
    name: Deploy to Edge
    type: action
    needs: [wf-gate]
    target: vercel-production
    url: https://nexus-platform.io`;

  const handleCopyYaml = () => {
    navigator.clipboard.writeText(yamlContent);
    setCopiedYaml(true);
    setTimeout(() => setCopiedYaml(false), 2000);
  };

  const handleDownloadYaml = () => {
    const blob = new Blob([yamlContent], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowSettings.slug}.nexus.yaml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section id="workflow" className="relative py-14 sm:py-18 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F6F6F3] via-white to-[#FAFAF8] text-[#111318] border-y border-[#E5E5E2]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="max-w-3xl mb-8 lg:mb-10 text-left">
          <span className="text-xs font-mono uppercase tracking-wider text-[#6D4AFF] block mb-2 font-semibold">
            Visual Workflow Studio
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#111318] leading-[1.1] mb-4">
            Build workflows visually.
          </h2>
          <p className="text-base sm:text-lg text-[#626873] leading-relaxed">
            Construct deterministic multi-agent execution pipelines using an intuitive node canvas. Connect triggers, models, automated verifications, and human approval gates with live execution simulation.
          </p>
        </div>

        {/* Workflow Studio Canvas Card */}
        <div className="rounded-2xl border border-[#E5E5E2] bg-white shadow-[0_16px_45px_rgba(0,0,0,0.06)] overflow-hidden">
          {/* Top Canvas Bar */}
          <div className="flex flex-wrap items-center justify-between px-5 py-3.5 border-b border-[#E5E5E2] bg-[#FBFBFA] gap-3 text-left">
            {/* Left: Workflow Title & View Switcher */}
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#6D4AFF] animate-pulse" />
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#111318]">
                  {workflowSettings.name}.workflow
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#6D4AFF]/10 border border-[#6D4AFF]/20 text-[#6D4AFF] font-bold">
                  DAG ENGINE v3.1
                </span>
              </div>

              {/* View Mode Toggle: Canvas vs YAML */}
              <div className="hidden sm:flex items-center bg-[#F0F0EC] p-0.5 rounded-lg border border-[#E5E5E2] ml-2">
                <button
                  onClick={() => setViewMode('canvas')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                    viewMode === 'canvas'
                      ? 'bg-white text-[#111318] font-bold shadow-xs'
                      : 'text-[#626873] hover:text-[#111318]'
                  }`}
                >
                  Canvas View
                </button>
                <button
                  onClick={() => setViewMode('yaml')}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer flex items-center gap-1 ${
                    viewMode === 'yaml'
                      ? 'bg-white text-[#111318] font-bold shadow-xs'
                      : 'text-[#626873] hover:text-[#111318]'
                  }`}
                >
                  <FileCode className="w-3 h-3" />
                  <span>YAML Spec</span>
                </button>
              </div>
            </div>

            {/* Right: Controls & Actions */}
            <div className="flex items-center gap-2">
              {/* YAML Toggle (Mobile fallback) */}
              <button
                onClick={() => setViewMode(viewMode === 'canvas' ? 'yaml' : 'canvas')}
                className={`sm:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors cursor-pointer ${
                  viewMode === 'yaml'
                    ? 'bg-[#6D4AFF] text-white border-[#6D4AFF]'
                    : 'bg-white border-[#E5E5E2] text-[#626873]'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>{viewMode === 'canvas' ? 'YAML' : 'Canvas'}</span>
              </button>

              {/* Interactive Settings Button */}
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E2] hover:border-[#D4D4CE] text-xs font-medium text-[#111318] hover:bg-[#FAFAF8] transition-colors cursor-pointer shadow-2xs"
                title="Configure workflow settings"
              >
                <Settings2 className="w-3.5 h-3.5 text-[#6D4AFF]" />
                <span className="hidden sm:inline">Settings</span>
              </button>

              {/* Reset Simulation Button */}
              {simStatus !== 'idle' && (
                <button
                  onClick={handleResetSimulation}
                  className="p-1.5 rounded-lg bg-white border border-[#E5E5E2] text-xs text-[#626873] hover:text-[#111318] hover:bg-[#FAFAF8] transition-colors cursor-pointer shadow-2xs"
                  title="Reset Preview"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Run Preview / Pause Button */}
              {simStatus === 'running' ? (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handlePauseSimulation}
                  className="h-8 text-xs cursor-pointer border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100"
                >
                  <Pause className="w-3 h-3 mr-1 fill-amber-700" />
                  <span>Pause ({elapsedSeconds}s)</span>
                </Button>
              ) : simStatus === 'completed' ? (
                <Button
                  size="sm"
                  onClick={handleStartSimulation}
                  className="h-8 text-xs cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  <span>Replay (5.5s)</span>
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleStartSimulation}
                  className="h-8 text-xs cursor-pointer shadow-md shadow-[#6D4AFF]/20"
                >
                  <Play className="w-3 h-3 mr-1 fill-white" />
                  <span>Run Preview</span>
                </Button>
              )}
            </div>
          </div>

          {/* Conditional View: CANVAS VIEW or YAML VIEW */}
          {viewMode === 'yaml' ? (
            /* Clean YAML Editor View */
            <div className="bg-[#F8F9FA] p-4 sm:p-6 text-left border-b border-[#E5E5E2]">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E5E5E2]">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-mono font-bold text-[#111318]">{workflowSettings.slug}.nexus.yaml</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                    SCHEMA VALID
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadYaml}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E5E5E2] hover:border-[#D4D4CE] text-xs font-mono text-[#111318] hover:bg-[#FAFAF8] transition-colors cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-[#6D4AFF]" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={handleCopyYaml}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6D4AFF] text-white text-xs font-mono transition-colors hover:bg-[#5B3CE8] cursor-pointer shadow-2xs"
                  >
                    {copiedYaml ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedYaml ? 'Copied!' : 'Copy YAML'}</span>
                  </button>
                </div>
              </div>
              <div className="flex font-mono text-xs max-h-[460px] overflow-y-auto bg-white border border-[#E5E5E2] rounded-xl p-4 shadow-2xs">
                <div className="select-none pr-4 text-right text-[#8B919B] border-r border-[#EFEFEA] space-y-0.5 font-mono text-xs">
                  {yamlContent.split('\n').map((_, i) => (
                    <div key={i} className="leading-5">
                      {i + 1}
                    </div>
                  ))}
                </div>
                <pre className="pl-4 text-[#1F2937] leading-5 overflow-x-auto font-mono">
                  {yamlContent}
                </pre>
              </div>
            </div>
          ) : (
            /* Interactive Visual DAG Canvas */
            <div>
              {/* Live Run Status Bar */}
              {simStatus !== 'idle' && (
                <div className="px-5 py-2.5 bg-[#FBFBFA] border-b border-[#E5E5E2] flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      simStatus === 'running' ? 'bg-blue-600 animate-ping' :
                      simStatus === 'completed' ? 'bg-emerald-600' : 'bg-amber-500'
                    }`} />
                    <span className="text-[#111318] font-bold">
                      {simStatus === 'running' ? `Executing Step ${currentStepIndex + 1} of 6: ${PREVIEW_NODES[currentStepIndex]?.title}` :
                       simStatus === 'completed' ? '✓ Pipeline execution completed successfully' :
                       `Paused at Step ${currentStepIndex + 1}`}
                    </span>
                    <span className="text-[#8B919B]">({elapsedSeconds}s elapsed)</span>
                  </div>

                  {/* Progress bar */}
                  <div className="flex items-center gap-3 w-48 sm:w-64">
                    <div className="h-1.5 flex-1 bg-[#E5E5E2] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#6D4AFF] to-emerald-500 transition-all duration-300"
                        style={{
                          width: `${simStatus === 'completed' ? 100 : Math.max(8, ((currentStepIndex + 1) / PREVIEW_NODES.length) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-[11px] text-[#626873] font-mono">
                      {simStatus === 'completed' ? '100%' : `${Math.round(((currentStepIndex + 1) / PREVIEW_NODES.length) * 100)}%`}
                    </span>
                  </div>
                </div>
              )}

              {/* Canvas Viewport */}
              <div className="relative min-h-[380px] sm:min-h-[400px] p-4 sm:p-10 overflow-x-auto touch-pan-x overscroll-x-contain bg-[#FAFAF8]">
                {/* Zoom Controls HUD */}
                <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-white/95 border border-[#E5E5E2] p-1 rounded-lg backdrop-blur-md z-20 text-[#626873] shadow-xs">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(z - 10, 70))}
                    className="p-1.5 hover:text-[#111318] hover:bg-[#F2F2EE] rounded cursor-pointer"
                    aria-label="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-mono px-1.5 font-semibold text-[#111318]">{zoomLevel}%</span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(z + 10, 130))}
                    className="p-1.5 hover:text-[#111318] hover:bg-[#F2F2EE] rounded cursor-pointer"
                    aria-label="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setZoomLevel(100)}
                    className="p-1.5 hover:text-[#111318] hover:bg-[#F2F2EE] rounded border-l border-[#E5E5E2] cursor-pointer"
                    aria-label="Reset Zoom"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Node Chain */}
                <div
                  className="relative min-w-[980px] flex items-center justify-between py-12 transition-transform duration-150"
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'left center' }}
                >
                  {/* Background Cable */}
                  <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-[2px] bg-[#E5E5E2] -z-0" />

                  {/* Active Cable Energy Flow when running */}
                  <div
                    className="absolute left-8 top-1/2 -translate-y-1/2 h-[3px] bg-gradient-to-r from-emerald-500 via-[#6D4AFF] to-[#3B82F6] -z-0 transition-all duration-500 shadow-[0_0_10px_rgba(109,74,255,0.4)]"
                    style={{
                      width: simStatus === 'idle'
                        ? '100%'
                        : simStatus === 'completed'
                        ? '100%'
                        : `${((currentStepIndex + 0.5) / PREVIEW_NODES.length) * 100}%`,
                      opacity: simStatus === 'idle' ? 0.4 : 1,
                    }}
                  />

                  {PREVIEW_NODES.map((node, index) => {
                    const IconComponent = NODE_ICONS[node.type] || Bot;
                    const isSelected = node.id === activeNodeId;

                    // Dynamic Node Status during Simulation
                    let nodeStatus: 'WAITING' | 'RUNNING' | 'COMPLETED' = 'COMPLETED';
                    if (simStatus === 'running' || simStatus === 'paused') {
                      if (index < currentStepIndex) nodeStatus = 'COMPLETED';
                      else if (index === currentStepIndex) nodeStatus = 'RUNNING';
                      else nodeStatus = 'WAITING';
                    } else if (simStatus === 'idle') {
                      nodeStatus = 'COMPLETED';
                    }

                    const statusStyles = {
                      COMPLETED: 'text-emerald-800 bg-emerald-50 border-emerald-200 font-bold',
                      RUNNING: 'text-blue-800 bg-blue-50 border-blue-200 animate-pulse font-bold',
                      WAITING: 'text-[#8B919B] bg-[#F6F6F3] border-[#E5E5E2]',
                    }[nodeStatus];

                    return (
                      <div key={node.id} className="relative z-10 flex flex-col items-center">
                        <div
                          onClick={() => setActiveNodeId(node.id)}
                          className={`w-44 p-4 rounded-xl border transition-all duration-200 cursor-pointer text-left ${
                            nodeStatus === 'RUNNING'
                              ? 'bg-white border-[#3B82F6] ring-4 ring-[#3B82F6]/15 shadow-md scale-105'
                              : isSelected
                              ? 'bg-white border-[#6D4AFF] ring-4 ring-[#6D4AFF]/15 shadow-md'
                              : 'bg-white border-[#E5E5E2] hover:border-[#D4D4CE] shadow-2xs hover:bg-[#FAFAF8]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2.5">
                            <div className={`p-1.5 rounded-lg border ${
                              nodeStatus === 'RUNNING' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                              nodeStatus === 'COMPLETED' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                              'bg-[#F6F6F3] border-[#E5E5E2] text-[#626873]'
                            }`}>
                              <IconComponent className="w-3.5 h-3.5" />
                            </div>
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${statusStyles}`}>
                              {nodeStatus}
                            </span>
                          </div>

                          <div className="text-xs font-bold text-[#111318] mb-0.5 truncate flex items-center justify-between">
                            <span>{node.title}</span>
                            {nodeStatus === 'COMPLETED' && (
                              <span className="text-[9px] font-mono text-[#8B919B] font-normal">{node.latency}</span>
                            )}
                          </div>

                          <div className="text-[10px] text-[#626873] truncate mb-2">
                            {node.subtitle}
                          </div>

                          <div className="flex items-center justify-between text-[9px] font-mono text-[#8B919B] pt-2 border-t border-[#F0F0EC]">
                            <span>in: [event]</span>
                            <span>out: [state]</span>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono text-[#8B919B] mt-3">
                          Step 0{index + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Streaming Live Execution Terminal (Expandable) */}
              <div className="border-t border-[#E5E5E2] bg-[#F8F9FA] text-left">
                <div
                  onClick={() => setIsTerminalExpanded(!isTerminalExpanded)}
                  className="flex items-center justify-between px-5 py-2.5 bg-[#FBFBFA] hover:bg-[#F6F6F3] transition-colors cursor-pointer border-b border-[#EFEFEA]"
                >
                  <div className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-[#6D4AFF]" />
                    <span className="text-xs font-mono font-bold text-[#111318]">Live Execution Terminal</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#E5E5E2] text-[#626873]">
                      {terminalLogs.length} events
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#626873]">
                    <span>{isTerminalExpanded ? 'Hide Console' : 'Show Console'}</span>
                    {isTerminalExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                  </div>
                </div>

                {isTerminalExpanded && (
                  <div className="p-4 max-h-44 overflow-y-auto font-mono text-[11px] space-y-1.5 bg-[#F8F9FA]">
                    {terminalLogs.length === 0 ? (
                      <div className="text-[#8B919B] italic py-2 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Click &quot;Run Preview&quot; above to play real-time pipeline execution simulation.</span>
                      </div>
                    ) : (
                      terminalLogs.map((log, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 leading-relaxed">
                          <span className="text-[#8B919B] shrink-0">[{log.timestamp}]</span>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold shrink-0 ${
                            log.level === 'SUCCESS' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' :
                            log.level === 'OK' ? 'bg-blue-50 border border-blue-200 text-blue-800' :
                            log.level === 'INIT' ? 'bg-purple-50 border border-purple-200 text-purple-800' :
                            'bg-[#E5E5E2] text-[#626873]'
                          }`}>
                            {log.stepTitle}
                          </span>
                          <span className="text-[#1F2937] break-all font-mono">{log.text}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom Step Details & Studio Link */}
          <div className="px-6 py-3 bg-[#FBFBFA] border-t border-[#E5E5E2] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#626873] text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[#8B919B]">Selected Step:</span>
              <span className="text-[#111318] font-bold">{activeNode.title}</span>
              {activeNode.model && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-50 text-[#6D4AFF] border border-purple-200 font-semibold">
                  {activeNode.model}
                </span>
              )}
              <span className="text-[#626873] truncate max-w-md">({activeNode.details})</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                to="/app/workflows/new"
                className="text-xs font-semibold text-[#6D4AFF] hover:text-[#5B3CE8] transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Open in Visual Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal (Workable and interactive!) */}
      <WorkflowSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={workflowSettings}
        onSave={(updated) => {
          setWorkflowSettings(updated);
        }}
      />
    </section>
  );
};
