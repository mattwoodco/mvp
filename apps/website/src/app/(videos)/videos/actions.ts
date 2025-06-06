"use server";

import { generateVideo as falGenerateVideo } from "@mvp/ai/providers/fal";
import type {
  VideoGenerationFormData,
  VideoGenerationResult,
} from "@mvp/workflow-generation";

export async function generateVideo(
  data: VideoGenerationFormData,
): Promise<VideoGenerationResult> {
  try {
    // Build the prompt with optional details
    let prompt = data.prompt;

    if (data.style) {
      prompt += `\n\nStyle: ${data.style}`;
    }

    if (data.cameraMotion) {
      prompt += `\n\nCamera motion: ${data.cameraMotion}`;
    }

    if (data.composition) {
      prompt += `\n\nComposition: ${data.composition}`;
    }

    if (data.ambiance) {
      prompt += `\n\nAmbiance: ${data.ambiance}`;
    }

    // Generate video using fal.ai
    const result = await falGenerateVideo(prompt, {
      aspectRatio: data.aspectRatio,
      duration: data.duration,
    });

    // Transform the result to match our interface
    return {
      id: `video-${Date.now()}`,
      video: result.data.video,
      metadata: {
        prompt: data.prompt,
        aspectRatio: data.aspectRatio,
        duration: data.duration,
        generatedAt: new Date(),
      },
    };
  } catch (error) {
    console.error("Failed to generate video:", error);
    throw new Error("Failed to generate video. Please try again.");
  }
}
