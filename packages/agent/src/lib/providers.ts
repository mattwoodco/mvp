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
  defaultModel: "llama-4-scout-17b-16e-instruct",
  defaultParams: {
    temperature: 0.7,
    max_tokens: 2000,
  },
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
  generateText: (params: {
    prompt: string;
    temperature?: number;
    maxTokens?: number;
  }) => Promise<{ text: string }>;
}

export async function getLLMProvider(
  taskType: "reasoning" | "creative" | "general" | "code",
): Promise<LLMProvider> {
  try {
    if (!process.env.CEREBRAS_API_KEY) {
      console.warn("Cerebras API key not found, falling back to OpenAI");
      return {
        generateText: async (params) => {
          const response = await openaiProvider.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: params.prompt }],
            temperature: params.temperature,
            max_tokens: params.maxTokens,
          });
          return { text: response.choices[0].message.content || "" };
        },
      };
    }

    const model = getBestModelForTask(taskType);

    try {
      // List available models first
      const models = await cerebrasClient.models.list();
      console.log("Available Cerebras models:", models);

      // Test the Cerebras client
      await cerebrasClient.completions.create({
        model,
        prompt: "test",
        max_tokens: 1,
      });

      return {
        generateText: async (params) => {
          const response = await cerebrasClient.completions.create({
            model,
            prompt: params.prompt,
            temperature: params.temperature,
            max_tokens: params.maxTokens,
          });
          return { text: response.choices[0].text || "" };
        },
      };
    } catch (error) {
      console.error("Cerebras provider test failed:", error);
      throw error;
    }
  } catch (error) {
    console.error("Cerebras provider failed, falling back to OpenAI:", error);
    return {
      generateText: async (params) => {
        const response = await openaiProvider.chat.completions.create({
          model: "gpt-4",
          messages: [{ role: "user", content: params.prompt }],
          temperature: params.temperature,
          max_tokens: params.maxTokens,
        });
        return { text: response.choices[0].message.content || "" };
      },
    };
  }
}
