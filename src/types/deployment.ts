export type DeploymentStatus =
  | 'QUEUED'
  | 'BUILDING'
  | 'READY'
  | 'ERROR'
  | 'CANCELLED';

export interface DeploymentRecord {
  id: string;
  workspace_id: string;
  workflow_execution_id?: string | null;
  connector_connection_id?: string | null;
  project_id: string;
  project_name: string;
  external_deployment_id: string;
  status: DeploymentStatus;
  url: string | null;
  commit_sha: string | null;
  branch: string | null;
  target: 'production' | 'preview';
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface VercelProject {
  id: string;
  name: string;
  framework: string | null;
  nodeVersion?: string;
  latestDeployments?: {
    id: string;
    url: string;
    readyState: string;
    createdAt: number;
  }[];
  link?: {
    type: string;
    repo: string;
    org?: string;
  };
  updatedAt: number;
  createdAt: number;
}

export interface VercelDeploymentResponse {
  id: string;
  url: string;
  name: string;
  status: DeploymentStatus;
  readyState?: string;
  inspectorUrl?: string;
  target: 'production' | 'preview';
  createdAt: number;
  buildingAt?: number;
  ready?: number;
}

export interface CreateDeploymentInput {
  workspaceId: string;
  workflowExecutionId?: string;
  projectId: string;
  projectName: string;
  gitSource?: {
    type: 'github';
    repo: string;
    ref: string;
    sha?: string;
  };
  target?: 'production' | 'preview';
}
