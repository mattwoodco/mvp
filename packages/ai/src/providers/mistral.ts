import { createMistral } from "@ai-sdk/mistral";
import type { AIProviderConfig } from "../types";
import { getProviderConfig, validateApiKey } from "../utils";

export function createMistralProvider(config?: AIProviderConfig) {
  const providerConfig = getProviderConfig("MISTRAL", config);
  const apiKey = validateApiKey("Mistral", providerConfig.apiKey);

  return createMistral({
    apiKey,
    baseURL: providerConfig.baseURL || "https://api.mistral.ai",
  });
}
