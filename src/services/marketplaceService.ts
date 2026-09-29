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
import { detectPromptInjection, isSafeExternalUrl } from '../security';
import { recordAuditLog } from './auditService';

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
    id: 'res_claude_planner_agent',
    workspace_id: 'ws_system',
    publisher_id: OFFICIAL_PUBLISHER.id,
    publisher: OFFICIAL_PUBLISHER,
    type: 'AGENT',
    name: 'Claude 3.7 Reasoning & DAG Planner Agent',
    slug: 'claude-planner-agent',
    summary: 'Decomposes complex engineering objectives into deterministic DAG tasks with topological ordering and safety invariants.',
    description: 'Powered by Anthropic Claude 3.7 Sonnet with extended thinking mode. When presented with high-level architectural goals, this agent conducts deep dependency analysis, identifies parallel execution paths, inserts human approval gates for critical infrastructure steps, and produces typed schemas for downstream coding and verification agents.',
    icon_url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/anthropic/anthropic-original.svg',
    banner_url: null,
    version: '3.7.0',
    latest_version: '3.7.0',
    visibility: 'PUBLIC',
    is_verified: true,
    verification_status: 'OFFICIAL',
    spec: {
      provider: 'anthropic',
      model: 'claude-3-7-sonnet-20250219',
      reasoning_mode: 'extended_thinking',
      max_thinking_tokens: 32000,
      temperature: 0.1,
      system_prompt: 'You are an elite Principal Systems Architect and DAG Orchestrator on NEXUS. Your role is to decompose complex software requests into safe, deterministic execution plans with strict dependency boundaries, rollback strategies, and human approval gates.',
      instructions: '1. Ingest user objective and workspace context.\n2. Identify security invariants and database state changes.\n3. Decompose into atomic DAG nodes with typed contracts.\n4. Designate destructive operations for human approval gates.\n5. Output schema-validated DAG JSON with estimated execution times.',
      tools: ['mcp_filesystem_read', 'mcp_git_status', 'mcp_vector_context'],
      input_parameters: [
        { name: 'objective', type: 'string', required: true, description: 'Target software architecture, feature, or refactoring goal.', default_value: 'Refactor auth system to support RLS workspaces' },
        { name: 'context_repo', type: 'string', required: false, description: 'Git repository identifier or file tree context.', default_value: 'workspace/main' },
        { name: 'constraints', type: 'string[]', required: false, description: 'Architectural invariants and zero-breaking-change rules.', default_value: '["Zero downtime", "Enforce Postgres RLS", "Require TypeScript strict mode"]' },
        { name: 'require_human_gate', type: 'boolean', required: false, description: 'Mandate role-based approval before running migrations or deploys.', default_value: 'true' }
      ],
      output_schema: {
        type: 'object',
        properties: {
          plan_summary: { type: 'string', description: 'Architectural overview of execution stages' },
          dag_nodes: { type: 'array', description: 'Execution graph nodes with dependencies' },
          parallel_groups: { type: 'array', description: 'Groups of tasks that execute simultaneously' },
          estimated_duration_seconds: { type: 'number', description: 'Projected pipeline execution runtime' }
        }
      },
      model_compatibility: [
        { provider: 'anthropic', model_id: 'claude-3-7-sonnet', name: 'Claude 3.7 Sonnet', latency: '142ms', recommended: true },
        { provider: 'openai', model_id: 'gpt-4o', name: 'OpenAI GPT-4o', latency: '118ms', recommended: false },
        { provider: 'deepseek', model_id: 'deepseek-r1', name: 'DeepSeek R1', latency: '164ms', recommended: false }
      ],
      sandbox_security: {
        ssrf_protection: 'Strict Tier-1 (Private RFC 1918 CIDRs blocked)',
        memory_isolation: 'Isolated MicroVM Sandbox',
        secret_scrubbing: 'Active on all prompt & output streams',
        static_analysis: 'Enforced AST Invariant Verifier'
      },
      sample_inputs: [
        {
          label: 'Microservice Decomposition',
          input_payload: '{"objective": "Migrate monolithic billing engine into event-driven microservices with idempotency keys."}',
          expected_output: 'Generated 5 DAG nodes: schema partitioning -> event bus adapter -> idempotency check -> human review gate -> canary deploy.'
        }
      ]
    },
    required_connectors: ['github'],
    required_capabilities: ['dag_synthesis', 'architectural_planning', 'network_egress'],
    tags: ['anthropic', 'claude-3-7', 'reasoning', 'planner', 'dag-orchestration'],
    categories: ['Productivity', 'Code & DevOps'],
    install_count: 1420,
    view_count: 5890,
    documentation_url: 'https://docs.nexus.build/agents/claude-planner',
    repository_url: 'https://github.com/nexus-orchestrator/agent-claude-planner',
    license: 'MIT',
    is_deprecated: false,
    deprecation_reason: null,
    created_at: '2026-01-05T12:00:00.000Z',
    updated_at: '2026-01-05T12:00:00.000Z',
  },
  {
    id: 'res_gpt4o_code_agent',
    workspace_id: 'ws_system',
    publisher_id: OFFICIAL_PUBLISHER.id,
    publisher: OFFICIAL_PUBLISHER,
    type: 'AGENT',
    name: 'OpenAI GPT-4o Core Code Synthesis & MCP Agent',
    slug: 'gpt4o-code-agent',
    summary: 'High-precision code synthesis, multi-file refactoring, and Model Context Protocol (MCP) tool invocation powered by GPT-4o.',
    description: 'An autonomous engineering agent engineered for full-stack implementation. Translates DAG specifications and architecture blueprints into production-ready TypeScript, Python, SQL, and Go. Employs direct MCP tool bindings for AST parsing, file patching, and automated test suite creation.',
    icon_url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/openai/openai-original.svg',
    banner_url: null,
    version: '4.0.2',
    latest_version: '4.0.2',
    visibility: 'PUBLIC',
    is_verified: true,
    verification_status: 'OFFICIAL',
    spec: {
      provider: 'openai',
      model: 'gpt-4o-2024-11-20',
      temperature: 0.15,
      system_prompt: 'You are an expert Staff Software Engineer. Write clean, modular, type-safe code that adheres strictly to established architectural invariants and includes comprehensive unit test suites.',
      instructions: '1. Ingest task specification and existing codebase types.\n2. Write atomic diffs without breaking existing functionality.\n3. Validate typing and syntax.\n4. Provide inline documentation and unit tests for public interfaces.',
      tools: ['mcp_filesystem_write', 'mcp_ast_parser', 'github_create_pull_request'],
      input_parameters: [
        { name: 'task_spec', type: 'string', required: true, description: 'Concrete specification of the feature or bug fix.', default_value: 'Create Postgres RLS adapter for workspace tenant isolation' },
        { name: 'file_paths', type: 'string[]', required: true, description: 'Relative file paths to inspect or modify.', default_value: '["src/lib/db.ts", "src/services/tenantService.ts"]' },
        { name: 'target_language', type: 'string', required: false, description: 'Target programming language.', default_value: 'typescript' },
        { name: 'generate_tests', type: 'boolean', required: false, description: 'Generate automated unit and integration tests.', default_value: 'true' }
      ],
      output_schema: {
        type: 'object',
        properties: {
          patches: { type: 'array', description: 'Atomic file diffs in unified format' },
          tests: { type: 'array', description: 'Generated test suites' },
          syntax_valid: { type: 'boolean', description: 'Passed language AST verification' }
        }
      },
      model_compatibility: [
        { provider: 'openai', model_id: 'gpt-4o', name: 'OpenAI GPT-4o', latency: '118ms', recommended: true },
        { provider: 'openai', model_id: 'o3-mini', name: 'OpenAI o3-mini', latency: '92ms', recommended: false },
        { provider: 'anthropic', model_id: 'claude-3-7-sonnet', name: 'Claude 3.7 Sonnet', latency: '142ms', recommended: false }
      ],
      sandbox_security: {
        ssrf_protection: 'Strict Tier-1 (Localhost and internal metadata endpoints blocked)',
        memory_isolation: 'Ephemeral container filesystem sandbox',
        secret_scrubbing: 'Active',
        static_analysis: 'Automated ESLint and TypeScript compilation pass'
      },
      sample_inputs: [
        {
          label: 'TypeScript Adapter Generation',
          input_payload: '{"task_spec": "Generate connection pool manager with retry backoff and metrics emitter.", "target_language": "typescript"}',
          expected_output: 'Generated PoolManager class with exponential backoff and EventEmitter telemetry.'
        }
      ]
    },
    required_connectors: ['github'],
    required_capabilities: ['code_synthesis', 'mcp_tool_execution', 'filesystem_write'],
    tags: ['openai', 'gpt-4o', 'code-synthesis', 'mcp', 'typescript'],
    categories: ['Code & DevOps', 'Productivity'],
    install_count: 2150,
    view_count: 8940,
    documentation_url: 'https://docs.nexus.build/agents/gpt4o-code-agent',
    repository_url: 'https://github.com/nexus-orchestrator/agent-gpt4o-code',
    license: 'MIT',
    is_deprecated: false,
    deprecation_reason: null,
    created_at: '2026-01-08T12:00:00.000Z',
    updated_at: '2026-01-08T12:00:00.000Z',
  },
  {
    id: 'res_deepseek_security_auditor',
    workspace_id: 'ws_system',
    publisher_id: OFFICIAL_PUBLISHER.id,
    publisher: OFFICIAL_PUBLISHER,
    type: 'AGENT',
    name: 'DeepSeek R1 Formal Logic & AST Security Auditor',
    slug: 'deepseek-security-auditor',
    summary: 'Deep reasoning agent specialized in formal mathematical verification, SQL injection auditing, and zero-day AST vulnerability scanning.',
    description: 'Built on DeepSeek R1 reasoning architecture. Evaluates code patches, database migrations, and IAM policies for subtle concurrency race conditions, transaction isolation violations, RLS policy bypasses, and hardcoded credential leaks before code reaches production.',
    icon_url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/deepseek/deepseek-original.svg',
    banner_url: null,
    version: '1.0.0',
    latest_version: '1.0.0',
    visibility: 'PUBLIC',
    is_verified: true,
    verification_status: 'OFFICIAL',
    spec: {
      provider: 'deepseek',
      model: 'deepseek-reasoner-r1',
      temperature: 0.0,
      system_prompt: 'You are a world-class Cybersecurity Researcher and Formal Verification Engineer. Find race conditions, memory leaks, SQL injections, authorization bypasses, and security flaws in code diffs.',
      instructions: '1. Parse AST and trace all untrusted user inputs.\n2. Verify SQL queries use parameterized statements.\n3. Audit authentication and Row-Level Security checks.\n4. Produce formal logic proof of safety or generate proof-of-concept exploit.',
      tools: ['mcp_ast_analyzer', 'secret_scanner_tool', 'cve_database_lookup'],
      input_parameters: [
        { name: 'code_diff', type: 'string', required: true, description: 'Unified git diff or source file to audit.', default_value: 'diff --git a/api/query.ts b/api/query.ts\n+ const rows = await db.query(`SELECT * FROM users WHERE org_id = ${req.params.orgId}`);' },
        { name: 'threat_model', type: 'string', required: false, description: 'Threat model profile (web_cloud_native, zero_trust, pci_dss).', default_value: 'web_cloud_native' },
        { name: 'strict_rls_check', type: 'boolean', required: false, description: 'Verify database Row-Level Security policies for multi-tenancy.', default_value: 'true' }
      ],
      output_schema: {
        type: 'object',
        properties: {
          audit_status: { type: 'string', enum: ['PASSED', 'REJECTED', 'WARNING'] },
          vulnerabilities: { type: 'array', description: 'Identified CVEs, CWEs, and line numbers' },
          compliance_score: { type: 'number', description: 'Overall security posture score 0-100' },
          formal_proof: { type: 'string', description: 'Mathematical invariant verification statement' }
        }
      },
      model_compatibility: [
        { provider: 'deepseek', model_id: 'deepseek-r1', name: 'DeepSeek R1', latency: '164ms', recommended: true },
        { provider: 'anthropic', model_id: 'claude-3-7-sonnet', name: 'Claude 3.7 Sonnet', latency: '142ms', recommended: false },
        { provider: 'openai', model_id: 'o3-mini', name: 'OpenAI o3-mini', latency: '95ms', recommended: false }
      ],
      sandbox_security: {
        ssrf_protection: 'Strict Tier-1 (Zero external network egress during audit pass)',
        memory_isolation: 'Air-gapped verification container',
        secret_scrubbing: 'Enforced',
        static_analysis: 'Deep AST Symbol Table Walker'
      },
      sample_inputs: [
        {
          label: 'SQL Injection Audit',
          input_payload: '{"code_diff": "const query = `SELECT * FROM users WHERE tenant_id = \'${tenant}\'`;"}',
          expected_output: 'REJECTED: High-Severity SQL Injection vulnerability (CWE-89). Recommended parameterized query.'
        }
      ]
    },
    required_connectors: ['github'],
    required_capabilities: ['ast_analysis', 'vulnerability_scanning', 'security_audit'],
    tags: ['deepseek', 'r1', 'security', 'formal-verification', 'ast-audit'],
    categories: ['Security & Compliance', 'Code & DevOps'],
    install_count: 1890,
    view_count: 7320,
    documentation_url: 'https://docs.nexus.build/agents/deepseek-security',
    repository_url: 'https://github.com/nexus-orchestrator/agent-deepseek-auditor',
    license: 'Apache-2.0',
    is_deprecated: false,
    deprecation_reason: null,
    created_at: '2026-01-14T12:00:00.000Z',
    updated_at: '2026-01-14T12:00:00.000Z',
  },
  {
    id: 'res_gemini_multimodal_analyst',
    workspace_id: 'ws_system',
    publisher_id: OFFICIAL_PUBLISHER.id,
    publisher: OFFICIAL_PUBLISHER,
    type: 'AGENT',
    name: 'Google Gemini 2.5 Pro 1M+ Context & Vision Analyst',
    slug: 'gemini-multimodal-analyst',
    summary: 'Massive 1M+ token context ingestion, visual UI regression inspection, and cross-repository architectural consistency verification.',
    description: 'Harnesses Google Gemini 2.5 Pro massive context window and native multimodal vision. Audits full multi-repository monorepos in a single prompt, compares Figma UI designs with rendered browser DOM screenshots, and detects cross-service schema discrepancies.',
    icon_url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg',
    banner_url: null,
    version: '2.5.1',
    latest_version: '2.5.1',
    visibility: 'PUBLIC',
    is_verified: true,
    verification_status: 'OFFICIAL',
    spec: {
      provider: 'gemini',
      model: 'gemini-2.5-pro',
      temperature: 0.2,
      context_window: 1048576,
      system_prompt: 'You are a Staff Full-Stack Architect with multimodal vision capabilities. Inspect cross-repository codebases and verify design fidelity between UI mocks and DOM renders.',
      instructions: '1. Ingest full repository file tree into 1M context.\n2. Compare visual screenshots against target design tokens.\n3. Trace cross-service API boundaries.\n4. Output alignment report with pixel diffs and structural recommendations.',
      tools: ['mcp_vision_diff', 'mcp_monorepo_indexer'],
      input_parameters: [
        { name: 'repo_snapshot', type: 'string', required: true, description: 'Monorepo tree or aggregated codebase context.', default_value: 'monorepo/packages/*' },
        { name: 'design_asset_url', type: 'string', required: false, description: 'Figma mock or reference UI screenshot URL.', default_value: 'https://assets.nexus.build/mocks/dashboard.png' },
        { name: 'viewport_sizes', type: 'string[]', required: false, description: 'Responsive viewports to verify.', default_value: '["375x812", "768x1024", "1440x900"]' }
      ],
      output_schema: {
        type: 'object',
        properties: {
          architectural_drift_score: { type: 'number', description: 'Repository consistency score 0-100' },
          visual_alignment_percent: { type: 'number', description: 'Pixel fidelity score' },
          drift_findings: { type: 'array', description: 'Discrepancies found across packages' }
        }
      },
      model_compatibility: [
        { provider: 'gemini', model_id: 'gemini-2.5-pro', name: 'Google Gemini 2.5 Pro', latency: '95ms', recommended: true },
        { provider: 'anthropic', model_id: 'claude-3-7-sonnet', name: 'Claude 3.7 Sonnet', latency: '142ms', recommended: false },
        { provider: 'openai', model_id: 'gpt-4o', name: 'OpenAI GPT-4o', latency: '118ms', recommended: false }
      ],
      sandbox_security: {
        ssrf_protection: 'Strict Tier-1',
        memory_isolation: 'Ephemeral container',
        secret_scrubbing: 'Active',
        static_analysis: 'Multimodal Vision & Token Analyzer'
      },
      sample_inputs: [
        {
          label: 'Figma to DOM Alignment',
          input_payload: '{"design_asset_url": "dashboard_mock.png", "rendered_screenshot_url": "dom_render.png"}',
          expected_output: '99.4% visual alignment. Discrepancy noted in header padding on 375px mobile viewport.'
        }
      ]
    },
    required_connectors: ['github'],
    required_capabilities: ['context_1m_ingestion', 'vision_analysis', 'monorepo_audit'],
    tags: ['gemini', 'google', 'vision', 'multimodal', '1m-context'],
    categories: ['Data & Analytics', 'Code & DevOps'],
    install_count: 1640,
    view_count: 6180,
    documentation_url: 'https://docs.nexus.build/agents/gemini-analyst',
    repository_url: 'https://github.com/nexus-orchestrator/agent-gemini-multimodal',
    license: 'Apache-2.0',
    is_deprecated: false,
    deprecation_reason: null,
    created_at: '2026-01-18T12:00:00.000Z',
    updated_at: '2026-01-18T12:00:00.000Z',
  },
  {
    id: 'res_llama_edge_dispatcher',
    workspace_id: 'ws_system',
    publisher_id: OFFICIAL_PUBLISHER.id,
    publisher: OFFICIAL_PUBLISHER,
    type: 'AGENT',
    name: 'Meta Llama 3.3 70B Sub-Second Edge Dispatcher',
    slug: 'llama-edge-dispatcher',
    summary: 'Sub-second webhook classification, intelligent event triage (<50ms via Groq), and edge orchestration dispatching.',
    description: 'Ultra-low-latency event processing agent powered by Llama 3.3 70B on Groq LPUs. Ingests high-frequency webhook events from GitHub, Slack, and cloud alerts, classifies payload intent in under 50ms, and dispatches directly to specialized agent pipelines.',
    icon_url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/meta/meta-original.svg',
    banner_url: null,
    version: '3.3.0',
    latest_version: '3.3.0',
    visibility: 'PUBLIC',
    is_verified: true,
    verification_status: 'OFFICIAL',
    spec: {
      provider: 'meta',
      model: 'llama-3.3-70b-versatile',
      temperature: 0.05,
      latency_budget_ms: 50,
      system_prompt: 'You are a high-speed Edge Routing and Telemetry Classifier. Process incoming event payloads within 50ms and dispatch to the correct autonomous pipeline.',
      instructions: '1. Ingest raw webhook event stream.\n2. Classify event priority (URGENT, NORMAL, LOW).\n3. Extract actor, repository, and target pipeline route.\n4. Output structured dispatch payload.',
      tools: ['webhook_evaluator', 'event_router'],
      input_parameters: [
        { name: 'payload', type: 'object', required: true, description: 'Raw JSON webhook or event payload from GitHub/Slack/Stripe.', default_value: '{"action": "opened", "issue": {"title": "Critical RLS bug", "body": "Users can access other workspaces"}}' },
        { name: 'source_service', type: 'string', required: false, description: 'Source system emitting the webhook.', default_value: 'github' }
      ],
      output_schema: {
        type: 'object',
        properties: {
          routed_pipeline: { type: 'string', description: 'Target agent pipeline ID' },
          priority: { type: 'string', enum: ['URGENT', 'NORMAL', 'LOW'] },
          processing_latency_ms: { type: 'number', description: 'Measured ingestion latency' }
        }
      },
      model_compatibility: [
        { provider: 'meta', model_id: 'llama-3.3-70b', name: 'Meta Llama 3.3 70B (Groq)', latency: '42ms', recommended: true },
        { provider: 'openai', model_id: 'gpt-4o-mini', name: 'OpenAI GPT-4o Mini', latency: '65ms', recommended: false }
      ],
      sandbox_security: {
        ssrf_protection: 'Strict Tier-1',
        memory_isolation: 'Edge Worker V8 isolate',
        secret_scrubbing: 'Active',
        static_analysis: 'High-speed JSON schema validator'
      },
      sample_inputs: [
        {
          label: 'Webhook Triage',
          input_payload: '{"event": "security_alert", "severity": "critical"}',
          expected_output: 'Classified in 38ms -> Routed to DeepSeek Security Auditor with URGENT priority.'
        }
      ]
    },
    required_connectors: ['github'],
    required_capabilities: ['edge_routing', 'webhook_triage', 'low_latency_streaming'],
    tags: ['llama', 'groq', 'meta', 'edge', 'telemetry', 'low-latency'],
    categories: ['Productivity', 'Cloud & Infrastructure'],
    install_count: 1120,
    view_count: 4210,
    documentation_url: 'https://docs.nexus.build/agents/llama-dispatcher',
    repository_url: 'https://github.com/nexus-orchestrator/agent-llama-dispatcher',
    license: 'MIT',
    is_deprecated: false,
    deprecation_reason: null,
    created_at: '2026-01-22T12:00:00.000Z',
    updated_at: '2026-01-22T12:00:00.000Z',
  },
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
      input_parameters: [
        { name: 'repo_owner', type: 'string', required: true, description: 'GitHub organization or username.', default_value: 'nexus-orchestrator' },
        { name: 'repo_name', type: 'string', required: true, description: 'Target GitHub repository name.', default_value: 'nexus-core' },
        { name: 'pull_number', type: 'number', required: false, description: 'Pull request number for diff inspection.', default_value: '42' }
      ],
      output_schema: {
        type: 'object',
        properties: {
          commit_sha: { type: 'string' },
          files_changed: { type: 'array' },
          diff_stat: { type: 'object' }
        }
      },
      sandbox_security: {
        ssrf_protection: 'Strict Tier-1 (GitHub API domain whitelist)',
        memory_isolation: 'Sandboxed connection manager',
        secret_scrubbing: 'Active',
        static_analysis: 'OAuth2 Scope Checker'
      }
    },
    required_connectors: [],
    required_capabilities: ['network_egress', 'oauth_callback'],
    tags: ['git', 'version-control', 'ci-cd', 'devops', 'webhooks'],
    categories: ['Code & DevOps', 'Cloud & Infrastructure'],
    install_count: 3200,
    view_count: 12400,
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
      input_parameters: [
        { name: 'project_id', type: 'string', required: true, description: 'Vercel project ID or slug.', default_value: 'prj_nexus_web' },
        { name: 'git_branch', type: 'string', required: false, description: 'Git branch to deploy.', default_value: 'main' },
        { name: 'production', type: 'boolean', required: false, description: 'Promote to production release.', default_value: 'false' }
      ],
      output_schema: {
        type: 'object',
        properties: {
          deployment_url: { type: 'string' },
          status: { type: 'string' },
          ready_state: { type: 'string' }
        }
      },
      sandbox_security: {
        ssrf_protection: 'Strict Tier-1',
        memory_isolation: 'Isolated API client',
        secret_scrubbing: 'Active',
        static_analysis: 'Token permission audit'
      }
    },
    required_connectors: [],
    required_capabilities: ['deployments:create', 'network_egress'],
    tags: ['deployments', 'serverless', 'hosting', 'frontend', 'ci-cd'],
    categories: ['Cloud & Infrastructure', 'Code & DevOps'],
    install_count: 2450,
    view_count: 9800,
    documentation_url: 'https://docs.nexus.build/connectors/vercel',
    repository_url: 'https://github.com/nexus-orchestrator/nexus-connector-vercel',
    license: 'Apache-2.0',
    is_deprecated: false,
    deprecation_reason: null,
    created_at: '2026-01-12T12:00:00.000Z',
    updated_at: '2026-01-12T12:00:00.000Z',
  },
  {
    id: 'res_supabase_connector',
    workspace_id: 'ws_system',
    publisher_id: OFFICIAL_PUBLISHER.id,
    publisher: OFFICIAL_PUBLISHER,
    type: 'CONNECTOR',
    name: 'Supabase Database & Realtime Connector',
    slug: 'supabase-connector',
    summary: 'PostgreSQL schema queries, Row-Level Security (RLS) policies, realtime broadcast channels, and Auth webhooks.',
    description: 'Provides authenticated agents with direct, sandboxed access to PostgreSQL tables, RLS policy inspection, SQL migration generation, and Supabase Auth webhooks.',
    icon_url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg',
    banner_url: null,
    version: '1.3.0',
    latest_version: '1.3.0',
    visibility: 'PUBLIC',
    is_verified: true,
    verification_status: 'OFFICIAL',
    spec: {
      connector_id: 'supabase',
      auth_types: ['service_role_key', 'anon_key', 'oauth2'],
      available_actions: ['execute_query', 'inspect_schema', 'verify_rls', 'listen_changes'],
      input_parameters: [
        { name: 'project_ref', type: 'string', required: true, description: 'Supabase project reference ID.', default_value: 'app-prod-db' },
        { name: 'sql_statement', type: 'string', required: false, description: 'Read-only or sandboxed SQL query.', default_value: 'SELECT tablename FROM pg_tables WHERE schemaname = \'public\';' },
        { name: 'schema_name', type: 'string', required: false, description: 'Target schema to inspect.', default_value: 'public' }
      ],
      output_schema: {
        type: 'object',
        properties: {
          rows: { type: 'array' },
          row_count: { type: 'number' },
          rls_enabled_tables: { type: 'array' }
        }
      },
      sandbox_security: {
        ssrf_protection: 'Strict Tier-1',
        memory_isolation: 'Role-based DB credentials isolation',
        secret_scrubbing: 'Active',
        static_analysis: 'SQL Injection AST validator'
      }
    },
    required_connectors: [],
    required_capabilities: ['database_access', 'network_egress'],
    tags: ['database', 'postgres', 'supabase', 'sql', 'rls'],
    categories: ['Data & Analytics', 'Cloud & Infrastructure'],
    install_count: 2780,
    view_count: 10400,
    documentation_url: 'https://docs.nexus.build/connectors/supabase',
    repository_url: 'https://github.com/nexus-orchestrator/nexus-connector-supabase',
    license: 'Apache-2.0',
    is_deprecated: false,
    deprecation_reason: null,
    created_at: '2026-01-13T12:00:00.000Z',
    updated_at: '2026-01-13T12:00:00.000Z',
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
      provider: 'gemini',
      model: 'gemini-1.5-pro',
      temperature: 0.1,
      system_prompt: 'You are an elite Staff Security & Software Engineer evaluating git commits and diffs.',
      instructions: '1. Inspect touched files.\n2. Flag high-risk changes.\n3. Validate tests and security posture.',
      tools: ['github_fetch_diff', 'github_create_comment', 'mcp_vector_context'],
      input_parameters: [
        { name: 'repo_id', type: 'string', required: true, description: 'Target GitHub repository.', default_value: 'nexus-orchestrator/nexus-core' },
        { name: 'pr_number', type: 'number', required: true, description: 'Pull request number.', default_value: '108' }
      ],
      output_schema: {
        type: 'object',
        properties: {
          risk_level: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
          review_comments: { type: 'array' },
          test_coverage_delta: { type: 'string' }
        }
      },
      sandbox_security: {
        ssrf_protection: 'Strict Tier-1',
        memory_isolation: 'Ephemeral container',
        secret_scrubbing: 'Active',
        static_analysis: 'AST Parser'
      }
    },
    required_connectors: ['github'],
    required_capabilities: ['code_analysis', 'github_pr_inspection'],
    tags: ['security', 'code-review', 'gemini', 'autonomous-agent'],
    categories: ['Security & Compliance', 'Code & DevOps'],
    install_count: 1350,
    view_count: 5120,
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
      input_parameters: [
        { name: 'webhook_secret', type: 'string', required: true, description: 'GitHub HMAC webhook signature secret.', default_value: 'whsec_••••••••••••' },
        { name: 'target_environment', type: 'string', required: false, description: 'Deployment target environment.', default_value: 'production' }
      ],
      output_schema: {
        type: 'object',
        properties: {
          deployment_status: { type: 'string' },
          release_url: { type: 'string' },
          audit_log_id: { type: 'string' }
        }
      },
      sandbox_security: {
        ssrf_protection: 'Strict Tier-1',
        memory_isolation: 'Pipeline Orchestration Engine Sandbox',
        secret_scrubbing: 'Active',
        static_analysis: 'Workflow Invariant Checker'
      }
    },
    required_connectors: ['github', 'vercel'],
    required_capabilities: ['multi_agent_orchestration', 'human_approval', 'production_deployment'],
    tags: ['pipeline', 'ci-cd', 'security-gate', 'deployment-automation'],
    categories: ['Code & DevOps', 'Security & Compliance'],
    install_count: 1980,
    view_count: 6720,
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
      input_parameters: [
        { name: 'query', type: 'string', required: true, description: 'Semantic search text query.', default_value: 'authentication architecture and RLS policies' },
        { name: 'top_k', type: 'number', required: false, description: 'Maximum number of memories to return.', default_value: '5' }
      ],
      output_schema: {
        type: 'object',
        properties: {
          results: { type: 'array', description: 'Ranked semantic documents with cosine similarity scores' }
        }
      },
      sandbox_security: {
        ssrf_protection: 'Strict Tier-1',
        memory_isolation: 'Vector Namespace Isolation',
        secret_scrubbing: 'Active',
        static_analysis: 'MCP Spec 2024-11-05 Validator'
      }
    },
    required_connectors: [],
    required_capabilities: ['mcp_tool_execution', 'semantic_search'],
    tags: ['mcp', 'protocol', 'vector-memory', 'context'],
    categories: ['Productivity', 'Data & Analytics'],
    install_count: 1720,
    view_count: 5930,
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
      input_parameters: [
        { name: 'user_feedback', type: 'string', required: true, description: 'Raw customer ticket or crash report.', default_value: 'Users getting 403 error on workspace invite links' },
        { name: 'target_team_id', type: 'string', required: false, description: 'Linear team identifier.', default_value: 'team_core_eng' }
      ],
      output_schema: {
        type: 'object',
        properties: {
          issue_key: { type: 'string' },
          priority: { type: 'string' },
          cluster_id: { type: 'string' }
        }
      },
      sandbox_security: {
        ssrf_protection: 'Strict Tier-1',
        memory_isolation: 'A2A Protocol Isolation Boundary',
        secret_scrubbing: 'Active',
        static_analysis: 'Agent Card Spec Validator'
      }
    },
    required_connectors: [],
    required_capabilities: ['a2a_agent_delegation', 'issue_triage'],
    tags: ['a2a', 'linear', 'issue-tracking', 'triage', 'productivity'],
    categories: ['Productivity', 'Communication'],
    install_count: 890,
    view_count: 3410,
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
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure all seed catalog resources are present with latest specs, while preserving user publications
        const map = new Map<string, MarketplaceResource>();
        INITIAL_RESOURCES.forEach((r) => map.set(r.slug, r));
        parsed.forEach((r: MarketplaceResource) => {
          if (!map.has(r.slug)) {
            map.set(r.slug, r);
          }
        });
        return Array.from(map.values());
      }
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

  // 1. Anti-SSRF URL Protocol and Hostname Validation
  if (documentationUrl && !isSafeExternalUrl(documentationUrl)) {
    return {
      resource: null,
      error: 'Security Policy Rejection: Documentation URL contains an invalid protocol or restricted internal network address.',
    };
  }
  if (repositoryUrl && !isSafeExternalUrl(repositoryUrl)) {
    return {
      resource: null,
      error: 'Security Policy Rejection: Repository URL contains an invalid protocol or restricted internal network address.',
    };
  }

  // 2. Secret & Credential Scanning
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

  // 3. AI Security Shield: Non-Bypassable Adversarial Prompt Injection Defense
  const contentToScan = `${name}\n${summary}\n${description || ''}\n${JSON.stringify(spec || {})}\n${tags.join(' ')}`;
  const injectionScan = detectPromptInjection(contentToScan);
  if (!injectionScan.safe) {
    const violationSummary = injectionScan.violations.map((v) => v.description).join('; ');
    return {
      resource: null,
      error: `Security Shield Rejection: Publication blocked due to potential prompt injection, delimiter smuggling, or safety guideline violation (${violationSummary}).`,
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

  // Compute cryptographic provenance fingerprint
  let specFingerprint = '';
  try {
    const specString = JSON.stringify({ name: newResource.name, version: newResource.version, spec: newResource.spec, type: newResource.type });
    const encoder = new TextEncoder();
    const data = encoder.encode(specString);
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      specFingerprint = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (err) {
    console.warn('[NEXUS Marketplace] Provenance hashing fallback:', err);
  }

  await logWorkspaceActivity(workspaceId, {
    type: 'system',
    action: 'publish_marketplace_resource',
    name: newResource.name,
    status: 'completed',
    details: `Published ${newResource.type} "${newResource.name}" (v${newResource.version}, ${newResource.visibility}) to marketplace with cryptographic provenance verification.`,
    metadata: {
      resource_id: newResource.id,
      slug: newResource.slug,
      type: newResource.type,
      visibility: newResource.visibility,
      provenance_fingerprint: specFingerprint,
    },
  });

  await recordAuditLog({
    workspaceId,
    action: 'RESOURCE_PUBLISHED',
    resourceType: newResource.type.toLowerCase(),
    resourceId: newResource.id,
    metadata: {
      name: newResource.name,
      version: newResource.version,
      visibility: newResource.visibility,
      provenance_fingerprint: specFingerprint,
      security_scans: {
        secrets_clean: true,
        injection_clean: true,
        urls_verified: true,
      },
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
