import { OrchestrationNode, ConnectorItem, CollaborationStep, WorkflowNode, LogEntry } from '../types';

export const HERO_NODES: OrchestrationNode[] = [
  {
    id: 'nexus-core',
    label: 'NEXUS',
    sublabel: 'ORCHESTRATOR',
    category: 'core',
    x: 50,
    y: 50,
    status: 'RUNNING',
    iconName: 'Cpu',
    description: 'Central orchestration engine coordinating agents, tools, and workflows.',
    role: 'Central Orchestration Engine'
  },
  {
    id: 'github',
    label: 'GitHub',
    sublabel: 'Source & Events',
    category: 'service',
    x: 18,
    y: 48,
    status: 'COMPLETED',
    iconName: 'GitBranch',
    description: 'Repository events, commits, and code review triggers.',
    role: 'Source Repository'
  },
  {
    id: 'ai-agent',
    label: 'AI Agent',
    sublabel: 'Reasoning Core',
    category: 'agent',
    x: 82,
    y: 48,
    status: 'RUNNING',
    iconName: 'Bot',
    description: 'Specialized autonomous agents planning and generating code.',
    role: 'Specialized Agents'
  },
  {
    id: 'security',
    label: 'Security',
    sublabel: 'Policy Gate',
    category: 'guardrail',
    x: 50,
    y: 18,
    status: 'COMPLETED',
    iconName: 'ShieldCheck',
    description: 'Permission enforcement, secret scanning, and execution boundaries.',
    role: 'Security & Permissions'
  },
  {
    id: 'vercel',
    label: 'Vercel',
    sublabel: 'Deployment',
    category: 'deploy',
    x: 50,
    y: 82,
    status: 'WAITING',
    iconName: 'CloudLightning',
    description: 'Atomic deployments, preview branches, and edge environments.',
    role: 'Deployment Target'
  },
  {
    id: 'testing',
    label: 'Testing',
    sublabel: 'Verification',
    category: 'guardrail',
    x: 26,
    y: 26,
    status: 'COMPLETED',
    iconName: 'CheckCircle2',
    description: 'Automated test execution, regression checks, and invariant assertions.',
    role: 'Automated Testing'
  },
  {
    id: 'database',
    label: 'Database',
    sublabel: 'State & Memory',
    category: 'storage',
    x: 74,
    y: 26,
    status: 'COMPLETED',
    iconName: 'Database',
    description: 'Shared agent context, session history, and application state.',
    role: 'State & Context'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    sublabel: 'Observability',
    category: 'telemetry',
    x: 74,
    y: 74,
    status: 'RUNNING',
    iconName: 'Activity',
    description: 'Live execution traces, step latencies, and token usage.',
    role: 'Execution Traces'
  }
];

export const ECOSYSTEM_BRANDS = [
  { name: 'GitHub', category: 'Development', icon: 'GitBranch', description: 'Repository and development workflows' },
  { name: 'Vercel', category: 'Deployment', icon: 'Globe', description: 'Web application and edge deployment' },
  { name: 'OpenAI', category: 'AI Models', icon: 'Sparkles', description: 'Language models and reasoning' },
  { name: 'Google Gemini', category: 'AI Models', icon: 'Cpu', description: 'Multimodal reasoning and models' },
  { name: 'Supabase', category: 'Data', icon: 'Database', description: 'Database and real-time backend' },
  { name: 'MongoDB', category: 'Data', icon: 'Layers', description: 'Document databases and search' },
  { name: 'WordPress', category: 'CMS', icon: 'FileText', description: 'Content and publishing systems' },
  { name: 'Shopify', category: 'Commerce', icon: 'ShoppingBag', description: 'Storefront APIs and webhooks' },
  { name: 'Slack', category: 'Communication', icon: 'MessageSquare', description: 'Human-in-the-loop approvals' },
  { name: 'Notion', category: 'Documentation', icon: 'BookOpen', description: 'Knowledge bases and documentation' },
];

export const CONNECTORS_DATA: ConnectorItem[] = [
  {
    id: 'github',
    name: 'GitHub',
    category: 'Development',
    description: 'Repository and development workflows with pull requests and commit triggers.',
    icon: 'GitBranch',
    features: ['Repository triggers', 'Pull request automation', 'Issue synchronization']
  },
  {
    id: 'docker',
    name: 'Docker & Containers',
    category: 'Development',
    description: 'Isolated environments for running agent tasks and testing builds.',
    icon: 'Box',
    features: ['Sandbox environments', 'Build runners', 'Clean lifecycle management']
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    category: 'AI',
    description: 'AI models and multimodal reasoning across text, code, and documents.',
    icon: 'Cpu',
    features: ['Multimodal inference', 'Structured outputs', 'Large context support']
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    category: 'AI',
    description: 'AI models for code synthesis, complex reasoning, and task decomposition.',
    icon: 'Sparkles',
    features: ['Code synthesis', 'System architecture', 'Tool invocation']
  },
  {
    id: 'postgres',
    name: 'PostgreSQL',
    category: 'Data',
    description: 'Databases and application data for persistent storage and query execution.',
    icon: 'Database',
    features: ['Schema integration', 'Read/write permissions', 'Vector query support']
  },
  {
    id: 'supabase',
    name: 'Supabase',
    category: 'Data',
    description: 'Database, authentication context, and real-time event streaming.',
    icon: 'Layers',
    features: ['Database triggers', 'Real-time sync', 'Storage integration']
  },
  {
    id: 'notion',
    name: 'Notion',
    category: 'CMS',
    description: 'CMS and content systems for ingesting specifications and documentation.',
    icon: 'BookOpen',
    features: ['Document search', 'Page ingestion', 'Spec retrieval']
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'Communication',
    description: 'Communication and approvals for human-in-the-loop workflow checkpoints.',
    icon: 'MessageSquare',
    features: ['Approval gates', 'Status notifications', 'Interactive responses']
  },
  {
    id: 'opentelemetry',
    name: 'OpenTelemetry',
    category: 'Analytics',
    description: 'Observability and trace metrics across agent execution pipelines.',
    icon: 'Activity',
    features: ['Distributed traces', 'Step duration metrics', 'Standard trace export']
  }
];

export const COLLABORATION_STEPS: CollaborationStep[] = [
  {
    id: 'step-0',
    name: 'User Request',
    role: 'Workflow Trigger',
    status: 'COMPLETED',
    summary: 'Request received: "Refactor payment retry logic with idempotency keying and add automated test coverage."',
    details: {
      input: 'Refactor payment retry logic with idempotency and add tests',
      output: 'Workflow initialized and execution plan drafted.',
      toolsInvoked: ['nexus.workflow.init', 'nexus.policy.check']
    }
  },
  {
    id: 'step-1',
    name: 'Planner Agent',
    role: 'Task Decomposition',
    status: 'COMPLETED',
    summary: 'Analyzes the codebase, identifies modified files, and decomposes task into parallel steps.',
    details: {
      input: 'Target codebase repository: /services/billing',
      output: 'Execution plan: [Research & Code Generation] -> [Testing] -> [Security] -> [Deployment]',
      toolsInvoked: ['codebase.analyze', 'dag.createPlan']
    }
  },
  {
    id: 'step-2',
    name: 'Research Agent + Code Agent',
    role: 'Parallel Analysis & Implementation',
    status: 'RUNNING',
    summary: 'Research Agent checks payment retry standards while Code Agent authors changes in parallel.',
    details: {
      input: 'File: billing/payment_processor.ts, requirement: retry with exponential backoff',
      output: 'Code changes authored and ready for automated test verification.',
      toolsInvoked: ['git.readFile', 'code.generatePatch'],
      parallelWith: 'Research Agent'
    }
  },
  {
    id: 'step-3',
    name: 'Testing Agent',
    role: 'Automated Verification',
    status: 'COMPLETED',
    summary: 'Executes test suite against mock payment service to ensure zero regressions.',
    details: {
      input: 'Sandbox test runner: payment_processor.test.ts',
      output: '48 test assertions passed (retry logic, concurrency, timeout recovery).',
      toolsInvoked: ['test.runSuite', 'test.checkCoverage']
    }
  },
  {
    id: 'step-4',
    name: 'Security Agent',
    role: 'Policy & Guardrail Check',
    status: 'RUNNING',
    summary: 'Scanning changes for credential exposure, permission limits, and boundary compliance.',
    details: {
      input: 'Synthesized patch diff and dependency updates',
      output: 'No secret leaks found. Permission boundaries verified.',
      toolsInvoked: ['security.scanDiff', 'policy.enforceBoundaries']
    }
  },
  {
    id: 'step-5',
    name: 'Deployment Agent',
    role: 'Staging & Human Approval',
    status: 'WAITING',
    summary: 'Prepares staging preview deployment and sends approval card to engineering channel.',
    details: {
      input: 'Verified commit bundle ready for staging rollout',
      output: 'Awaiting human sign-off before promoting to production.',
      toolsInvoked: ['slack.requestApproval', 'deploy.stagePreview']
    }
  }
];

export const WORKFLOW_NODES: WorkflowNode[] = [
  {
    id: 'wf-1',
    title: 'GitHub Push',
    subtitle: 'Repository Event',
    type: 'trigger',
    status: 'COMPLETED',
    x: 8,
    y: 40
  },
  {
    id: 'wf-2',
    title: 'Code Agent',
    subtitle: 'Generates Changes',
    type: 'agent',
    status: 'COMPLETED',
    x: 24,
    y: 40
  },
  {
    id: 'wf-3',
    title: 'Test Agent',
    subtitle: 'Runs Test Suite',
    type: 'verification',
    status: 'COMPLETED',
    x: 40,
    y: 20
  },
  {
    id: 'wf-4',
    title: 'Security Agent',
    subtitle: 'Security Checks',
    type: 'guardrail',
    status: 'RUNNING',
    x: 56,
    y: 20
  },
  {
    id: 'wf-5',
    title: 'Human Approval',
    subtitle: 'Approval Gate',
    type: 'gate',
    status: 'WAITING',
    x: 72,
    y: 40
  },
  {
    id: 'wf-6',
    title: 'Deploy to Vercel',
    subtitle: 'Production Release',
    type: 'action',
    status: 'WAITING',
    x: 88,
    y: 40
  }
];

export const MISSION_LOGS: LogEntry[] = [
  {
    id: 'log-1',
    timestamp: '17:42:01',
    level: 'INFO',
    agent: 'ORCHESTRATOR',
    message: 'Workflow initialized: payment retry refactor.'
  },
  {
    id: 'log-2',
    timestamp: '17:42:02',
    level: 'INFO',
    agent: 'PLANNER',
    message: 'Resolved dependencies. Dispatched parallel agents: [Research, Code].'
  },
  {
    id: 'log-3',
    timestamp: '17:42:03',
    level: 'EXEC',
    agent: 'CODE AGENT',
    message: 'Generated patch for payment_processor.ts with exponential backoff.'
  },
  {
    id: 'log-4',
    timestamp: '17:42:04',
    level: 'INFO',
    agent: 'TEST AGENT',
    message: 'Test suite completed: 48 tests passed.'
  },
  {
    id: 'log-5',
    timestamp: '17:42:05',
    level: 'INFO',
    agent: 'SECURITY AGENT',
    message: 'Security scan completed. Permissions and boundaries verified.'
  },
  {
    id: 'log-6',
    timestamp: '17:42:06',
    level: 'WARN',
    agent: 'DEPLOY AGENT',
    message: 'Awaiting human approval before production release.'
  }
];
