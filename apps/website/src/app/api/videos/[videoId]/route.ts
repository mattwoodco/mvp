import { auth } from "@mvp/auth";
import { db, video, eq } from "@mvp/database";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { videoId: string } }
) {
  try {
    const { videoId } = params;

    const [foundVideo] = await db
      .select()
      .from(video)
      .where(eq(video.id, videoId))
      .limit(1);

    if (!foundVideo) {
      return new Response("Video not found", { status: 404 });
    }

    // Check if video is public or belongs to current user
    const session = await auth();
    if (!foundVideo.isPublic && foundVideo.userId !== session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    return Response.json(foundVideo);
  } catch (error) {
    console.error("Error fetching video:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { videoId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { videoId } = params;
    const body = await request.json();

    // Check if video belongs to current user
    const [existingVideo] = await db
      .select()
      .from(video)
      .where(eq(video.id, videoId))
      .limit(1);

    if (!existingVideo) {
      return new Response("Video not found", { status: 404 });
    }

    if (existingVideo.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Update only allowed fields
    const updates: any = {
      updatedAt: new Date(),
    };

    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.isPublic !== undefined) updates.isPublic = body.isPublic;

    const [updatedVideo] = await db
      .update(video)
      .set(updates)
      .where(eq(video.id, videoId))
      .returning();

    return Response.json(updatedVideo);
  } catch (error) {
    console.error("Error updating video:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { videoId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { videoId } = params;

    // Check if video belongs to current user
    const [existingVideo] = await db
      .select()
      .from(video)
      .where(eq(video.id, videoId))
      .limit(1);

    if (!existingVideo) {
      return new Response("Video not found", { status: 404 });
    }

    if (existingVideo.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Delete video record
    await db.delete(video).where(eq(video.id, videoId));

    // TODO: Also delete the actual video and thumbnail files from storage

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting video:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}