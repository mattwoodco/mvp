export const BUCKET = "storage";
export const MINIO_ENDPOINT = "localhost";
export const MINIO_PORT = 9000;

export function isLocalEnv(): boolean {
  return (
    process.env.NEXT_PUBLIC_APP_ENV === "local" &&
    process.env.NEXT_PUBLIC_USE_MINIO === "true"
  );
}

export function createPath(filename: string): string {
  return `storage/${filename}`;
}

export function checkToken(): void {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!isLocalEnv() && !token) {
    throw new Error("Missing BLOB_READ_WRITE_TOKEN for production storage");
  }
}

export function getMinioUrl(key: string): string {
  return `http://${MINIO_ENDPOINT}:${MINIO_PORT}/${BUCKET}/${key}`;
}
