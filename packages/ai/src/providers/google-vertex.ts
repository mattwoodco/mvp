import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { AIProviderConfig } from "../types";
import { getProviderConfig, validateApiKey } from "../utils";

export function createGoogleVertexProvider(config?: AIProviderConfig) {
  const providerConfig = getProviderConfig("GOOGLE", config);
  const apiKey = validateApiKey("Google", providerConfig.apiKey);

  return createGoogleGenerativeAI({
    apiKey,
    baseURL:
      providerConfig.baseURL ||
      "https://generativelanguage.googleapis.com/v1beta",
  });
}
