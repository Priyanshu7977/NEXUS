import { IAIProvider, ModelMessage, ModelResponse, ModelToolDefinition } from '../types';

export class GroqProvider implements IAIProvider {
  public id = 'groq';
  public name = 'Groq LPUs';

  private getApiKey(): string {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('nexus_groq_key');
      if (stored && stored.trim().length > 0) return stored.trim();
    }
    return (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GROQ_API_KEY) || '';
  }

  public isConfigured(): boolean {
    const key = this.getApiKey();
    return Boolean(key && !key.includes('your_groq_api_key') && key.trim().length > 0);
  }

  public getConfigError(): string | null {
    if (!this.isConfigured()) {
      return 'Groq API key is missing. Add VITE_GROQ_API_KEY or save it in the API Key Vault.';
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
      throw new Error(this.getConfigError() || 'Groq API is not configured.');
    }

    const modelName = params.model || 'llama-3.3-70b-versatile';

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
        messagesPayload.push({ role: 'assistant', content: msg.content || null });
      }
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages: messagesPayload,
          temperature: params.temperature ?? 0.2,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const choice = data.choices?.[0];

      return {
        text: choice?.message?.content || null,
        usage: {
          promptTokens: data.usage?.prompt_tokens,
          completionTokens: data.usage?.completion_tokens,
          totalTokens: data.usage?.total_tokens,
        },
        finishReason: choice?.finish_reason,
      };
    } catch (err: any) {
      console.warn('Groq API request failed:', err.message);
      throw err;
    }
  }
}

export const groqProvider = new GroqProvider();
