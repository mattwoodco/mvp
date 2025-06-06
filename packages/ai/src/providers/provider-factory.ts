import type { AIProviders, SupportedProvider } from "../types";
import { createCerebrasProvider } from "./cerebras";
import { createFalProvider } from "./fal";
import { createGoogleVertexProvider } from "./google-vertex";
import { createMistralProvider } from "./mistral";
import { createOllamaProvider } from "./ollama";
import { createOpenAIProvider } from "./openai";

export function createProvider(
  provider: SupportedProvider,
  config?: AIProviders[SupportedProvider],
) {
  switch (provider) {
    case "openai":
      return createOpenAIProvider(config);
    case "google":
      return createGoogleVertexProvider(config);
    case "mistral":
      return createMistralProvider(config);
    case "ollama":
      return createOllamaProvider(config);
    case "cerebras":
      return createCerebrasProvider(config);
    case "fal":
      return createFalProvider(config);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}
