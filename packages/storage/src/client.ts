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

const isEnabled = process.env.APP_ENV !== "local";
const token = process.env.BLOB_READ_WRITE_TOKEN;

function checkToken() {
  if (isEnabled && !token) {
    throw new Error("Missing BLOB_READ_WRITE_TOKEN for production storage");
  }
}

function createPath(filename: string) {
  return `storage/${filename}`;
}

/**
 * Upload file from server (Node.js Buffer/Blob/Stream)
 * @example await put("avatar.jpg", buffer)
 */
export async function put(
  filename: string,
  data: Blob | Buffer | ReadableStream,
): Promise<string | null> {
  checkToken();
  if (!isEnabled) return null;

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
  if (!isEnabled) return null;

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
  checkToken();
  if (!isEnabled) return false;

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
  checkToken();
  if (!isEnabled) return false;

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
  checkToken();
  if (!isEnabled) return [];

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
  checkToken();
  if (!isEnabled) return null;

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
