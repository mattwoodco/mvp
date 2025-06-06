export {
  createDataStreamResponse,
  generateObject,
  generateText,
  streamObject,
  streamText,
  tool,
} from "ai";

export type {
  CoreMessage,
  CoreTool,
  GenerateObjectResult,
  GenerateTextResult,
  Message,
  StreamObjectResult,
  StreamTextResult,
} from "ai";

export { createGoogleGenerativeAI, google } from "@ai-sdk/google";
export { createMistral, mistral } from "@ai-sdk/mistral";
export { createOpenAI, openai } from "@ai-sdk/openai";

// Re-export provider configurations
export * from "./providers/index";
export * from "./types";
export * from "./utils";
