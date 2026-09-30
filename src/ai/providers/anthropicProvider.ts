import { IAIProvider, ModelMessage, ModelResponse, ModelToolDefinition } from '../types';

export class AnthropicProvider implements IAIProvider {
  public id = 'anthropic';
  public name = 'Anthropic Claude';

  private getApiKey(): string {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('nexus_anthropic_key');
      if (stored && stored.trim().length > 0) return stored.trim();
    }
    return (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_ANTHROPIC_API_KEY) || '';
  }

  public isConfigured(): boolean {
    const key = this.getApiKey();
    return Boolean(key && !key.includes('your_anthropic_api_key') && key.trim().length > 0);
  }

  public getConfigError(): string | null {
    if (!this.isConfigured()) {
      return 'Anthropic Claude API key is missing. Add VITE_ANTHROPIC_API_KEY or save it in the API Key Vault.';
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
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error(this.getConfigError() || 'Anthropic API is not configured.');
    }

    let modelName = params.model || 'claude-3-5-sonnet-20241022';
    if (!modelName.startsWith('claude-')) {
      modelName = 'claude-3-5-sonnet-20241022';
    }

    const messagesPayload: any[] = [];
    for (const msg of params.messages) {
      if (msg.role === 'system') continue;
      messagesPayload.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content || '',
      });
    }

    const requestBody: any = {
      model: modelName,
      max_tokens: 4096,
      temperature: params.temperature ?? 0.3,
      messages: messagesPayload,
    };

    if (params.systemInstruction) {
      requestBody.system = params.systemInstruction;
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'dangerously-allow-browser': 'true',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Anthropic Claude API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const textContent = data.content
        ?.filter((c: any) => c.type === 'text')
        .map((c: any) => c.text)
        .join('\n') || null;

      return {
        text: textContent,
        usage: {
          promptTokens: data.usage?.input_tokens,
          completionTokens: data.usage?.output_tokens,
          totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
        },
      };
    } catch (err: any) {
      console.warn('Anthropic API request failed, falling back:', err.message);
      throw err;
    }
  }
}

export const anthropicProvider = new AnthropicProvider();
