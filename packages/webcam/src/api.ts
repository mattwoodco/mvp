import { upload } from "@mvp/storage";
import { generateVideoId, generateThumbnail } from "./utils";
import type { Video, VideoMetadata } from "./types";

export interface UploadVideoOptions {
  userId: string;
  videoBlob: Blob;
  metadata: VideoMetadata;
  generateThumbnail?: boolean;
  onProgress?: (progress: { loaded: number; total: number }) => void;
}

export async function uploadVideo({
  userId,
  videoBlob,
  metadata,
  generateThumbnail: shouldGenerateThumbnail = true,
  onProgress,
}: UploadVideoOptions): Promise<Video> {
  try {
    const videoId = generateVideoId();
    const videoFile = new File([videoBlob], `${videoId}.webm`, {
      type: videoBlob.type || "video/webm",
    });

    // Upload video
    const videoUrl = await upload(`videos/${userId}/${videoId}.webm`, videoFile, {
      onUploadProgress: onProgress,
    });

    if (!videoUrl) {
      throw new Error("Failed to upload video");
    }

    // Generate and upload thumbnail if requested
    let thumbnailUrl: string | null = null;
    if (shouldGenerateThumbnail) {
      const thumbnailBlob = await generateThumbnail(videoBlob);
      if (thumbnailBlob) {
        const thumbnailFile = new File([thumbnailBlob], `${videoId}_thumb.jpg`, {
          type: "image/jpeg",
        });
        thumbnailUrl = await upload(
          `videos/${userId}/thumbnails/${videoId}_thumb.jpg`,
          thumbnailFile
        );
      }
    }

    // Save video metadata to database
    const response = await fetch("/api/videos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: videoId,
        userId,
        title: metadata.title,
        description: metadata.description,
        url: videoUrl,
        thumbnailUrl,
        duration: Math.round(metadata.duration),
        fileSize: metadata.fileSize,
        mimeType: metadata.mimeType,
        width: metadata.width,
        height: metadata.height,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save video metadata");
    }

    const video: Video = await response.json();
    return video;
  } catch (error) {
    console.error("Error uploading video:", error);
    throw error;
  }
}

export async function getUserVideos(userId: string): Promise<Video[]> {
  try {
    const response = await fetch(`/api/videos?userId=${userId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch videos");
    }
    const videos: Video[] = await response.json();
    return videos;
  } catch (error) {
    console.error("Error fetching videos:", error);
    return [];
  }
}

export async function getVideo(videoId: string): Promise<Video | null> {
  try {
    const response = await fetch(`/api/videos/${videoId}`);
    if (!response.ok) {
      return null;
    }
    const video: Video = await response.json();
    return video;
  } catch (error) {
    console.error("Error fetching video:", error);
    return null;
  }
}

export async function deleteVideo(videoId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/videos/${videoId}`, {
      method: "DELETE",
    });
    return response.ok;
  } catch (error) {
    console.error("Error deleting video:", error);
    return false;
  }
}

export async function updateVideoMetadata(
  videoId: string,
  updates: Partial<Pick<Video, "title" | "description" | "isPublic">>
): Promise<Video | null> {
  try {
    const response = await fetch(`/api/videos/${videoId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      return null;
    }

    const video: Video = await response.json();
    return video;
  } catch (error) {
    console.error("Error updating video:", error);
    return null;
  }
}

export async function incrementVideoViews(videoId: string): Promise<void> {
  try {
    await fetch(`/api/videos/${videoId}/views`, {
      method: "POST",
    });
  } catch (error) {
    console.error("Error incrementing video views:", error);
  }
}