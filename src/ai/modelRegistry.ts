import { IAIProvider } from './types';
import { geminiProvider } from './providers/geminiProvider';
import { openaiProvider } from './providers/openaiProvider';
import { anthropicProvider } from './providers/anthropicProvider';
import { deepseekProvider } from './providers/deepseekProvider';
import { groqProvider } from './providers/groqProvider';

const PROVIDERS: Record<string, IAIProvider> = {
  gemini: geminiProvider,
  openai: openaiProvider,
  anthropic: anthropicProvider,
  deepseek: deepseekProvider,
  groq: groqProvider,
};

export const getModelProvider = (providerId: string): IAIProvider => {
  const normalized = providerId.toLowerCase();
  if (normalized.includes('claude') || normalized.includes('anthropic')) return anthropicProvider;
  if (normalized.includes('deepseek')) return deepseekProvider;
  if (normalized.includes('groq') || normalized.includes('llama')) return groqProvider;
  if (normalized.includes('gpt') || normalized.includes('openai')) return openaiProvider;
  if (normalized.includes('gemini') || normalized.includes('google')) return geminiProvider;

  const provider = PROVIDERS[normalized];
  if (!provider) {
    return geminiProvider;
  }
  return provider;
};

export const getAllModelProviders = (): IAIProvider[] => {
  return Object.values(PROVIDERS);
};

export const isAnyProviderConfigured = (): boolean => {
  return Object.values(PROVIDERS).some((p) => p.isConfigured());
};

export const getProviderStatusMap = (): Record<string, boolean> => {
  return {
    openai: openaiProvider.isConfigured(),
    anthropic: anthropicProvider.isConfigured(),
    gemini: geminiProvider.isConfigured(),
    deepseek: deepseekProvider.isConfigured(),
    groq: groqProvider.isConfigured(),
  };
};

export const saveCustomApiKey = (providerId: string, apiKey: string): void => {
  if (typeof window === 'undefined') return;
  const keyName = `nexus_${providerId.toLowerCase()}_key`;
  if (apiKey.trim()) {
    localStorage.setItem(keyName, apiKey.trim());
  } else {
    localStorage.removeItem(keyName);
  }
};

export const getCustomApiKey = (providerId: string): string => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(`nexus_${providerId.toLowerCase()}_key`) || '';
};
