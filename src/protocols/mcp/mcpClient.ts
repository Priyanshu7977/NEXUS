import {
  McpJsonRpcRequest,
  McpJsonRpcResponse,
  McpInitializeResult,
  McpToolsListResult,
  McpToolCallResult,
} from '../../types/mcp';
import { ProtocolAuthType } from '../../types/database';
import { ProtocolError } from '../../types/protocol';
import { assertSafeUrl } from '../../services/ssrfProtection';

export interface McpClientOptions {
  serverUrl: string;
  transportType?: 'sse' | 'streamable_http' | 'stdio' | 'websocket';
  authType?: ProtocolAuthType;
  headerName?: string;
  authToken?: string;
  timeoutMs?: number;
}

export class McpClient {
  private serverUrl: string;
  private transportType: string;
  private authType: ProtocolAuthType;
  private headerName: string;
  private authToken: string;
  private timeoutMs: number;
  private requestId: number = 1;

  constructor(options: McpClientOptions) {
    this.serverUrl = options.serverUrl.replace(/\/+$/, '');
    this.transportType = options.transportType || 'streamable_http';
    this.authType = options.authType || 'none';
    this.headerName = options.headerName || 'Authorization';
    this.authToken = options.authToken || '';
    this.timeoutMs = options.timeoutMs || 30000;
  }

  public getTransportType(): string {
    return this.transportType;
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (!this.authToken) return headers;

    if (this.authType === 'bearer') {
      headers['Authorization'] = this.authToken.startsWith('Bearer ')
        ? this.authToken
        : `Bearer ${this.authToken}`;
    } else if (this.authType === 'api_key' || this.authType === 'custom_header') {
      headers[this.headerName || 'X-API-Key'] = this.authToken;
    }

    return headers;
  }

  public async sendJsonRpc<T = any>(
    method: string,
    params?: Record<string, any>
  ): Promise<T> {
    const id = this.requestId++;
    const payload: McpJsonRpcRequest = {
      jsonrpc: '2.0',
      id,
      method,
      params,
    };

    // If serverUrl is demo/mock or localhost without backend, provide simulated responses
    if (this.isMockOrDemoServer(this.serverUrl)) {
      return this.handleMockJsonRpc<T>(method, params);
    }

    assertSafeUrl(this.serverUrl);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const endpoint = `${this.serverUrl}/jsonrpc`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`MCP Server responded with HTTP ${response.status}: ${response.statusText}`);
      }

      const json: McpJsonRpcResponse<T> = await response.json();

      if (json.error) {
        const error: ProtocolError = {
          code: 'SERVER_ERROR',
          message: json.error.message || 'MCP JSON-RPC execution error',
          details: json.error.data,
        };
        throw error;
      }

      return json.result as T;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw {
          code: 'TIMEOUT',
          message: `MCP Server request timed out after ${this.timeoutMs}ms.`,
        } as ProtocolError;
      }
      if (err.code) {
        throw err;
      }
      throw {
        code: 'CONNECTION_FAILED',
        message: err.message || 'Failed to connect to MCP Server endpoint.',
        details: err,
      } as ProtocolError;
    }
  }

  /**
   * Initializes session with the MCP server
   */
  public async initialize(): Promise<McpInitializeResult> {
    return this.sendJsonRpc<McpInitializeResult>('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {
        roots: { listChanged: true },
        sampling: {},
      },
      clientInfo: {
        name: 'nexus-orchestrator',
        version: '1.0.0',
      },
    });
  }

  /**
   * Lists available tools from the MCP server
   */
  public async listTools(): Promise<McpToolsListResult> {
    return this.sendJsonRpc<McpToolsListResult>('tools/list', {});
  }

  /**
   * Calls a specific tool on the MCP server
   */
  public async callTool(
    name: string,
    argumentsPayload: Record<string, any>
  ): Promise<McpToolCallResult> {
    return this.sendJsonRpc<McpToolCallResult>('tools/call', {
      name,
      arguments: argumentsPayload,
    });
  }

  /**
   * Pings the MCP server to verify health
   */
  public async ping(): Promise<{ healthy: boolean; latencyMs: number }> {
    const start = Date.now();
    try {
      await this.sendJsonRpc('ping', {});
      return { healthy: true, latencyMs: Date.now() - start };
    } catch {
      // Fallback to initialize as health probe
      try {
        await this.initialize();
        return { healthy: true, latencyMs: Date.now() - start };
      } catch (err: any) {
        return { healthy: false, latencyMs: Date.now() - start };
      }
    }
  }

  private isMockOrDemoServer(url: string): boolean {
    return (
      url.includes('nexus-demo.internal') ||
      url.includes('demo.mcp.local') ||
      url.startsWith('mock://') ||
      url.includes('localhost:9999')
    );
  }

  private async handleMockJsonRpc<T = any>(
    method: string,
    params?: Record<string, any>
  ): Promise<T> {
    await new Promise((r) => setTimeout(r, 120));

    switch (method) {
      case 'initialize':
        return {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: { listChanged: true },
            resources: { subscribe: true },
          },
          serverInfo: {
            name: 'NEXUS Standard Security & Cloud MCP Server',
            version: '2.4.0',
            description: 'Provides automated vulnerability scanning, container inspection, and infrastructure diagnostics.',
          },
        } as unknown as T;

      case 'tools/list':
        return {
          tools: [
            {
              name: 'security_vulnerability_scan',
              description: 'Performs static AST code scanning and CVE dependency vulnerability analysis.',
              inputSchema: {
                type: 'object',
                properties: {
                  repository: { type: 'string', description: 'GitHub repo identifier (e.g. org/repo)' },
                  commit_sha: { type: 'string', description: 'Target commit SHA for scanning' },
                  severity_threshold: {
                    type: 'string',
                    enum: ['low', 'medium', 'high', 'critical'],
                    description: 'Minimum severity to flag',
                    default: 'medium',
                  },
                },
                required: ['repository'],
              },
            },
            {
              name: 'database_schema_inspector',
              description: 'Inspects SQL schema migrations and reports table drift, missing foreign keys, or unindexed queries.',
              inputSchema: {
                type: 'object',
                properties: {
                  schema_path: { type: 'string', description: 'Path to migration or DDL files' },
                  strict_mode: { type: 'boolean', default: true },
                },
                required: ['schema_path'],
              },
            },
            {
              name: 'cloud_resource_linter',
              description: 'Lints infrastructure-as-code files (Terraform, Dockerfile, Vercel JSON) against security baselines.',
              inputSchema: {
                type: 'object',
                properties: {
                  file_content: { type: 'string', description: 'Configuration content to lint' },
                  target_platform: { type: 'string', enum: ['vercel', 'aws', 'docker', 'supabase'] },
                },
                required: ['file_content'],
              },
            },
            {
              name: 'execute_shell_command',
              description: 'Executes arbitrary shell commands in sandbox environment. HIGH RISK: Requires explicit admin grant.',
              inputSchema: {
                type: 'object',
                properties: {
                  command: { type: 'string', description: 'Shell command line to execute' },
                },
                required: ['command'],
              },
            },
          ],
        } as unknown as T;

      case 'tools/call': {
        const toolName = params?.name;
        const args = params?.arguments || {};

        if (toolName === 'security_vulnerability_scan') {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    scan_id: `mcp_scan_${Date.now()}`,
                    repository: args.repository || 'workspace/nexus-core',
                    commit_sha: args.commit_sha || '9f8a21b',
                    vulnerabilities_found: 0,
                    critical_count: 0,
                    high_count: 0,
                    medium_count: 0,
                    status: 'PASSED',
                    compliance_score: 99.4,
                    summary: 'Static analysis and CVE check passed with zero critical vulnerabilities.',
                    scanned_at: new Date().toISOString(),
                  },
                  null,
                  2
                ),
              },
            ],
            isError: false,
          } as unknown as T;
        }

        if (toolName === 'database_schema_inspector') {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    tables_analyzed: 8,
                    indexes_verified: 14,
                    drift_detected: false,
                    rls_status: '100% ENABLED',
                    recommendations: ['All foreign keys have indexes and ON DELETE policies.'],
                  },
                  null,
                  2
                ),
              },
            ],
            isError: false,
          } as unknown as T;
        }

        if (toolName === 'cloud_resource_linter') {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  lint_passed: true,
                  warnings: 0,
                  score: 100,
                  platform: args.target_platform || 'vercel',
                }),
              },
            ],
            isError: false,
          } as unknown as T;
        }

        if (toolName === 'execute_shell_command') {
          return {
            content: [
              {
                type: 'text',
                text: `Executed mock command "${args.command || 'echo hello'}": exit code 0.`,
              },
            ],
            isError: false,
          } as unknown as T;
        }

        return {
          content: [{ type: 'text', text: `Tool ${toolName} executed successfully with arguments: ${JSON.stringify(args)}` }],
          isError: false,
        } as unknown as T;
      }

      case 'ping':
        return { pong: true } as unknown as T;

      default:
        throw new Error(`Method ${method} not implemented in mock MCP server`);
    }
  }
}
