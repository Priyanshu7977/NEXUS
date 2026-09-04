import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  MarketplaceResource,
  MarketplaceInstallation,
  MarketplaceReport,
  Publisher,
  MarketplaceSearchFilters,
  DependencyCheckResult,
  DependencyCheckItem,
  PublishResourceInput,
  InstallResourceInput,
} from '../types/marketplace';
import { scanForSecrets } from './secretScanner';
import { getWorkspaceConnections } from './connectorService';
import { createAgent } from './agentService';
import { createWorkflow } from './workflowService';
import { registerMcpServer } from './mcpService';
import { registerExternalAgent } from './externalAgentService';
import { logWorkspaceActivity } from './activityService';

const LOCAL_PUBLISHERS_KEY = 'nexus_marketplace_publishers';
const LOCAL_RESOURCES_KEY = 'nexus_marketplace_resources';
const LOCAL_INSTALLATIONS_KEY = 'nexus_marketplace_installations';
const LOCAL_REPORTS_KEY = 'nexus_marketplace_reports';

// Initial Official Nexus Publisher
const OFFICIAL_PUBLISHER: Publisher = {
  id: 'pub_nexus_official',
  workspace_id: 'ws_system',
  name: 'NEXUS Official',
  slug: 'nexus',
  description: 'Official core integrations, intelligent agents, and reference templates built and maintained by the NEXUS team.',
  publisher_type: 'OFFICIAL_NEXUS',
  website_url: 'https://nexus.build',
  support_email: 'support@nexus.build',
  github_handle: 'nexus-orchestrator',
  avatar_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80',
  verified: true,
  verification_badge: 'OFFICIAL',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

const COMMUNITY_LABS_PUBLISHER: Publisher = {
  id: 'pub_nexus_labs',
  workspace_id: 'ws_labs',
  name: 'Nexus Ecosystem Labs',
  slug: 'nexus-labs',
  description: 'Community-driven open protocols, experimental connectors, and A2A external agent runtimes.',
  publisher_type: 'ORGANIZATION',
  website_url: 'https://labs.nexus.build',
  support_email: 'labs@nexus.build',
  github_handle: 'nexus-labs',
  avatar_url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=128&auto=format&fit=crop&q=80',
  verified: true,
  verification_badge: 'VERIFIED',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

// Initial Real Seed Catalog
const INITIAL_RESOURCES: MarketplaceResource[] = [
  {
    id: 'res_github_connector',
    workspace_id: 'ws_system',
    publisher_id: OFFICIAL_PUBLISHER.id,
    publisher: OFFICIAL_PUBLISHER,
    type: 'CONNECTOR',
    name: 'GitHub Connector',
    slug: 'github-connector',
    summary: 'Bi-directional repository sync, real-time webhooks, issue tracking, and PR automation for GitHub.',
    description: 'The official GitHub integration for NEXUS. Enables authenticated AI agents to clone repositories, parse Git diffs, post PR comments, ingest push/PR events via secure webhooks, and trigger multi-agent CI/CD workflows.',
    icon_url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg',
    banner_url: null,
    version: '1.2.0',
    latest_version: '1.2.0',
    visibility: 'PUBLIC',
    is_verified: true,
    verification_status: 'OFFICIAL',
    spec: {
      connector_id: 'github',
      auth_types: ['oauth2', 'personal_access_token'],
      supported_events: ['push', 'pull_request', 'issues', 'issue_comment'],
      available_actions: ['fetch_diff', 'list_repos', 'create_comment', 'create_issue', 'update_pr'],
    },
    required_connectors: [],
    required_capabilities: ['network_egress', 'oauth_callback'],
    tags: ['git', 'version-control', 'ci-cd', 'devops', 'webhooks'],
    categories: ['Code & DevOps', 'Cloud & Infrastructure'],
    install_count: 0,
    view_count: 0,
    documentation_url: 'https://docs.nexus.build/connectors/github',
    repository_url: 'https://github.com/nexus-orchestrator/nexus-connector-github',
    license: 'Apache-2.0',
    is_deprecated: false,
    deprecation_reason: null,
    created_at: '2026-01-10T12:00:00.000Z',
    updated_at: '2026-01-10T12:00:00.000Z',
  },
  {
    id: 'res_vercel_connector',
    workspace_id: 'ws_system',
    publisher_id: OFFICIAL_PUBLISHER.id,
    publisher: OFFICIAL_PUBLISHER,
    type: 'CONNECTOR',
    name: 'Vercel Deployment Connector',
    slug: 'vercel-connector',
    summary: 'Deploy preview environments, manage production releases, and monitor deployment health.',
    description: 'Empowers NEXUS workflows to automatically deploy frontend and edge applications to Vercel upon code review completion and human approval.',
    icon_url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vercel/vercel-original.svg',
    banner_url: null,
    version: '1.1.0',
    latest_version: '1.1.0',
    visibility: 'PUBLIC',
    is_verified: true,
    verification_status: 'OFFICIAL',
    spec: {
      connector_id: 'vercel',
      auth_types: ['bearer_token'],
      available_actions: ['create_deployment', 'list_projects', 'get_deployment_status', 'cancel_deployment'],
    },
    required_connectors: [],
    required_capabilities: ['deployments:create', 'network_egress'],
    tags: ['deployments', 'serverless', 'hosting', 'frontend', 'ci-cd'],
    categories: ['Cloud & Infrastructure', 'Code & DevOps'],
    install_count: 0,
    view_count: 0,
    documentation_url: 'https://docs.nexus.build/connectors/vercel',
    repository_url: 'https://github.com/nexus-orchestrator/nexus-connector-vercel',
    license: 'Apache-2.0',
    is_deprecated: false,
    deprecation_reason: null,
    created_at: '2026-01-12T12:00:00.000Z',
    updated_at: '2026-01-12T12:00:00.000Z',
  },
  {
    id: 'res_repo_analyst_agent',
    workspace_id: 'ws_system',
    publisher_id: OFFICIAL_PUBLISHER.id,
    publisher: OFFICIAL_PUBLISHER,
    type: 'AGENT',
    name: 'Repository Code Analyst Agent',
    slug: 'repo-analyst-agent',
    summary: 'Autonomous AI agent specialized in Git diff inspection, vulnerability auditing, and architectural feedback.',
    description: 'An expert code review agent equipped with AST diff parsers and security heuristics. Evaluates incoming pull requests for security flaws, cyclomatic complexity spikes, and test coverage regressions.',
    icon_url: null,
    banner_url: null,
    version: '2.0.0',
    latest_version: '2.0.0',
    visibility: 'PUBLIC',
    is_verified: true,
    verification_status: 'OFFICIAL',
    spec: {
      model: 'gemini',
      temperature: 0.1,
      system_prompt: 'You are an elite Staff Security & Software Engineer evaluating git commits and diffs.',
      instructions: '1. Inspect touched files.\n2. Flag high-risk changes.\n3. Validate tests and security posture.',
      tools: ['github_fetch_diff', 'github_create_comment', 'mcp_vector_context'],
    },
    required_connectors: ['github'],
    required_capabilities: ['code_analysis', 'github_pr_inspection'],
    tags: ['security', 'code-review', 'gemini', 'autonomous-agent'],
    categories: ['Security & Compliance', 'Code & DevOps'],
    install_count: 0,
    view_count: 0,
    documentation_url: 'https://docs.nexus.build/agents/code-analyst',
    repository_url: 'https://github.com/nexus-orchestrator/agent-code-analyst',
    license: 'MIT',
    is_deprecated: false,
    deprecation_reason: null,
    created_at: '2026-01-15T12:00:00.000Z',
    updated_at: '2026-01-15T12:00:00.000Z',
  },
  {
    id: 'res_ci_cd_workflow_template',
    workspace_id: 'ws_system',
    publisher_id: OFFICIAL_PUBLISHER.id,
    publisher: OFFICIAL_PUBLISHER,
    type: 'WORKFLOW',
    name: 'Continuous Security Gate & Vercel Release Pipeline',
    slug: 'ci-cd-security-pipeline',
    summary: 'Production-ready end-to-end workflow: GitHub Webhook -> Code Analysis -> Security Audit -> Human Approval -> Vercel Deployment.',
    description: 'Multi-agent orchestration template connecting GitHub repository events to automated AI security reviews, a role-based human approval step, and instant production deployment to Vercel.',
    icon_url: null,
    banner_url: null,
    version: '1.0.0',
    latest_version: '1.0.0',
    visibility: 'PUBLIC',
    is_verified: true,
    verification_status: 'OFFICIAL',
    spec: {
      trigger_type: 'WEBHOOK',
      nodes: [
        { id: 'node_trig', node_key: 'trigger', node_type: 'TRIGGER', name: 'GitHub Webhook (push / pr)', position_x: 60, position_y: 180, config: { connector: 'github', event: 'push' } },
        { id: 'node_code', node_key: 'analyst', node_type: 'AGENT', name: 'Code Analysis Agent', position_x: 320, position_y: 180, config: { directive: 'Analyze code diff for commit {{trigger.commit_sha}}' } },
        { id: 'node_sec', node_key: 'auditor', node_type: 'AGENT', name: 'Security Validation Agent', position_x: 580, position_y: 180, config: { directive: 'Scan repository for hardcoded secrets and CVEs.' } },
        { id: 'node_app', node_key: 'approval', node_type: 'APPROVAL', name: 'Production Deployment Gate', position_x: 840, position_y: 180, config: { requireRole: 'admin' } },
        { id: 'node_dep', node_key: 'deploy', node_type: 'TOOL', name: 'Vercel Deployment', position_x: 1100, position_y: 180, config: { toolName: 'vercel_create_deployment' } },
      ],
      edges: [
        { id: 'e1', source_node_key: 'trigger', target_node_key: 'analyst' },
        { id: 'e2', source_node_key: 'analyst', target_node_key: 'auditor' },
        { id: 'e3', source_node_key: 'auditor', target_node_key: 'approval' },
        { id: 'e4', source_node_key: 'approval', target_node_key: 'deploy' },
      ],
    },
    required_connectors: ['github', 'vercel'],
    required_capabilities: ['multi_agent_orchestration', 'human_approval', 'production_deployment'],
    tags: ['pipeline', 'ci-cd', 'security-gate', 'deployment-automation'],
    categories: ['Code & DevOps', 'Security & Compliance'],
    install_count: 0,
    view_count: 0,
    documentation_url: 'https://docs.nexus.build/workflows/ci-cd-gate',
    repository_url: 'https://github.com/nexus-orchestrator/template-ci-cd-gate',
    license: 'Apache-2.0',
    is_deprecated: false,
    deprecation_reason: null,
    created_at: '2026-01-20T12:00:00.000Z',
    updated_at: '2026-01-20T12:00:00.000Z',
  },
  {
    id: 'res_mcp_memory_server',
    workspace_id: 'ws_system',
    publisher_id: OFFICIAL_PUBLISHER.id,
    publisher: OFFICIAL_PUBLISHER,
    type: 'MCP_SERVER',
    name: 'Memory & Semantic Context Protocol Server',
    slug: 'mcp-memory-server',
    summary: 'Standard Model Context Protocol (MCP) server providing long-term vector memory and semantic knowledge retrieval.',
    description: 'Enables any NEXUS Agent or external MCP client to store, index, and semantically recall conversational memories, workspace documentation, and architectural decisions.',
    icon_url: null,
    banner_url: null,
    version: '1.0.4',
    latest_version: '1.0.4',
    visibility: 'PUBLIC',
    is_verified: true,
    verification_status: 'OFFICIAL',
    spec: {
      server_url: 'https://mcp-memory.nexus.build/sse',
      transport_type: 'sse',
      protocol_version: '2024-11-05',
      tools: ['memory_store', 'memory_search', 'memory_delete'],
    },
    required_connectors: [],
    required_capabilities: ['mcp_tool_execution', 'semantic_search'],
    tags: ['mcp', 'protocol', 'vector-memory', 'context'],
    categories: ['Productivity', 'Data & Analytics'],
    install_count: 0,
    view_count: 0,
    documentation_url: 'https://docs.nexus.build/mcp/memory-server',
    repository_url: 'https://github.com/nexus-orchestrator/mcp-memory-server',
    license: 'MIT',
    is_deprecated: false,
    deprecation_reason: null,
    created_at: '2026-02-01T12:00:00.000Z',
    updated_at: '2026-02-01T12:00:00.000Z',
  },
  {
    id: 'res_a2a_linear_triage',
    workspace_id: 'ws_labs',
    publisher_id: COMMUNITY_LABS_PUBLISHER.id,
    publisher: COMMUNITY_LABS_PUBLISHER,
    type: 'EXTERNAL_AGENT',
    name: 'Linear Issue Triage & Roadmap Agent',
    slug: 'linear-triage-agent',
    summary: 'External A2A protocol-compatible agent for autonomous Linear backlog categorization, prioritization, and sprint assignment.',
    description: 'An A2A-compliant agent that communicates via JSON-RPC / Agent Card specs to ingest customer feedback, cluster similar bug reports, and automatically generate structured Linear issues.',
    icon_url: null,
    banner_url: null,
    version: '0.9.2',
    latest_version: '0.9.2',
    visibility: 'PUBLIC',
    is_verified: true,
    verification_status: 'VERIFIED',
    spec: {
      endpoint_url: 'https://a2a.nexus-labs.dev/agents/linear-triage',
      agent_card_url: 'https://a2a.nexus-labs.dev/agents/linear-triage/.well-known/agent-card.json',
      protocol_version: '0.3.0',
      skills: ['issue_clustering', 'priority_scoring', 'linear_issue_generation'],
    },
    required_connectors: [],
    required_capabilities: ['a2a_agent_delegation', 'issue_triage'],
    tags: ['a2a', 'linear', 'issue-tracking', 'triage', 'productivity'],
    categories: ['Productivity', 'Communication'],
    install_count: 0,
    view_count: 0,
    documentation_url: 'https://labs.nexus.build/docs/a2a/linear-triage',
    repository_url: 'https://github.com/nexus-labs/a2a-linear-triage',
    license: 'MIT',
    is_deprecated: false,
    deprecation_reason: null,
    created_at: '2026-02-10T12:00:00.000Z',
    updated_at: '2026-02-10T12:00:00.000Z',
  },
];

// In-Memory Fallbacks for node / testing environments
let memoryPublishers: Publisher[] = [OFFICIAL_PUBLISHER, COMMUNITY_LABS_PUBLISHER];
let memoryResources: MarketplaceResource[] = [...INITIAL_RESOURCES];
let memoryInstallations: MarketplaceInstallation[] = [];
let memoryReports: MarketplaceReport[] = [];

// Local Storage helpers
const getLocalPublishers = (): Publisher[] => {
  if (typeof window === 'undefined') return memoryPublishers;
  try {
    const raw = localStorage.getItem(LOCAL_PUBLISHERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('[NEXUS Marketplace] Error reading local publishers:', e);
  }
  return [OFFICIAL_PUBLISHER, COMMUNITY_LABS_PUBLISHER];
};

const saveLocalPublishers = (publishers: Publisher[]): void => {
  memoryPublishers = publishers;
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_PUBLISHERS_KEY, JSON.stringify(publishers));
  } catch (e) {
    console.error('[NEXUS Marketplace] Error saving local publishers:', e);
  }
};

const getLocalResources = (): MarketplaceResource[] => {
  if (typeof window === 'undefined') return memoryResources;
  try {
    const raw = localStorage.getItem(LOCAL_RESOURCES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('[NEXUS Marketplace] Error reading local resources:', e);
  }
  return INITIAL_RESOURCES;
};

const saveLocalResources = (resources: MarketplaceResource[]): void => {
  memoryResources = resources;
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_RESOURCES_KEY, JSON.stringify(resources));
  } catch (e) {
    console.error('[NEXUS Marketplace] Error saving local resources:', e);
  }
};

const getLocalInstallations = (workspaceId?: string): MarketplaceInstallation[] => {
  let list: MarketplaceInstallation[] = [];
  if (typeof window === 'undefined') {
    list = memoryInstallations;
  } else {
    try {
      const raw = localStorage.getItem(LOCAL_INSTALLATIONS_KEY);
      list = raw ? JSON.parse(raw) : [];
    } catch {
      list = [];
    }
  }
  if (workspaceId) {
    return list.filter((i) => i.workspace_id === workspaceId);
  }
  return list;
};

const saveLocalInstallations = (installations: MarketplaceInstallation[]): void => {
  memoryInstallations = installations;
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_INSTALLATIONS_KEY, JSON.stringify(installations));
  } catch (e) {
    console.error('[NEXUS Marketplace] Error saving local installations:', e);
  }
};

const getLocalReports = (): MarketplaceReport[] => {
  if (typeof window === 'undefined') return memoryReports;
  try {
    const raw = localStorage.getItem(LOCAL_REPORTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalReports = (reports: MarketplaceReport[]): void => {
  memoryReports = reports;
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_REPORTS_KEY, JSON.stringify(reports));
  } catch (e) {
    console.error('[NEXUS Marketplace] Error saving local reports:', e);
  }
};

// ----------------------------------------------------------------------
// Marketplace Query & Search Operations
// ----------------------------------------------------------------------

export const getMarketplaceResources = async (
  filters: MarketplaceSearchFilters = {}
): Promise<{ resources: MarketplaceResource[]; error: string | null }> => {
  const publishers = getLocalPublishers();
  const localResources = getLocalResources();

  if (isSupabaseConfigured) {
    try {
      let query = (supabase.from('marketplace_resources') as any).select(`
        *,
        publishers (
          id,
          name,
          slug,
          description,
          publisher_type,
          website_url,
          support_email,
          github_handle,
          avatar_url,
          verified,
          verification_badge
        )
      `);

      if (filters.types && filters.types.length > 0) {
        query = query.in('type', filters.types);
      }

      if (filters.verificationStatuses && filters.verificationStatuses.length > 0) {
        query = query.in('verification_status', filters.verificationStatuses);
      }

      if (filters.publisherId) {
        query = query.eq('publisher_id', filters.publisherId);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        let results: MarketplaceResource[] = data.map((r: any) => ({
          ...r,
          publisher: r.publishers || publishers.find((p) => p.id === r.publisher_id),
        }));

        results = applySearchAndFilters(results, filters);
        return { resources: results, error: null };
      }
    } catch (e) {
      console.warn('[NEXUS Marketplace] Supabase query fallback to local store:', e);
    }
  }

  const enriched = localResources.map((r) => ({
    ...r,
    publisher: publishers.find((p) => p.id === r.publisher_id) || r.publisher,
  }));

  const filtered = applySearchAndFilters(enriched, filters);
  return { resources: filtered, error: null };
};

function applySearchAndFilters(
  items: MarketplaceResource[],
  filters: MarketplaceSearchFilters
): MarketplaceResource[] {
  let list = [...items];

  // Visibility Check
  list = list.filter((item) => {
    if (item.visibility === 'PUBLIC') return true;
    if (item.visibility === 'UNLISTED') {
      if (filters.query && item.slug.toLowerCase().includes(filters.query.toLowerCase())) return true;
      return filters.visibility?.includes('UNLISTED') ?? false;
    }
    if (item.visibility === 'PRIVATE') {
      return filters.workspaceId ? item.workspace_id === filters.workspaceId : false;
    }
    return false;
  });

  // Type filter
  if (filters.types && filters.types.length > 0) {
    list = list.filter((item) => filters.types!.includes(item.type));
  }

  // Category filter
  if (filters.categories && filters.categories.length > 0) {
    list = list.filter((item) =>
      item.categories?.some((cat) => filters.categories!.includes(cat))
    );
  }

  // Tag filter
  if (filters.tags && filters.tags.length > 0) {
    list = list.filter((item) =>
      item.tags?.some((t) => filters.tags!.includes(t.toLowerCase()))
    );
  }

  // Verification status
  if (filters.verificationStatuses && filters.verificationStatuses.length > 0) {
    list = list.filter((item) => filters.verificationStatuses!.includes(item.verification_status));
  }

  // Publisher filter
  if (filters.publisherId) {
    list = list.filter((item) => item.publisher_id === filters.publisherId);
  }

  // Text query search
  if (filters.query && filters.query.trim().length > 0) {
    const q = filters.query.toLowerCase().trim();
    list = list.filter((item) => {
      const matchName = item.name.toLowerCase().includes(q);
      const matchSlug = item.slug.toLowerCase().includes(q);
      const matchSummary = item.summary.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchPub = item.publisher?.name.toLowerCase().includes(q);
      const matchTags = item.tags?.some((t) => t.toLowerCase().includes(q));
      const matchCategories = item.categories?.some((c) => c.toLowerCase().includes(q));
      return matchName || matchSlug || matchSummary || matchDesc || matchPub || matchTags || matchCategories;
    });
  }

  // Sorting
  const sortBy = filters.sortBy || 'popular';
  list.sort((a, b) => {
    if (sortBy === 'popular') {
      return (b.install_count || 0) - (a.install_count || 0);
    }
    if (sortBy === 'recent') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  if (filters.limit) {
    const offset = filters.offset || 0;
    list = list.slice(offset, offset + filters.limit);
  }

  return list;
}

export const getMarketplaceResourceBySlug = async (
  slugOrId: string,
  workspaceId?: string
): Promise<{ resource: MarketplaceResource | null; error: string | null }> => {
  const { resources } = await getMarketplaceResources({ workspaceId, visibility: ['PUBLIC', 'UNLISTED'] });
  const match = resources.find(
    (r) => r.slug.toLowerCase() === slugOrId.toLowerCase() || r.id === slugOrId
  );

  if (match) {
    return { resource: match, error: null };
  }

  const local = getLocalResources();
  const publishers = getLocalPublishers();
  const directMatch = local.find(
    (r) => r.slug.toLowerCase() === slugOrId.toLowerCase() || r.id === slugOrId
  );

  if (directMatch) {
    const enriched = {
      ...directMatch,
      publisher: publishers.find((p) => p.id === directMatch.publisher_id) || directMatch.publisher,
    };
    return { resource: enriched, error: null };
  }

  return { resource: null, error: `Resource "${slugOrId}" not found in marketplace.` };
};

// ----------------------------------------------------------------------
// Dependency & Permission Verification Engine
// ----------------------------------------------------------------------

export const checkResourceDependencies = async (
  workspaceId: string,
  resourceId: string
): Promise<DependencyCheckResult> => {
  const { resource } = await getMarketplaceResourceBySlug(resourceId, workspaceId);
  if (!resource) {
    return {
      satisfied: false,
      items: [],
      missingConnectors: [],
      missingCapabilities: [],
      requiredEnvVars: [],
    };
  }

  const { connections } = await getWorkspaceConnections(workspaceId);
  const connectedIds = new Set(
    (connections || [])
      .filter((c) => c.status === 'connected')
      .map((c) => c.connector_id.toLowerCase())
  );

  const items: DependencyCheckItem[] = [];
  const missingConnectors: string[] = [];

  for (const reqConnector of resource.required_connectors || []) {
    const isConnected = connectedIds.has(reqConnector.toLowerCase());
    items.push({
      id: reqConnector,
      name: `${reqConnector.toUpperCase()} Connector`,
      type: 'connector',
      satisfied: isConnected,
      description: isConnected
        ? `Active ${reqConnector} connector connection detected.`
        : `Requires connected ${reqConnector} account in Workspace Settings.`,
    });
    if (!isConnected) {
      missingConnectors.push(reqConnector);
    }
  }

  for (const reqCap of resource.required_capabilities || []) {
    items.push({
      id: reqCap,
      name: reqCap.replace(/_/g, ' '),
      type: 'capability',
      satisfied: true,
      description: `Supported by NEXUS runtime sandbox.`,
    });
  }

  const satisfied = missingConnectors.length === 0;

  return {
    satisfied,
    items,
    missingConnectors,
    missingCapabilities: [],
    requiredEnvVars: [],
  };
};

// ----------------------------------------------------------------------
// Installation & Uninstallation Lifecycle Engine
// ----------------------------------------------------------------------

export const installMarketplaceResource = async (
  input: InstallResourceInput
): Promise<{ installation: MarketplaceInstallation | null; error: string | null }> => {
  const { workspaceId, resourceId, customName, configuration, grantedPermissions } = input;

  const { resource, error: resErr } = await getMarketplaceResourceBySlug(resourceId, workspaceId);
  if (!resource || resErr) {
    return { installation: null, error: resErr || 'Resource not found' };
  }

  const existingInstalls = getLocalInstallations(workspaceId);
  const alreadyInstalled = existingInstalls.find(
    (i) => i.resource_id === resource.id && i.status !== 'UNINSTALLED'
  );

  if (alreadyInstalled) {
    return { installation: alreadyInstalled, error: null };
  }

  let installedResourceId: string | null = null;
  const displayName = customName || resource.name;

  try {
    if (resource.type === 'AGENT') {
      const agentRes = await createAgent(workspaceId, {
        name: displayName,
        description: resource.description,
        model_provider: 'gemini',
        model_name: 'gemini-1.5-pro',
        temperature: resource.spec?.temperature ?? 0.2,
        instructions: resource.spec?.instructions || resource.description,
        tools: (resource.spec?.tools || []).map((toolName: string) => ({
          connector_id: 'github',
          capability: toolName,
          permission_mode: 'allowed',
        })),
      });

      if (agentRes.agent) {
        installedResourceId = agentRes.agent.id;
      }
    } else if (resource.type === 'WORKFLOW') {
      const wfRes = await createWorkflow(workspaceId, {
        name: displayName,
        slug: `${resource.slug}-${Date.now().toString().slice(-4)}`,
        description: resource.description,
        nodes: resource.spec?.nodes || [],
        edges: resource.spec?.edges || [],
        trigger_type: resource.spec?.trigger_type || 'MANUAL',
      });

      if (wfRes.workflow) {
        installedResourceId = wfRes.workflow.id;
      }
    } else if (resource.type === 'MCP_SERVER') {
      const mcpRes = await registerMcpServer({
        workspace_id: workspaceId,
        name: displayName,
        slug: `${resource.slug}-${Date.now().toString().slice(-4)}`,
        description: resource.description,
        server_url: resource.spec?.server_url || 'https://mcp-memory.nexus.build/sse',
        transport_type: resource.spec?.transport_type || 'sse',
        auth_type: 'none',
      });

      if (mcpRes.server) {
        installedResourceId = mcpRes.server.id;
      }
    } else if (resource.type === 'EXTERNAL_AGENT') {
      const a2aRes = await registerExternalAgent({
        workspace_id: workspaceId,
        name: displayName,
        slug: `${resource.slug}-${Date.now().toString().slice(-4)}`,
        description: resource.description,
        endpoint_url: resource.spec?.endpoint_url || 'https://a2a.nexus-labs.dev/agents/linear-triage',
        agent_card_url: resource.spec?.agent_card_url,
        auth_type: 'none',
      });

      if (a2aRes.agent) {
        installedResourceId = a2aRes.agent.id;
      }
    } else if (resource.type === 'CONNECTOR') {
      installedResourceId = resource.spec?.connector_id || resource.slug;
    }
  } catch (err: any) {
    console.error('[NEXUS Marketplace] Error provisioning installed resource instance:', err);
  }

  const newInstallation: MarketplaceInstallation = {
    id: `inst_${Date.now().toString().slice(-6)}_${Math.random().toString(36).slice(2, 6)}`,
    workspace_id: workspaceId,
    resource_id: resource.id,
    resource,
    installed_version: resource.version,
    installed_resource_id: installedResourceId,
    status: 'INSTALLED',
    granted_permissions: grantedPermissions || resource.required_capabilities || [],
    configuration: configuration || {},
    installed_by: 'current_user',
    installed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      await (supabase.from('marketplace_installations') as any).insert({
        workspace_id: workspaceId,
        resource_id: resource.id,
        installed_version: resource.version,
        installed_resource_id: installedResourceId,
        status: 'INSTALLED',
        granted_permissions: newInstallation.granted_permissions,
        configuration: newInstallation.configuration,
        installed_by: newInstallation.installed_by,
      });
    } catch (e) {
      console.warn('[NEXUS Marketplace] Supabase installation insert failed, saving locally:', e);
    }
  }

  const allInstalls = getLocalInstallations();
  allInstalls.push(newInstallation);
  saveLocalInstallations(allInstalls);

  const allResources = getLocalResources();
  const targetRes = allResources.find((r) => r.id === resource.id);
  if (targetRes) {
    targetRes.install_count = (targetRes.install_count || 0) + 1;
    saveLocalResources(allResources);
  }

  await logWorkspaceActivity(workspaceId, {
    type: 'system',
    action: 'install_marketplace_resource',
    name: resource.name,
    status: 'completed',
    details: `Installed "${resource.name}" (v${resource.version}) into workspace.`,
    metadata: {
      resource_id: resource.id,
      type: resource.type,
      installed_resource_id: installedResourceId,
    },
  });

  return { installation: newInstallation, error: null };
};

export const uninstallMarketplaceResource = async (
  workspaceId: string,
  installationId: string
): Promise<{ success: boolean; error: string | null }> => {
  if (isSupabaseConfigured) {
    try {
      await (supabase.from('marketplace_installations') as any)
        .update({ status: 'UNINSTALLED', updated_at: new Date().toISOString() })
        .eq('id', installationId)
        .eq('workspace_id', workspaceId);
    } catch (e) {
      console.warn('[NEXUS Marketplace] Supabase uninstall update error:', e);
    }
  }

  const allInstalls = getLocalInstallations();
  const index = allInstalls.findIndex(
    (i) => i.id === installationId && i.workspace_id === workspaceId
  );

  if (index !== -1) {
    const uninstalled = allInstalls[index];
    allInstalls.splice(index, 1);
    saveLocalInstallations(allInstalls);

    await logWorkspaceActivity(workspaceId, {
      type: 'system',
      action: 'uninstall_marketplace_resource',
      name: uninstalled.resource?.name || 'Marketplace Resource',
      status: 'completed',
      details: `Uninstalled marketplace resource (${installationId}).`,
      metadata: { installation_id: installationId },
    });

    return { success: true, error: null };
  }

  return { success: false, error: 'Installation not found.' };
};

export const getInstalledMarketplaceResources = async (
  workspaceId: string
): Promise<{ installations: MarketplaceInstallation[]; error: string | null }> => {
  const local = getLocalInstallations(workspaceId);
  const resources = getLocalResources();

  const enriched = local.map((inst) => ({
    ...inst,
    resource: resources.find((r) => r.id === inst.resource_id) || inst.resource,
  }));

  return { installations: enriched, error: null };
};

// ----------------------------------------------------------------------
// Publishing & Validation Engine
// ----------------------------------------------------------------------

export const publishMarketplaceResource = async (
  input: PublishResourceInput
): Promise<{ resource: MarketplaceResource | null; error: string | null; secretViolations?: any[] }> => {
  const {
    workspaceId,
    type,
    name,
    slug,
    summary,
    description,
    iconUrl,
    bannerUrl,
    version,
    visibility,
    spec,
    requiredConnectors = [],
    requiredCapabilities = [],
    tags = [],
    categories = [],
    license = 'MIT',
    documentationUrl = null,
    repositoryUrl = null,
  } = input;

  if (!name || name.trim().length < 3) {
    return { resource: null, error: 'Resource name must be at least 3 characters long.' };
  }
  if (!summary || summary.trim().length < 10) {
    return { resource: null, error: 'Summary must be at least 10 characters describing what the resource does.' };
  }
  if (!version || !/^\d+\.\d+\.\d+/.test(version)) {
    return { resource: null, error: 'Version must follow SemVer format (e.g., 1.0.0).' };
  }

  const cleanSlug = (slug || name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  // Secret Scanning
  const scanPayload = {
    name,
    summary,
    description,
    spec,
    requiredConnectors,
    tags,
    categories,
    documentationUrl,
    repositoryUrl,
  };

  const secretScanResult = scanForSecrets(scanPayload);
  if (secretScanResult.hasSecrets) {
    return {
      resource: null,
      error: `Publication rejected: Detected ${secretScanResult.violations.length} exposed credential(s) or private key(s). Please remove all secrets before publishing.`,
      secretViolations: secretScanResult.violations,
    };
  }

  let publishers = getLocalPublishers();
  let publisher = publishers.find((p) => p.workspace_id === workspaceId);

  if (!publisher) {
    publisher = {
      id: `pub_${workspaceId.slice(0, 8)}_${Date.now().toString().slice(-4)}`,
      workspace_id: workspaceId,
      name: 'Workspace Publisher',
      slug: `pub-${cleanSlug}`,
      description: 'Community publisher on NEXUS Marketplace.',
      publisher_type: 'INDIVIDUAL',
      website_url: null,
      support_email: null,
      github_handle: null,
      avatar_url: null,
      verified: false,
      verification_badge: 'COMMUNITY',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    publishers.push(publisher);
    saveLocalPublishers(publishers);
  }

  const newResource: MarketplaceResource = {
    id: `res_${Date.now().toString().slice(-6)}_${Math.random().toString(36).slice(2, 6)}`,
    workspace_id: workspaceId,
    publisher_id: publisher.id,
    publisher,
    type,
    name: name.trim(),
    slug: cleanSlug,
    summary: summary.trim(),
    description: description || summary.trim(),
    icon_url: iconUrl || null,
    banner_url: bannerUrl || null,
    version,
    latest_version: version,
    visibility,
    is_verified: publisher.verified,
    verification_status: publisher.verification_badge || 'COMMUNITY',
    spec: spec || {},
    required_connectors: requiredConnectors,
    required_capabilities: requiredCapabilities,
    tags,
    categories,
    install_count: 0,
    view_count: 0,
    documentation_url: documentationUrl,
    repository_url: repositoryUrl,
    license,
    is_deprecated: false,
    deprecation_reason: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      await (supabase.from('marketplace_resources') as any).insert({
        workspace_id: workspaceId,
        publisher_id: publisher.id,
        type: newResource.type,
        name: newResource.name,
        slug: newResource.slug,
        summary: newResource.summary,
        description: newResource.description,
        icon_url: newResource.icon_url,
        banner_url: newResource.banner_url,
        version: newResource.version,
        latest_version: newResource.version,
        visibility: newResource.visibility,
        is_verified: newResource.is_verified,
        verification_status: newResource.verification_status,
        spec: newResource.spec,
        required_connectors: newResource.required_connectors,
        required_capabilities: newResource.required_capabilities,
        tags: newResource.tags,
        categories: newResource.categories,
        install_count: 0,
        view_count: 0,
        documentation_url: newResource.documentation_url,
        repository_url: newResource.repository_url,
        license: newResource.license,
      });
    } catch (e) {
      console.warn('[NEXUS Marketplace] Supabase insert failed, saving locally:', e);
    }
  }

  const allResources = getLocalResources();
  allResources.unshift(newResource);
  saveLocalResources(allResources);

  await logWorkspaceActivity(workspaceId, {
    type: 'system',
    action: 'publish_marketplace_resource',
    name: newResource.name,
    status: 'completed',
    details: `Published ${newResource.type} "${newResource.name}" (v${newResource.version}, ${newResource.visibility}) to marketplace.`,
    metadata: {
      resource_id: newResource.id,
      slug: newResource.slug,
      type: newResource.type,
      visibility: newResource.visibility,
    },
  });

  return { resource: newResource, error: null };
};

// ----------------------------------------------------------------------
// Reporting & Safety Operations
// ----------------------------------------------------------------------

export const submitMarketplaceReport = async (
  workspaceId: string,
  resourceId: string,
  category: MarketplaceReport['category'],
  details: string
): Promise<{ report: MarketplaceReport | null; error: string | null }> => {
  if (!details || details.trim().length < 10) {
    return { report: null, error: 'Please provide at least 10 characters detailing the issue.' };
  }

  const newReport: MarketplaceReport = {
    id: `rep_${Date.now().toString().slice(-6)}`,
    resource_id: resourceId,
    reporter_workspace_id: workspaceId,
    reporter_user_id: 'current_user',
    category,
    details: details.trim(),
    status: 'PENDING',
    resolution_notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      await (supabase.from('marketplace_reports') as any).insert({
        resource_id: resourceId,
        reporter_workspace_id: workspaceId,
        reporter_user_id: newReport.reporter_user_id,
        category,
        details: newReport.details,
        status: 'PENDING',
      });
    } catch (e) {
      console.warn('[NEXUS Marketplace] Supabase report insert failed, saving locally:', e);
    }
  }

  const reports = getLocalReports();
  reports.unshift(newReport);
  saveLocalReports(reports);

  return { report: newReport, error: null };
};
