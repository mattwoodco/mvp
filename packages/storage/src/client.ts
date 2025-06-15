import {
  del,
  head,
  copy as vercelCopy,
  list as vercelList,
  put as vercelPut,
} from "@vercel/blob";
import {
  type HandleUploadBody,
  type UploadOptions,
  handleUpload as vercelHandleUpload,
  upload as vercelUpload,
} from "@vercel/blob/client";
import { uploadBrowser } from "./minio-browser";

declare const window: Window & typeof globalThis;

const token = process.env.BLOB_READ_WRITE_TOKEN;

function isLocalEnv(): boolean {
  return (
    process.env.NEXT_PUBLIC_APP_ENV === "local" &&
    process.env.NEXT_PUBLIC_USE_MINIO === "true"
  );
}

function checkToken() {
  if (!isLocalEnv() && !token) {
    throw new Error("Missing BLOB_READ_WRITE_TOKEN for production storage");
  }
}

function createPath(filename: string) {
  return `storage/${filename}`;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/**
 * Upload file from server (Node.js Buffer/Blob/Stream)
 * @example await put("avatar.jpg", buffer)
 */
export async function put(
  filename: string,
  data: Blob | Buffer | ReadableStream,
): Promise<string | null> {
  if (isLocalEnv()) {
    throw new Error(
      "Server-side put() with minio not available in browser build. Use upload() instead.",
    );
  }

  checkToken();
  const blob = await vercelPut(createPath(filename), data, {
    access: "public",
    token,
    addRandomSuffix: true,
  });
  return blob.url;
}

/**
 * Upload file from client (browser File object)
 * @example await upload("photo.jpg", fileInput.files[0])
 */
export async function upload(
  filename: string,
  file: File,
  options?: Partial<UploadOptions>,
): Promise<string | null> {
  console.log("Storage upload debugging:");
  console.log("  - NEXT_PUBLIC_APP_ENV:", process.env.NEXT_PUBLIC_APP_ENV);
  console.log("  - isLocalEnv():", isLocalEnv());
  console.log("  - isBrowser():", isBrowser());

  if (isLocalEnv()) {
    console.log("Using minio browser upload");
    return await uploadBrowser(filename, file);
  }

  console.log("Using vercel upload");
  const blob = await vercelUpload(createPath(filename), file, {
    access: "public",
    handleUploadUrl: "/api/handle-upload",
    ...options,
  });
  return blob.url;
}

/**
 * Handle upload requests in API routes
 * @example return NextResponse.json(await handleUpload(body, request))
 */
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

/**
 * Delete a file
 * @example await remove("old-avatar.jpg")
 */
export async function remove(filename: string): Promise<boolean> {
  if (isLocalEnv()) {
    throw new Error(
      "Server-side remove() with minio not available in browser build.",
    );
  }

  checkToken();
  try {
    await del(createPath(filename), { token });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if file exists
 * @example if (await exists("avatar.jpg")) { ... }
 */
export async function exists(filename: string): Promise<boolean> {
  if (isLocalEnv()) {
    throw new Error(
      "Server-side exists() with minio not available in browser build.",
    );
  }

  checkToken();
  try {
    await head(createPath(filename), { token });
    return true;
  } catch {
    return false;
  }
}

/**
 * List files with optional prefix
 * @example await list("avatars/") // ["user1.jpg", "user2.png"]
 */
export async function list(prefix = ""): Promise<string[]> {
  if (isLocalEnv()) {
    throw new Error(
      "Server-side list() with minio not available in browser build.",
    );
  }

  checkToken();
  const { blobs } = await vercelList({
    prefix: `storage/${prefix}`,
    token,
  });
  return blobs.map((blob: any) => blob.pathname.replace("storage/", ""));
}

/**
 * Copy a file to new location
 * @example await copy("temp.jpg", "permanent.jpg")
 */
export async function copy(from: string, to: string): Promise<string | null> {
  if (isLocalEnv()) {
    throw new Error(
      "Server-side copy() with minio not available in browser build.",
    );
  }

  checkToken();
  const blob = await vercelCopy(createPath(from), createPath(to), {
    access: "public",
    token,
  });
  return blob.url;
}

// Aliases for backwards compatibility
export const deleteFile = remove;
export const listFiles = list;
export const copyFile = copy;
