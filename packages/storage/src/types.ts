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
