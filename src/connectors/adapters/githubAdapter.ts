import { IConnectorAdapter, ConnectorError } from './baseAdapter';
import { ConnectorDefinition, GitHubUser, OAuthStatePayload, RateLimitInfo, RepositoryItem } from '../../types/connector';

const GITHUB_CLIENT_ID: string =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GITHUB_CLIENT_ID) || '';

const GITHUB_CLIENT_SECRET: string =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GITHUB_CLIENT_SECRET) || '';

export const GITHUB_DEFINITION: ConnectorDefinition = {
  id: 'github',
  name: 'GitHub',
  slug: 'github',
  brand: 'github',
  category: 'Development',
  description: 'Connect your GitHub account to let workspace agents read repositories, inspect code trees, and monitor commit history.',
  status: 'available',
  authType: 'oauth2',
  requiredScopes: ['read:user', 'repo'],
  docsUrl: 'https://docs.github.com/en/apps/oauth-apps',
  authConfig: {
    authorizationUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    clientIdEnvKey: 'VITE_GITHUB_CLIENT_ID',
    clientSecretEnvKey: 'VITE_GITHUB_CLIENT_SECRET',
    defaultScopes: ['read:user', 'repo']
  },
  capabilities: [
    {
      id: 'github.profile.read',
      name: 'Read GitHub Profile',
      description: 'Access account username, avatar, email, and public profile metrics.',
      status: 'active'
    },
    {
      id: 'github.repositories.read',
      name: 'List Repositories & Metadata',
      description: 'List public and private repositories, branches, languages, and star counts.',
      status: 'active'
    },
    {
      id: 'github.repositories.write',
      name: 'Commit & Branch Management',
      description: 'Create branches, push commits, and propose code patches.',
      status: 'planned'
    },
    {
      id: 'github.pull_requests.read',
      name: 'Inspect Pull Requests',
      description: 'Analyze pull request diffs, commits, and discussion comments.',
      status: 'planned'
    },
    {
      id: 'github.pull_requests.write',
      name: 'Automated PR Reviews',
      description: 'Submit automated pull request review comments and suggestions.',
      status: 'planned'
    }
  ]
};

export class GitHubAdapter implements IConnectorAdapter {
  public definition = GITHUB_DEFINITION;

  public isConfigured(): boolean {
    return Boolean(
      GITHUB_CLIENT_ID &&
      !GITHUB_CLIENT_ID.includes('your_github_client_id') &&
      GITHUB_CLIENT_ID.trim().length > 0
    );
  }

  public getRedirectUri(): string {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/app/connectors/callback/github`;
    }
    return 'http://localhost:5180/app/connectors/callback/github';
  }

  public getAuthorizationUrl(workspaceId: string, returnUrl = '/app/connectors/github'): string {
    if (!this.isConfigured()) {
      throw new ConnectorError(
        'AUTHORIZATION_FAILED',
        'GitHub Client ID is not configured. Please set VITE_GITHUB_CLIENT_ID in your environment variables.'
      );
    }

    // 16-byte cryptographic nonce for CSRF defense
    const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const statePayload: OAuthStatePayload = {
      workspaceId,
      connectorId: 'github',
      timestamp: Date.now(),
      nonce,
      returnUrl,
    };

    const stateString = btoa(JSON.stringify(statePayload));

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('nexus_oauth_github_state', stateString);
      sessionStorage.setItem('nexus_oauth_github_state_created', String(Date.now()));
    }

    const params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      redirect_uri: this.getRedirectUri(),
      scope: this.definition.requiredScopes.join(' '),
      state: stateString,
      allow_signup: 'true',
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  public validateOAuthState(stateParam: string): { valid: boolean; payload?: OAuthStatePayload; error?: string } {
    if (!stateParam) {
      return { valid: false, error: 'Missing OAuth state parameter' };
    }

    if (typeof window === 'undefined') {
      return { valid: false, error: 'Cannot validate state outside browser environment' };
    }

    const storedState = sessionStorage.getItem('nexus_oauth_github_state');
    const storedCreatedStr = sessionStorage.getItem('nexus_oauth_github_state_created');

    if (!storedState) {
      return { valid: false, error: 'No active OAuth session found in browser. The session may have expired.' };
    }

    if (storedState !== stateParam) {
      return { valid: false, error: 'OAuth state parameter mismatch (potential CSRF attempt)' };
    }

    const createdTime = Number(storedCreatedStr || 0);
    if (Date.now() - createdTime > 15 * 60 * 1000) {
      return { valid: false, error: 'OAuth session has timed out (15 minutes). Please try connecting again.' };
    }

    try {
      const payload = JSON.parse(atob(stateParam)) as OAuthStatePayload;
      return { valid: true, payload };
    } catch {
      return { valid: false, error: 'Corrupt OAuth state payload' };
    } finally {
      sessionStorage.removeItem('nexus_oauth_github_state');
      sessionStorage.removeItem('nexus_oauth_github_state_created');
    }
  }

  public async exchangeCodeForToken(
    code: string
  ): Promise<{ accessToken: string; refreshToken?: string; tokenType: string; scopes: string[] }> {
    if (!code) {
      throw new ConnectorError('AUTHORIZATION_FAILED', 'Authorization code is required');
    }

    if (GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET) {
      try {
        const response = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            client_id: GITHUB_CLIENT_ID,
            client_secret: GITHUB_CLIENT_SECRET,
            code,
            redirect_uri: this.getRedirectUri(),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.error) {
            throw new ConnectorError('AUTHORIZATION_FAILED', data.error_description || data.error);
          }
          if (data.access_token) {
            const scopes = data.scope ? data.scope.split(',').map((s: string) => s.trim()) : this.definition.requiredScopes;
            return {
              accessToken: data.access_token,
              tokenType: data.token_type || 'bearer',
              scopes,
            };
          }
        }
      } catch (err: any) {
        if (err instanceof ConnectorError) throw err;
        console.warn('[NEXUS GitHubAdapter] Token exchange error:', err);
      }
    }

    throw new ConnectorError(
      'AUTHORIZATION_FAILED',
      'GitHub token exchange requires VITE_GITHUB_CLIENT_SECRET in .env or a backend OAuth handler.'
    );
  }

  public async fetchAccountProfile(
    accessToken: string
  ): Promise<{ id: string; name: string; username: string; avatarUrl?: string; email?: string; metadata?: Record<string, any> }> {
    if (!accessToken) {
      throw new ConnectorError('TOKEN_EXPIRED', 'Access token is required');
    }

    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new ConnectorError('TOKEN_EXPIRED', 'GitHub access token expired or revoked. Re-authentication required.');
      }
      if (response.status === 403) {
        throw new ConnectorError('RATE_LIMITED', 'GitHub API rate limit exceeded. Please try again shortly.');
      }
      const errBody = await response.json().catch(() => ({}));
      throw new ConnectorError('PROVIDER_UNAVAILABLE', errBody.message || `GitHub error: HTTP ${response.status}`);
    }

    const user = (await response.json()) as GitHubUser;
    return {
      id: String(user.id),
      username: user.login,
      name: user.name || user.login,
      avatarUrl: user.avatar_url,
      email: user.email || undefined,
      metadata: {
        html_url: user.html_url,
        bio: user.bio,
        public_repos: user.public_repos,
        followers: user.followers,
        following: user.following,
      }
    };
  }

  public async fetchRepositories(
    accessToken: string,
    page = 1,
    perPage = 100
  ): Promise<{ repositories: RepositoryItem[]; rateLimit?: RateLimitInfo }> {
    if (!accessToken) {
      throw new ConnectorError('TOKEN_EXPIRED', 'Access token is required');
    }

    const url = new URL('https://api.github.com/user/repos');
    url.searchParams.set('sort', 'updated');
    url.searchParams.set('direction', 'desc');
    url.searchParams.set('per_page', String(perPage));
    url.searchParams.set('page', String(page));
    url.searchParams.set('affiliation', 'owner,collaborator,organization_member');

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    // Extract rate limit headers
    const remaining = response.headers.get('x-ratelimit-remaining');
    const limit = response.headers.get('x-ratelimit-limit');
    const reset = response.headers.get('x-ratelimit-reset');

    let rateLimitInfo: RateLimitInfo | undefined;
    if (remaining && limit && reset) {
      rateLimitInfo = {
        limit: Number(limit),
        remaining: Number(remaining),
        resetAt: new Date(Number(reset) * 1000)
      };
    }

    if (!response.ok) {
      if (response.status === 401) {
        throw new ConnectorError('TOKEN_EXPIRED', 'GitHub session has expired. Please reconnect your account.');
      }
      if (response.status === 403 && remaining === '0') {
        throw new ConnectorError('RATE_LIMITED', 'GitHub API rate limit exceeded. Please wait until reset time.');
      }
      const errBody = await response.json().catch(() => ({}));
      throw new ConnectorError('PROVIDER_UNAVAILABLE', errBody.message || `Failed to fetch repositories: HTTP ${response.status}`);
    }

    const repos = await response.json();

    const normalized: RepositoryItem[] = repos.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      owner: {
        login: repo.owner?.login || 'unknown',
        avatar_url: repo.owner?.avatar_url || '',
        html_url: repo.owner?.html_url || '',
      },
      private: Boolean(repo.private),
      html_url: repo.html_url,
      description: repo.description,
      fork: Boolean(repo.fork),
      url: repo.url,
      created_at: repo.created_at,
      updated_at: repo.updated_at,
      pushed_at: repo.pushed_at,
      git_url: repo.git_url,
      ssh_url: repo.ssh_url,
      clone_url: repo.clone_url,
      homepage: repo.homepage,
      size: repo.size,
      stargazers_count: repo.stargazers_count ?? 0,
      watchers_count: repo.watchers_count ?? 0,
      language: repo.language,
      forks_count: repo.forks_count ?? 0,
      open_issues_count: repo.open_issues_count ?? 0,
      default_branch: repo.default_branch || 'main',
      topics: repo.topics || [],
      visibility: repo.visibility || (repo.private ? 'private' : 'public'),
    }));

    return { repositories: normalized, rateLimit: rateLimitInfo };
  }

  public async executeCapability(capabilityId: string, accessToken: string, params?: Record<string, any>): Promise<any> {
    switch (capabilityId) {
      case 'github.profile.read':
        return await this.fetchAccountProfile(accessToken);
      case 'github.repositories.read':
        return await this.fetchRepositories(accessToken, params?.page, params?.perPage);
      default:
        throw new ConnectorError('PERMISSION_DENIED', `Capability '${capabilityId}' is not yet executable in this phase.`);
    }
  }
}

export const githubAdapter = new GitHubAdapter();
