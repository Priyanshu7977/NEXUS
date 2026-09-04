import { ITool } from './types';
import { GITHUB_TOOLS } from './githubTools';
import { VERCEL_TOOLS } from './vercelTools';
import { McpServerConfig } from '../../types/mcp';
import { createMcpRuntimeTool } from './mcpToolAdapter';

class ToolRegistry {
  private tools: Map<string, ITool> = new Map();

  constructor() {
    this.registerAll(GITHUB_TOOLS);
    this.registerAll(VERCEL_TOOLS);
  }

  public register(tool: ITool): void {
    this.tools.set(tool.id, tool);
    this.tools.set(tool.name, tool);
  }

  public registerAll(tools: ITool[]): void {
    for (const tool of tools) {
      this.register(tool);
    }
  }

  public registerMcpServer(server: McpServerConfig): void {
    for (const tool of server.capabilities || []) {
      const runtimeTool = createMcpRuntimeTool(server, tool);
      this.register(runtimeTool);
    }
  }

  public getTool(nameOrId: string): ITool | null {
    const existing = this.tools.get(nameOrId);
    if (existing) return existing;

    // Check normalized variations
    const normalized = nameOrId.replace(/\./g, '_');
    const dotNormalized = nameOrId.replace(/_/g, '.');
    return this.tools.get(normalized) || this.tools.get(dotNormalized) || null;
  }

  public getAllTools(): ITool[] {
    const unique = new Set<ITool>(this.tools.values());
    return Array.from(unique);
  }

  /**
   * Filters and returns only the tools that are:
   * 1. Implemented in the runtime
   * 2. Connected in the workspace (connectorId is active)
   * 3. Permitted to the agent (requiredCapability is granted)
   */
  public getAuthorizedToolsForAgent(
    grantedCapabilities: string[],
    activeConnectorIds: string[],
    mcpServers?: McpServerConfig[]
  ): ITool[] {
    if (mcpServers) {
      for (const s of mcpServers) {
        if (s.status === 'connected') {
          this.registerMcpServer(s);
        }
      }
    }

    const all = this.getAllTools();
    const activeConnectorSet = new Set(activeConnectorIds.map((c) => c.toLowerCase()));
    const grantedCapabilitySet = new Set(grantedCapabilities.map((c) => c.toLowerCase()));

    return all.filter((tool) => {
      const connectorIsActive =
        activeConnectorSet.has(tool.connectorId.toLowerCase()) ||
        tool.connectorId.startsWith('mcp:');
      const capabilityIsGranted =
        grantedCapabilitySet.has(tool.requiredCapability.toLowerCase()) ||
        grantedCapabilitySet.has(tool.id.toLowerCase()) ||
        grantedCapabilitySet.has('*') ||
        tool.requiredCapability.startsWith('mcp.');
      return connectorIsActive && capabilityIsGranted;
    });
  }
}

export const toolRegistry = new ToolRegistry();

