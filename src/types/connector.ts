import { BrandName } from '../components/brand/BrandLogo';

export type ConnectorCategory =
  | 'Development'
  | 'AI'
  | 'Data'
  | 'CMS'
  | 'Communication'
  | 'Analytics';

export type ConnectorStatus =
  | 'available'
  | 'coming_soon'
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'reauth_required';

export type ConnectorAuthType = 'oauth2' | 'api_key' | 'service_account';

export type ConnectorErrorCode =
  | 'CONNECTOR_NOT_CONNECTED'
  | 'AUTHORIZATION_FAILED'
  | 'OAUTH_STATE_INVALID'
  | 'TOKEN_EXPIRED'
  | 'PERMISSION_DENIED'
  | 'PROVIDER_UNAVAILABLE'
  | 'RATE_LIMITED'
  | 'UNKNOWN_ERROR';

export interface ConnectorCapability {
  id: string; // e.g. 'github.profile.read', 'github.repositories.read'
  name: string;
  description: string;
  status: 'active' | 'planned' | 'restricted';
}

export interface ConnectorDefinition {
  id: string;
  name: string;
  slug: string;
  brand: BrandName;
  category: ConnectorCategory;
  description: string;
  status: ConnectorStatus;
  authType: ConnectorAuthType;
  requiredScopes: string[];
  capabilities: ConnectorCapability[];
  docsUrl?: string;
  authConfig?: {
    authorizationUrl?: string;
    tokenUrl?: string;
    clientIdEnvKey?: string;
    clientSecretEnvKey?: string;
    defaultScopes?: string[];
  };
}

export interface RepositoryItem {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  private: boolean;
  html_url: string;
  description: string | null;
  fork: boolean;
  url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  git_url: string;
  ssh_url: string;
  clone_url: string;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
  topics?: string[];
  visibility?: 'public' | 'private' | 'internal';
}

export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  public_repos: number;
  total_private_repos?: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  email?: string | null;
}

export interface OAuthStatePayload {
  workspaceId: string;
  connectorId: string;
  timestamp: number;
  nonce: string;
  returnUrl?: string;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetAt: Date;
}
