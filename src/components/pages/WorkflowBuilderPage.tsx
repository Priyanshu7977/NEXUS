import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { BrandLogo } from '../brand/BrandLogo';
import {
  ArrowLeft,
  Play,
  Save,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Plus,
  Trash2,
  Bot,
  Shield,
  Clock,
  Terminal,
  CheckCircle2,
  Sliders,
  Layers,
  FolderGit2,
  AlertCircle,
  FileText,
  HelpCircle,
  Loader2,
  ShieldAlert,
  Settings2,
  FileCode,
  Sparkles,
} from 'lucide-react';
import {
  WorkflowNode,
  WorkflowEdge,
  Workflow,
  WorkflowNodeType,
} from '../../types/workflow';
import {
  getWorkflowById,
  createWorkflow,
  updateWorkflow,
  SEED_DEFAULT_WORKFLOW,
} from '../../services/workflowService';
import { validateWorkflowGraph } from '../../runtime/workflow/graphValidator';
import { useAuth } from '../../context/AuthContext';
import { getWorkspaceAgents } from '../../services/agentService';
import { RunWorkflowModal } from '../workflows/RunWorkflowModal';
import { WorkflowSettingsModal, WorkflowSettingsData, DEFAULT_WORKFLOW_SETTINGS } from '../workflows/WorkflowSettingsModal';
import { WorkflowYamlModal } from '../workflows/WorkflowYamlModal';
import { PromptToWorkflowModal } from '../workflow/PromptToWorkflowModal';

interface NodeTemplate {
  category: WorkflowNodeType;
  type: string;
  name: string;
  icon: any;
  isBrand?: boolean;
  brand?: any;
  defaultConfig: Record<string, any>;
}

const NODE_TEMPLATES: NodeTemplate[] = [
  // Triggers
  {
    category: 'TRIGGER',
    type: 'manual_trigger',
    name: 'Manual Trigger',
    icon: Play,
    defaultConfig: { trigger_type: 'manual', repository: 'facebook/react' },
  },
  {
    category: 'TRIGGER',
    type: 'github_event',
    name: 'GitHub PR Trigger',
    icon: FolderGit2,
    isBrand: true,
    brand: 'github',
    defaultConfig: { trigger_type: 'github_event', event: 'pull_request.opened', repository: 'facebook/react' },
  },
  {
    category: 'TRIGGER',
    type: 'schedule_cron',
    name: 'Schedule Cron',
    icon: Clock,
    defaultConfig: { trigger_type: 'schedule_cron', cron: '0 0 * * *' },
  },

  // Agents
  {
    category: 'AGENT',
    type: 'security_agent',
    name: 'Security Auditor Agent',
    icon: Shield,
    defaultConfig: {
      model: 'gemini',
      directive: 'Perform security analysis on {{trigger.repository}}. Scan for CVEs, permission flaws, and secrets.',
    },
  },
  {
    category: 'AGENT',
    type: 'code_agent',
    name: 'Code Synthesizer Agent',
    icon: Bot,
    defaultConfig: {
      model: 'openai',
      directive: 'Review code changes and suggest patch improvements for {{trigger.repository}}.',
    },
  },
  {
    category: 'AGENT',
    type: 'research_agent',
    name: 'Research & Discovery Agent',
    icon: Bot,
    defaultConfig: {
      model: 'anthropic',
      directive: 'Survey repository architecture, documentation, and dependencies for {{trigger.repository}}.',
    },
  },

  // Tools
  {
    category: 'TOOL',
    type: 'github_tool',
    name: 'GitHub Repository Info',
    icon: FolderGit2,
    isBrand: true,
    brand: 'github',
    defaultConfig: {
      toolName: 'github_get_repository',
      args: { owner: 'facebook', repo: 'react' },
    },
  },
  {
    category: 'TOOL',
    type: 'github_pr_tool',
    name: 'GitHub Pull Requests',
    icon: FolderGit2,
    isBrand: true,
    brand: 'github',
    defaultConfig: {
      toolName: 'github_list_pull_requests',
      args: { owner: 'facebook', repo: 'react', state: 'open' },
    },
  },
  {
    category: 'TOOL',
    type: 'http_request',
    name: 'HTTP Webhook Tool',
    icon: Terminal,
    defaultConfig: {
      toolName: 'http_request',
      method: 'POST',
      endpoint: 'https://api.example.com/events',
    },
  },

  // Logic & Gates
  {
    category: 'APPROVAL',
    type: 'approval_gate',
    name: 'Human Approval Gate',
    icon: ShieldAlert,
    defaultConfig: {
      requireRole: 'admin',
      prompt: 'Review agent security audit and approve next remediation actions.',
    },
  },
  {
    category: 'CONDITION',
    type: 'condition_branch',
    name: 'Condition Branch',
    icon: Sliders,
    defaultConfig: {
      condition: "node_fetch.stars > 1000",
    },
  },

  // Output
  {
    category: 'OUTPUT',
    type: 'output_summary',
    name: 'Execution Report',
    icon: FileText,
    defaultConfig: {
      summaryTemplate: 'Workflow completed successfully for {{trigger.repository}}.',
    },
  },
];

export const WorkflowBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const targetId = id || searchParams.get('id');
  const { currentWorkspace } = useAuth();
  const workspaceId = currentWorkspace?.id || 'default-workspace';

  // Workflow Core State
  const [workflowId, setWorkflowId] = useState<string>(targetId || 'new');
  const [workflowName, setWorkflowName] = useState('Automated Repository Review & Security Gate');
  const [workflowDescription, setWorkflowDescription] = useState('Orchestrates AI security audit and human gate.');
  const [nodes, setNodes] = useState<WorkflowNode[]>(SEED_DEFAULT_WORKFLOW.nodes);
  const [edges, setEdges] = useState<WorkflowEdge[]>(SEED_DEFAULT_WORKFLOW.edges);
  const [triggerType, setTriggerType] = useState<Workflow['trigger_type']>('manual');

  // Studio Interactive State
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('node_auditor');
  const [activeCategory, setActiveCategory] = useState<'ALL' | WorkflowNodeType>('ALL');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [connectingSourceKey, setConnectingSourceKey] = useState<string | null>(null);
  const [showRunModal, setShowRunModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showYamlModal, setShowYamlModal] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [workflowSettings, setWorkflowSettings] = useState<WorkflowSettingsData>({
    ...DEFAULT_WORKFLOW_SETTINGS,
    name: workflowName,
    description: workflowDescription,
  });
  const [workspaceAgentsList, setWorkspaceAgentsList] = useState<any[]>([]);

  // Dragging State
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggingNodeKey, setDraggingNodeKey] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Load existing workflow or query params
  useEffect(() => {
    const loadData = async () => {
      if (targetId && targetId !== 'new') {
        const { workflow } = await getWorkflowById(workspaceId, targetId);
        if (workflow) {
          setWorkflowId(workflow.id);
          setWorkflowName(workflow.name);
          setWorkflowDescription(workflow.description || '');
          setNodes(workflow.nodes || []);
          setEdges(workflow.edges || []);
          setTriggerType(workflow.trigger_type || 'manual');
        }
      }

      const { agents } = await getWorkspaceAgents(workspaceId);
      setWorkspaceAgentsList(agents || []);
    };
    loadData();
  }, [targetId, workspaceId]);

  // Real-time Graph Validation
  const validation = validateWorkflowGraph(nodes, edges);

  const selectedNode = nodes.find((n) => n.node_key === selectedNodeId) || null;

  // Node Drag Handlers
  const handleNodeMouseDown = (e: React.MouseEvent, nodeKey: string) => {
    e.stopPropagation();
    setSelectedNodeId(nodeKey);
    const node = nodes.find((n) => n.node_key === nodeKey);
    if (!node) return;

    setDraggingNodeKey(nodeKey);
    setDragOffset({
      x: e.clientX - node.position_x * zoom - pan.x,
      y: e.clientY - node.position_y * zoom - pan.y,
    });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!draggingNodeKey) return;

    const newX = Math.round((e.clientX - dragOffset.x - pan.x) / zoom);
    const newY = Math.round((e.clientY - dragOffset.y - pan.y) / zoom);

    setNodes((prev) =>
      prev.map((n) =>
        n.node_key === draggingNodeKey
          ? { ...n, position_x: Math.max(20, newX), position_y: Math.max(20, newY) }
          : n
      )
    );
  };

  const handleCanvasMouseUp = () => {
    setDraggingNodeKey(null);
  };

  // Add Node from Library
  const handleAddNode = (template: NodeTemplate) => {
    const nodeKey = `node_${template.category.toLowerCase()}_${Date.now().toString().slice(-4)}`;

    const newNode: WorkflowNode = {
      id: `node_${Date.now()}`,
      node_key: nodeKey,
      node_type: template.category,
      name: template.name,
      position_x: 200 + Math.random() * 180,
      position_y: 120 + Math.random() * 160,
      config: { ...template.defaultConfig },
      status: 'idle',
    };

    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newNode.node_key);
  };

  // Delete Node
  const handleDeleteNode = (nodeKey: string) => {
    setNodes((prev) => prev.filter((n) => n.node_key !== nodeKey));
    setEdges((prev) => prev.filter((e) => e.source_node_key !== nodeKey && e.target_node_key !== nodeKey));
    if (selectedNodeId === nodeKey) {
      setSelectedNodeId(null);
    }
  };

  // Connect Nodes
  const handleConnectPort = (targetNodeKey: string) => {
    if (!connectingSourceKey || connectingSourceKey === targetNodeKey) {
      setConnectingSourceKey(null);
      return;
    }

    const exists = edges.some(
      (e) => e.source_node_key === connectingSourceKey && e.target_node_key === targetNodeKey
    );

    if (!exists) {
      const newEdge: WorkflowEdge = {
        id: `e_${Date.now()}`,
        source_node_key: connectingSourceKey,
        target_node_key: targetNodeKey,
      };
      setEdges((prev) => [...prev, newEdge]);
    }

    setConnectingSourceKey(null);
  };

  const handleDeleteEdge = (edgeId: string) => {
    setEdges((prev) => prev.filter((e) => e.id !== edgeId));
  };

  // Save Workflow
  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      if (workflowId && workflowId !== 'new') {
        await updateWorkflow(workspaceId, workflowId, {
          name: workflowName,
          description: workflowDescription,
          trigger_type: triggerType,
          nodes,
          edges,
        });
      } else {
        const res = await createWorkflow(workspaceId, {
          name: workflowName,
          description: workflowDescription,
          trigger_type: triggerType,
          nodes,
          edges,
        });
        if (res.workflow) {
          setWorkflowId(res.workflow.id);
        }
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredTemplates = NODE_TEMPLATES.filter(
    (t) => activeCategory === 'ALL' || t.category === activeCategory
  );

  const currentWorkflowObject: Workflow = {
    id: workflowId,
    workspace_id: workspaceId,
    name: workflowName,
    slug: workflowName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: workflowDescription,
    status: 'active',
    trigger_type: triggerType,
    trigger_config: { repository: 'facebook/react' },
    nodes,
    edges,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const generateDynamicYaml = () => {
    const nodeLines = nodes
      .map((n) => {
        const parentEdges = edges.filter((e) => e.target_node_key === n.node_key);
        const needs =
          parentEdges.length > 0
            ? `\n    needs: [${parentEdges.map((e) => `"${e.source_node_key}"`).join(', ')}]`
            : '';
        return `  - id: "${n.node_key}"
    name: "${n.name}"
    type: "${n.node_type.toLowerCase()}"${needs}
    position: [${n.position_x}, ${n.position_y}]`;
      })
      .join('\n\n');

    return `version: "3.1"
metadata:
  id: "${workflowId}"
  name: "${workflowName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}"
  title: "${workflowName}"
  description: "${workflowDescription}"

trigger:
  type: "${triggerType}"
  branch: "${workflowSettings.triggerBranch}"

settings:
  timeout_minutes: ${workflowSettings.executionTimeoutMinutes}
  max_concurrency: ${workflowSettings.maxConcurrency}
  failure_strategy: "${workflowSettings.failureStrategy}"
  slack_channel: "${workflowSettings.slackChannel}"
  approval_quorum: "${workflowSettings.approvalQuorum}"

pipeline:
${nodeLines}

connections:
${edges.map((e) => `  - from: "${e.source_node_key}"\n    to: "${e.target_node_key}"`).join('\n') || '  []'}
`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full overflow-hidden bg-[#111318] text-white select-none">
      {/* Top Builder Navigation & Controls */}
      <div className="h-14 px-4 bg-[#161922] border-b border-[#252836] flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/app/workflows')}
            className="p-1.5 rounded-lg text-[#8B919B] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Back to workflows"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-[#252836]" />

          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="bg-transparent text-sm font-bold text-white border-b border-transparent hover:border-[#3E4259] focus:border-[#6D4AFF] focus:bg-[#1C202E] px-2 py-1 rounded outline-none transition-all max-w-sm"
          />

          {/* Validation Status Badge */}
          {validation.isValid ? (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> DAG Valid
            </span>
          ) : (
            <span
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1 cursor-pointer"
              title={validation.errors.join(' | ')}
            >
              <AlertCircle className="w-3 h-3 text-amber-400" /> Invalid Graph
            </span>
          )}
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center bg-[#1C202E] border border-[#252836] rounded-xl p-0.5">
            <button
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
              className="p-1.5 text-[#8B919B] hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-2 text-[#8B919B]">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
              className="p-1.5 text-[#8B919B] hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
              className="p-1.5 text-[#8B919B] hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
              title="Reset view"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-[#252836]" />

          {/* AI Compiler Button */}
          <button
            onClick={() => setShowPromptModal(true)}
            className="px-3 py-1.5 rounded-xl bg-[#6D4AFF]/15 hover:bg-[#6D4AFF]/25 text-[#C4B5FD] hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-[#6D4AFF]/30 transition-all cursor-pointer shadow-sm"
            title="Compile DAG pipeline from natural language prompt"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#A78BFA] animate-pulse" />
            <span className="hidden sm:inline">AI Compiler</span>
          </button>

          {/* YAML Button */}
          <button
            onClick={() => setShowYamlModal(true)}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-mono flex items-center gap-1.5 border border-white/10 transition-all cursor-pointer shadow-sm"
            title="Inspect DAG YAML Specification"
          >
            <FileCode className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">YAML</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-all cursor-pointer shadow-sm"
            title="Configure Execution, Concurrency, and Gate Settings"
          >
            <Settings2 className="w-3.5 h-3.5 text-[#6D4AFF]" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          {/* Test Run Button */}
          <button
            onClick={() => setShowRunModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-all cursor-pointer shadow-sm"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400" />
            <span>Test Run</span>
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-3.5 py-1.5 rounded-xl bg-[#6D4AFF] hover:bg-[#5B3CE8] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{saveSuccess ? 'Saved!' : 'Save Workflow'}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Body: Left Node Drawer, Center Canvas, Right Node Inspector */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: Node Library */}
        <div className="w-64 bg-[#161922] border-r border-[#252836] flex flex-col shrink-0 z-10 text-left">
          <div className="p-3 border-b border-[#252836] flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8B919B] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> Node Library
            </span>
          </div>

          {/* Category Tabs */}
          <div className="p-2 border-b border-[#252836] flex items-center gap-1 overflow-x-auto text-[10px] font-mono">
            {(['ALL', 'TRIGGER', 'AGENT', 'TOOL', 'APPROVAL', 'CONDITION', 'OUTPUT'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2 py-1 rounded-lg uppercase transition-colors cursor-pointer shrink-0 ${
                  activeCategory === cat
                    ? 'bg-[#6D4AFF] text-white font-semibold'
                    : 'text-[#8B919B] hover:text-white hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Node Templates List */}
          <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-2">
            {filteredTemplates.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.name}
                  onClick={() => handleAddNode(item)}
                  className="p-3 rounded-xl bg-[#1C202E] hover:bg-[#252A3D] border border-[#252836] hover:border-[#3E4259] transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center shrink-0">
                      {item.isBrand && item.brand ? (
                        <BrandLogo brand={item.brand} size={15} />
                      ) : (
                        <Icon className="w-4 h-4 text-[#9D85FF]" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-[#9D85FF] transition-colors">
                        {item.name}
                      </div>
                      <div className="text-[9px] font-mono text-[#8B919B] uppercase">
                        {item.category}
                      </div>
                    </div>
                  </div>
                  <Plus className="w-3.5 h-3.5 text-[#8B919B] group-hover:text-white transition-colors" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Center: Dark Interactive Canvas */}
        <div
          ref={canvasRef}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onClick={() => {
            setSelectedNodeId(null);
            setConnectingSourceKey(null);
          }}
          className="flex-1 h-full relative overflow-hidden bg-[#0D0F14] cursor-crosshair"
          style={{
            backgroundImage: `radial-gradient(circle, #252836 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        >
          {/* Canvas Transform Plane */}
          <div
            className="w-full h-full absolute inset-0 transform-gpu"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
            }}
          >
            {/* SVG Connecting Edges (Smooth Bezier Curves) */}
            <svg className="w-full h-full absolute inset-0 pointer-events-none overflow-visible">
              <defs>
                <linearGradient id="edgeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6D4AFF" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
              {edges.map((edge) => {
                const sourceNode = nodes.find((n) => n.node_key === edge.source_node_key);
                const targetNode = nodes.find((n) => n.node_key === edge.target_node_key);
                if (!sourceNode || !targetNode) return null;

                const startX = sourceNode.position_x + 230;
                const startY = sourceNode.position_y + 44;
                const endX = targetNode.position_x;
                const endY = targetNode.position_y + 44;

                const dx = Math.abs(endX - startX) * 0.5;
                const pathData = `M ${startX} ${startY} C ${startX + dx} ${startY}, ${endX - dx} ${endY}, ${endX} ${endY}`;

                return (
                  <g key={edge.id} className="cursor-pointer pointer-events-auto">
                    {/* Background stroke */}
                    <path
                      d={pathData}
                      fill="none"
                      stroke="#222736"
                      strokeWidth="7"
                    />
                    {/* Animated gradient stroke */}
                    <path
                      d={pathData}
                      fill="none"
                      stroke="url(#edgeGlow)"
                      strokeWidth="2.5"
                      strokeDasharray="4 4"
                      className="animate-pulse"
                    />
                    {/* Clickable delete target in middle of line */}
                    <circle
                      cx={(startX + endX) / 2}
                      cy={(startY + endY) / 2}
                      r="7"
                      fill="#1C202E"
                      stroke="#6D4AFF"
                      strokeWidth="1.5"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEdge(edge.id!);
                      }}
                      className="hover:fill-red-500 transition-colors cursor-pointer"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Draggable DAG Nodes */}
            {nodes.map((node) => {
              const isSelected = selectedNodeId === node.node_key;
              const isConnecting = connectingSourceKey === node.node_key;

              return (
                <div
                  key={node.node_key}
                  onMouseDown={(e) => handleNodeMouseDown(e, node.node_key)}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (connectingSourceKey && connectingSourceKey !== node.node_key) {
                      handleConnectPort(node.node_key);
                    } else {
                      setSelectedNodeId(node.node_key);
                    }
                  }}
                  style={{
                    left: `${node.position_x}px`,
                    top: `${node.position_y}px`,
                    width: '230px',
                  }}
                  className={`absolute rounded-2xl bg-[#161922] border transition-all shadow-xl cursor-move p-4 text-left ${
                    isSelected
                      ? 'border-[#6D4AFF] ring-2 ring-[#6D4AFF]/40 shadow-[0_0_24px_rgba(109,74,255,0.3)]'
                      : isConnecting
                      ? 'border-emerald-500 ring-2 ring-emerald-500/40'
                      : 'border-[#252836] hover:border-[#3E4259]'
                  }`}
                >
                  {/* Left In-Port Handle */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      if (connectingSourceKey) {
                        handleConnectPort(node.node_key);
                      }
                    }}
                    title="Input Port (Click to connect here)"
                    className="absolute left-[-7px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#1C202E] border-2 border-[#6D4AFF] hover:scale-125 transition-transform cursor-pointer"
                  />

                  {/* Right Out-Port Handle */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setConnectingSourceKey(node.node_key);
                    }}
                    title="Output Port (Click then click target node)"
                    className={`absolute right-[-7px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-white hover:scale-125 transition-transform cursor-pointer ${
                      isConnecting ? 'bg-emerald-400 animate-ping' : 'bg-[#6D4AFF]'
                    }`}
                  />

                  {/* Node Header */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-[#8B919B] px-1.5 py-0.5 rounded bg-black/40 border border-white/5">
                      {node.node_type}
                    </span>

                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      Ready
                    </span>
                  </div>

                  {/* Node Title & Key */}
                  <div className="text-xs font-bold text-white mb-0.5 truncate">
                    {node.name}
                  </div>
                  <div className="text-[10px] font-mono text-[#8B919B] truncate">
                    {node.node_key}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Node Inspector */}
        <div className="w-80 bg-[#161922] border-l border-[#252836] flex flex-col shrink-0 z-10 text-left">
          <div className="p-3 border-b border-[#252836] flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8B919B]">
              Node Inspector
            </span>
            {selectedNode && (
              <button
                onClick={() => handleDeleteNode(selectedNode.node_key)}
                className="p-1 text-[#8B919B] hover:text-red-400 transition-colors cursor-pointer"
                title="Delete node"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {selectedNode ? (
            <div className="p-4 flex flex-col gap-4 overflow-y-auto">
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#8B919B] mb-1">
                  Node Title
                </label>
                <input
                  type="text"
                  value={selectedNode.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNodes((prev) =>
                      prev.map((n) => (n.node_key === selectedNode.node_key ? { ...n, name: val } : n))
                    );
                  }}
                  className="w-full h-8 px-2.5 rounded-lg bg-[#1C202E] border border-[#252836] text-xs text-white outline-none focus:border-[#6D4AFF]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#8B919B] mb-1">
                  Node Key (Reference Identifier)
                </label>
                <input
                  type="text"
                  value={selectedNode.node_key}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNodes((prev) =>
                      prev.map((n) => (n.node_key === selectedNode.node_key ? { ...n, node_key: val } : n))
                    );
                  }}
                  className="w-full h-8 px-2.5 rounded-lg bg-[#1C202E] border border-[#252836] text-xs font-mono text-[#9D85FF] outline-none"
                />
              </div>

              {/* Agent Node Configuration */}
              {selectedNode.node_type === 'AGENT' && (
                <>
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#8B919B] mb-1">
                      Assigned Workspace Agent
                    </label>
                    <select
                      value={selectedNode.config?.agent_id || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNodes((prev) =>
                          prev.map((n) =>
                            n.node_key === selectedNode.node_key
                              ? { ...n, config: { ...n.config, agent_id: val } }
                              : n
                          )
                        );
                      }}
                      className="w-full h-8 px-2 rounded-lg bg-[#1C202E] border border-[#252836] text-xs text-white outline-none"
                    >
                      <option value="">Default AI Reasoning Agent</option>
                      {workspaceAgentsList.map((ag) => (
                        <option key={ag.id} value={ag.id}>
                          {ag.name} ({ag.model_provider})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#8B919B] mb-1">
                      Task Directive / Prompt Template
                    </label>
                    <textarea
                      rows={4}
                      value={selectedNode.config?.directive || selectedNode.config?.prompt || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNodes((prev) =>
                          prev.map((n) =>
                            n.node_key === selectedNode.node_key
                              ? { ...n, config: { ...n.config, directive: val } }
                              : n
                          )
                        );
                      }}
                      className="w-full p-2.5 rounded-lg bg-[#1C202E] border border-[#252836] text-xs font-mono text-white outline-none focus:border-[#6D4AFF] leading-relaxed resize-none"
                    />
                    <div className="mt-1 flex items-center gap-1.5 flex-wrap text-[10px] text-[#8B919B]">
                      <span>Interpolate:</span>
                      <span className="font-mono text-[#9D85FF] bg-black/40 px-1 rounded">{`{{trigger.repository}}`}</span>
                      <span className="font-mono text-[#9D85FF] bg-black/40 px-1 rounded">{`{{node_fetch.data}}`}</span>
                    </div>
                  </div>
                </>
              )}

              {/* Tool Node Configuration */}
              {selectedNode.node_type === 'TOOL' && (
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#8B919B] mb-1">
                    Tool Identifier
                  </label>
                  <select
                    value={selectedNode.config?.toolName || 'github_get_repository'}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNodes((prev) =>
                        prev.map((n) =>
                          n.node_key === selectedNode.node_key
                            ? { ...n, config: { ...n.config, toolName: val } }
                            : n
                        )
                      );
                    }}
                    className="w-full h-8 px-2 rounded-lg bg-[#1C202E] border border-[#252836] text-xs text-white outline-none"
                  >
                    <option value="github_get_repository">GitHub: Get Repository Metadata</option>
                    <option value="github_list_pull_requests">GitHub: List Pull Requests</option>
                    <option value="github_get_pull_request">GitHub: Get Pull Request Details</option>
                  </select>
                </div>
              )}

              {/* Approval Node Configuration */}
              {selectedNode.node_type === 'APPROVAL' && (
                <>
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#8B919B] mb-1">
                      Required Reviewer Role
                    </label>
                    <select
                      value={selectedNode.config?.requireRole || 'admin'}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNodes((prev) =>
                          prev.map((n) =>
                            n.node_key === selectedNode.node_key
                              ? { ...n, config: { ...n.config, requireRole: val } }
                              : n
                          )
                        );
                      }}
                      className="w-full h-8 px-2 rounded-lg bg-[#1C202E] border border-[#252836] text-xs text-white outline-none"
                    >
                      <option value="admin">Workspace Admin</option>
                      <option value="lead">Security Lead</option>
                      <option value="owner">Workspace Owner</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#8B919B] mb-1">
                      Approval Prompt / Verification Gate
                    </label>
                    <textarea
                      rows={3}
                      value={selectedNode.config?.prompt || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNodes((prev) =>
                          prev.map((n) =>
                            n.node_key === selectedNode.node_key
                              ? { ...n, config: { ...n.config, prompt: val } }
                              : n
                          )
                        );
                      }}
                      className="w-full p-2.5 rounded-lg bg-[#1C202E] border border-[#252836] text-xs text-white outline-none focus:border-[#6D4AFF] resize-none"
                    />
                  </div>
                </>
              )}

              {/* Condition Node Configuration */}
              {selectedNode.node_type === 'CONDITION' && (
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#8B919B] mb-1">
                    Condition Expression
                  </label>
                  <input
                    type="text"
                    value={selectedNode.config?.condition || 'true'}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNodes((prev) =>
                        prev.map((n) =>
                          n.node_key === selectedNode.node_key
                            ? { ...n, config: { ...n.config, condition: val } }
                            : n
                        )
                      );
                    }}
                    placeholder="e.g. node_auditor.status == 'completed'"
                    className="w-full h-8 px-2.5 rounded-lg bg-[#1C202E] border border-[#252836] text-xs font-mono text-white outline-none focus:border-[#6D4AFF]"
                  />
                </div>
              )}

              {/* Output Node Configuration */}
              {selectedNode.node_type === 'OUTPUT' && (
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#8B919B] mb-1">
                    Summary Template
                  </label>
                  <textarea
                    rows={3}
                    value={selectedNode.config?.summaryTemplate || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNodes((prev) =>
                        prev.map((n) =>
                          n.node_key === selectedNode.node_key
                            ? { ...n, config: { ...n.config, summaryTemplate: val } }
                            : n
                        )
                      );
                    }}
                    className="w-full p-2.5 rounded-lg bg-[#1C202E] border border-[#252836] text-xs font-mono text-white outline-none focus:border-[#6D4AFF] resize-none"
                  />
                </div>
              )}

              <div className="pt-2 border-t border-[#252836] text-[10px] font-mono text-[#8B919B]">
                Canvas Pos: ({selectedNode.position_x}, {selectedNode.position_y})
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[#8B919B] flex flex-col items-center justify-center gap-2">
              <HelpCircle className="w-6 h-6 text-[#3E4259]" />
              <p>Click any node on canvas to inspect and edit its parameters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Embedded Run Modal */}
      {showRunModal && (
        <RunWorkflowModal
          isOpen={showRunModal}
          onClose={() => setShowRunModal(false)}
          workspaceId={workspaceId}
          workflow={currentWorkflowObject}
        />
      )}

      {/* Workflow Settings Modal */}
      <WorkflowSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        settings={workflowSettings}
        onSave={(updated) => {
          setWorkflowSettings(updated);
          setWorkflowName(updated.name);
          setWorkflowDescription(updated.description);
        }}
      />

      {/* Workflow YAML Modal */}
      <WorkflowYamlModal
        isOpen={showYamlModal}
        onClose={() => setShowYamlModal(false)}
        workflowName={workflowName}
        yamlContent={generateDynamicYaml()}
      />

      {/* Prompt-to-Workflow AI Compiler Modal */}
      <PromptToWorkflowModal
        isOpen={showPromptModal}
        onClose={() => setShowPromptModal(false)}
        onWorkflowCompiled={(compiled) => {
          setWorkflowName(compiled.name);
          setWorkflowDescription(compiled.description);
          setNodes(compiled.nodes);
          setEdges(compiled.edges);
          setSelectedNodeId(compiled.nodes[0]?.node_key || null);
        }}
      />
    </div>
  );
};
