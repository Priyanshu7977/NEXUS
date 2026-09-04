import { ConnectorDefinition, ConnectorErrorCode } from '../../types/connector';

export class ConnectorError extends Error {
  public code: ConnectorErrorCode;
  public details?: any;

  constructor(code: ConnectorErrorCode, message: string, details?: any) {
    super(message);
    this.name = 'ConnectorError';
    this.code = code;
    this.details = details;
  }
}

export interface IConnectorAdapter {
  definition: ConnectorDefinition;
  
  // OAuth / Auth methods
  getAuthorizationUrl?(workspaceId: string, returnUrl?: string): string;
  validateOAuthState?(stateParam: string): { valid: boolean; payload?: any; error?: string };
  exchangeCodeForToken?(code: string): Promise<{ accessToken: string; refreshToken?: string; tokenType: string; scopes: string[] }>;
  
  // Profile & Validation
  fetchAccountProfile(accessToken: string): Promise<{ id: string; name: string; username: string; avatarUrl?: string; email?: string; metadata?: Record<string, any> }>;
  
  // Capability Execution
  executeCapability?(capabilityId: string, accessToken: string, params?: Record<string, any>): Promise<any>;
}
