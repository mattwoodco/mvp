import { db, video, eq, sql } from "@mvp/database";
import { NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { videoId: string } }
) {
  try {
    const { videoId } = params;

    // Increment view count
    const [updatedVideo] = await db
      .update(video)
      .set({
        viewCount: sql`${video.viewCount} + 1`,
      })
      .where(eq(video.id, videoId))
      .returning();

    if (!updatedVideo) {
      return new Response("Video not found", { status: 404 });
    }

    return Response.json({ viewCount: updatedVideo.viewCount });
  } catch (error) {
    console.error("Error incrementing video views:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}