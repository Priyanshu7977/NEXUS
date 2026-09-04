import { IAIProvider, ModelMessage, ModelResponse, ModelToolCall, ModelToolDefinition } from '../types';

const GEMINI_API_KEY: string =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) || '';

export class GeminiProvider implements IAIProvider {
  public id = 'gemini';
  public name = 'Google Gemini';

  public isConfigured(): boolean {
    return Boolean(
      GEMINI_API_KEY &&
      !GEMINI_API_KEY.includes('your_gemini_api_key') &&
      GEMINI_API_KEY.trim().length > 0
    );
  }

  public getConfigError(): string | null {
    if (!this.isConfigured()) {
      return 'Google Gemini API key is missing. Add VITE_GEMINI_API_KEY to your .env file to enable live reasoning.';
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
      throw new Error(this.getConfigError() || 'Gemini API is not configured.');
    }

    // Default model if unspecified or legacy
    let modelName = params.model || 'gemini-1.5-flash';
    if (!modelName.startsWith('gemini-')) {
      modelName = 'gemini-1.5-flash';
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;

    // Transform messages to Gemini contents format
    const contents: any[] = [];

    for (const msg of params.messages) {
      if (msg.role === 'system') continue; // handled via systemInstruction

      if (msg.role === 'user') {
        contents.push({
          role: 'user',
          parts: [{ text: msg.content || '' }],
        });
      } else if (msg.role === 'assistant') {
        const parts: any[] = [];
        if (msg.content) {
          parts.push({ text: msg.content });
        }
        if (msg.toolCalls && msg.toolCalls.length > 0) {
          for (const tc of msg.toolCalls) {
            parts.push({
              functionCall: {
                name: tc.name,
                args: tc.args || {},
              },
            });
          }
        }
        contents.push({
          role: 'model',
          parts,
        });
      } else if (msg.role === 'tool') {
        // Tool result sent back to model
        let parsedResponse: any = {};
        try {
          parsedResponse = msg.content ? JSON.parse(msg.content) : {};
        } catch {
          parsedResponse = { result: msg.content };
        }

        contents.push({
          role: 'user',
          parts: [
            {
              functionResponse: {
                name: msg.name || 'tool_call',
                response: {
                  name: msg.name || 'tool_call',
                  content: parsedResponse,
                },
              },
            },
          ],
        });
      }
    }

    const payload: any = {
      contents,
      generationConfig: {
        temperature: typeof params.temperature === 'number' ? params.temperature : 0.7,
      },
    };

    if (params.systemInstruction) {
      payload.systemInstruction = {
        parts: [{ text: params.systemInstruction }],
      };
    }

    if (params.tools && params.tools.length > 0) {
      payload.tools = [
        {
          functionDeclarations: params.tools.map((t) => ({
            name: t.name,
            description: t.description,
            parameters: t.parameters,
          })),
        },
      ];
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const message = errData?.error?.message || `Gemini API HTTP Error ${response.status}`;
      throw new Error(`Gemini Provider: ${message}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    if (!candidate) {
      throw new Error('Gemini returned an empty response candidate.');
    }

    let text: string | null = null;
    const toolCalls: ModelToolCall[] = [];

    if (candidate.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.text) {
          text = (text ? text + '\n' : '') + part.text;
        }
        if (part.functionCall) {
          toolCalls.push({
            id: 'call_' + Math.random().toString(36).substring(2, 9),
            name: part.functionCall.name,
            args: part.functionCall.args || {},
          });
        }
      }
    }

    return {
      text,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      usage: data.usageMetadata
        ? {
            promptTokens: data.usageMetadata.promptTokenCount,
            completionTokens: data.usageMetadata.candidatesTokenCount,
            totalTokens: data.usageMetadata.totalTokenCount,
          }
        : undefined,
      finishReason: candidate.finishReason,
    };
  }
}

export const geminiProvider = new GeminiProvider();
