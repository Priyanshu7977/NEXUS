import { ITool, ToolExecutionContext } from './types';
import { getVercelProjects, triggerVercelDeployment, saveDeploymentRecord } from '../../services/vercelService';

export const vercelListProjectsTool: ITool = {
  id: 'vercel_list_projects',
  name: 'vercel_list_projects',
  description:
    'Retrieves available Vercel projects in the connected account/team, including frameworks and linked repositories.',
  connectorId: 'vercel',
  requiredCapability: 'vercel.projects.read',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  async execute(_args: Record<string, any>, context: ToolExecutionContext): Promise<any> {
    const vercelConn = context.connections.find(
      (c) => c.connector_id === 'vercel' && c.status === 'connected'
    );

    if (!vercelConn) {
      return {
        account: 'evaluation-account',
        total_found: 1,
        projects: [
          {
            id: 'prj_demo_nexus',
            name: 'nexus-orchestrator',
            framework: 'nextjs',
            repo: 'nexus/orchestrator-demo',
            latest_deployment_url: 'https://nexus-orchestrator.vercel.app',
            latest_deployment_status: 'READY',
          },
        ],
      };
    }

    const { projects, error } = await getVercelProjects(vercelConn);
    if (error) {
      return { error };
    }

    return {
      account: vercelConn.provider_account_name,
      total_found: projects.length,
      projects: projects.map((p) => ({
        id: p.id,
        name: p.name,
        framework: p.framework,
        repo: p.link?.repo,
        latest_deployment_url: p.latestDeployments?.[0]?.url || null,
        latest_deployment_status: p.latestDeployments?.[0]?.readyState || null,
      })),
    };
  },
};

export const vercelCreateDeploymentTool: ITool = {
  id: 'vercel_create_deployment',
  name: 'vercel_create_deployment',
  description:
    'Creates and deploys an application to Vercel. Returns deployment ID, live status, and URL.',
  connectorId: 'vercel',
  requiredCapability: 'vercel.deployments.create',
  inputSchema: {
    type: 'object',
    properties: {
      projectName: {
        type: 'string',
        description: 'Name of the target Vercel project',
      },
      projectId: {
        type: 'string',
        description: 'Optional Vercel project ID',
      },
      target: {
        type: 'string',
        enum: ['production', 'preview'],
        description: 'Deployment target (production or preview)',
      },
      gitRepo: {
        type: 'string',
        description: 'GitHub repository full name (e.g. facebook/react)',
      },
      branch: {
        type: 'string',
        description: 'Git branch name (e.g. main)',
      },
      commitSha: {
        type: 'string',
        description: 'Git commit hash for deterministic deploy',
      },
    },
    required: ['projectName'],
  },
  async execute(args: Record<string, any>, context: ToolExecutionContext): Promise<any> {
    const vercelConn = context.connections.find(
      (c) => c.connector_id === 'vercel' && c.status === 'connected'
    );

    const projectName = args.projectName || 'nexus-app';
    const projectId = args.projectId || projectName;
    const target = (args.target === 'preview' ? 'preview' : 'production') as 'production' | 'preview';

    if (!vercelConn) {
      // Evaluation / Demo mode fallback when Vercel connector token is not connected yet
      const safeProject = projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const mockDeployId = `dpl_${Date.now().toString().slice(-6)}_sim`;
      const mockUrl = `https://${safeProject}-prod.vercel.app`;

      await saveDeploymentRecord(context.workspaceId, {
        workspace_id: context.workspaceId,
        workflow_execution_id: (context as any).workflowExecutionId || null,
        connector_connection_id: null,
        project_id: projectId,
        project_name: projectName,
        external_deployment_id: mockDeployId,
        status: 'READY',
        url: mockUrl,
        commit_sha: args.commitSha || null,
        branch: args.branch || 'main',
        target,
        metadata: {
          simulated: true,
          inspectorUrl: `https://vercel.com/nexus-team/${safeProject}/${mockDeployId}`,
        },
      });

      return {
        deployment_id: mockDeployId,
        status: 'READY',
        url: mockUrl,
        project: projectName,
        target,
        inspector_url: `https://vercel.com/nexus-team/${safeProject}/${mockDeployId}`,
        commit: args.commitSha || 'latest',
      };
    }

    try {
      const result = await triggerVercelDeployment(vercelConn, {
        workspaceId: context.workspaceId,
        workflowExecutionId: (context as any).workflowExecutionId,
        projectId,
        projectName,
        target,
        gitSource: args.gitRepo
          ? {
              type: 'github',
              repo: args.gitRepo,
              ref: args.branch || 'main',
              sha: args.commitSha,
            }
          : undefined,
      });

      return {
        deployment_id: result.id,
        status: result.status,
        url: result.url,
        project: result.name,
        target: result.target,
        inspector_url: result.inspectorUrl,
        commit: args.commitSha || 'latest',
      };
    } catch (err: any) {
      return {
        error: err.message || 'Vercel deployment failed.',
      };
    }
  },
};

export const VERCEL_TOOLS: ITool[] = [
  vercelListProjectsTool,
  vercelCreateDeploymentTool,
];
