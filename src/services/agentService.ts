import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  Agent,
  AgentStatus,
  AgentToolPermission,
  AgentExecution,
  AgentExecutionEvent,
  CreateAgentInput,
  UpdateAgentInput,
} from '../types/agent';
import { logWorkspaceActivity } from './activityService';

const LOCAL_AGENTS_PREFIX = 'nexus_agents_';
const LOCAL_TOOLS_PREFIX = 'nexus_agent_tools_';
const LOCAL_EXECUTIONS_PREFIX = 'nexus_executions_';
const LOCAL_EVENTS_PREFIX = 'nexus_exec_events_';

// In-memory fallback stores for non-browser runtime
const memoryAgents = new Map<string, Agent[]>();
const memoryTools = new Map<string, AgentToolPermission[]>();
const memoryExecutions = new Map<string, AgentExecution[]>();
const memoryEvents = new Map<string, AgentExecutionEvent[]>();

// --- Local Storage Helpers ---
const getLocalAgents = (workspaceId: string): Agent[] => {
  if (typeof window === 'undefined') return memoryAgents.get(workspaceId) || [];
  try {
    const raw = localStorage.getItem(`${LOCAL_AGENTS_PREFIX}${workspaceId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalAgents = (workspaceId: string, agents: Agent[]): void => {
  memoryAgents.set(workspaceId, agents);
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${LOCAL_AGENTS_PREFIX}${workspaceId}`, JSON.stringify(agents));
  } catch (e) {
    console.error('[NEXUS AgentService] Failed to save local agents:', e);
  }
};

const getLocalTools = (agentId: string): AgentToolPermission[] => {
  if (typeof window === 'undefined') return memoryTools.get(agentId) || [];
  try {
    const raw = localStorage.getItem(`${LOCAL_TOOLS_PREFIX}${agentId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalTools = (agentId: string, tools: AgentToolPermission[]): void => {
  memoryTools.set(agentId, tools);
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${LOCAL_TOOLS_PREFIX}${agentId}`, JSON.stringify(tools));
  } catch (e) {
    console.error('[NEXUS AgentService] Failed to save local tools:', e);
  }
};

const getLocalExecutions = (workspaceId: string): AgentExecution[] => {
  if (typeof window === 'undefined') return memoryExecutions.get(workspaceId) || [];
  try {
    const raw = localStorage.getItem(`${LOCAL_EXECUTIONS_PREFIX}${workspaceId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalExecutions = (workspaceId: string, executions: AgentExecution[]): void => {
  memoryExecutions.set(workspaceId, executions);
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${LOCAL_EXECUTIONS_PREFIX}${workspaceId}`, JSON.stringify(executions));
  } catch (e) {
    console.error('[NEXUS AgentService] Failed to save local executions:', e);
  }
};

const getLocalEvents = (executionId: string): AgentExecutionEvent[] => {
  if (typeof window === 'undefined') return memoryEvents.get(executionId) || [];
  try {
    const raw = localStorage.getItem(`${LOCAL_EVENTS_PREFIX}${executionId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalEvents = (executionId: string, events: AgentExecutionEvent[]): void => {
  memoryEvents.set(executionId, events);
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${LOCAL_EVENTS_PREFIX}${executionId}`, JSON.stringify(events));
  } catch (e) {
    console.error('[NEXUS AgentService] Failed to save local events:', e);
  }
};

// --- Agent CRUD Operations ---

export const getWorkspaceAgents = async (
  workspaceId: string
): Promise<{ agents: Agent[]; error?: string }> => {
  if (!workspaceId) return { agents: [] };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*, agent_tools(*)')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const mapped = (data as any[]).map((row) => ({
          ...row,
          tools: row.agent_tools || [],
        }));
        if (mapped.length === 0) {
          return await seedDefaultReferenceAgent(workspaceId);
        }
        return { agents: mapped };
      }
    } catch {
      // Fall through to local fallback
    }
  }

  const local = getLocalAgents(workspaceId);
  if (local.length < 8) {
    return await seedDefaultReferenceAgent(workspaceId);
  }

  // Populate tools
  const withTools = local.map((ag) => ({
    ...ag,
    tools: getLocalTools(ag.id),
  }));

  return { agents: withTools };
};

export const getAgentById = async (
  workspaceId: string,
  agentId: string
): Promise<{ agent: Agent | null; error?: string }> => {
  if (!workspaceId || !agentId) return { agent: null };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*, agent_tools(*)')
        .eq('workspace_id', workspaceId)
        .eq('id', agentId)
        .single();

      if (!error && data) {
        return {
          agent: {
            ...(data as any),
            tools: (data as any).agent_tools || [],
          },
        };
      }
    } catch {
      // fallback
    }
  }

  const localList = getLocalAgents(workspaceId);
  const found = localList.find((a) => a.id === agentId);
  if (found) {
    found.tools = getLocalTools(agentId);
    return { agent: found };
  }

  return { agent: null };
};

export const createAgent = async (
  workspaceId: string,
  input: CreateAgentInput,
  userId?: string
): Promise<{ agent: Agent | null; error?: string }> => {
  if (!workspaceId) return { agent: null, error: 'Workspace ID required' };
  if (!input.name?.trim()) return { agent: null, error: 'Agent name is required' };

  const slug = input.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const agentId = crypto.randomUUID();
  const now = new Date().toISOString();

  const newAgent: Agent = {
    id: agentId,
    workspace_id: workspaceId,
    name: input.name.trim(),
    slug: slug || 'agent',
    role: input.role || 'Specialized Agent',
    description: input.description || '',
    instructions: input.instructions || '',
    model_provider: input.model_provider || 'gemini',
    model_name: input.model_name || 'gemini-1.5-flash',
    status: input.status || 'active',
    temperature: typeof input.temperature === 'number' ? input.temperature : 0.7,
    max_steps: input.max_steps || 10,
    max_runtime_seconds: input.max_runtime_seconds || 300,
    created_by: userId || null,
    created_at: now,
    updated_at: now,
  };

  const toolsToInsert: AgentToolPermission[] = (input.tools || []).map((t) => ({
    id: crypto.randomUUID(),
    agent_id: agentId,
    connector_id: t.connector_id,
    capability: t.capability,
    permission_mode: t.permission_mode || 'read_only',
    created_at: now,
  }));

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await (supabase.from('agents') as any)
        .insert([newAgent])
        .select()
        .single();

      if (!error && data) {
        if (toolsToInsert.length > 0) {
          await (supabase.from('agent_tools') as any).insert(toolsToInsert);
        }

        await logWorkspaceActivity(workspaceId, {
          type: 'agent',
          action: 'agent_created',
          name: `Created agent: ${newAgent.name}`,
          status: 'completed',
          details: `Configured with ${toolsToInsert.length} tools. Model: ${newAgent.model_provider}/${newAgent.model_name}`,
          metadata: { agentId, name: newAgent.name },
        });

        return { agent: { ...data, tools: toolsToInsert } };
      }
    } catch {
      // Local fallback
    }
  }

  // Local storage save
  const localList = getLocalAgents(workspaceId);
  localList.unshift(newAgent);
  saveLocalAgents(workspaceId, localList);
  saveLocalTools(agentId, toolsToInsert);

  await logWorkspaceActivity(workspaceId, {
    type: 'agent',
    action: 'agent_created',
    name: `Created agent: ${newAgent.name}`,
    status: 'completed',
    details: `Configured with ${toolsToInsert.length} tools. Model: ${newAgent.model_provider}/${newAgent.model_name}`,
    metadata: { agentId, name: newAgent.name },
  });

  newAgent.tools = toolsToInsert;
  return { agent: newAgent };
};

export const updateAgent = async (
  workspaceId: string,
  agentId: string,
  input: UpdateAgentInput
): Promise<{ agent: Agent | null; error?: string }> => {
  if (!workspaceId || !agentId) return { agent: null, error: 'Agent ID required' };

  const now = new Date().toISOString();
  const { tools, ...agentFields } = input;

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await (supabase.from('agents') as any)
        .update({
          ...agentFields,
          updated_at: now,
        })
        .eq('id', agentId)
        .eq('workspace_id', workspaceId)
        .select()
        .single();

      if (!error && data) {
        if (tools) {
          await supabase.from('agent_tools').delete().eq('agent_id', agentId);
          const toolRows = tools.map((t) => ({
            id: crypto.randomUUID(),
            agent_id: agentId,
            connector_id: t.connector_id,
            capability: t.capability,
            permission_mode: t.permission_mode || 'read_only',
            created_at: now,
          }));
          if (toolRows.length > 0) {
            await (supabase.from('agent_tools') as any).insert(toolRows);
          }
        }

        return { agent: data };
      }
    } catch {
      // fallback
    }
  }

  const localList = getLocalAgents(workspaceId);
  const idx = localList.findIndex((a) => a.id === agentId);
  if (idx >= 0) {
    localList[idx] = {
      ...localList[idx],
      ...agentFields,
      updated_at: now,
    };
    saveLocalAgents(workspaceId, localList);

    if (tools) {
      const toolRows: AgentToolPermission[] = tools.map((t) => ({
        id: crypto.randomUUID(),
        agent_id: agentId,
        connector_id: t.connector_id,
        capability: t.capability,
        permission_mode: t.permission_mode || 'read_only',
        created_at: now,
      }));
      saveLocalTools(agentId, toolRows);
      localList[idx].tools = toolRows;
    }

    return { agent: localList[idx] };
  }

  return { agent: null, error: 'Agent not found' };
};

export const setAgentStatus = async (
  workspaceId: string,
  agentId: string,
  status: AgentStatus
): Promise<{ success: boolean; error?: string }> => {
  return updateAgent(workspaceId, agentId, { status }).then((res) => ({
    success: Boolean(res.agent),
    error: res.error,
  }));
};

export const deleteAgent = async (
  workspaceId: string,
  agentId: string
): Promise<{ success: boolean; error?: string }> => {
  if (!workspaceId || !agentId) return { success: false, error: 'Agent ID required' };

  if (isSupabaseConfigured) {
    try {
      await supabase
        .from('agents')
        .delete()
        .eq('id', agentId)
        .eq('workspace_id', workspaceId);
    } catch (e) {
      console.warn('[NEXUS AgentService] Supabase delete error:', e);
    }
  }

  const localList = getLocalAgents(workspaceId);
  const updated = localList.filter((a) => a.id !== agentId);
  saveLocalAgents(workspaceId, updated);

  return { success: true };
};

export const getAgentTools = async (agentId: string): Promise<AgentToolPermission[]> => {
  if (!agentId) return [];

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('agent_tools')
        .select('*')
        .eq('agent_id', agentId);
      if (!error && data) {
        return data as AgentToolPermission[];
      }
    } catch {
      // fallback
    }
  }

  return getLocalTools(agentId);
};

// --- Execution & Event Persistence ---

export const getAgentExecutions = async (
  workspaceId: string,
  agentId?: string
): Promise<{ executions: AgentExecution[]; error?: string }> => {
  if (!workspaceId) return { executions: [] };

  if (isSupabaseConfigured) {
    try {
      let query = supabase
        .from('agent_executions')
        .select('*, agents(name, role, model_provider)')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (agentId) {
        query = query.eq('agent_id', agentId);
      }

      const { data, error } = await query;
      if (!error && data) {
        const mapped = (data as any[]).map((row) => ({
          ...row,
          agent: row.agents || null,
        }));
        return { executions: mapped };
      }
    } catch {
      // fallback
    }
  }

  const local = getLocalExecutions(workspaceId);
  const filtered = agentId ? local.filter((e) => e.agent_id === agentId) : local;
  return { executions: filtered };
};

export const getExecutionById = async (
  workspaceId: string,
  executionId: string
): Promise<{ execution: AgentExecution | null; error?: string }> => {
  if (!workspaceId || !executionId) return { execution: null };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('agent_executions')
        .select('*, agents(name, role, instructions, model_provider)')
        .eq('workspace_id', workspaceId)
        .eq('id', executionId)
        .single();

      if (!error && data) {
        const events = await getExecutionEvents(executionId);
        return {
          execution: {
            ...(data as any),
            agent: (data as any).agents || null,
            events,
          },
        };
      }
    } catch {
      // fallback
    }
  }

  const local = getLocalExecutions(workspaceId);
  const match = local.find((e) => e.id === executionId);
  if (match) {
    match.events = getLocalEvents(executionId);
    return { execution: match };
  }

  return { execution: null };
};

export const getExecutionEvents = async (executionId: string): Promise<AgentExecutionEvent[]> => {
  if (!executionId) return [];

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('agent_execution_events')
        .select('*')
        .eq('execution_id', executionId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        return data as AgentExecutionEvent[];
      }
    } catch {
      // fallback
    }
  }

  return getLocalEvents(executionId);
};

export const saveExecutionRecord = async (
  workspaceId: string,
  execution: Partial<AgentExecution>
): Promise<AgentExecution> => {
  const record: AgentExecution = {
    id: execution.id || crypto.randomUUID(),
    workspace_id: workspaceId,
    agent_id: execution.agent_id || '',
    status: execution.status || 'running',
    input: execution.input || '',
    output: execution.output || null,
    error: execution.error || null,
    started_at: execution.started_at || new Date().toISOString(),
    completed_at: execution.completed_at || null,
    steps_used: execution.steps_used || 0,
    duration_ms: execution.duration_ms || 0,
    model: execution.model || null,
    tokens_used: execution.tokens_used || null,
    created_at: execution.created_at || new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      await (supabase.from('agent_executions') as any).upsert(record);
    } catch (e) {
      console.warn('[NEXUS AgentService] Upsert execution error:', e);
    }
  }

  const local = getLocalExecutions(workspaceId);
  const existingIdx = local.findIndex((e) => e.id === record.id);
  if (existingIdx >= 0) {
    local[existingIdx] = record;
  } else {
    local.unshift(record);
  }
  saveLocalExecutions(workspaceId, local);

  return record;
};

export const saveExecutionEventRecord = async (
  executionId: string,
  event: Partial<AgentExecutionEvent>
): Promise<AgentExecutionEvent> => {
  const eventRecord: AgentExecutionEvent = {
    id: event.id || crypto.randomUUID(),
    execution_id: executionId,
    event_type: event.event_type || 'AGENT_STARTED',
    tool_name: event.tool_name || null,
    status: event.status || 'completed',
    message: event.message || '',
    metadata: event.metadata || {},
    created_at: event.created_at || new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      await (supabase.from('agent_execution_events') as any).insert([eventRecord]);
    } catch (e) {
      console.warn('[NEXUS AgentService] Insert execution event error:', e);
    }
  }

  const local = getLocalEvents(executionId);
  local.push(eventRecord);
  saveLocalEvents(executionId, local);

  return eventRecord;
};

// --- Default Specialized Agents Seeding ---

export const seedDefaultReferenceAgent = async (
  workspaceId: string
): Promise<{ agents: Agent[] }> => {
  const defaultAgents: CreateAgentInput[] = [
    {
      name: 'Claude 3.5 Sonnet Lead Architect',
      role: 'System Architecture & TypeScript AST Synthesis',
      description:
        'Decomposes engineering tasks into typed contracts, AST abstractions, and architectural invariants with extreme safety.',
      instructions:
        'You are Claude 3.5 Sonnet Lead Architect, an elite software engineering agent on NEXUS. Analyze system requirements, synthesize type-safe TypeScript interfaces, enforce architectural constraints, and generate clean, production-ready code with zero regressions.',
      model_provider: 'anthropic',
      model_name: 'claude-3-5-sonnet',
      status: 'active',
      temperature: 0.2,
      max_steps: 15,
      max_runtime_seconds: 600,
      tools: [
        {
          connector_id: 'github',
          capability: 'github.repositories.read',
          permission_mode: 'read_only',
        },
      ],
    },
    {
      name: 'DeepSeek-R1 Zero-Trust Security Auditor',
      role: 'Mathematical Verification & AST Security Audit',
      description:
        'Employs cold-blooded formal reasoning to audit code diffs for SQL injections, RLS policy leaks, and transaction race conditions.',
      instructions:
        'You are DeepSeek-R1 Security Auditor. Your purpose is adversarial security evaluation. Scrutinize every line of code, database query, and authentication header. Trace every input to sink. Enforce strict Row-Level Security, check for IDOR boundary leaks, and provide formal mathematical proofs of correctness.',
      model_provider: 'deepseek',
      model_name: 'deepseek-reasoner',
      status: 'active',
      temperature: 0.1,
      max_steps: 12,
      max_runtime_seconds: 450,
      tools: [
        {
          connector_id: 'github',
          capability: 'github.repositories.read',
          permission_mode: 'read_only',
        },
      ],
    },
    {
      name: 'OpenAI GPT-4o Core Synthesizer',
      role: 'Multi-File Refactoring & MCP Orchestration',
      description:
        'Autonomous full-stack engineering agent capable of multi-file synthesis, test generation, and tool coordination.',
      instructions:
        'You are GPT-4o Core Synthesizer. You implement end-to-end features, coordinate Model Context Protocol (MCP) tools, execute test suites, and author clean pull request summaries.',
      model_provider: 'openai',
      model_name: 'gpt-4o',
      status: 'active',
      temperature: 0.3,
      max_steps: 15,
      max_runtime_seconds: 500,
      tools: [
        {
          connector_id: 'github',
          capability: 'github.repositories.read',
          permission_mode: 'read_only',
        },
        {
          connector_id: 'docker',
          capability: 'docker.sandbox.exec',
          permission_mode: 'read_write',
        },
      ],
    },
    {
      name: 'Google Gemini 1.5 Pro Context Analyst',
      role: '1M+ Monorepo Context & Edge Optimization',
      description:
        'Ingests massive context windows across full monorepos, audits architectural consistency, and designs edge latency budgets.',
      instructions:
        'You are Gemini 1.5 Pro Context Analyst. Evaluate cross-service dependencies, synthesize comprehensive technical specifications, and optimize distributed edge routing with sub-50ms latency targets.',
      model_provider: 'gemini',
      model_name: 'gemini-1.5-pro',
      status: 'active',
      temperature: 0.3,
      max_steps: 10,
      max_runtime_seconds: 400,
      tools: [
        {
          connector_id: 'github',
          capability: 'github.repositories.read',
          permission_mode: 'read_only',
        },
      ],
    },
    {
      name: 'Groq Llama 3.3 70B Edge Dispatcher',
      role: 'Sub-Second Webhook Triage & Incident Router',
      description:
        'Ultra-low-latency event processing agent (500+ tok/s). Classifies incoming webhooks and alerts in under 50ms.',
      instructions:
        'You are Groq Llama 3.3 70B Edge Dispatcher. Evaluate incoming payloads at maximum speed, classify security risk level, and dispatch deterministic instructions to downstream specialist agents.',
      model_provider: 'groq',
      model_name: 'llama-3.3-70b-versatile',
      status: 'active',
      temperature: 0.1,
      max_steps: 5,
      max_runtime_seconds: 60,
      tools: [
        {
          connector_id: 'slack',
          capability: 'slack.messages.send',
          permission_mode: 'read_write',
        },
      ],
    },
    {
      name: 'Repository Analyst',
      role: 'GitHub Repository Inspection & Context Synthesis',
      description:
        'Analyzes project repositories, languages, commit activity, and metadata from connected GitHub accounts.',
      instructions:
        'You are Repository Analyst, a specialized NEXUS intelligence worker. Your purpose is to evaluate repository metadata, code structure, language distribution, and project summaries from the user\'s connected GitHub workspace. Always invoke the appropriate tool to retrieve live data before answering. Structure your findings clearly with bullet points, project names, and accurate technical details.',
      model_provider: 'gemini',
      model_name: 'gemini-1.5-flash',
      status: 'active',
      temperature: 0.5,
      max_steps: 10,
      max_runtime_seconds: 300,
      tools: [
        {
          connector_id: 'github',
          capability: 'github.profile.read',
          permission_mode: 'read_only',
        },
        {
          connector_id: 'github',
          capability: 'github.repositories.read',
          permission_mode: 'read_only',
        },
      ],
    },
    {
      name: 'Code Analysis & Diff Inspector',
      role: 'Automated Code Review & Diff Quality Inspection',
      description:
        'Analyzes git commits, code diffs, architectural modifications, and computes risk levels for continuous integration.',
      instructions:
        'You are Code Analyst, a specialized NEXUS intelligence worker for automated code review and diff inspection. When triggered with code diffs, commits, or pull requests, inspect the modified lines, analyze architectural impact, identify potential syntax or runtime bugs, and provide a structured JSON analysis with summary, risk_level (low, medium, high), issues, and recommendation (approve, reject, needs_review).',
      model_provider: 'openai',
      model_name: 'gpt-4o',
      status: 'active',
      temperature: 0.3,
      max_steps: 10,
      max_runtime_seconds: 300,
      tools: [
        {
          connector_id: 'github',
          capability: 'github.repositories.read',
          permission_mode: 'read_only',
        },
      ],
    },
    {
      name: 'DevOps Edge Deployer & Health Verifier',
      role: 'Vercel Deployment & Synthetic Latency Testing',
      description:
        'Orchestrates zero-downtime edge deployments, verifies DNS propagation, and executes post-deploy health suites.',
      instructions:
        'You are DevOps Edge Deployer. When pipelines reach deployment, verify build artifacts, trigger Vercel/Cloudflare production deployments, execute synthetic HTTP health probes, and report latency percentiles.',
      model_provider: 'openai',
      model_name: 'gpt-4o',
      status: 'active',
      temperature: 0.2,
      max_steps: 8,
      max_runtime_seconds: 240,
      tools: [
        {
          connector_id: 'vercel',
          capability: 'vercel.deployments.create',
          permission_mode: 'read_write',
        },
      ],
    },
  ];

  const createdAgents: Agent[] = [];
  for (const input of defaultAgents) {
    const { agent } = await createAgent(workspaceId, input);
    if (agent) createdAgents.push(agent);
  }

  return { agents: createdAgents };
};

