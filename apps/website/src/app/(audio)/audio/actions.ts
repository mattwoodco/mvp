"use server";

import { generateVoice } from "@mvp/ai/providers/elevenlabs";
import type {
  AudioGenerationFormData,
  AudioGenerationResult,
} from "@mvp/workflow-generation";

export async function generateAudio(
  data: AudioGenerationFormData,
): Promise<AudioGenerationResult> {
  try {
    if (data.type === "voice") {
      // Generate voice using ElevenLabs
      const result = await generateVoice(data.text, {
        voice: data.voice,
        stability: data.stability,
        similarity_boost: data.similarity_boost,
      });

      return {
        id: `audio-${Date.now()}`,
        audio: {
          base64: result.audio_base64,
          content_type: result.contentType,
        },
        metadata: {
          text: data.text,
          type: "voice",
          voice: data.voice,
          generatedAt: new Date(),
        },
      };
    } else {
      // For music generation, we would integrate with Riffusion or another music API
      // For now, throw an error indicating it's not yet implemented
      throw new Error("Music generation is not yet implemented. Please choose voice generation.");
    }
  } catch (error) {
    console.error("Failed to generate audio:", error);
    throw new Error("Failed to generate audio. Please try again.");
  }
}