export type AgentStatus = 'RUNNING' | 'COMPLETED' | 'PAUSED' | 'WAITING';

export interface OrchestrationNode {
  id: string;
  label: string;
  sublabel?: string;
  category: 'core' | 'service' | 'agent' | 'guardrail' | 'storage' | 'deploy' | 'telemetry';
  x: number;
  y: number;
  status: AgentStatus;
  iconName: string;
  description: string;
  role: string;
}

export interface ConnectorItem {
  id: string;
  name: string;
  category: 'Development' | 'AI' | 'Data' | 'CMS' | 'Communication' | 'Analytics';
  description: string;
  protocol?: string;
  icon: string;
  features: string[];
}

export interface CollaborationStep {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  summary: string;
  details: {
    input: string;
    output: string;
    toolsInvoked: string[];
    parallelWith?: string;
  };
}

export interface WorkflowNode {
  id: string;
  title: string;
  type: 'trigger' | 'agent' | 'verification' | 'guardrail' | 'gate' | 'action';
  subtitle: string;
  status: AgentStatus;
  x: number;
  y: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'EXEC' | 'WARN';
  agent: string;
  message: string;
}
