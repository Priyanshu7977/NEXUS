import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { vercelAdapter } from '../connectors/adapters/vercelAdapter';
import { getDecryptedAccessToken } from './connectorService';
import { ConnectorConnection } from '../types/database';
import { DeploymentRecord, VercelProject, VercelDeploymentResponse, CreateDeploymentInput } from '../types/deployment';
import { logWorkspaceActivity } from './activityService';

const LOCAL_DEPLOYMENTS_KEY = 'nexus_deployments_store_v5';

const getLocalDeployments = (): DeploymentRecord[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_DEPLOYMENTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    return [];
  }
  return [];
};

const saveLocalDeployments = (deployments: DeploymentRecord[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_DEPLOYMENTS_KEY, JSON.stringify(deployments));
  } catch (err) {
    console.error('Failed to save local deployments:', err);
  }
};

export const saveDeploymentRecord = async (
  workspaceId: string,
  record: Omit<DeploymentRecord, 'id' | 'created_at' | 'updated_at'> & { id?: string }
): Promise<DeploymentRecord> => {
  const localList = getLocalDeployments();
  const depId = record.id || crypto.randomUUID();
  const existingIdx = localList.findIndex((d) => d.id === depId || d.external_deployment_id === record.external_deployment_id);

  const fullRecord: DeploymentRecord = {
    id: depId,
    workspace_id: workspaceId,
    workflow_execution_id: record.workflow_execution_id || null,
    connector_connection_id: record.connector_connection_id || null,
    project_id: record.project_id,
    project_name: record.project_name,
    external_deployment_id: record.external_deployment_id,
    status: record.status || 'QUEUED',
    url: record.url || null,
    commit_sha: record.commit_sha || null,
    branch: record.branch || null,
    target: record.target || 'production',
    metadata: record.metadata || {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    localList[existingIdx] = {
      ...localList[existingIdx],
      ...fullRecord,
      updated_at: new Date().toISOString(),
    };
  } else {
    localList.unshift(fullRecord);
  }
  saveLocalDeployments(localList);

  if (isSupabaseConfigured) {
    try {
      await (supabase.from('deployments') as any).upsert({
        id: fullRecord.id,
        workspace_id: workspaceId,
        workflow_execution_id: fullRecord.workflow_execution_id,
        connector_connection_id: fullRecord.connector_connection_id,
        project_id: fullRecord.project_id,
        project_name: fullRecord.project_name,
        external_deployment_id: fullRecord.external_deployment_id,
        status: fullRecord.status,
        url: fullRecord.url,
        commit_sha: fullRecord.commit_sha,
        branch: fullRecord.branch,
        target: fullRecord.target,
        metadata: fullRecord.metadata,
      });
    } catch (err) {
      console.warn('Supabase deployments sync error:', err);
    }
  }

  return fullRecord;
};

export const getWorkspaceDeployments = async (
  workspaceId: string
): Promise<{ deployments: DeploymentRecord[]; error?: string }> => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('deployments')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return { deployments: data as unknown as DeploymentRecord[] };
      }
    } catch (err: any) {
      console.warn('Supabase getWorkspaceDeployments fallback:', err);
    }
  }

  const local = getLocalDeployments().filter((d) => d.workspace_id === workspaceId);
  return { deployments: local };
};

export const getVercelProjects = async (
  connection: ConnectorConnection
): Promise<{ projects: VercelProject[]; error?: string }> => {
  const token = await getDecryptedAccessToken(connection);
  if (!token) {
    return { projects: [], error: 'Could not decrypt Vercel access token.' };
  }

  try {
    const projects = await vercelAdapter.fetchProjects(token);
    return { projects };
  } catch (err: any) {
    return { projects: [], error: err.message || 'Failed to fetch Vercel projects.' };
  }
};

/**
 * Triggers a real Vercel deployment, saves the deployment record, and polls status until READY or TIMEOUT.
 */
export const triggerVercelDeployment = async (
  connection: ConnectorConnection,
  input: CreateDeploymentInput
): Promise<VercelDeploymentResponse> => {
  const token = await getDecryptedAccessToken(connection);
  if (!token) {
    throw new Error('Vercel connector connection token is missing or expired.');
  }

  // 1. Trigger deployment
  const deployRes = await vercelAdapter.createDeployment(token, {
    projectId: input.projectId,
    projectName: input.projectName,
    target: input.target || 'production',
    gitSource: input.gitSource,
  });

  // 2. Persist initial deployment record
  await saveDeploymentRecord(input.workspaceId, {
    workspace_id: input.workspaceId,
    workflow_execution_id: input.workflowExecutionId || null,
    connector_connection_id: connection.id,
    project_id: input.projectId,
    project_name: input.projectName,
    external_deployment_id: deployRes.id,
    status: deployRes.status,
    url: deployRes.url,
    commit_sha: input.gitSource?.sha || null,
    branch: input.gitSource?.ref || null,
    target: input.target || 'production',
    metadata: {
      inspectorUrl: deployRes.inspectorUrl,
      readyState: deployRes.readyState,
    },
  });

  await logWorkspaceActivity(input.workspaceId, {
    type: 'connector',
    action: 'vercel_deployment_created',
    name: `Vercel Deployment: ${input.projectName}`,
    status: 'running',
    details: `Initiated ${input.target || 'production'} deployment (${deployRes.id}) for commit ${input.gitSource?.sha?.slice(0, 7) || 'HEAD'}`,
    metadata: {
      deploymentId: deployRes.id,
      url: deployRes.url,
      project: input.projectName,
    },
  });

  // 3. Short poll loop for build progression (maximum 15 seconds so workflow engine doesn't block forever)
  let currentStatus = deployRes;
  const pollStart = Date.now();
  const maxPollMs = 15000;

  while (Date.now() - pollStart < maxPollMs && currentStatus.status === 'BUILDING') {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    try {
      const updated = await vercelAdapter.getDeploymentStatus(token, deployRes.id);
      currentStatus = updated;

      if (updated.status === 'READY' || updated.status === 'ERROR') {
        await saveDeploymentRecord(input.workspaceId, {
          workspace_id: input.workspaceId,
          workflow_execution_id: input.workflowExecutionId || null,
          connector_connection_id: connection.id,
          project_id: input.projectId,
          project_name: input.projectName,
          external_deployment_id: deployRes.id,
          status: updated.status,
          url: updated.url,
          commit_sha: input.gitSource?.sha || null,
          branch: input.gitSource?.ref || null,
          target: input.target || 'production',
          metadata: {
            readyState: updated.readyState,
            readyAt: updated.ready,
          },
        });

        if (updated.status === 'READY') {
          await logWorkspaceActivity(input.workspaceId, {
            type: 'connector',
            action: 'vercel_deployment_ready',
            name: `Vercel Deployment Live: ${input.projectName}`,
            status: 'completed',
            details: `Deployment ready at: ${updated.url}`,
            metadata: {
              deploymentId: deployRes.id,
              url: updated.url,
            },
          });
        }
        break;
      }
    } catch (pollErr) {
      console.warn('Vercel status polling error:', pollErr);
      break;
    }
  }

  return currentStatus;
};
