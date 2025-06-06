import type { AIProviderConfig } from './types';

export function getProviderConfig(
  providerName: string,
  config?: AIProviderConfig
): AIProviderConfig {
  const envPrefix = providerName.toUpperCase();
  
  return {
    apiKey: config?.apiKey || process.env[`${envPrefix}_API_KEY`],
    baseURL: config?.baseURL || process.env[`${envPrefix}_API_URL`],
    model: config?.model || process.env[`${envPrefix}_MODEL`],
  };
}

export function validateApiKey(provider: string, apiKey?: string): string {
  if (!apiKey) {
    throw new Error(`API key for ${provider} is required. Set ${provider.toUpperCase()}_API_KEY environment variable.`);
  }
  return apiKey;
}