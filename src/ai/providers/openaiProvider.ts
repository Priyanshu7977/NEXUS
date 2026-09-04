import { IAIProvider, ModelMessage, ModelResponse, ModelToolCall, ModelToolDefinition } from '../types';

const OPENAI_API_KEY: string =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_OPENAI_API_KEY) || '';

export class OpenAIProvider implements IAIProvider {
  public id = 'openai';
  public name = 'OpenAI';

  public isConfigured(): boolean {
    return Boolean(
      OPENAI_API_KEY &&
      !OPENAI_API_KEY.includes('your_openai_api_key') &&
      OPENAI_API_KEY.trim().length > 0
    );
  }

  public getConfigError(): string | null {
    if (!this.isConfigured()) {
      return 'OpenAI API key is missing. Add VITE_OPENAI_API_KEY to your .env file to enable live reasoning.';
    }
    return null;
  }

  public async generate(params: {
    model: string;
    systemInstruction?: string;
    messages: ModelMessage[];
    tools?: ModelToolDefinition[];
    temperature?: number;
  }): Promise<ModelResponse> {
    if (!this.isConfigured()) {
      throw new Error(this.getConfigError() || 'OpenAI API is not configured.');
    }

    let modelName = params.model || 'gpt-4o';
    if (!modelName.startsWith('gpt-')) {
      modelName = 'gpt-4o';
    }

    const messagesPayload: any[] = [];

    if (params.systemInstruction) {
      messagesPayload.push({
        role: 'system',
        content: params.systemInstruction,
      });
    }

    for (const msg of params.messages) {
      if (msg.role === 'user') {
        messagesPayload.push({ role: 'user', content: msg.content || '' });
      } else if (msg.role === 'assistant') {
        const item: any = { role: 'assistant', content: msg.content || null };
        if (msg.toolCalls && msg.toolCalls.length > 0) {
          item.tool_calls = msg.toolCalls.map((tc) => ({
            id: tc.id,
            type: 'function',
            function: {
              name: tc.name,
              arguments: JSON.stringify(tc.args || {}),
            },
          }));
        }
        messagesPayload.push(item);
      } else if (msg.role === 'tool') {
        messagesPayload.push({
          role: 'tool',
          tool_call_id: msg.toolCallId || 'call_0',
          content: msg.content || '{}',
        });
      }
    }

    const payload: any = {
      model: modelName,
      messages: messagesPayload,
      temperature: typeof params.temperature === 'number' ? params.temperature : 0.7,
    };

    if (params.tools && params.tools.length > 0) {
      payload.tools = params.tools.map((t) => ({
        type: 'function',
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        },
      }));
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const message = errData?.error?.message || `OpenAI API HTTP Error ${response.status}`;
      throw new Error(`OpenAI Provider: ${message}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    if (!choice) {
      throw new Error('OpenAI returned an empty response choice.');
    }

    const toolCalls: ModelToolCall[] = [];
    if (choice.message?.tool_calls) {
      for (const tc of choice.message.tool_calls) {
        let args = {};
        try {
          args = tc.function?.arguments ? JSON.parse(tc.function.arguments) : {};
        } catch {
          args = {};
        }
        toolCalls.push({
          id: tc.id,
          name: tc.function?.name || '',
          args,
        });
      }
    }

    return {
      text: choice.message?.content || null,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
      finishReason: choice.finish_reason,
    };
  }
}

export const openaiProvider = new OpenAIProvider();
