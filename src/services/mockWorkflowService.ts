export interface WorkflowNodeData {
  id: string;
  name: string;
  category: 'trigger' | 'agent' | 'tool' | 'logic' | 'action';
  type: string;
  status?: 'idle' | 'running' | 'completed' | 'error';
  x: number;
  y: number;
  config?: Record<string, any>;
}

export interface WorkflowEdgeData {
  id: string;
  from: string;
  to: string;
}

export interface WorkflowModel {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused';
  nodes: WorkflowNodeData[];
  edges: WorkflowEdgeData[];
  createdAt: string;
  updatedAt: string;
}

const WORKFLOW_STORAGE_KEY = 'nexus_workflows_store';

const DEFAULT_WORKFLOW: WorkflowModel = {
  id: 'wf_pr_review_pipeline',
  name: 'Automated PR Code Review & Security Gate',
  description: 'Triggers on GitHub PR open, runs Planner Agent, Code Agent, Security Audit, and requests approval before merging.',
  status: 'active',
  nodes: [
    {
      id: 'node_trigger',
      name: 'GitHub PR Trigger',
      category: 'trigger',
      type: 'github_event',
      status: 'completed',
      x: 60,
      y: 180,
      config: { event: 'pull_request.opened', repo: 'all' }
    },
    {
      id: 'node_planner',
      name: 'Planner Agent',
      category: 'agent',
      type: 'reasoning_agent',
      status: 'completed',
      x: 320,
      y: 120,
      config: { model: 'openai', directive: 'Analyze PR scope and diff size' }
    },
    {
      id: 'node_code_agent',
      name: 'Code Synthesizer',
      category: 'agent',
      type: 'code_agent',
      status: 'running',
      x: 580,
      y: 80,
      config: { model: 'anthropic', directive: 'Inspect AST for code quality issues' }
    },
    {
      id: 'node_sec_agent',
      name: 'Security Auditor',
      category: 'agent',
      type: 'security_agent',
      status: 'idle',
      x: 580,
      y: 260,
      config: { model: 'gemini', directive: 'Scan for hardcoded secrets and SQLi' }
    },
    {
      id: 'node_approval',
      name: 'Human Approval Gate',
      category: 'logic',
      type: 'approval_gate',
      status: 'idle',
      x: 840,
      y: 180,
      config: { requireRole: 'admin', timeout: '24h' }
    }
  ],
  edges: [
    { id: 'e1', from: 'node_trigger', to: 'node_planner' },
    { id: 'e2', from: 'node_planner', to: 'node_code_agent' },
    { id: 'e3', from: 'node_planner', to: 'node_sec_agent' },
    { id: 'e4', from: 'node_code_agent', to: 'node_approval' },
    { id: 'e5', from: 'node_sec_agent', to: 'node_approval' }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const getStoredWorkflows = (): WorkflowModel[] => {
  try {
    const data = localStorage.getItem(WORKFLOW_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load workflows:', e);
  }
  return [DEFAULT_WORKFLOW];
};

export const saveWorkflow = (wf: WorkflowModel): void => {
  const current = getStoredWorkflows();
  const idx = current.findIndex((w) => w.id === wf.id);
  if (idx >= 0) {
    current[idx] = wf;
  } else {
    current.unshift(wf);
  }
  try {
    localStorage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to save workflow:', e);
  }
};

export const getWorkflowById = (id: string): WorkflowModel | null => {
  const list = getStoredWorkflows();
  return list.find((w) => w.id === id) || null;
};
