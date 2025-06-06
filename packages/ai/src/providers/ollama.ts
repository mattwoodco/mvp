import { createOpenAI } from "@ai-sdk/openai";
import type { AIProviderConfig } from "../types";
import { getProviderConfig } from "../utils";

export function createOllamaProvider(config?: AIProviderConfig) {
  const providerConfig = getProviderConfig("OLLAMA", config);

  return createOpenAI({
    baseURL: providerConfig.baseURL || "http://localhost:11434/v1",
    apiKey: "ollama", // Ollama doesn't require a real API key
  });
}
