import {
  abortMultipartUploadS3,
  completeMultipartUploadS3,
  copyS3,
  existsS3,
  initializeMultipartUploadS3,
  listS3,
  putS3,
  removeS3,
  uploadChunkS3,
} from "./s3-multipart";

const token = process.env.BLOB_READ_WRITE_TOKEN;

export async function putServer(
  filename: string,
  data: Blob | Buffer | ReadableStream,
): Promise<string | null> {
  return await putS3(filename, data);
}

export async function removeServer(filename: string): Promise<boolean> {
  return await removeS3(filename);
}

export async function existsServer(filename: string): Promise<boolean> {
  return await existsS3(filename);
}

export async function listServer(prefix = ""): Promise<string[]> {
  return await listS3(prefix);
}

export async function copyServer(
  from: string,
  to: string,
): Promise<string | null> {
  return await copyS3(from, to);
}

export async function initializeMultipartUpload(
  filename: string,
  contentType: string,
): Promise<{ uploadId: string; key: string }> {
  return await initializeMultipartUploadS3(filename, contentType);
}

export async function uploadChunk(
  uploadId: string,
  key: string,
  partNumber: number,
  chunk: Buffer,
): Promise<{ partNumber: number; etag: string }> {
  return await uploadChunkS3(uploadId, key, partNumber, chunk);
}

export async function completeMultipartUpload(
  uploadId: string,
  key: string,
  parts: { partNumber: number; etag: string }[],
): Promise<string> {
  return await completeMultipartUploadS3(uploadId, key, parts);
}

export async function abortMultipartUpload(
  uploadId: string,
  key: string,
): Promise<void> {
  return await abortMultipartUploadS3(uploadId, key);
}
