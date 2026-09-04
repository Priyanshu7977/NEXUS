import { ConnectorConnection } from '../../types/database';

export interface ToolExecutionContext {
  workspaceId: string;
  agentId: string;
  connections: ConnectorConnection[];
}

export interface ITool {
  id: string;
  name: string;
  description: string;
  connectorId: string;
  requiredCapability: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  execute(args: Record<string, any>, context: ToolExecutionContext): Promise<any>;
}
