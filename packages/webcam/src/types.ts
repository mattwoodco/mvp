export interface VideoMetadata {
  title: string;
  description?: string;
  duration: number;
  fileSize: number;
  mimeType: string;
  width: number;
  height: number;
  recordedAt: Date;
}

export interface RecordingOptions {
  maxDuration?: number; // Maximum recording duration in seconds
  videoBitsPerSecond?: number;
  mimeType?: string;
  facingMode?: "user" | "environment";
  width?: number;
  height?: number;
}

export interface Video {
  id: string;
  userId: string;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  duration?: number;
  fileSize?: number;
  mimeType?: string;
  width?: number;
  height?: number;
  isPublic: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}