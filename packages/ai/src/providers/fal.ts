import { fal } from "@fal-ai/client";
import type { AIProviderConfig } from "../types";

export function createFalProvider(config?: AIProviderConfig) {
  const apiKey = process.env.FAL_API_KEY;

  if (!apiKey) {
    throw new Error(
      "FAL_API_KEY is required. Set FAL_API_KEY environment variable.",
    );
  }

  fal.config({
    credentials: apiKey,
  });

  return fal;
}

export async function generateVideo(
  prompt: string,
  options?: {
    aspectRatio?: "16:9" | "9:16";
    duration?: "8s";
  },
) {
  const apiKey = process.env.FAL_API_KEY;

  if (!apiKey) {
    throw new Error("FAL_API_KEY is required for video generation");
  }

  fal.config({
    credentials: apiKey,
  });

  const result = await fal.subscribe("fal-ai/veo3", {
    input: {
      prompt,
      aspect_ratio: options?.aspectRatio || "16:9",
      duration: options?.duration || "8s",
    },
  });

  return result;
}
