import { ITool, ToolExecutionContext } from './types';
import { McpServerConfig, McpToolDefinition } from '../../types/mcp';
import { McpClient } from '../../protocols/mcp/mcpClient';
import {
  validateMcpToolArguments,
  normalizeMcpToolResult,
} from '../../protocols/mcp/mcpAdapter';
import { getWorkspaceMcpServers } from '../../services/mcpService';

/**
 * Creates a runtime ITool for an MCP tool on a given MCP server.
 */
export const createMcpRuntimeTool = (
  server: McpServerConfig,
  tool: McpToolDefinition
): ITool => {
  const toolId = `mcp.${server.slug}.${tool.name}`;
  const toolName = `mcp_${server.slug}_${tool.name}`.replace(/[^a-zA-Z0-9_]/g, '_');

  return {
    id: toolId,
    name: toolName,
    description: `[MCP: ${server.name}] ${tool.description || tool.name}`,
    connectorId: `mcp:${server.slug}`,
    requiredCapability: toolId,
    inputSchema: (tool.inputSchema as any) || { type: 'object', properties: {} },
    execute: async (args: Record<string, any>, context: ToolExecutionContext): Promise<any> => {
      const startTime = Date.now();

      // 1. Verify workspace has this MCP server active and tool is enabled
      const { servers } = await getWorkspaceMcpServers(context.workspaceId);
      const activeServer = servers.find((s) => s.slug === server.slug || s.id === server.id);

      if (!activeServer) {
        throw new Error(
          `MCP Tool execution failed: Server "${server.name}" (${server.slug}) is not connected in workspace.`
        );
      }

      if (activeServer.status !== 'connected') {
        throw new Error(
          `MCP Tool execution failed: Server "${server.name}" status is "${activeServer.status}".`
        );
      }

      const isEnabled = (activeServer.enabled_tools || []).includes(tool.name);
      if (!isEnabled) {
        throw new Error(
          `MCP Tool execution blocked: Tool "${tool.name}" is disabled by workspace security policy.`
        );
      }

      // 2. Schema Validation
      const validation = validateMcpToolArguments(tool.inputSchema, args);
      if (!validation.valid) {
        throw new Error(`MCP Tool parameter validation failed: ${validation.errors.join(', ')}`);
      }

      // 3. Dispatch to MCP Client
      const client = new McpClient({
        serverUrl: activeServer.server_url,
        transportType: activeServer.transport_type,
        authType: activeServer.auth_type,
        headerName: activeServer.header_name || undefined,
        authToken: activeServer.auth_token || undefined,
        timeoutMs: 30000,
      });

      try {
        const rawResult = await client.callTool(tool.name, args);
        const duration = Date.now() - startTime;
        const normalized = normalizeMcpToolResult(server.slug, tool.name, rawResult, duration);
        return normalized.data;
      } catch (err: any) {
        throw new Error(`MCP Tool "${tool.name}" failed: ${err.message || 'Execution error'}`);
      }
    },
  };
};
