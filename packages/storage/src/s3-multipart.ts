import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CopyObjectCommand,
  CreateMultipartUploadCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { put as vercelPut } from "@vercel/blob";
import { createPath, isLocalEnv } from "./utils";

const BUCKET = process.env.MINIO_BUCKET_NAME || "storage";

// Create S3 client for local MinIO
function createS3Client() {
  if (!isLocalEnv()) {
    throw new Error("S3 client should only be used in local environment");
  }

  return new S3Client({
    endpoint: process.env.MINIO_ENDPOINT || "http://localhost:9000",
    region: process.env.MINIO_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.MINIO_ACCESS_KEY || "minioadmin",
      secretAccessKey: process.env.MINIO_SECRET_KEY || "minioadmin",
    },
    forcePathStyle: true,
  });
}

let s3Client: S3Client | null = null;

function getS3Client() {
  if (!s3Client) {
    s3Client = createS3Client();
  }
  return s3Client;
}

// Ensure bucket exists
async function ensureBucket() {
  if (!isLocalEnv()) return;

  try {
    const client = getS3Client();
    await client.send(new HeadObjectCommand({ Bucket: BUCKET, Key: ".test" }));
  } catch (error) {
    // Bucket doesn't exist or we can't access it
    // MinIO will auto-create buckets, so this is fine
  }
}

export async function putS3(
  filename: string,
  data: Blob | Buffer | ReadableStream,
): Promise<string | null> {
  if (isLocalEnv()) {
    await ensureBucket();
    const client = getS3Client();
    const key = createPath(filename);

    await client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: data as Buffer,
        ContentType: data instanceof Blob ? data.type : undefined,
      }),
    );

    return `http://localhost:9000/${BUCKET}/${key}`;
  }

  // Production: Use Vercel Blob
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("BLOB_READ_WRITE_TOKEN is required for production uploads");
  }

  const blob = await vercelPut(createPath(filename), data, {
    access: "public",
    token,
    addRandomSuffix: true,
  });
  return blob.url;
}

export async function removeS3(filename: string): Promise<boolean> {
  if (isLocalEnv()) {
    try {
      const client = getS3Client();
      await client.send(
        new DeleteObjectCommand({
          Bucket: BUCKET,
          Key: createPath(filename),
        }),
      );
      return true;
    } catch {
      return false;
    }
  }

  // Production: Use Vercel Blob
  const { del } = await import("@vercel/blob");
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("BLOB_READ_WRITE_TOKEN is required");
  }

  try {
    await del(createPath(filename), { token });
    return true;
  } catch {
    return false;
  }
}

export async function existsS3(filename: string): Promise<boolean> {
  if (isLocalEnv()) {
    try {
      const client = getS3Client();
      await client.send(
        new HeadObjectCommand({
          Bucket: BUCKET,
          Key: createPath(filename),
        }),
      );
      return true;
    } catch {
      return false;
    }
  }

  // Production: Use Vercel Blob
  const { head } = await import("@vercel/blob");
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("BLOB_READ_WRITE_TOKEN is required");
  }

  try {
    await head(createPath(filename), { token });
    return true;
  } catch {
    return false;
  }
}

export async function listS3(prefix = ""): Promise<string[]> {
  if (isLocalEnv()) {
    const client = getS3Client();
    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: `storage/${prefix}`,
      }),
    );

    return (response.Contents || [])
      .map((obj: { Key?: string }) => obj.Key)
      .filter((key: string | undefined): key is string => !!key)
      .map((key: string) => key.replace("storage/", ""));
  }

  // Production: Use Vercel Blob
  const { list } = await import("@vercel/blob");
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("BLOB_READ_WRITE_TOKEN is required");
  }

  const { blobs } = await list({
    prefix: `storage/${prefix}`,
    token,
  });
  return blobs.map((blob: any) => blob.pathname.replace("storage/", ""));
}

export async function copyS3(from: string, to: string): Promise<string | null> {
  if (isLocalEnv()) {
    const client = getS3Client();
    const fromKey = createPath(from);
    const toKey = createPath(to);

    await client.send(
      new CopyObjectCommand({
        Bucket: BUCKET,
        CopySource: `${BUCKET}/${fromKey}`,
        Key: toKey,
      }),
    );

    return `http://localhost:9000/${BUCKET}/${toKey}`;
  }

  // Production: Use Vercel Blob
  const { copy } = await import("@vercel/blob");
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("BLOB_READ_WRITE_TOKEN is required");
  }

  const blob = await copy(createPath(from), createPath(to), {
    access: "public",
    token,
  });
  return blob.url;
}

// Multipart upload functions
export async function initializeMultipartUploadS3(
  filename: string,
  contentType: string,
): Promise<{ uploadId: string; key: string }> {
  if (isLocalEnv()) {
    await ensureBucket();
    const client = getS3Client();
    const key = createPath(filename);

    const response = await client.send(
      new CreateMultipartUploadCommand({
        Bucket: BUCKET,
        Key: key,
        ContentType: contentType,
      }),
    );

    if (!response.UploadId) {
      throw new Error("Failed to initialize multipart upload");
    }

    return { uploadId: response.UploadId, key };
  }

  // Production: For Vercel Blob, we don't need to initialize
  // The put() method handles chunking automatically
  const key = createPath(filename);
  return { uploadId: `vercel-${Date.now()}`, key };
}

export async function uploadChunkS3(
  uploadId: string,
  key: string,
  partNumber: number,
  chunk: Buffer,
): Promise<{ partNumber: number; etag: string }> {
  if (isLocalEnv()) {
    const client = getS3Client();

    const response = await client.send(
      new UploadPartCommand({
        Bucket: BUCKET,
        Key: key,
        UploadId: uploadId,
        PartNumber: partNumber,
        Body: chunk,
      }),
    );

    if (!response.ETag) {
      throw new Error(`No ETag returned for part ${partNumber}`);
    }

    return { partNumber, etag: response.ETag };
  }

  // Production: Store chunks temporarily for final assembly
  // This is a fallback since Vercel Blob handles chunking automatically
  const tempKey = `temp-multipart/${uploadId}/${partNumber}`;
  await putS3(tempKey, chunk);

  // Generate a temporary etag
  const etag = `"${Date.now()}-${partNumber}"`;
  return { partNumber, etag };
}

export async function completeMultipartUploadS3(
  uploadId: string,
  key: string,
  parts: { partNumber: number; etag: string }[],
): Promise<string> {
  if (isLocalEnv()) {
    const client = getS3Client();

    const response = await client.send(
      new CompleteMultipartUploadCommand({
        Bucket: BUCKET,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: parts.map((part) => ({
            PartNumber: part.partNumber,
            ETag: part.etag,
          })),
        },
      }),
    );

    return response.Location || `http://localhost:9000/${BUCKET}/${key}`;
  }

  // Production: This won't be called since we use Vercel Blob's put() directly
  throw new Error(
    "Complete multipart upload should not be called in production",
  );
}

export async function abortMultipartUploadS3(
  uploadId: string,
  key: string,
): Promise<void> {
  if (isLocalEnv()) {
    const client = getS3Client();

    await client.send(
      new AbortMultipartUploadCommand({
        Bucket: BUCKET,
        Key: key,
        UploadId: uploadId,
      }),
    );
    return;
  }

  // Production: Clean up any temporary chunks
  try {
    const tempPrefix = `temp-multipart/${uploadId}/`;
    const tempFiles = await listS3(tempPrefix);
    await Promise.all(tempFiles.map((file) => removeS3(file)));
  } catch (error) {
    console.error("Failed to clean up temporary files:", error);
  }
}
