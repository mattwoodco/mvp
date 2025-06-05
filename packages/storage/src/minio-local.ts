import { Client } from "minio";

const BUCKET = "storage";
const ENDPOINT = "localhost";
const PORT = 9000;
const ACCESS_KEY = "minioadmin";
const SECRET_KEY = "minioadmin";

const client = new Client({
  endPoint: ENDPOINT,
  port: PORT,
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
  return `http://${ENDPOINT}:${PORT}/${BUCKET}/${key}`;
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
  return `http://${ENDPOINT}:${PORT}/${BUCKET}/${to}`;
}
