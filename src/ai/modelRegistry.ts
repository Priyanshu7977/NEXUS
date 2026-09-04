import { IAIProvider } from './types';
import { geminiProvider } from './providers/geminiProvider';
import { openaiProvider } from './providers/openaiProvider';

const PROVIDERS: Record<string, IAIProvider> = {
  gemini: geminiProvider,
  openai: openaiProvider,
};

export const getModelProvider = (providerId: string): IAIProvider => {
  const provider = PROVIDERS[providerId.toLowerCase()];
  if (!provider) {
    // Default fallback to Gemini
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
