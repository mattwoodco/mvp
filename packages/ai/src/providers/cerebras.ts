import { createOpenAI } from "@ai-sdk/openai";
import type { AIProviderConfig } from "../types";
import { getProviderConfig, validateApiKey } from "../utils";

export function createCerebrasProvider(config?: AIProviderConfig) {
  const providerConfig = getProviderConfig("CEREBRAS", config);
  const apiKey = validateApiKey("Cerebras", providerConfig.apiKey);

  return createOpenAI({
    apiKey,
    baseURL: "https://api.cerebras.ai/v1",
  });
}
