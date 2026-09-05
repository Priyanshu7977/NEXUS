// ====================================================================
// NEXUS DEVELOPER SDK — CUSTOM TOOL DEFINITION FOUNDATION
// ====================================================================

export interface ToolParameterProperty {
  type: string;
  description?: string;
  enum?: string[];
  default?: any;
}

export interface ToolParametersSchema {
  type: 'object';
  properties: Record<string, ToolParameterProperty>;
  required?: string[];
}

export interface ToolExecutionContext {
  workspaceId?: string;
  executionId?: string;
  agentId?: string;
  secrets?: Record<string, string>;
}

export interface ToolDefinition<TArgs = any, TResult = any> {
  name: string;
  description: string;
  parameters: ToolParametersSchema;
  handler: (args: TArgs, context?: ToolExecutionContext) => Promise<TResult> | TResult;
  requiresApproval?: boolean;
  permissionLevel?: 'read' | 'write' | 'admin';
}

/**
 * Declares and validates a custom Tool definition for NEXUS agents and workflows.
 */
export function defineTool<TArgs = any, TResult = any>(
  definition: ToolDefinition<TArgs, TResult>
): ToolDefinition<TArgs, TResult> {
  if (!definition.name || !definition.name.trim()) {
    throw new Error('Tool definition requires a valid "name".');
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(definition.name)) {
    throw new Error(`Invalid tool name "${definition.name}". Tool names must be alphanumeric and may include hyphens or underscores.`);
  }
  if (!definition.description || !definition.description.trim()) {
    throw new Error('Tool definition requires a valid "description".');
  }
  if (!definition.handler || typeof definition.handler !== 'function') {
    throw new Error('Tool definition requires an executable "handler" function.');
  }

  return {
    ...definition,
    parameters: definition.parameters || { type: 'object', properties: {} },
    requiresApproval: Boolean(definition.requiresApproval),
    permissionLevel: definition.permissionLevel || 'read',
  };
}
