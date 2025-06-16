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

export type { HandleUploadBody, UploadOptions };
