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

export interface ChatMessage extends CoreMessage {
  id?: string;
  createdAt?: Date;
}
