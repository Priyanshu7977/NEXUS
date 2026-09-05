// ====================================================================
// NEXUS DEVELOPER SDK — CUSTOM CONNECTOR DEFINITION FOUNDATION
// ====================================================================

export type ConnectorAuthType = 'bearer' | 'oauth2' | 'api_key' | 'basic' | 'custom';

export interface ConnectorAuthField {
  name: string;
  label: string;
  type: 'string' | 'password' | 'url' | 'number';
  required: boolean;
  description?: string;
  placeholder?: string;
}

export interface ConnectorAuthConfig {
  type: ConnectorAuthType;
  fields: ConnectorAuthField[];
  tokenEndpoint?: string;
  authorizationEndpoint?: string;
  scopes?: string[];
}

export interface ConnectorCapability<TParams = any, TResult = any> {
  name: string;
  description: string;
  requiresApproval?: boolean;
  handler: (credentials: Record<string, string>, params: TParams) => Promise<TResult> | TResult;
}

export interface ConnectorDefinition {
  id?: string;
  name: string;
  version: string;
  description: string;
  category?: string;
  icon?: string;
  auth: ConnectorAuthConfig;
  capabilities: ConnectorCapability[];
}

/**
 * Declares and validates a custom Connector definition for NEXUS.
 */
export function defineConnector(definition: ConnectorDefinition): ConnectorDefinition {
  if (!definition.name || !definition.name.trim()) {
    throw new Error('Connector definition requires a valid "name".');
  }
  if (!definition.version || !definition.version.trim()) {
    throw new Error('Connector definition requires a valid "version".');
  }
  if (!definition.auth || !definition.auth.type) {
    throw new Error('Connector definition requires an "auth" configuration with a valid type.');
  }
  if (!Array.isArray(definition.capabilities) || definition.capabilities.length === 0) {
    throw new Error('Connector definition must provide at least one capability.');
  }

  for (const cap of definition.capabilities) {
    if (!cap.name || !cap.name.trim()) {
      throw new Error(`Connector capability requires a valid "name".`);
    }
    if (typeof cap.handler !== 'function') {
      throw new Error(`Connector capability "${cap.name}" requires an executable "handler" function.`);
    }
  }

  return {
    ...definition,
    category: definition.category || 'Custom',
    capabilities: definition.capabilities.map((c) => ({
      ...c,
      requiresApproval: Boolean(c.requiresApproval),
    })),
  };
}
