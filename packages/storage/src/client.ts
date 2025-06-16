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

    // Upload chunks
    for (let i = 0; i < totalChunks; i++) {
      if (options?.abortSignal?.aborted) {
        await abortUpload(uploadId, key);
        throw new Error("Upload aborted");
      }

      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);
      const partNumber = i + 1;

      const formData = new FormData();
      formData.append("uploadId", uploadId);
      formData.append("key", key);
      formData.append("partNumber", partNumber.toString());
      formData.append("chunk", chunk);
      formData.append("isLastPart", (i === totalChunks - 1).toString());

      const chunkResponse = await fetch("/api/large-upload/chunk", {
        method: "POST",
        body: formData,
      });

      if (!chunkResponse.ok) {
        await abortUpload(uploadId, key);
        throw new Error(`Chunk upload failed: ${await chunkResponse.text()}`);
      }

      const result = (await chunkResponse.json()) as {
        partNumber: number;
        etag: string;
      };
      uploadedParts.push(result);
      uploadedBytes += chunk.size;
      updateProgress();
    }

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
