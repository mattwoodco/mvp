import type { CoreMessage } from "ai";

export interface AIProviderConfig {
  apiKey?: string;
  baseURL?: string;
  model?: string;
}

export interface AIProviders {
  openai?: AIProviderConfig;
  google?: AIProviderConfig;
  mistral?: AIProviderConfig;
  ollama?: AIProviderConfig;
  cerebras?: AIProviderConfig;
  fal?: AIProviderConfig;
}

export type SupportedProvider = keyof AIProviders;

export type ChatMessage = CoreMessage & {
  id?: string;
  createdAt?: Date;
};
