import { ITool, ToolExecutionContext } from './types';
import { githubAdapter } from '../../connectors/adapters/githubAdapter';
import { getDecryptedAccessToken } from '../../services/connectorService';

export const githubListRepositoriesTool: ITool = {
  id: 'github_list_repositories',
  name: 'github_list_repositories',
  description:
    'Retrieves repositories accessible to the connected GitHub account. Returns repository names, descriptions, privacy status, primary language, star counts, and default branches.',
  connectorId: 'github',
  requiredCapability: 'github.repositories.read',
  inputSchema: {
    type: 'object',
    properties: {
      limit: {
        type: 'number',
        description: 'Maximum number of repositories to return (default 30, maximum 100)',
      },
    },
  },
  async execute(args: Record<string, any>, context: ToolExecutionContext): Promise<any> {
    const githubConn = context.connections.find(
      (c) => c.connector_id === 'github' && c.status === 'connected'
    );

    if (!githubConn) {
      return {
        error: 'GitHub connector is not connected for this workspace. Please connect GitHub in Connectors settings.',
      };
    }

    const token = await getDecryptedAccessToken(githubConn);
    if (!token) {
      return {
        error: 'Could not decrypt GitHub access token. Re-authentication may be required.',
      };
    }

    const limit = Math.min(Math.max(Number(args.limit) || 30, 1), 100);
    const { repositories, rateLimit } = await githubAdapter.fetchRepositories(token, 1, limit);

    // Sanitize and return concise summary to save LLM context window
    const sanitized = repositories.slice(0, limit).map((repo) => ({
      name: repo.name,
      full_name: repo.full_name,
      private: repo.private,
      description: repo.description || 'No description provided',
      language: repo.language || 'Unknown',
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      open_issues: repo.open_issues_count,
      default_branch: repo.default_branch,
      html_url: repo.html_url,
      updated_at: repo.updated_at,
    }));

    return {
      account: githubConn.provider_account_name,
      total_found: sanitized.length,
      rate_limit_remaining: rateLimit?.remaining,
      repositories: sanitized,
    };
  },
};

export const githubGetUserProfileTool: ITool = {
  id: 'github_get_user_profile',
  name: 'github_get_user_profile',
  description:
    'Retrieves the public profile metadata and statistics of the authenticated GitHub account.',
  connectorId: 'github',
  requiredCapability: 'github.profile.read',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  async execute(_args: Record<string, any>, context: ToolExecutionContext): Promise<any> {
    const githubConn = context.connections.find(
      (c) => c.connector_id === 'github' && c.status === 'connected'
    );

    if (!githubConn) {
      return {
        error: 'GitHub connector is not connected for this workspace.',
      };
    }

    const token = await getDecryptedAccessToken(githubConn);
    if (!token) {
      return {
        error: 'Could not decrypt GitHub access token.',
      };
    }

    const profile = await githubAdapter.fetchAccountProfile(token);
    return {
      username: profile.username,
      name: profile.name,
      avatar_url: profile.avatarUrl,
      email: profile.email,
      public_repos: profile.metadata?.public_repos,
      followers: profile.metadata?.followers,
      following: profile.metadata?.following,
      bio: profile.metadata?.bio,
    };
  },
};

export const GITHUB_TOOLS: ITool[] = [
  githubListRepositoriesTool,
  githubGetUserProfileTool,
];
