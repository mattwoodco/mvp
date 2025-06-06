import * as fal from '@fal-ai/client';
import type { AIProviderConfig } from '../types';
import { getProviderConfig, validateApiKey } from '../utils';

export function createFalProvider(config?: AIProviderConfig) {
  const providerConfig = getProviderConfig('FAL', config);
  const apiKey = validateApiKey('fal.ai', providerConfig.apiKey);
  
  // Configure fal client
  fal.config({
    credentials: apiKey,
  });
  
  return fal;
}

// Export specific fal.ai video generation function
export async function generateVideo(prompt: string, options?: {
  aspectRatio?: '16:9' | '9:16';
  duration?: '8s';
}) {
  const result = await fal.subscribe("fal-ai/veo3", {
    input: {
      prompt,
      aspect_ratio: options?.aspectRatio || '16:9',
      duration: options?.duration || '8s',
    },
  });
  
  return result;
}