// ====================================================================
// NEXUS DEVELOPER SDK — CUSTOM AGENT DEFINITION FOUNDATION
// ====================================================================

export interface AgentPermissions {
  allowWrite?: boolean;
  allowedConnectors?: string[];
  requireApproval?: string[];
}

export interface AgentDefinition {
  name: string;
  role: string;
  description: string;
  instructions: string;
  model?: string;
  tools?: string[];
  permissions?: AgentPermissions;
}

/**
 * Declares and validates a custom AI Agent definition for the NEXUS platform.
 */
export function defineAgent(definition: AgentDefinition): AgentDefinition {
  if (!definition.name || !definition.name.trim()) {
    throw new Error('Agent definition requires a valid "name".');
  }
  if (!definition.instructions || !definition.instructions.trim()) {
    throw new Error('Agent definition requires "instructions" (system prompt).');
  }

  return {
    ...definition,
    model: definition.model || 'gemini-1.5-flash',
    tools: definition.tools || [],
    permissions: definition.permissions || { allowWrite: false },
  };
}
