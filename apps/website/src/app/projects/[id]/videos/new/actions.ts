"use server";

import { createVideo, updateVideo } from "@mvp/database";
import { revalidatePath } from "next/cache";

interface CreateVideoData {
  projectId: string;
  title: string;
  description?: string;
  originalUrl?: string;
  uploadedBy: string;
}

export async function createVideoAction(data: CreateVideoData) {
  try {
    const video = await createVideo(data);
    revalidatePath(`/projects/${data.projectId}`);
    return video;
  } catch (error) {
    console.error("Failed to create video:", error);
    throw new Error("Failed to create video");
  }
}

export async function transcodeVideoAction(
  videoId: string,
  originalUrl: string,
) {
  try {
    await updateVideo(videoId, { status: "processing" });
    revalidatePath("/projects");

    const transcodeResponse = await fetch(
      `${process.env.TRANSCODER_URL || "http://localhost:8080"}/transcode`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: videoId,
          fileUrl: originalUrl,
        }),
      },
    );

    if (!transcodeResponse.ok) {
      throw new Error(
        `Transcoding service error: ${transcodeResponse.statusText}`,
      );
    }

    const result = await transcodeResponse.json();

    if (result.success) {
      await updateVideo(videoId, {
        status: "ready",
        transcodedUrl: result.optimizedFile,
      });
      revalidatePath("/projects");

      return {
        success: true,
        transcodedUrl: result.optimizedFile,
      };
    }

    await updateVideo(videoId, {
      status: "error",
      errorMessage: result.error || "Transcoding failed",
    });
    revalidatePath("/projects");

    return {
      success: false,
      error: result.error || "Transcoding failed",
    };
  } catch (error) {
    console.error("Transcoding failed:", error);

    await updateVideo(videoId, {
      status: "error",
      errorMessage:
        error instanceof Error ? error.message : "Transcoding failed",
    });
    revalidatePath("/projects");

    return {
      success: false,
      error: error instanceof Error ? error.message : "Transcoding failed",
    };
  }
}
