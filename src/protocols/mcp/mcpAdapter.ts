import { McpToolDefinition, McpToolInputSchema } from '../../types/mcp';
import { NormalizedProtocolResult } from '../../types/protocol';

const HIGH_RISK_PATTERNS = [
  { pattern: /\b(shell|terminal|bash|powershell|cmd|run_command|execute_shell|exec_command)\b/i, reason: 'Direct system or shell command execution privilege' },
  { pattern: /(?:^|_)(exec|shell|bash|cmd|eval)(?:_|$)/i, reason: 'Direct system or shell command execution privilege' },
  { pattern: /\b(delete_file|drop_table|truncate_table|destroy_resource|wipe_disk|purge_database)\b/i, reason: 'Destructive data deletion capability' },
  { pattern: /(?:^|_)(delete|drop|truncate|destroy|rm|wipe)(?:_|$)/i, reason: 'Destructive data deletion or file removal capability' },
  { pattern: /\b(file_write|write_file|overwrite_file|fs_write)\b/i, reason: 'Unrestricted filesystem write or overwrite privilege' },
  { pattern: /\b(code_exec|execute_script|python_eval|eval_code|raw_query)\b/i, reason: 'Arbitrary dynamic code evaluation capability' },
];

/**
 * Evaluates whether an MCP tool presents high operational risk (destructive or shell execution).
 */
export const isHighRiskMcpTool = (
  tool: McpToolDefinition
): { isHighRisk: boolean; riskReason?: string } => {
  const name = tool.name || '';
  const desc = tool.description || '';

  for (const { pattern, reason } of HIGH_RISK_PATTERNS) {
    if (pattern.test(name) || pattern.test(desc)) {
      return {
        isHighRisk: true,
        riskReason: reason,
      };
    }
  }

  return { isHighRisk: false };
};

/**
 * Validates tool call arguments against MCP JSON schema.
 */
export const validateMcpToolArguments = (
  schema: McpToolInputSchema,
  args: Record<string, any>
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!schema || typeof schema !== 'object') {
    return { valid: true, errors: [] };
  }

  // Check required properties
  if (Array.isArray(schema.required)) {
    for (const req of schema.required) {
      if (args[req] === undefined || args[req] === null || args[req] === '') {
        errors.push(`Missing required parameter: "${req}"`);
      }
    }
  }

  // Check types if defined
  if (schema.properties && typeof schema.properties === 'object') {
    for (const [key, propDef] of Object.entries(schema.properties)) {
      const val = args[key];
      if (val !== undefined && val !== null && propDef.type) {
        if (propDef.type === 'string' && typeof val !== 'string') {
          errors.push(`Parameter "${key}" must be a string, got ${typeof val}`);
        } else if (propDef.type === 'number' && typeof val !== 'number') {
          errors.push(`Parameter "${key}" must be a number, got ${typeof val}`);
        } else if (propDef.type === 'boolean' && typeof val !== 'boolean') {
          errors.push(`Parameter "${key}" must be a boolean, got ${typeof val}`);
        } else if (propDef.type === 'array' && !Array.isArray(val)) {
          errors.push(`Parameter "${key}" must be an array`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Normalizes tool raw results into universal NEXUS format.
 */
export const normalizeMcpToolResult = (
  serverSlug: string,
  toolName: string,
  rawResult: any,
  latencyMs: number
): NormalizedProtocolResult => {
  let parsedData: any = rawResult;

  if (rawResult?.content && Array.isArray(rawResult.content)) {
    const textBlocks = rawResult.content
      .filter((c: any) => c.type === 'text' && c.text)
      .map((c: any) => c.text);

    if (textBlocks.length === 1) {
      try {
        parsedData = JSON.parse(textBlocks[0]);
      } catch {
        parsedData = textBlocks[0];
      }
    } else if (textBlocks.length > 1) {
      parsedData = textBlocks.join('\n\n');
    }
  }

  return {
    status: rawResult?.isError ? 'error' : 'success',
    source: 'mcp',
    provider: `mcp:${serverSlug}`,
    capability: `mcp.${serverSlug}.${toolName}`,
    data: parsedData,
    latency_ms: latencyMs,
    timestamp: new Date().toISOString(),
  };
};
