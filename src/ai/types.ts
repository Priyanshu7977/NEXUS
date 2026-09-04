export interface ModelToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface ModelToolCall {
  id: string;
  name: string;
  args: Record<string, any>;
}

export interface ModelMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content?: string | null;
  toolCalls?: ModelToolCall[];
  toolCallId?: string;
  name?: string;
}

export interface ModelUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

export interface ModelResponse {
  text: string | null;
  toolCalls?: ModelToolCall[];
  usage?: ModelUsage;
  finishReason?: string;
}

export interface IAIProvider {
  id: string;
  name: string;
  isConfigured(): boolean;
  getConfigError(): string | null;
  generate(params: {
    model: string;
    systemInstruction?: string;
    messages: ModelMessage[];
    tools?: ModelToolDefinition[];
    temperature?: number;
  }): Promise<ModelResponse>;
}
