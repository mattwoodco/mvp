import { generateVoice } from "@mvp/ai/providers/elevenlabs";
import type { AudioGenerationFormData } from "@mvp/workflow-generation";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const data: AudioGenerationFormData = await request.json();

    if (data.type === "voice") {
      // Generate voice using ElevenLabs
      const result = await generateVoice(data.text, {
        voice: data.voice,
        stability: data.stability,
        similarity_boost: data.similarity_boost,
      });

      return NextResponse.json({
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
      });
    } else {
      return NextResponse.json(
        { error: "Music generation is not yet implemented" },
        { status: 501 }
      );
    }
  } catch (error) {
    console.error("Failed to generate audio:", error);
    return NextResponse.json(
      { error: "Failed to generate audio" },
      { status: 500 }
    );
  }
}