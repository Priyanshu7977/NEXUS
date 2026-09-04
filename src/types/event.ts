export type ExternalEventStatus =
  | 'RECEIVED'
  | 'PROCESSING'
  | 'PROCESSED'
  | 'FAILED'
  | 'IGNORED';

export interface ExternalEvent {
  id: string;
  workspace_id: string;
  provider: 'github' | 'vercel' | 'webhook';
  event_type: string;
  external_event_id: string;
  payload: Record<string, any>;
  received_at: string;
  processed_at: string | null;
  status: ExternalEventStatus;
  error: string | null;
  created_at: string;
}

export interface NormalizedGitHubPushEvent {
  event: 'github.push';
  delivery_id: string;
  repository: {
    id: number;
    name: string;
    full_name: string;
    owner: string;
    html_url: string;
    default_branch: string;
  };
  ref: string;
  branch: string;
  commit: {
    sha: string;
    message: string;
    author: {
      name: string;
      email: string;
      username?: string;
    };
    added: string[];
    removed: string[];
    modified: string[];
    timestamp: string;
    url: string;
  };
  sender: {
    login: string;
    id: number;
    avatar_url: string;
  };
}

export interface WebhookVerificationResult {
  isValid: boolean;
  error?: string;
}

export interface WebhookSubscription {
  event_type: 'push' | 'pull_request' | 'release';
  active: boolean;
  status: 'active' | 'coming_soon';
}
