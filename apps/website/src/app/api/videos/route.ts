import { auth } from "@mvp/auth";
import { db, video, eq, desc } from "@mvp/database";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    // If userId is provided and matches the current user, return their videos
    if (userId && userId === session.user.id) {
      const videos = await db
        .select()
        .from(video)
        .where(eq(video.userId, userId))
        .orderBy(desc(video.createdAt));

      return Response.json(videos);
    }

    // Otherwise return public videos
    const videos = await db
      .select()
      .from(video)
      .where(eq(video.isPublic, true))
      .orderBy(desc(video.createdAt))
      .limit(50);

    return Response.json(videos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      title,
      description,
      url,
      thumbnailUrl,
      duration,
      fileSize,
      mimeType,
      width,
      height,
    } = body;

    // Validate required fields
    if (!id || !title || !url) {
      return new Response("Missing required fields", { status: 400 });
    }

    // Create video record
    const [newVideo] = await db
      .insert(video)
      .values({
        id,
        userId: session.user.id,
        title,
        description,
        url,
        thumbnailUrl,
        duration,
        fileSize,
        mimeType,
        width,
        height,
        isPublic: false,
        viewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return Response.json(newVideo);
  } catch (error) {
    console.error("Error creating video:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}