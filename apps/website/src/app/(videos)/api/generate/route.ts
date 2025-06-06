import { NextRequest, NextResponse } from 'next/server';
import { generateVideo as falGenerateVideo } from '@repo/ai/providers/fal';
import type { VideoGenerationFormData } from '@repo/workflow-generation';

export async function POST(request: NextRequest) {
  try {
    const data: VideoGenerationFormData = await request.json();
    
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

    // Return the result
    return NextResponse.json({
      id: `video-${Date.now()}`,
      video: result.data.video,
      metadata: {
        prompt: data.prompt,
        aspectRatio: data.aspectRatio,
        duration: data.duration,
        generatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Failed to generate video:', error);
    return NextResponse.json(
      { error: 'Failed to generate video' },
      { status: 500 }
    );
  }
}