import { createOpenAI } from "@ai-sdk/openai";
import type { AIProviderConfig } from "../types";
import { getProviderConfig, validateApiKey } from "../utils";

export function createOpenAIProvider(config?: AIProviderConfig) {
  const providerConfig = getProviderConfig("OPENAI", config);
  const apiKey = validateApiKey("OpenAI", providerConfig.apiKey);

  return createOpenAI({
    apiKey,
    baseURL: providerConfig.baseURL,
  });
}
