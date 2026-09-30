import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  Workflow,
  WorkflowNode,
  WorkflowEdge,
  WorkflowExecution,
  WorkflowExecutionEvent,
  CreateWorkflowInput,
  UpdateWorkflowInput,
} from '../types/workflow';
import { broadcastExecutionEvent } from './realtimeExecutionService';

const WORKFLOWS_STORAGE_KEY = 'nexus_workflows_store_v4';
const EXECUTIONS_STORAGE_KEY = 'nexus_workflow_executions_store_v4';
const EXECUTION_EVENTS_STORAGE_KEY = 'nexus_workflow_exec_events_store_v4';

export const KILLER_DEMO_WORKFLOW: Workflow = {
  id: 'wf_github_push_ci_vercel_deploy',
  workspace_id: 'default-workspace',
  name: 'GitHub Push → AI Code Review & Security Gate → Vercel Deploy',
  slug: 'github-push-ci-vercel-deploy',
  description: 'Triggered by GitHub push events: analyzes commit diffs, runs AI security compliance audit, requests human approval, and deploys verified builds to Vercel.',
  status: 'active',
  trigger_type: 'event',
  trigger_config: {
    provider: 'github',
    event: 'push',
    branch: 'main',
    repository: 'nexus/orchestrator-demo',
  },
  nodes: [
    {
      id: 'node_trigger',
      node_key: 'node_trigger',
      node_type: 'TRIGGER',
      name: 'GitHub Push Event Trigger',
      position_x: 60,
      position_y: 180,
      config: {
        trigger_type: 'event',
        provider: 'github',
        event: 'push',
        branch: 'main',
        repository: 'nexus/orchestrator-demo',
      },
      status: 'idle',
    },
    {
      id: 'node_code_analyst',
      node_key: 'node_code_analyst',
      node_type: 'AGENT',
      name: 'Code Analysis Agent',
      position_x: 320,
      position_y: 180,
      config: {
        agent_name: 'Code Analysis Agent',
        directive: 'Analyze code diff for commit {{trigger.commit_sha}} in {{trigger.repository}}. Inspect modified files and calculate risk rating.',
        model: 'gemini',
      },
      status: 'idle',
    },
    {
      id: 'node_sec_auditor',
      node_key: 'node_sec_auditor',
      node_type: 'AGENT',
      name: 'Security Validation Agent',
      position_x: 580,
      position_y: 180,
      config: {
        agent_name: 'Security Validation Agent',
        directive: 'Scan repository commit {{trigger.commit_sha}} for hardcoded secrets, dangerous dependencies, and security compliance.',
        model: 'gemini',
      },
      status: 'idle',
    },
    {
      id: 'node_approval',
      node_key: 'node_approval',
      node_type: 'APPROVAL',
      name: 'Production Deployment Gate',
      position_x: 840,
      position_y: 180,
      config: {
        requireRole: 'admin',
        title: 'Approve Vercel Production Deployment',
        description: 'Review AI code analysis and security audit before deploying to production.',
      },
      status: 'idle',
    },
    {
      id: 'node_deploy',
      node_key: 'node_deploy',
      node_type: 'TOOL',
      name: 'Vercel Production Deployment',
      position_x: 1100,
      position_y: 180,
      config: {
        toolName: 'vercel_create_deployment',
        target: 'production',
        args: {
          projectName: '{{trigger.repository}}',
          gitRepo: '{{trigger.repository}}',
          branch: '{{trigger.branch}}',
          commitSha: '{{trigger.commit_sha}}',
          target: 'production',
        },
      },
      status: 'idle',
    },
    {
      id: 'node_output',
      node_key: 'node_output',
      node_type: 'OUTPUT',
      name: 'Deployment Summary & Trace',
      position_x: 1360,
      position_y: 180,
      config: {
        summaryTemplate: 'Workflow completed successfully. Live build verified and deployed to Vercel.',
      },
      status: 'idle',
    },
  ],
  edges: [
    {
      id: 'e1',
      source_node_key: 'node_trigger',
      target_node_key: 'node_code_analyst',
    },
    {
      id: 'e2',
      source_node_key: 'node_code_analyst',
      target_node_key: 'node_sec_auditor',
    },
    {
      id: 'e3',
      source_node_key: 'node_sec_auditor',
      target_node_key: 'node_approval',
    },
    {
      id: 'e4',
      source_node_key: 'node_approval',
      target_node_key: 'node_deploy',
    },
    {
      id: 'e5',
      source_node_key: 'node_deploy',
      target_node_key: 'node_output',
    },
  ],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const SEED_DEFAULT_WORKFLOW: Workflow = KILLER_DEMO_WORKFLOW;

export const DEFAULT_WORKFLOWS_LIST: Workflow[] = [
  KILLER_DEMO_WORKFLOW,
  {
    id: 'wf_repo_review_security_gate',
    workspace_id: 'default-workspace',
    name: 'Automated Repository Review & Security Gate',
    slug: 'repo-review-security-gate',
    description: 'Triggers on repository event, gathers repository data, orchestrates AI Security Auditor, and enforces Human Lead approval.',
    status: 'active',
    trigger_type: 'manual',
    trigger_config: {
      event: 'repository.audit',
      defaultRepo: 'facebook/react',
    },
    nodes: [
      {
        id: 'node_1',
        node_key: 'node_trigger',
        node_type: 'TRIGGER',
        name: 'Repository Event Trigger',
        position_x: 60,
        position_y: 160,
        config: {
          trigger_type: 'manual',
          repository: 'facebook/react',
        },
        status: 'idle',
      },
      {
        id: 'node_2',
        node_key: 'node_fetch',
        node_type: 'TOOL',
        name: 'Fetch Repository Context',
        position_x: 320,
        position_y: 160,
        config: {
          toolName: 'github_get_repository',
          args: {
            owner: 'facebook',
            repo: 'react',
          },
        },
        status: 'idle',
      },
      {
        id: 'node_3',
        node_key: 'node_auditor',
        node_type: 'AGENT',
        name: 'Security & Code Auditor Agent',
        position_x: 580,
        position_y: 160,
        config: {
          agent_name: 'Security Auditor Agent',
          directive: 'Review repository metadata, branch policies, and vulnerability postures. Provide high-level security ratings and recommendations.',
          model: 'gemini',
        },
        status: 'idle',
      },
      {
        id: 'node_4',
        node_key: 'node_approval',
        node_type: 'APPROVAL',
        name: 'Human Security Lead Approval Gate',
        position_x: 840,
        position_y: 160,
        config: {
          requireRole: 'admin',
          title: 'Review Audit & Confirm Next Actions',
          description: 'Verify the AI agent assessment before completing execution.',
        },
        status: 'idle',
      },
      {
        id: 'node_5',
        node_key: 'node_output',
        node_type: 'OUTPUT',
        name: 'Execution Report & Summary',
        position_x: 1100,
        position_y: 160,
        config: {
          summaryTemplate: 'Workflow completed successfully. Repository audit verified.',
        },
        status: 'idle',
      },
    ],
    edges: [
      {
        id: 'e1',
        source_node_key: 'node_trigger',
        target_node_key: 'node_fetch',
      },
      {
        id: 'e2',
        source_node_key: 'node_fetch',
        target_node_key: 'node_auditor',
      },
      {
        id: 'e3',
        source_node_key: 'node_auditor',
        target_node_key: 'node_approval',
      },
      {
        id: 'e4',
        source_node_key: 'node_approval',
        target_node_key: 'node_output',
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const WEBSITE_BUILDER_4_APPS_WORKFLOW: Workflow = {
  id: 'wf_4_apps_autonomous_website_builder',
  workspace_id: 'default-workspace',
  name: 'Multi-App Website Builder (GitHub → Claude → Supabase → DeepSeek → Vercel → Slack)',
  slug: '4-apps-autonomous-website-builder',
  description: 'Connects 4 applications together: Clones GitHub template, synthesizes full-stack SaaS UI via Claude 3.5, provisions Supabase database & RLS schema, performs DeepSeek security audit, deploys to Vercel edge, and notifies team via Slack.',
  status: 'active',
  trigger_type: 'manual',
  trigger_config: {
    event: 'website.build',
    topic: 'Frontier AI Agent Orchestrator SaaS',
  },
  nodes: [
    {
      id: 'node_github_clone',
      node_key: 'node_github_clone',
      node_type: 'TOOL',
      name: 'GitHub: Clone Starter Template',
      position_x: 60,
      position_y: 180,
      config: {
        toolName: 'github_clone_repo',
        args: {
          owner: 'nexus-org',
          repo: 'saas-website-template',
          branch: 'main',
        },
      },
      status: 'idle',
    },
    {
      id: 'node_claude_synthesis',
      node_key: 'node_claude_synthesis',
      node_type: 'AGENT',
      name: 'Claude 3.5 Sonnet: UI Synthesis',
      position_x: 320,
      position_y: 180,
      config: {
        agent_name: 'Claude 3.5 Code Synthesizer',
        directive: 'Synthesize responsive React & Tailwind components with modern editorial light aesthetics, Hero section, feature cards, and newsletter signup.',
        model: 'claude',
      },
      status: 'idle',
    },
    {
      id: 'node_supabase_db',
      node_key: 'node_supabase_db',
      node_type: 'TOOL',
      name: 'Supabase: Migrate Schema & RLS',
      position_x: 580,
      position_y: 180,
      config: {
        toolName: 'supabase_apply_migration',
        args: {
          table: 'subscribers',
          policies: ['ENABLE_RLS', 'ALLOW_ANON_INSERT'],
        },
      },
      status: 'idle',
    },
    {
      id: 'node_deepseek_security',
      node_key: 'node_deepseek_security',
      node_type: 'AGENT',
      name: 'DeepSeek-R1: Pre-Deploy Audit',
      position_x: 840,
      position_y: 180,
      config: {
        agent_name: 'DeepSeek-R1 Security Auditor',
        directive: 'Audit generated code and database policies for secret leakage, SQL injection vulnerabilities, and OWASP Top 10 compliance.',
        model: 'deepseek',
      },
      status: 'idle',
    },
    {
      id: 'node_vercel_deploy',
      node_key: 'node_vercel_deploy',
      node_type: 'TOOL',
      name: 'Vercel: Edge Production Deploy',
      position_x: 1100,
      position_y: 180,
      config: {
        toolName: 'vercel_create_deployment',
        args: {
          project: 'nexus-saas-website',
          target: 'production',
        },
      },
      status: 'idle',
    },
    {
      id: 'node_slack_alert',
      node_key: 'node_slack_alert',
      node_type: 'TOOL',
      name: 'Slack: Live Release Broadcast',
      position_x: 1360,
      position_y: 180,
      config: {
        toolName: 'slack_send_message',
        args: {
          channel: '#nexus-alerts',
          message: '🚀 Autonomous Website Build v2.4 successfully deployed to Vercel production edge! Database and RLS policies active.',
        },
      },
      status: 'idle',
    },
  ],
  edges: [
    {
      id: 'e1',
      source_node_key: 'node_github_clone',
      target_node_key: 'node_claude_synthesis',
    },
    {
      id: 'e2',
      source_node_key: 'node_claude_synthesis',
      target_node_key: 'node_supabase_db',
    },
    {
      id: 'e3',
      source_node_key: 'node_supabase_db',
      target_node_key: 'node_deepseek_security',
    },
    {
      id: 'e4',
      source_node_key: 'node_deepseek_security',
      target_node_key: 'node_vercel_deploy',
    },
    {
      id: 'e5',
      source_node_key: 'node_vercel_deploy',
      target_node_key: 'node_slack_alert',
    },
  ],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

DEFAULT_WORKFLOWS_LIST.push(WEBSITE_BUILDER_4_APPS_WORKFLOW);

// ----------------------------------------------------------------------
// Local Storage Fallback Helpers
// ----------------------------------------------------------------------

// In-memory fallback for non-browser / edge / test environments
let memoryWorkflows: Workflow[] = [...DEFAULT_WORKFLOWS_LIST];
let memoryExecutions: WorkflowExecution[] = [];
const memoryEvents: Map<string, WorkflowExecutionEvent[]> = new Map();

const getLocalWorkflows = (): Workflow[] => {
  if (typeof window === 'undefined') return memoryWorkflows;
  try {
    const raw = localStorage.getItem(WORKFLOWS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure Killer Demo workflow is present
        const hasKiller = parsed.some((w: any) => w.id === KILLER_DEMO_WORKFLOW.id || w.slug === KILLER_DEMO_WORKFLOW.slug);
        if (!hasKiller) {
          parsed.unshift(KILLER_DEMO_WORKFLOW);
        }
        // Ensure 4 Apps Website Builder workflow is present
        const hasBuilder = parsed.some((w: any) => w.id === WEBSITE_BUILDER_4_APPS_WORKFLOW.id || w.slug === WEBSITE_BUILDER_4_APPS_WORKFLOW.slug);
        if (!hasBuilder) {
          parsed.splice(1, 0, WEBSITE_BUILDER_4_APPS_WORKFLOW);
        }
        localStorage.setItem(WORKFLOWS_STORAGE_KEY, JSON.stringify(parsed));
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed reading local workflows:', err);
  }
  return DEFAULT_WORKFLOWS_LIST;
};

const saveLocalWorkflows = (workflows: Workflow[]): void => {
  memoryWorkflows = workflows;
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WORKFLOWS_STORAGE_KEY, JSON.stringify(workflows));
  } catch (err) {
    console.error('Failed saving local workflows:', err);
  }
};

const getLocalExecutions = (): WorkflowExecution[] => {
  if (typeof window === 'undefined') return memoryExecutions;
  try {
    const raw = localStorage.getItem(EXECUTIONS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading local workflow executions:', err);
  }
  return [];
};

const saveLocalExecutions = (executions: WorkflowExecution[]): void => {
  memoryExecutions = executions;
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(EXECUTIONS_STORAGE_KEY, JSON.stringify(executions));
  } catch (err) {
    console.error('Failed saving local workflow executions:', err);
  }
};

const getLocalExecutionEvents = (executionId: string): WorkflowExecutionEvent[] => {
  if (typeof window === 'undefined') return memoryEvents.get(executionId) || [];
  try {
    const raw = localStorage.getItem(`${EXECUTION_EVENTS_STORAGE_KEY}_${executionId}`);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading local workflow execution events:', err);
  }
  return [];
};

const saveLocalExecutionEvents = (executionId: string, events: WorkflowExecutionEvent[]): void => {
  memoryEvents.set(executionId, events);
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${EXECUTION_EVENTS_STORAGE_KEY}_${executionId}`, JSON.stringify(events));
  } catch (err) {
    console.error('Failed saving local workflow execution events:', err);
  }
};

// ----------------------------------------------------------------------
// Workflows Service API
// ----------------------------------------------------------------------

export const getWorkflows = async (workspaceId: string): Promise<{ workflows: Workflow[]; error: string | null }> => {
  if (!isSupabaseConfigured) {
    const list = getLocalWorkflows();
    return { workflows: list, error: null };
  }

  try {
    const { data: wfRows, error: wfErr } = await supabase
      .from('workflows')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (wfErr || !wfRows || wfRows.length === 0) {
      const list = getLocalWorkflows();
      return { workflows: list, error: null };
    }

    const workflowIds = wfRows.map((w: any) => w.id);

    const [nodesRes, edgesRes] = await Promise.all([
      supabase.from('workflow_nodes').select('*').in('workflow_id', workflowIds),
      supabase.from('workflow_edges').select('*').in('workflow_id', workflowIds),
    ]);

    const allNodes = (nodesRes.data || []) as WorkflowNode[];
    const allEdges = (edgesRes.data || []) as WorkflowEdge[];

    const enriched: Workflow[] = wfRows.map((row: any) => ({
      ...row,
      nodes: allNodes.filter((n) => n.workflow_id === row.id),
      edges: allEdges.filter((e) => e.workflow_id === row.id),
    }));

    return { workflows: enriched, error: null };
  } catch (err: any) {
    console.error('getWorkflows error, falling back to local storage:', err);
    return { workflows: getLocalWorkflows(), error: null };
  }
};

export const getWorkflowById = async (
  workspaceId: string,
  workflowId: string
): Promise<{ workflow: Workflow | null; error: string | null }> => {
  const { workflows } = await getWorkflows(workspaceId);
  const found = workflows.find((w) => w.id === workflowId || w.slug === workflowId);
  if (found) return { workflow: found, error: null };

  const local = getLocalWorkflows();
  const localFound = local.find((w) => w.id === workflowId || w.slug === workflowId);
  return { workflow: localFound || null, error: localFound ? null : 'Workflow not found.' };
};

export const createWorkflow = async (
  workspaceIdOrInput: string | (CreateWorkflowInput & { workspace_id?: string }),
  inputParam?: CreateWorkflowInput
): Promise<{ workflow: Workflow | null; error: string | null } & Workflow> => {
  let workspaceId: string;
  let input: CreateWorkflowInput;

  if (typeof workspaceIdOrInput === 'string') {
    workspaceId = workspaceIdOrInput;
    input = inputParam!;
  } else {
    workspaceId = workspaceIdOrInput.workspace_id || 'default-workspace';
    input = workspaceIdOrInput;
  }

  const newId = crypto.randomUUID();
  const slug = input.slug || input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const newWorkflow: Workflow = {
    id: newId,
    workspace_id: workspaceId,
    name: input.name,
    slug: slug || `workflow-${Date.now().toString().slice(-4)}`,
    description: input.description || '',
    status: input.status || 'active',
    trigger_type: input.trigger_type || 'manual',
    trigger_config: input.trigger_config || {},
    nodes: (input.nodes || []).map((n, i) => ({
      ...n,
      id: n.id || `node_${Date.now()}_${i}`,
      workflow_id: newId,
    })),
    edges: (input.edges || []).map((e, i) => ({
      ...e,
      id: e.id || `edge_${Date.now()}_${i}`,
      workflow_id: newId,
    })),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Update local storage
  const current = getLocalWorkflows();
  saveLocalWorkflows([newWorkflow, ...current]);

  if (isSupabaseConfigured) {
    try {
      await (supabase.from('workflows') as any).insert({
        id: newWorkflow.id,
        workspace_id: workspaceId,
        name: newWorkflow.name,
        slug: newWorkflow.slug,
        description: newWorkflow.description,
        status: newWorkflow.status,
        trigger_type: newWorkflow.trigger_type,
        trigger_config: newWorkflow.trigger_config,
      });

      if (newWorkflow.nodes.length > 0) {
        await (supabase.from('workflow_nodes') as any).insert(
          newWorkflow.nodes.map((n) => ({
            workflow_id: newWorkflow.id,
            node_key: n.node_key,
            node_type: n.node_type,
            name: n.name,
            config: n.config,
            position_x: n.position_x,
            position_y: n.position_y,
          }))
        );
      }

      if (newWorkflow.edges.length > 0) {
        await (supabase.from('workflow_edges') as any).insert(
          newWorkflow.edges.map((e) => ({
            workflow_id: newWorkflow.id,
            source_node_key: e.source_node_key,
            target_node_key: e.target_node_key,
            source_handle: e.source_handle || null,
            target_handle: e.target_handle || null,
            condition_expression: e.condition_expression || null,
          }))
        );
      }
    } catch (err) {
      console.warn('Supabase createWorkflow sync error:', err);
    }
  }

  return Object.assign(newWorkflow, { workflow: newWorkflow, error: null });
};

export const updateWorkflow = async (
  _workspaceId: string,
  workflowId: string,
  input: UpdateWorkflowInput
): Promise<{ workflow: Workflow | null; error: string | null }> => {
  const currentList = getLocalWorkflows();
  const existingIdx = currentList.findIndex((w) => w.id === workflowId);

  const existing = existingIdx >= 0 ? currentList[existingIdx] : SEED_DEFAULT_WORKFLOW;

  const updated: Workflow = {
    ...existing,
    name: input.name !== undefined ? input.name : existing.name,
    slug: input.slug !== undefined ? input.slug : existing.slug,
    description: input.description !== undefined ? input.description : existing.description,
    status: input.status !== undefined ? input.status : existing.status,
    trigger_type: input.trigger_type !== undefined ? input.trigger_type : existing.trigger_type,
    trigger_config: input.trigger_config !== undefined ? input.trigger_config : existing.trigger_config,
    nodes: input.nodes !== undefined ? input.nodes.map((n) => ({ ...n, workflow_id: workflowId })) : existing.nodes,
    edges: input.edges !== undefined ? input.edges.map((e) => ({ ...e, workflow_id: workflowId })) : existing.edges,
    updated_at: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    currentList[existingIdx] = updated;
  } else {
    currentList.unshift(updated);
  }
  saveLocalWorkflows(currentList);

  if (isSupabaseConfigured) {
    try {
      await (supabase.from('workflows') as any).update({
        name: updated.name,
        slug: updated.slug,
        description: updated.description,
        status: updated.status,
        trigger_type: updated.trigger_type,
        trigger_config: updated.trigger_config,
        updated_at: updated.updated_at,
      }).eq('id', workflowId);

      if (input.nodes) {
        await supabase.from('workflow_nodes').delete().eq('workflow_id', workflowId);
        await (supabase.from('workflow_nodes') as any).insert(
          updated.nodes.map((n) => ({
            workflow_id: workflowId,
            node_key: n.node_key,
            node_type: n.node_type,
            name: n.name,
            config: n.config,
            position_x: n.position_x,
            position_y: n.position_y,
          }))
        );
      }

      if (input.edges) {
        await supabase.from('workflow_edges').delete().eq('workflow_id', workflowId);
        await (supabase.from('workflow_edges') as any).insert(
          updated.edges.map((e) => ({
            workflow_id: workflowId,
            source_node_key: e.source_node_key,
            target_node_key: e.target_node_key,
            source_handle: e.source_handle || null,
            target_handle: e.target_handle || null,
            condition_expression: e.condition_expression || null,
          }))
        );
      }
    } catch (err) {
      console.warn('Supabase updateWorkflow sync error:', err);
    }
  }

  return { workflow: updated, error: null };
};

export const deleteWorkflow = async (
  _workspaceId: string,
  workflowId: string
): Promise<{ success: boolean; error: string | null }> => {
  const current = getLocalWorkflows().filter((w) => w.id !== workflowId);
  saveLocalWorkflows(current);

  if (isSupabaseConfigured) {
    try {
      await supabase.from('workflows').delete().eq('id', workflowId);
    } catch (err: any) {
      console.error('Supabase deleteWorkflow error:', err);
    }
  }

  return { success: true, error: null };
};

// ----------------------------------------------------------------------
// Workflow Execution & History Service API
// ----------------------------------------------------------------------

export const saveWorkflowExecutionRecord = async (
  workspaceId: string,
  record: Partial<WorkflowExecution> & { id: string; workflow_id: string }
): Promise<WorkflowExecution> => {
  const localList = getLocalExecutions();
  const existingIdx = localList.findIndex((e) => e.id === record.id);

  let updatedExec: WorkflowExecution;

  if (existingIdx >= 0) {
    updatedExec = {
      ...localList[existingIdx],
      ...record,
    } as WorkflowExecution;
    localList[existingIdx] = updatedExec;
  } else {
    updatedExec = {
      id: record.id,
      workspace_id: workspaceId,
      workflow_id: record.workflow_id,
      status: record.status || 'queued',
      trigger_data: record.trigger_data || {},
      context_data: record.context_data || {},
      output_data: record.output_data || null,
      error: record.error || null,
      started_at: record.started_at || new Date().toISOString(),
      completed_at: record.completed_at || null,
      duration_ms: record.duration_ms || 0,
      current_node_key: record.current_node_key || null,
      created_at: record.created_at || new Date().toISOString(),
      nodes: record.nodes || [],
    };
    localList.unshift(updatedExec);
  }

  saveLocalExecutions(localList);

  if (isSupabaseConfigured) {
    try {
      await (supabase.from('workflow_executions') as any).upsert({
        id: updatedExec.id,
        workspace_id: workspaceId,
        workflow_id: updatedExec.workflow_id,
        status: updatedExec.status,
        trigger_data: updatedExec.trigger_data,
        context_data: updatedExec.context_data,
        output_data: updatedExec.output_data,
        error: updatedExec.error,
        started_at: updatedExec.started_at,
        completed_at: updatedExec.completed_at,
        duration_ms: updatedExec.duration_ms,
        current_node_key: updatedExec.current_node_key,
      });
    } catch (err) {
      console.warn('Supabase saveWorkflowExecutionRecord error:', err);
    }
  }

  return updatedExec;
};

export const saveWorkflowExecutionEventRecord = async (
  executionId: string,
  event: Omit<WorkflowExecutionEvent, 'id' | 'created_at' | 'execution_id'>
): Promise<WorkflowExecutionEvent> => {
  const fullEvent: WorkflowExecutionEvent = {
    id: crypto.randomUUID(),
    execution_id: executionId,
    event_type: event.event_type,
    node_key: event.node_key || null,
    status: event.status,
    message: event.message,
    metadata: event.metadata || {},
    created_at: new Date().toISOString(),
  };

  const localEvents = getLocalExecutionEvents(executionId);
  localEvents.push(fullEvent);
  saveLocalExecutionEvents(executionId, localEvents);

  let sourceType: any = 'workflow';
  if (fullEvent.event_type?.includes('APPROVAL')) sourceType = 'approval';
  else if (fullEvent.event_type?.includes('DEPLOY') || fullEvent.node_key?.includes('deploy')) sourceType = 'deployment';
  else if (fullEvent.event_type?.includes('TOOL') || fullEvent.node_key?.includes('tool')) sourceType = 'tool';
  else if (fullEvent.event_type?.includes('AGENT') || fullEvent.node_key?.includes('agent')) sourceType = 'agent';

  broadcastExecutionEvent({
    id: fullEvent.id,
    execution_id: executionId,
    workspace_id: 'default-workspace',
    source_type: sourceType,
    source_id: fullEvent.node_key || null,
    event_type: fullEvent.event_type,
    status: fullEvent.status === 'running' ? 'running' : fullEvent.status === 'failed' ? 'failed' : 'completed',
    message: fullEvent.message,
    timestamp: fullEvent.created_at,
    metadata: fullEvent.metadata,
  });

  if (isSupabaseConfigured) {
    try {
      await (supabase.from('workflow_execution_events') as any).insert({
        id: fullEvent.id,
        execution_id: executionId,
        event_type: fullEvent.event_type,
        node_key: fullEvent.node_key,
        status: fullEvent.status,
        message: fullEvent.message,
        metadata: fullEvent.metadata,
      });
    } catch (err) {
      console.warn('Supabase saveWorkflowExecutionEventRecord error:', err);
    }
  }

  return fullEvent;
};

export const getWorkflowExecutions = async (
  workspaceId: string,
  workflowId?: string
): Promise<{ executions: WorkflowExecution[]; error: string | null }> => {
  let list = getLocalExecutions().filter((e) => e.workspace_id === workspaceId);
  if (workflowId) {
    list = list.filter((e) => e.workflow_id === workflowId);
  }

  if (isSupabaseConfigured) {
    try {
      let query = supabase
        .from('workflow_executions')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (workflowId) {
        query = query.eq('workflow_id', workflowId);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return { executions: data as unknown as WorkflowExecution[], error: null };
      }
    } catch (err) {
      console.warn('Supabase getWorkflowExecutions error:', err);
    }
  }

  return { executions: list, error: null };
};

export const getWorkflowExecutionById = async (
  executionId: string
): Promise<{ execution: WorkflowExecution | null; events: WorkflowExecutionEvent[]; error: string | null }> => {
  const localList = getLocalExecutions();
  const found = localList.find((e) => e.id === executionId);
  const events = getLocalExecutionEvents(executionId);

  if (isSupabaseConfigured) {
    try {
      const execRes: any = await supabase.from('workflow_executions').select('*').eq('id', executionId).single();
      const eventsRes: any = await supabase.from('workflow_execution_events').select('*').eq('execution_id', executionId).order('created_at', { ascending: true });

      if (!execRes.error && execRes.data) {
        return {
          execution: execRes.data as WorkflowExecution,
          events: (eventsRes.data || []) as WorkflowExecutionEvent[],
          error: null,
        };
      }
    } catch (err) {
      console.warn('Supabase getWorkflowExecutionById error:', err);
    }
  }

  return {
    execution: found || null,
    events,
    error: found ? null : 'Execution not found.',
  };
};
