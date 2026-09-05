// ====================================================================
// NEXUS TYPESCRIPT SDK — CLIENT IMPLEMENTATION
// ====================================================================

import {
  NexusApiError,
  NexusAuthenticationError,
  NexusPermissionError,
  NexusNotFoundError,
  NexusValidationError,
  NexusRateLimitError,
} from './errors';
import type {
  DeveloperWebhook,
  WebhookEventType,
} from '../types/api';

export interface NexusClientOptions {
  apiKey: string;
  baseUrl?: string;
  customFetch?: typeof fetch;
}

export interface ExecutionFilterParams {
  status?: string;
  agentId?: string;
  workflowId?: string;
  limit?: number;
  offset?: number;
}

export interface WaitForCompletionOptions {
  pollIntervalMs?: number;
  timeoutMs?: number;
  onUpdate?: (execution: any) => void;
}

export class NexusClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  public readonly agents: NexusAgentsClient;
  public readonly workflows: NexusWorkflowsClient;
  public readonly executions: NexusExecutionsClient;
  public readonly connectors: NexusConnectorsClient;
  public readonly activity: NexusActivityClient;
  public readonly webhooks: NexusWebhooksClient;

  constructor(options: NexusClientOptions) {
    if (!options.apiKey || !options.apiKey.trim()) {
      throw new NexusAuthenticationError('A valid NEXUS API Key is required (e.g. nxs_live_...).');
    }

    this.apiKey = options.apiKey.trim();
    this.baseUrl = (options.baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173')).replace(/\/+$/, '');
    this.fetchImpl = options.customFetch || (typeof fetch !== 'undefined' ? fetch.bind(globalThis) : (() => {
      throw new Error('No fetch implementation found. Pass customFetch in NexusClient options.');
    }) as any);

    this.agents = new NexusAgentsClient(this);
    this.workflows = new NexusWorkflowsClient(this);
    this.executions = new NexusExecutionsClient(this);
    this.connectors = new NexusConnectorsClient(this);
    this.activity = new NexusActivityClient(this);
    this.webhooks = new NexusWebhooksClient(this);
  }

  public async request<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    path: string,
    options: {
      query?: Record<string, string | number | boolean | undefined>;
      body?: any;
      idempotencyKey?: string;
      headers?: Record<string, string>;
    } = {}
  ): Promise<T> {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    let url = `${this.baseUrl}${cleanPath}`;

    if (options.query) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(options.query)) {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      }
      const qs = searchParams.toString();
      if (qs) {
        url += (url.includes('?') ? '&' : '?') + qs;
      }
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Accept': 'application/json',
      ...(options.headers || {}),
    };

    if (options.body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    if (options.idempotencyKey) {
      headers['Idempotency-Key'] = options.idempotencyKey;
    }

    let response: Response;
    try {
      response = await this.fetchImpl(url, {
        method,
        headers,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      });
    } catch (err: any) {
      throw new NexusApiError(`Network error while calling NEXUS API: ${err.message || err}`, 0, 'NETWORK_ERROR');
    }

    const requestId = response.headers.get('x-request-id') || response.headers.get('X-Request-Id') || undefined;
    let json: any = null;
    const rawText = await response.text();
    if (rawText) {
      try {
        json = JSON.parse(rawText);
      } catch {
        json = { error: { message: rawText, code: 'INVALID_JSON_RESPONSE' } };
      }
    }

    if (!response.ok) {
      const errorPayload = json?.error || {};
      const message = errorPayload.message || response.statusText || 'API request failed';
      const code = errorPayload.code || 'API_ERROR';
      const reqId = errorPayload.request_id || requestId;

      if (response.status === 401) {
        throw new NexusAuthenticationError(message, reqId);
      }
      if (response.status === 403) {
        throw new NexusPermissionError(message, reqId);
      }
      if (response.status === 404) {
        throw new NexusNotFoundError(message, reqId);
      }
      if (response.status === 422 || response.status === 400) {
        throw new NexusValidationError(message, reqId, errorPayload.details);
      }
      if (response.status === 429) {
        const retryHeader = response.headers.get('retry-after');
        const retryAfter = retryHeader ? parseInt(retryHeader, 10) : undefined;
        throw new NexusRateLimitError(message, reqId, retryAfter);
      }

      throw new NexusApiError(message, response.status, code, reqId, errorPayload.details);
    }

    // Unpack canonical envelope { data: T, request_id: string }
    if (json && typeof json === 'object' && 'data' in json) {
      return json.data as T;
    }

    return json as T;
  }
}

// --------------------------------------------------------------------
// Sub-clients
// --------------------------------------------------------------------

export class NexusAgentsClient {
  constructor(private readonly client: NexusClient) {}

  async list(): Promise<any[]> {
    return this.client.request<any[]>('GET', '/api/v1/agents');
  }

  async get(agentId: string): Promise<any> {
    return this.client.request<any>('GET', `/api/v1/agents/${encodeURIComponent(agentId)}`);
  }

  async execute(
    agentId: string,
    input: { prompt: string; context?: Record<string, any> },
    options: { idempotencyKey?: string } = {}
  ): Promise<any> {
    return this.client.request<any>('POST', `/api/v1/agents/${encodeURIComponent(agentId)}/execute`, {
      body: input,
      idempotencyKey: options.idempotencyKey,
    });
  }
}

export class NexusWorkflowsClient {
  constructor(private readonly client: NexusClient) {}

  async list(): Promise<any[]> {
    return this.client.request<any[]>('GET', '/api/v1/workflows');
  }

  async get(workflowId: string): Promise<any> {
    return this.client.request<any>('GET', `/api/v1/workflows/${encodeURIComponent(workflowId)}`);
  }

  async execute(
    workflowId: string,
    input: { triggerData?: Record<string, any> } = {},
    options: { idempotencyKey?: string } = {}
  ): Promise<any> {
    return this.client.request<any>('POST', `/api/v1/workflows/${encodeURIComponent(workflowId)}/execute`, {
      body: input,
      idempotencyKey: options.idempotencyKey,
    });
  }
}

export class NexusExecutionsClient {
  constructor(private readonly client: NexusClient) {}

  async list(params: ExecutionFilterParams = {}): Promise<any[]> {
    return this.client.request<any[]>('GET', '/api/v1/executions', {
      query: {
        status: params.status,
        agent_id: params.agentId,
        workflow_id: params.workflowId,
        limit: params.limit,
        offset: params.offset,
      },
    });
  }

  async get(executionId: string): Promise<any> {
    return this.client.request<any>('GET', `/api/v1/executions/${encodeURIComponent(executionId)}`);
  }

  async getEvents(executionId: string): Promise<any[]> {
    return this.client.request<any[]>('GET', `/api/v1/executions/${encodeURIComponent(executionId)}/events`);
  }

  /**
   * Polls execution status until it reaches a terminal state (completed, failed, cancelled).
   */
  async waitForCompletion(
    executionId: string,
    options: WaitForCompletionOptions = {}
  ): Promise<any> {
    const pollInterval = options.pollIntervalMs || 1000;
    const timeout = options.timeoutMs || 120000; // 2 minutes default
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const execution = await this.get(executionId);
      if (options.onUpdate) {
        options.onUpdate(execution);
      }

      const status = execution?.status;
      if (status === 'completed' || status === 'failed' || status === 'cancelled') {
        return execution;
      }

      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    throw new NexusApiError(
      `Execution ${executionId} timed out after ${timeout}ms while waiting for completion.`,
      408,
      'EXECUTION_TIMEOUT'
    );
  }
}

export class NexusConnectorsClient {
  constructor(private readonly client: NexusClient) {}

  async list(): Promise<any[]> {
    return this.client.request<any[]>('GET', '/api/v1/connectors');
  }
}

export class NexusActivityClient {
  constructor(private readonly client: NexusClient) {}

  async list(params: { limit?: number; offset?: number; type?: string } = {}): Promise<any[]> {
    return this.client.request<any[]>('GET', '/api/v1/activity', { query: params });
  }
}

export class NexusWebhooksClient {
  constructor(private readonly client: NexusClient) {}

  async list(): Promise<DeveloperWebhook[]> {
    return this.client.request<DeveloperWebhook[]>('GET', '/api/v1/webhooks');
  }

  async create(params: {
    url: string;
    events: WebhookEventType[];
    description?: string;
  }): Promise<DeveloperWebhook & { secret: string }> {
    return this.client.request<DeveloperWebhook & { secret: string }>('POST', '/api/v1/webhooks', {
      body: params,
    });
  }

  async delete(webhookId: string): Promise<{ success: boolean; id: string }> {
    return this.client.request<{ success: boolean; id: string }>(
      'DELETE',
      `/api/v1/webhooks/${encodeURIComponent(webhookId)}`
    );
  }

  async test(webhookId: string): Promise<{ success: boolean; statusCode?: number }> {
    return this.client.request<{ success: boolean; statusCode?: number }>(
      'POST',
      `/api/v1/webhooks/${encodeURIComponent(webhookId)}/test`
    );
  }
}
