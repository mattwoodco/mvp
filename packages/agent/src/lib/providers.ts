import { openai } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import Cerebras from "@cerebras/cerebras_cloud_sdk";

// OpenAI provider - create provider instance
export const openaiProvider = openai({
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
  CEREBRAS_DEEPSEEK_R1: "deepseek-r1-distill-llama-70b",

  // OpenAI models - for comparison and fallback
  OPENAI_GPT_4O: "gpt-4o",
  OPENAI_GPT_4O_MINI: "gpt-4o-mini",
} as const;

// Model performance characteristics
export const MODEL_CHARACTERISTICS = {
  [MODELS.CEREBRAS_LLAMA_4_SCOUT]: {
    speed: 2600, // tokens/s
    parameters: "109B",
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
  [MODELS.CEREBRAS_DEEPSEEK_R1]: {
    speed: 1700,
    parameters: "70B",
    strengths: ["advanced reasoning", "mathematics", "coding"],
    maxTokens: 8192,
  },
} as const;

// Get the best model for a given task type
export function getBestModelForTask(
  taskType: "reasoning" | "creative" | "general" | "code",
): string {
  switch (taskType) {
    case "reasoning":
      return MODELS.CEREBRAS_DEEPSEEK_R1;
    case "creative":
      return MODELS.CEREBRAS_LLAMA_4_SCOUT;
    case "code":
      return MODELS.CEREBRAS_LLAMA_3_3_70B;
    default:
      return MODELS.CEREBRAS_LLAMA_4_SCOUT;
  }
}
