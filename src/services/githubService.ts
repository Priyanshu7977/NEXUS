import { GitHubUser, OAuthStatePayload, RepositoryItem } from '../types/connector';

// Environment variables for GitHub OAuth
const GITHUB_CLIENT_ID: string =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GITHUB_CLIENT_ID) || '';

const GITHUB_CLIENT_SECRET: string =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GITHUB_CLIENT_SECRET) || '';

// Default scopes required for reading repos and profile
export const GITHUB_DEFAULT_SCOPES = ['read:user', 'repo'];

/**
 * Checks whether GitHub OAuth credentials are configured in the environment
 */
export const isGitHubConfigured = (): boolean => {
  return Boolean(
    GITHUB_CLIENT_ID &&
    !GITHUB_CLIENT_ID.includes('your_github_client_id') &&
    GITHUB_CLIENT_ID.trim().length > 0
  );
};

/**
 * Returns current GitHub client ID for configuration inspection
 */
export const getGitHubClientId = (): string => {
  return GITHUB_CLIENT_ID;
};

/**
 * Returns the OAuth redirect URI for GitHub
 */
export const getGitHubRedirectUri = (): string => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/app/connectors/callback/github`;
  }
  return 'http://localhost:5180/app/connectors/callback/github';
};

/**
 * Generates a cryptographically secure OAuth authorization URL for GitHub
 */
export const getGitHubAuthUrl = (workspaceId: string, returnUrl = '/app/connectors'): string => {
  if (!isGitHubConfigured()) {
    throw new Error('GitHub Client ID is not configured in environment variables');
  }

  // Create cryptographic nonce for CSRF defense
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

  // Store in sessionStorage with 15-minute expiration
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('nexus_oauth_github_state', stateString);
    sessionStorage.setItem('nexus_oauth_github_state_created', String(Date.now()));
  }

  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: getGitHubRedirectUri(),
    scope: GITHUB_DEFAULT_SCOPES.join(' '),
    state: stateString,
    allow_signup: 'true',
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
};

/**
 * Validates the returned OAuth state parameter against the session store
 */
export const validateGitHubOAuthState = (stateParam: string): { valid: boolean; payload?: OAuthStatePayload; error?: string } => {
  if (!stateParam) {
    return { valid: false, error: 'Missing OAuth state parameter' };
  }

  if (typeof window === 'undefined') {
    return { valid: false, error: 'Cannot validate state in non-browser context' };
  }

  const storedState = sessionStorage.getItem('nexus_oauth_github_state');
  const storedCreatedStr = sessionStorage.getItem('nexus_oauth_github_state_created');

  if (!storedState) {
    return { valid: false, error: 'No active OAuth session found in browser. The authorization may have timed out.' };
  }

  if (storedState !== stateParam) {
    return { valid: false, error: 'OAuth state mismatch (possible CSRF attempt)' };
  }

  // Check 15-minute expiration
  const createdTime = Number(storedCreatedStr || 0);
  const now = Date.now();
  if (now - createdTime > 15 * 60 * 1000) {
    return { valid: false, error: 'OAuth session has expired. Please try connecting again.' };
  }

  try {
    const payload = JSON.parse(atob(stateParam)) as OAuthStatePayload;
    return { valid: true, payload };
  } catch {
    return { valid: false, error: 'Corrupt OAuth state payload' };
  } finally {
    // Clean up state after consumption
    sessionStorage.removeItem('nexus_oauth_github_state');
    sessionStorage.removeItem('nexus_oauth_github_state_created');
  }
};

/**
 * Exchanges the temporary authorization code for a GitHub access token
 */
export const exchangeGitHubCodeForToken = async (
  code: string
): Promise<{ accessToken: string; tokenType: string; scopes: string[] }> => {
  if (!code) {
    throw new Error('Authorization code is required');
  }

  // 1. Attempt token exchange using client secret if present
  if (GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET) {
    try {
      // Direct POST or via proxy
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
          redirect_uri: getGitHubRedirectUri(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error_description || data.error);
        }
        if (data.access_token) {
          const scopes = data.scope ? data.scope.split(',').map((s: string) => s.trim()) : GITHUB_DEFAULT_SCOPES;
          return {
            accessToken: data.access_token,
            tokenType: data.token_type || 'bearer',
            scopes,
          };
        }
      }
    } catch (directErr) {
      console.warn('[NEXUS GitHub] Direct token exchange failed, attempting fallback resolution:', directErr);
    }
  }

  // If we reach here and cannot exchange directly due to browser CORS on github.com,
  // we provide a clear error message instructing how to configure token proxy or secret.
  throw new Error(
    'GitHub token exchange requires VITE_GITHUB_CLIENT_SECRET or a backend OAuth handler. Please check your .env configuration.'
  );
};

/**
 * Fetches the authenticated GitHub user profile
 */
export const fetchGitHubUser = async (accessToken: string): Promise<GitHubUser> => {
  if (!accessToken) {
    throw new Error('Access token is required');
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
      throw new Error('GitHub token expired or revoked. Re-authentication required.');
    }
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.message || `GitHub API error: HTTP ${response.status}`);
  }

  const user = await response.json();
  return {
    id: user.id,
    login: user.login,
    name: user.name || user.login,
    avatar_url: user.avatar_url,
    html_url: user.html_url,
    bio: user.bio,
    public_repos: user.public_repos ?? 0,
    total_private_repos: user.total_private_repos ?? 0,
    followers: user.followers ?? 0,
    following: user.following ?? 0,
    created_at: user.created_at,
    updated_at: user.updated_at,
    email: user.email,
  };
};

/**
 * Fetches repositories accessible to the authenticated GitHub user
 */
export const fetchGitHubRepositories = async (
  accessToken: string,
  page = 1,
  perPage = 100
): Promise<RepositoryItem[]> => {
  if (!accessToken) {
    throw new Error('Access token is required');
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

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('GitHub session has expired. Please reconnect your account.');
    }
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.message || `Failed to fetch repositories: HTTP ${response.status}`);
  }

  const repos = await response.json();

  return repos.map((repo: any): RepositoryItem => ({
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
};
