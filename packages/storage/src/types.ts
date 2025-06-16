export interface StorageAdapter {
  put(
    filename: string,
    data: Blob | Buffer | ReadableStream,
  ): Promise<string | null>;
  remove(filename: string): Promise<boolean>;
  exists(filename: string): Promise<boolean>;
  list(prefix?: string): Promise<string[]>;
  copy(from: string, to: string): Promise<string | null>;
}

export interface ClientStorageAdapter {
  upload(filename: string, file: File, options?: any): Promise<string | null>;
}

export interface MinioConfig {
  endpoint: string;
  port: number;
  accessKey: string;
  secretKey: string;
  bucket: string;
}

export interface LargeFileUploadOptions {
  chunkSize?: number;
  maxConcurrentChunks?: number;
  onProgress?: (progress: ProgressInfo) => void;
  abortSignal?: AbortSignal;
}

export interface ProgressInfo {
  loaded: number;
  total: number;
  percentage: number;
  speed: number;
  remainingTime: number;
}

export interface MultipartUploadResult {
  uploadId: string;
  key: string;
}

export interface ChunkUploadResult {
  partNumber: number;
  etag: string;
}

export interface LargeFileStorageAdapter {
  initializeMultipartUpload(
    filename: string,
    contentType: string,
  ): Promise<MultipartUploadResult>;
  uploadChunk(
    uploadId: string,
    key: string,
    partNumber: number,
    chunk: Blob | Buffer,
  ): Promise<ChunkUploadResult>;
  completeMultipartUpload(
    uploadId: string,
    key: string,
    parts: ChunkUploadResult[],
  ): Promise<string>;
  abortMultipartUpload(uploadId: string, key: string): Promise<void>;
}
