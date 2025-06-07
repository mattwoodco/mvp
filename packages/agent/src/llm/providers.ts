import { Mistral } from "@mistralai/mistralai";
import { type LLMConfig, LLMError, type LLMProvider } from "../types";

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason?: string;
}

export interface LLMStreamResponse {
  content: string;
  delta: string;
  finished: boolean;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// Simple retry utility
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000,
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        throw lastError;
      }

      // Exponential backoff
      const waitTime = delay * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw lastError!;
}

export abstract class BaseLLMProvider {
  protected config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  abstract complete(
    messages: LLMMessage[],
    options?: Partial<LLMConfig>,
  ): Promise<LLMResponse>;
  abstract stream(
    messages: LLMMessage[],
    options?: Partial<LLMConfig>,
  ): AsyncIterableIterator<LLMStreamResponse>;

  protected async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    return withRetry(operation, this.config.retryAttempts, 1000);
  }
}

export class MistralProvider extends BaseLLMProvider {
  private client: Mistral;

  constructor(config: LLMConfig) {
    super(config);
    this.client = new Mistral({
      apiKey: config.apiKey,
      serverURL: config.baseUrl,
    });
  }

  async complete(
    messages: LLMMessage[],
    options?: Partial<LLMConfig>,
  ): Promise<LLMResponse> {
    return this.withRetry(async () => {
      try {
        const response = await this.client.chat.complete({
          model: options?.model || this.config.model,
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          temperature: options?.temperature || this.config.temperature,
          maxTokens: options?.maxTokens || this.config.maxTokens,
          topP: options?.topP || this.config.topP,
        });

        if (!response.choices?.[0]?.message?.content) {
          throw new LLMError(
            "No content in Mistral response",
            "mistral",
            this.config.model,
            false,
          );
        }

        const result: LLMResponse = {
          content: response.choices[0].message.content,
          model: response.model || this.config.model,
          finishReason: response.choices[0].finishReason,
        };

        if (response.usage) {
          result.usage = {
            promptTokens: response.usage.promptTokens,
            completionTokens: response.usage.completionTokens,
            totalTokens: response.usage.totalTokens,
          };
        }

        return result;
      } catch (error) {
        throw new LLMError(
          `Mistral API error: ${error instanceof Error ? error.message : "Unknown error"}`,
          "mistral",
          this.config.model,
          true,
        );
      }
    });
  }

  async *stream(
    messages: LLMMessage[],
    options?: Partial<LLMConfig>,
  ): AsyncIterableIterator<LLMStreamResponse> {
    try {
      const stream = await this.client.chat.stream({
        model: options?.model || this.config.model,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: options?.temperature || this.config.temperature,
        maxTokens: options?.maxTokens || this.config.maxTokens,
        topP: options?.topP || this.config.topP,
      });

      let fullContent = "";
      for await (const chunk of stream) {
        const delta = chunk.choices?.[0]?.delta?.content || "";
        fullContent += delta;

        const result: LLMStreamResponse = {
          content: fullContent,
          delta,
          finished: chunk.choices?.[0]?.finishReason !== null,
        };

        if (chunk.usage) {
          result.usage = {
            promptTokens: chunk.usage.promptTokens,
            completionTokens: chunk.usage.completionTokens,
            totalTokens: chunk.usage.totalTokens,
          };
        }

        yield result;
      }
    } catch (error) {
      throw new LLMError(
        `Mistral stream error: ${error instanceof Error ? error.message : "Unknown error"}`,
        "mistral",
        this.config.model,
        true,
      );
    }
  }
}

export class CerebrasProvider extends BaseLLMProvider {
  private client: { baseURL: string; apiKey: string };

  constructor(config: LLMConfig) {
    super(config);
    // Cerebras uses OpenAI-compatible API but with their own endpoint
    this.client = {
      baseURL: config.baseUrl || "https://api.cerebras.ai/v1",
      apiKey: config.apiKey,
    };
  }

  async complete(
    messages: LLMMessage[],
    options?: Partial<LLMConfig>,
  ): Promise<LLMResponse> {
    return this.withRetry(async () => {
      try {
        const response = await fetch(
          `${this.client.baseURL}/chat/completions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.client.apiKey}`,
            },
            body: JSON.stringify({
              model: options?.model || this.config.model,
              messages: messages.map((msg) => ({
                role: msg.role,
                content: msg.content,
              })),
              temperature: options?.temperature || this.config.temperature,
              max_tokens: options?.maxTokens || this.config.maxTokens,
              top_p: options?.topP || this.config.topP,
              stream: false,
            }),
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.choices?.[0]?.message?.content) {
          throw new LLMError(
            "No content in Cerebras response",
            "cerebras",
            this.config.model,
            false,
          );
        }

        const result: LLMResponse = {
          content: data.choices[0].message.content,
          model: data.model || this.config.model,
          finishReason: data.choices[0].finish_reason,
        };

        if (data.usage) {
          result.usage = {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          };
        }

        return result;
      } catch (error) {
        throw new LLMError(
          `Cerebras API error: ${error instanceof Error ? error.message : "Unknown error"}`,
          "cerebras",
          this.config.model,
          true,
        );
      }
    });
  }

  async *stream(
    messages: LLMMessage[],
    options?: Partial<LLMConfig>,
  ): AsyncIterableIterator<LLMStreamResponse> {
    try {
      const response = await fetch(`${this.client.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.client.apiKey}`,
        },
        body: JSON.stringify({
          model: options?.model || this.config.model,
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          temperature: options?.temperature || this.config.temperature,
          max_tokens: options?.maxTokens || this.config.maxTokens,
          top_p: options?.topP || this.config.topP,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body reader available");
      }

      const decoder = new TextDecoder();
      let fullContent = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter((line) => line.trim());

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") {
                return;
              }

              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta?.content || "";
                fullContent += delta;

                const result: LLMStreamResponse = {
                  content: fullContent,
                  delta,
                  finished: parsed.choices?.[0]?.finish_reason !== null,
                };

                if (parsed.usage) {
                  result.usage = {
                    promptTokens: parsed.usage.prompt_tokens,
                    completionTokens: parsed.usage.completion_tokens,
                    totalTokens: parsed.usage.total_tokens,
                  };
                }

                yield result;
              } catch (parseError) {
                // Skip invalid JSON chunks
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      throw new LLMError(
        `Cerebras stream error: ${error instanceof Error ? error.message : "Unknown error"}`,
        "cerebras",
        this.config.model,
        true,
      );
    }
  }
}

export namespace LLMProviderFactory {
  export function create(config: LLMConfig): BaseLLMProvider {
    switch (config.provider) {
      case "mistral":
        return new MistralProvider(config);
      case "cerebras":
        return new CerebrasProvider(config);
      default:
        throw new Error(`Unsupported LLM provider: ${config.provider}`);
    }
  }

  export function getDefaultConfig(provider: LLMProvider): Partial<LLMConfig> {
    switch (provider) {
      case "mistral":
        return {
          model: "mistral-large-latest",
          baseUrl: "https://api.mistral.ai",
          temperature: 0.7,
          maxTokens: 2000,
        };
      case "cerebras":
        return {
          model: "llama3.1-70b", // Latest Cerebras model
          baseUrl: "https://api.cerebras.ai/v1",
          temperature: 0.7,
          maxTokens: 2000,
        };
      default:
        throw new Error(`No default config for provider: ${provider}`);
    }
  }

  export function getLatestModels(provider: LLMProvider): string[] {
    switch (provider) {
      case "mistral":
        return [
          "mistral-large-latest",
          "mistral-small-latest",
          "codestral-latest",
          "ministral-3b-latest",
          "ministral-8b-latest",
        ];
      case "cerebras":
        return [
          "llama3.1-70b",
          "llama3.1-8b",
          "deepseek-r1-llama-70b", // Latest fast reasoning model
          "llama4-scout", // Latest Llama 4 model
        ];
      default:
        return [];
    }
  }
}
