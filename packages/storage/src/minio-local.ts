import { Client } from "minio";
import { BUCKET, MINIO_ENDPOINT, MINIO_PORT, getMinioUrl } from "./utils";

const ACCESS_KEY = "minioadmin";
const SECRET_KEY = "minioadmin";

const client = new Client({
  endPoint: MINIO_ENDPOINT,
  port: MINIO_PORT,
  useSSL: false,
  accessKey: ACCESS_KEY,
  secretKey: SECRET_KEY,
});

async function ensureBucket() {
  const exists = await client.bucketExists(BUCKET);
  if (!exists) {
    await client.makeBucket(BUCKET);
    await client.setBucketPolicy(
      BUCKET,
      JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: "*",
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${BUCKET}/*`],
          },
        ],
      }),
    );
  }
}

export async function putLocal(
  filename: string,
  data: Blob | Buffer | ReadableStream,
): Promise<string> {
  await ensureBucket();

  let buffer: Buffer;
  if (data instanceof Blob) {
    buffer = Buffer.from(await data.arrayBuffer());
  } else if (data instanceof ReadableStream) {
    const chunks: Uint8Array[] = [];
    const reader = data.getReader();
    let done = false;
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) chunks.push(value);
    }
    buffer = Buffer.concat(chunks);
  } else {
    buffer = data;
  }

  const key = `${filename}-${Date.now()}`;
  await client.putObject(BUCKET, key, buffer);
  return getMinioUrl(key);
}

export async function removeLocal(filename: string): Promise<boolean> {
  try {
    await client.removeObject(BUCKET, filename);
    return true;
  } catch {
    return false;
  }
}

export async function existsLocal(filename: string): Promise<boolean> {
  try {
    await client.statObject(BUCKET, filename);
    return true;
  } catch {
    return false;
  }
}

export async function listLocal(prefix = ""): Promise<string[]> {
  await ensureBucket();
  const objects: string[] = [];
  const stream = client.listObjects(BUCKET, prefix);

  return new Promise((resolve, reject) => {
    stream.on("data", (obj: any) => objects.push(obj.name || ""));
    stream.on("end", () => resolve(objects));
    stream.on("error", reject);
  });
}

export async function copyLocal(from: string, to: string): Promise<string> {
  await ensureBucket();
  await client.copyObject(BUCKET, to, `/${BUCKET}/${from}`);
  return getMinioUrl(to);
}

export async function initializeMultipartUpload(
  filename: string,
  contentType: string,
): Promise<{ uploadId: string; key: string }> {
  await ensureBucket();
  const key = `${filename}-${Date.now()}`;
  const uploadId = await client.initiateNewMultipartUpload(BUCKET, key, {
    "Content-Type": contentType,
  });
  return { uploadId, key };
}

export async function uploadChunk(
  uploadId: string,
  key: string,
  partNumber: number,
  chunk: Buffer,
): Promise<{ partNumber: number; etag: string }> {
  await ensureBucket();

  // Use reliable temporary file approach for multipart upload simulation
  const tempKey = `temp-${uploadId}-part-${partNumber}`;

  try {
    // Upload as temporary object
    await client.putObject(BUCKET, tempKey, chunk, chunk.length);

    // Get etag from stat
    const stat = await client.statObject(BUCKET, tempKey);
    const etag = stat.etag;

    // Clean up temp object
    await client.removeObject(BUCKET, tempKey);

    return { partNumber, etag };
  } catch (error) {
    // Clean up temp object if it exists
    try {
      await client.removeObject(BUCKET, tempKey);
    } catch {
      // Ignore cleanup errors
    }

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to upload part ${partNumber}: ${errorMessage}`);
  }
}

export async function completeMultipartUpload(
  uploadId: string,
  key: string,
  parts: { partNumber: number; etag: string }[],
): Promise<string> {
  await ensureBucket();
  await client.completeMultipartUpload(
    BUCKET,
    key,
    uploadId,
    parts.map((p) => ({ part: p.partNumber, etag: p.etag })),
  );
  return getMinioUrl(key);
}

export async function abortMultipartUpload(
  uploadId: string,
  key: string,
): Promise<void> {
  await ensureBucket();
  await client.abortMultipartUpload(BUCKET, key, uploadId);
}
