import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import Cerebras from "@cerebras/cerebras_cloud_sdk";
import OpenAI from "openai";

// OpenAI provider - create provider instance
export const openaiProvider = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Cerebras provider using their official SDK
export const cerebrasClient = new Cerebras({
  apiKey: process.env.CEREBRAS_API_KEY,
});

// Cerebras provider for AI SDK compatibility
export const cerebrasProvider = createOpenAICompatible({
  name: "cerebras",
  apiKey: process.env.CEREBRAS_API_KEY || "",
  baseURL: "https://api.cerebras.ai/v1",
});

// Available models configuration
export const MODELS = {
  // Cerebras models - optimized for speed
  CEREBRAS_LLAMA_4_SCOUT: "llama-4-scout-17b-16e-instruct",
  CEREBRAS_LLAMA_3_1_8B: "llama3.1-8b",
  CEREBRAS_LLAMA_3_3_70B: "llama-3.3-70b",
  CEREBRAS_QWEN_3_32B: "qwen-3-32b",

  // OpenAI models - for comparison and fallback
  OPENAI_GPT_4O: "gpt-4o",
  OPENAI_GPT_4O_MINI: "gpt-4o-mini",
} as const;

// Model performance characteristics
export const MODEL_CHARACTERISTICS = {
  [MODELS.CEREBRAS_LLAMA_4_SCOUT]: {
    speed: 2600,
    parameters: "17B",
    strengths: ["general purpose", "fast reasoning", "creative writing"],
    maxTokens: 8192,
  },
  [MODELS.CEREBRAS_LLAMA_3_3_70B]: {
    speed: 2100,
    parameters: "70B",
    strengths: ["advanced reasoning", "complex tasks", "code generation"],
    maxTokens: 8192,
  },
  [MODELS.CEREBRAS_QWEN_3_32B]: {
    speed: 2100,
    parameters: "32B",
    strengths: ["hybrid reasoning", "thinking tokens", "analysis"],
    maxTokens: 8192,
  },
} as const;

// Get the best model for a given task type
export function getBestModelForTask(
  taskType: "reasoning" | "creative" | "general" | "code",
): string {
  switch (taskType) {
    case "reasoning":
      return MODELS.CEREBRAS_LLAMA_3_3_70B;
    case "creative":
      return MODELS.CEREBRAS_LLAMA_4_SCOUT;
    case "code":
      return MODELS.CEREBRAS_LLAMA_3_3_70B;
    default:
      return MODELS.CEREBRAS_LLAMA_4_SCOUT;
  }
}

interface LLMProvider {
  specificationVersion: string;
  provider: string;
  modelId: string;
  defaultObjectGenerationMode: string;
  generateText: (params: {
    prompt: string;
    temperature?: number;
    maxTokens?: number;
  }) => Promise<{ text: string }>;
}

interface OpenAICompatibleProviderSettings {
  apiKey: string;
  baseUrl: string;
  model: string;
  defaultModel?: string;
}

export async function getLLMProvider(
  taskType: "reasoning" | "creative" | "general" | "code",
): Promise<LLMProvider> {
  try {
    console.log("[LLM Provider] Starting provider initialization");
    console.log("[LLM Provider] Task type:", taskType);
    console.log(
      "[LLM Provider] Cerebras API key present:",
      !!process.env.CEREBRAS_API_KEY,
    );

    if (!process.env.CEREBRAS_API_KEY) {
      console.warn(
        "[LLM Provider] Cerebras API key not found, falling back to OpenAI",
      );
      return {
        specificationVersion: "1.0",
        provider: "openai",
        modelId: "gpt-4",
        defaultObjectGenerationMode: "text",
        generateText: async (params) => {
          console.log("[LLM Provider] Using OpenAI for text generation");
          const response = await openaiProvider.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: params.prompt }],
            temperature: params.temperature,
            max_tokens: params.maxTokens,
          });
          return { text: response.choices?.[0]?.message?.content || "" };
        },
      };
    }

    const model = getBestModelForTask(taskType);
    console.log("[LLM Provider] Selected model:", model);

    try {
      console.log("[LLM Provider] Testing Cerebras client");
      // List available models first
      const models = await cerebrasClient.models.list();
      console.log("[LLM Provider] Available Cerebras models:", models);

      // Test the Cerebras client
      console.log("[LLM Provider] Testing model completion");
      await cerebrasClient.completions.create({
        model,
        prompt: "test",
        max_tokens: 1,
      });
      console.log("[LLM Provider] Cerebras client test successful");

      return {
        specificationVersion: "1.0",
        provider: "cerebras",
        modelId: model,
        defaultObjectGenerationMode: "text",
        generateText: async (params) => {
          console.log("[LLM Provider] Using Cerebras for text generation");
          const response = await cerebrasClient.completions.create({
            model,
            prompt: params.prompt,
            temperature: params.temperature,
            max_tokens: params.maxTokens,
          });
          return {
            text:
              (response.choices &&
                Array.isArray(response.choices) &&
                response.choices[0]?.text) ||
              "",
          };
        },
      };
    } catch (error) {
      console.error("[LLM Provider] Cerebras provider test failed:", error);
      throw error;
    }
  } catch (error) {
    console.error(
      "[LLM Provider] Cerebras provider failed, falling back to OpenAI:",
      error,
    );
    return {
      specificationVersion: "1.0",
      provider: "openai",
      modelId: "gpt-4",
      defaultObjectGenerationMode: "text",
      generateText: async (params) => {
        console.log("[LLM Provider] Using OpenAI fallback for text generation");
        const response = await openaiProvider.chat.completions.create({
          model: "gpt-4",
          messages: [{ role: "user", content: params.prompt }],
          temperature: params.temperature,
          max_tokens: params.maxTokens,
        });
        return { text: response.choices?.[0]?.message?.content || "" };
      },
    };
  }
}
