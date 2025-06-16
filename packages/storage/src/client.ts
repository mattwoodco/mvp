"use client";

import {
  type HandleUploadBody,
  type UploadOptions,
  handleUpload as vercelHandleUpload,
  upload as vercelUpload,
} from "@vercel/blob/client";
import { uploadBrowser } from "./minio-browser";
import { createPath, isLocalEnv } from "./utils";

export async function upload(
  filename: string,
  file: File,
  options?: Partial<UploadOptions>,
): Promise<string | null> {
  if (isLocalEnv()) {
    return await uploadBrowser(filename, file);
  }

  const blob = await vercelUpload(createPath(filename), file, {
    access: "public",
    handleUploadUrl: "/api/handle-upload",
    ...options,
  });
  return blob.url;
}

export async function handleUpload(body: HandleUploadBody, request: Request) {
  return vercelHandleUpload({
    body,
    request,
    onBeforeGenerateToken: async () => ({
      allowedContentTypes: [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "application/pdf",
        "text/plain",
        "video/mp4",
        "video/quicktime",
        "video/x-msvideo",
        "audio/mpeg",
        "audio/wav",
        "application/zip",
        "application/x-rar-compressed",
        "*/*",
      ],
      addRandomSuffix: true,
      tokenPayload: JSON.stringify({ uploadedAt: new Date().toISOString() }),
    }),
    onUploadCompleted: async ({ blob, tokenPayload }) => {
      console.log("📁 Upload completed:", blob.url);
      if (tokenPayload) {
        try {
          const metadata = JSON.parse(tokenPayload);
          console.log("📊 Metadata:", metadata);
        } catch (error) {
          console.error("Failed to parse metadata:", error);
        }
      }
    },
  });
}

export async function uploadLargeFile(
  filename: string,
  file: File,
  options?: {
    chunkSize?: number;
    maxConcurrentChunks?: number;
    onProgress?: (progress: {
      loaded: number;
      total: number;
      percentage: number;
    }) => void;
    abortSignal?: AbortSignal;
  },
): Promise<string | null> {
  if (!isLocalEnv()) {
    // Production: Use Vercel Blob's native upload with progress tracking
    return await vercelUpload(createPath(filename), file, {
      access: "public",
      handleUploadUrl: "/api/handle-upload",
    }).then((blob) => blob.url);
  }

  // Local: Use manual chunking for MinIO
  const chunkSize = options?.chunkSize || 10 * 1024 * 1024; // 10MB default
  const maxConcurrentChunks = options?.maxConcurrentChunks || 3; // 3 parallel uploads default
  const totalChunks = Math.ceil(file.size / chunkSize);

  let uploadedBytes = 0;
  const updateProgress = () => {
    if (options?.onProgress) {
      options.onProgress({
        loaded: uploadedBytes,
        total: file.size,
        percentage: Math.round((uploadedBytes / file.size) * 100),
      });
    }
  };

  try {
    // Initialize multipart upload
    const initResponse = await fetch("/api/large-upload/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename,
        contentType: file.type,
      }),
    });

    if (!initResponse.ok) {
      throw new Error(`Init failed: ${await initResponse.text()}`);
    }

    const { uploadId, key } = (await initResponse.json()) as {
      uploadId: string;
      key: string;
    };
    const uploadedParts: { partNumber: number; etag: string }[] = [];

    // Create chunks info
    const chunksToUpload = Array.from({ length: totalChunks }, (_, i) => ({
      index: i,
      partNumber: i + 1,
      start: i * chunkSize,
      end: Math.min((i + 1) * chunkSize, file.size),
    }));

    // Upload chunks with controlled concurrency
    const activeUploads = new Set<Promise<void>>();
    const chunkQueue = [...chunksToUpload];
    let hasError = false;

    const uploadChunk = async (chunkInfo: (typeof chunksToUpload)[0]) => {
      if (options?.abortSignal?.aborted || hasError) return;

      console.log(
        `🚀 Starting upload of chunk ${chunkInfo.partNumber}/${totalChunks}`,
      );
      const startTime = Date.now();

      try {
        const chunk = file.slice(chunkInfo.start, chunkInfo.end);
        const formData = new FormData();
        formData.append("uploadId", uploadId);
        formData.append("key", key);
        formData.append("partNumber", chunkInfo.partNumber.toString());
        formData.append("chunk", chunk);
        formData.append(
          "isLastPart",
          (chunkInfo.index === totalChunks - 1).toString(),
        );

        const chunkResponse = await fetch("/api/large-upload/chunk", {
          method: "POST",
          body: formData,
        });

        if (!chunkResponse.ok) {
          throw new Error(`Chunk upload failed: ${await chunkResponse.text()}`);
        }

        const result = (await chunkResponse.json()) as {
          partNumber: number;
          etag: string;
        };

        const endTime = Date.now();
        console.log(
          `✅ Completed chunk ${chunkInfo.partNumber} in ${endTime - startTime}ms`,
        );

        uploadedParts.push(result);
        uploadedBytes += chunk.size;
        updateProgress();
      } catch (error) {
        console.error(`❌ Failed chunk ${chunkInfo.partNumber}:`, error);
        hasError = true;
        throw error;
      }
    };

    // Process uploads with concurrency control
    console.log(
      `📊 Starting parallel upload with ${maxConcurrentChunks} concurrent chunks`,
    );
    while (chunkQueue.length > 0 || activeUploads.size > 0) {
      if (options?.abortSignal?.aborted) {
        await abortUpload(uploadId, key);
        throw new Error("Upload aborted");
      }

      if (hasError) {
        await abortUpload(uploadId, key);
        throw new Error("Upload failed");
      }

      // Start new uploads up to the concurrency limit
      while (
        activeUploads.size < maxConcurrentChunks &&
        chunkQueue.length > 0
      ) {
        const chunkInfo = chunkQueue.shift()!;
        console.log(
          `🔄 Starting chunk ${chunkInfo.partNumber}, active uploads: ${activeUploads.size + 1}/${maxConcurrentChunks}`,
        );
        const uploadPromise = uploadChunk(chunkInfo).finally(() => {
          console.log(
            `🏁 Chunk ${chunkInfo.partNumber} finished, active uploads: ${activeUploads.size - 1}/${maxConcurrentChunks}`,
          );
          activeUploads.delete(uploadPromise);
        });
        activeUploads.add(uploadPromise);
      }

      // Wait for at least one upload to complete
      if (activeUploads.size > 0) {
        console.log(
          `⏳ Waiting for one of ${activeUploads.size} active uploads to complete...`,
        );
        await Promise.race(activeUploads);
      }
    }

    // Sort parts by part number before completing
    uploadedParts.sort((a, b) => a.partNumber - b.partNumber);
    console.log(`🎉 All ${totalChunks} chunks uploaded successfully!`);

    // Complete multipart upload
    const completeResponse = await fetch("/api/large-upload/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uploadId,
        key,
        parts: uploadedParts,
      }),
    });

    if (!completeResponse.ok) {
      await abortUpload(uploadId, key);
      throw new Error(`Complete failed: ${await completeResponse.text()}`);
    }

    const { url } = (await completeResponse.json()) as { url: string };
    return url;
  } catch (error) {
    console.error("Large file upload failed:", error);
    throw error;
  }
}

async function abortUpload(uploadId: string, key: string) {
  try {
    await fetch("/api/large-upload/abort", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uploadId, key }),
    });
  } catch (error) {
    console.error("Failed to abort upload:", error);
  }
}

export type { HandleUploadBody, UploadOptions };
