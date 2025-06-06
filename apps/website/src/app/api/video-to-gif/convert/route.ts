import { NextRequest, NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk/v3";
import type { videoToGif } from "@repo/tasks";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoUrl } = body;

    if (!videoUrl) {
      return NextResponse.json(
        { error: "Video URL is required" },
        { status: 400 }
      );
    }

    // Generate a unique session ID for tracking
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // For demo purposes, using a placeholder user ID
    // In production, get this from your auth system
    const userId = "demo_user";

    // Trigger the video-to-gif task
    const handle = await tasks.trigger<typeof videoToGif>(
      "video-to-gif",
      {
        videoUrl,
        userId,
        sessionId,
      }
    );

    return NextResponse.json({
      runId: handle.id,
      publicAccessToken: handle.publicAccessToken,
    });
  } catch (error) {
    console.error("Error triggering task:", error);
    return NextResponse.json(
      { error: "Failed to start conversion task" },
      { status: 500 }
    );
  }
}