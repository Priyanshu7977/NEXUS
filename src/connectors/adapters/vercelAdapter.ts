import { IConnectorAdapter, ConnectorError } from './baseAdapter';
import { ConnectorDefinition, OAuthStatePayload } from '../../types/connector';
import { VercelProject, VercelDeploymentResponse } from '../../types/deployment';

const VERCEL_ACCESS_TOKEN: string =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_VERCEL_ACCESS_TOKEN) || '';

const VERCEL_CLIENT_ID: string =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_VERCEL_CLIENT_ID) || '';

export const VERCEL_DEFINITION: ConnectorDefinition = {
  id: 'vercel',
  name: 'Vercel',
  slug: 'vercel',
  brand: 'vercel',
  category: 'Development',
  description: 'Deploy frontend projects, serverless functions, and production web applications directly from NEXUS orchestration pipelines.',
  status: 'available',
  authType: 'api_key',
  requiredScopes: ['deployments:read', 'deployments:write', 'projects:read'],
  docsUrl: 'https://vercel.com/docs/rest-api',
  capabilities: [
    {
      id: 'vercel.projects.read',
      name: 'List Vercel Projects',
      description: 'Discover connected Vercel applications, frameworks, and deployment histories.',
      status: 'active',
    },
    {
      id: 'vercel.deployments.read',
      name: 'Read Deployment Telemetry',
      description: 'Inspect deployment status, build stages, and generated preview/production URLs.',
      status: 'active',
    },
    {
      id: 'vercel.deployments.create',
      name: 'Create Verified Deployment',
      description: 'Trigger authenticated preview and production deployments with commit metadata.',
      status: 'active',
    },
  ],
};

export class VercelAdapter implements IConnectorAdapter {
  public definition = VERCEL_DEFINITION;

  public isConfigured(): boolean {
    return Boolean(
      (VERCEL_ACCESS_TOKEN && !VERCEL_ACCESS_TOKEN.includes('your_vercel_token') && VERCEL_ACCESS_TOKEN.trim().length > 0) ||
      (VERCEL_CLIENT_ID && !VERCEL_CLIENT_ID.includes('your_vercel_client_id') && VERCEL_CLIENT_ID.trim().length > 0)
    );
  }

  public getAuthorizationUrl(workspaceId: string, returnUrl = '/app/connectors/vercel'): string {
    const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const statePayload: OAuthStatePayload = {
      workspaceId,
      connectorId: 'vercel',
      timestamp: Date.now(),
      nonce,
      returnUrl,
    };

    const stateString = btoa(JSON.stringify(statePayload));
    return `https://vercel.com/oauth/authorize?client_id=${VERCEL_CLIENT_ID}&state=${stateString}`;
  }

  public validateOAuthState(stateParam: string): { valid: boolean; payload?: OAuthStatePayload; error?: string } {
    try {
      const payload = JSON.parse(atob(stateParam)) as OAuthStatePayload;
      return { valid: true, payload };
    } catch {
      return { valid: false, error: 'Corrupt OAuth state payload' };
    }
  }

  public async exchangeCodeForToken(
    code: string
  ): Promise<{ accessToken: string; refreshToken?: string; tokenType: string; scopes: string[] }> {
    if (!code) {
      throw new ConnectorError('AUTHORIZATION_FAILED', 'Authorization code or token is required.');
    }
    return {
      accessToken: code.trim(),
      tokenType: 'bearer',
      scopes: this.definition.requiredScopes,
    };
  }

  public async fetchAccountProfile(
    accessToken: string
  ): Promise<{ id: string; name: string; username: string; avatarUrl?: string; email?: string; metadata?: Record<string, any> }> {
    const token = accessToken || VERCEL_ACCESS_TOKEN;
    if (!token) {
      throw new ConnectorError('TOKEN_EXPIRED', 'Vercel access token is missing. Connect your Vercel account or set VITE_VERCEL_ACCESS_TOKEN.');
    }

    try {
      const res = await fetch('https://api.vercel.com/v2/user', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new ConnectorError('TOKEN_EXPIRED', 'Vercel token is invalid or expired.');
        }
        throw new ConnectorError('PROVIDER_UNAVAILABLE', `Vercel error: HTTP ${res.status}`);
      }

      const data = await res.json();
      const user = data.user || data;

      return {
        id: user.id || 'vercel-user',
        name: user.name || user.username || 'Vercel Team Member',
        username: user.username || user.email || 'vercel-account',
        avatarUrl: user.avatar ? `https://vercel.com/api/www/avatar/${user.avatar}` : undefined,
        email: user.email || undefined,
        metadata: {
          tier: user.tier || 'pro',
          bio: user.bio,
        },
      };
    } catch (err: any) {
      if (err instanceof ConnectorError) throw err;
      throw new ConnectorError('PROVIDER_UNAVAILABLE', `Failed to fetch Vercel profile: ${err.message}`);
    }
  }

  public async fetchProjects(accessToken: string): Promise<VercelProject[]> {
    const token = accessToken || VERCEL_ACCESS_TOKEN;
    if (!token) {
      throw new ConnectorError('TOKEN_EXPIRED', 'Vercel access token is missing.');
    }

    try {
      const res = await fetch('https://api.vercel.com/v9/projects?limit=50', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new ConnectorError('PROVIDER_UNAVAILABLE', `Vercel projects error: HTTP ${res.status}`);
      }

      const data = await res.json();
      const projects = data.projects || [];

      return projects.map((p: any) => ({
        id: p.id,
        name: p.name,
        framework: p.framework || null,
        nodeVersion: p.nodeVersion,
        latestDeployments: (p.latestDeployments || []).slice(0, 3).map((d: any) => ({
          id: d.id,
          url: d.url ? `https://${d.url}` : '',
          readyState: d.readyState || 'READY',
          createdAt: d.createdAt,
        })),
        link: p.link
          ? {
              type: p.link.type || 'github',
              repo: p.link.repo || p.link.orgAndRepo || p.name,
              org: p.link.org,
            }
          : undefined,
        updatedAt: p.updatedAt,
        createdAt: p.createdAt,
      }));
    } catch (err: any) {
      if (err instanceof ConnectorError) throw err;
      throw new ConnectorError('PROVIDER_UNAVAILABLE', `Failed to fetch Vercel projects: ${err.message}`);
    }
  }

  public async createDeployment(
    accessToken: string,
    params: {
      projectId: string;
      projectName: string;
      target?: 'production' | 'preview';
      gitSource?: {
        type: 'github';
        repo: string;
        ref: string;
        sha?: string;
      };
    }
  ): Promise<VercelDeploymentResponse> {
    const token = accessToken || VERCEL_ACCESS_TOKEN;
    if (!token) {
      throw new ConnectorError('TOKEN_EXPIRED', 'Vercel access token is missing.');
    }

    try {
      const target = params.target || 'production';

      const payload: Record<string, any> = {
        name: params.projectName,
        project: params.projectId,
        target: target === 'production' ? 'production' : undefined,
      };

      if (params.gitSource) {
        payload.gitSource = {
          type: params.gitSource.type || 'github',
          repo: params.gitSource.repo,
          ref: params.gitSource.ref || 'main',
          sha: params.gitSource.sha,
        };
      }

      const res = await fetch('https://api.vercel.com/v13/deployments', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new ConnectorError(
          'PROVIDER_UNAVAILABLE',
          errJson.error?.message || `Vercel deployment failed: HTTP ${res.status}`
        );
      }

      const data = await res.json();
      return {
        id: data.id,
        url: data.url ? (data.url.startsWith('http') ? data.url : `https://${data.url}`) : '',
        name: data.name || params.projectName,
        status: data.readyState === 'READY' ? 'READY' : 'BUILDING',
        readyState: data.readyState || 'INITIALIZING',
        inspectorUrl: data.inspectorUrl,
        target,
        createdAt: data.createdAt || Date.now(),
        buildingAt: data.buildingAt,
      };
    } catch (err: any) {
      if (err instanceof ConnectorError) throw err;
      throw new ConnectorError('PROVIDER_UNAVAILABLE', `Vercel deployment error: ${err.message}`);
    }
  }

  public async getDeploymentStatus(
    accessToken: string,
    deploymentId: string
  ): Promise<VercelDeploymentResponse> {
    const token = accessToken || VERCEL_ACCESS_TOKEN;
    if (!token) {
      throw new ConnectorError('TOKEN_EXPIRED', 'Vercel access token is missing.');
    }

    try {
      const res = await fetch(`https://api.vercel.com/v13/deployments/${deploymentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new ConnectorError('PROVIDER_UNAVAILABLE', `Vercel status check error: HTTP ${res.status}`);
      }

      const data = await res.json();
      const readyState = data.readyState || data.status;

      let mappedStatus: VercelDeploymentResponse['status'] = 'BUILDING';
      if (readyState === 'READY') mappedStatus = 'READY';
      else if (readyState === 'ERROR' || readyState === 'CANCELED') mappedStatus = 'ERROR';
      else if (readyState === 'QUEUED' || readyState === 'INITIALIZING') mappedStatus = 'QUEUED';

      return {
        id: data.id,
        url: data.url ? (data.url.startsWith('http') ? data.url : `https://${data.url}`) : '',
        name: data.name,
        status: mappedStatus,
        readyState,
        inspectorUrl: data.inspectorUrl,
        target: data.target || 'production',
        createdAt: data.createdAt,
        ready: data.ready,
      };
    } catch (err: any) {
      if (err instanceof ConnectorError) throw err;
      throw new ConnectorError('PROVIDER_UNAVAILABLE', `Failed to fetch Vercel status: ${err.message}`);
    }
  }

  public async executeCapability(capabilityId: string, accessToken: string, params?: Record<string, any>): Promise<any> {
    switch (capabilityId) {
      case 'vercel.projects.read':
        return await this.fetchProjects(accessToken);
      case 'vercel.deployments.create':
        if (!params?.projectName && !params?.projectId) {
          throw new ConnectorError('PERMISSION_DENIED', 'Missing required target projectName/projectId for deployment.');
        }
        return await this.createDeployment(accessToken, params as any);
      case 'vercel.deployments.read':
        if (!params?.deploymentId) {
          throw new ConnectorError('PERMISSION_DENIED', 'Missing deploymentId parameter.');
        }
        return await this.getDeploymentStatus(accessToken, params.deploymentId);
      default:
        throw new ConnectorError('PERMISSION_DENIED', `Capability '${capabilityId}' not supported by Vercel adapter.`);
    }
  }
}

export const vercelAdapter = new VercelAdapter();
