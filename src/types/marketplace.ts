export type MarketplaceResourceType = 
  | 'AGENT' 
  | 'CONNECTOR' 
  | 'MCP_SERVER' 
  | 'EXTERNAL_AGENT' 
  | 'WORKFLOW';

export type MarketplaceVisibility = 'PUBLIC' | 'UNLISTED' | 'PRIVATE';

export type PublisherType = 'INDIVIDUAL' | 'ORGANIZATION' | 'OFFICIAL_NEXUS';

export type VerificationStatus = 'OFFICIAL' | 'VERIFIED' | 'COMMUNITY' | 'UNVERIFIED';

export type InstallationStatus = 'INSTALLED' | 'UPDATE_AVAILABLE' | 'DISABLED' | 'UNINSTALLED';

export type ReportCategory = 
  | 'SECURITY_VULNERABILITY' 
  | 'EXPOSED_SECRETS' 
  | 'MALICIOUS_BEHAVIOR' 
  | 'BROKEN_FUNCTIONALITY' 
  | 'MISLEADING_METADATA' 
  | 'POLICY_VIOLATION' 
  | 'OTHER';

export type ReportStatus = 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';

export interface Publisher {
  id: string;
  workspace_id: string;
  name: string;
  slug: string;
  description: string | null;
  publisher_type: PublisherType;
  website_url: string | null;
  support_email: string | null;
  github_handle: string | null;
  avatar_url: string | null;
  verified: boolean;
  verification_badge: VerificationStatus;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceResource {
  id: string;
  workspace_id: string;
  publisher_id: string;
  publisher?: Publisher;
  type: MarketplaceResourceType;
  name: string;
  slug: string;
  summary: string;
  description: string;
  icon_url: string | null;
  banner_url: string | null;
  version: string;
  latest_version?: string;
  visibility: MarketplaceVisibility;
  is_verified: boolean;
  verification_status: VerificationStatus;
  spec: Record<string, any>;
  required_connectors: string[];
  required_capabilities: string[];
  tags: string[];
  categories: string[];
  install_count: number;
  view_count: number;
  documentation_url: string | null;
  repository_url: string | null;
  license: string;
  is_deprecated: boolean;
  deprecation_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceInstallation {
  id: string;
  workspace_id: string;
  resource_id: string;
  resource?: MarketplaceResource;
  installed_version: string;
  installed_resource_id: string | null;
  status: InstallationStatus;
  granted_permissions: string[];
  configuration: Record<string, any>;
  installed_by: string;
  installed_at: string;
  updated_at: string;
}

export interface MarketplaceReport {
  id: string;
  resource_id: string;
  reporter_workspace_id: string;
  reporter_user_id: string;
  category: ReportCategory;
  details: string;
  status: ReportStatus;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceReview {
  id: string;
  resource_id: string;
  workspace_id: string;
  user_id: string;
  rating: number;
  review_title: string | null;
  review_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceSearchFilters {
  query?: string;
  types?: MarketplaceResourceType[];
  categories?: string[];
  tags?: string[];
  verificationStatuses?: VerificationStatus[];
  visibility?: MarketplaceVisibility[];
  publisherId?: string;
  workspaceId?: string;
  sortBy?: 'popular' | 'recent' | 'name' | 'trending';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface DependencyCheckItem {
  id: string;
  name: string;
  type: 'connector' | 'capability' | 'env_var';
  satisfied: boolean;
  description?: string;
}

export interface DependencyCheckResult {
  satisfied: boolean;
  items: DependencyCheckItem[];
  missingConnectors: string[];
  missingCapabilities: string[];
  requiredEnvVars: string[];
}

export interface PublishResourceInput {
  workspaceId: string;
  type: MarketplaceResourceType;
  name: string;
  slug: string;
  summary: string;
  description: string;
  iconUrl?: string | null;
  bannerUrl?: string | null;
  version: string;
  visibility: MarketplaceVisibility;
  spec: Record<string, any>;
  sourceResourceId?: string;
  requiredConnectors?: string[];
  requiredCapabilities?: string[];
  tags?: string[];
  categories?: string[];
  license?: string;
  documentationUrl?: string | null;
  repositoryUrl?: string | null;
}

export interface InstallResourceInput {
  workspaceId: string;
  resourceId: string;
  customName?: string;
  targetEnvironment?: string;
  configuration?: Record<string, any>;
  grantedPermissions?: string[];
}

export interface SecretScanViolation {
  rule: string;
  path: string;
  maskedPreview: string;
  description: string;
}

export interface SecretScanResult {
  hasSecrets: boolean;
  violations: SecretScanViolation[];
}
