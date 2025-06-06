// Components
export { WebcamRecorder } from "./components/WebcamRecorder";
export type { WebcamRecorderProps } from "./components/WebcamRecorder";

export { VideoPlayer } from "./components/VideoPlayer";
export type { VideoPlayerProps } from "./components/VideoPlayer";

export { VideoLibrary } from "./components/VideoLibrary";
export type { VideoLibraryProps } from "./components/VideoLibrary";

// Hooks
export { useWebcam } from "./hooks/useWebcam";
export type { UseWebcamReturn } from "./hooks/useWebcam";

// API
export {
  uploadVideo,
  getUserVideos,
  getVideo,
  deleteVideo,
  updateVideoMetadata,
  incrementVideoViews,
} from "./api";
export type { UploadVideoOptions } from "./api";

// Types
export type {
  Video,
  VideoMetadata,
  RecordingOptions,
  UploadProgress,
} from "./types";

// Utils
export {
  generateVideoId,
  formatDuration,
  formatFileSize,
  generateThumbnail,
  getVideoDimensions,
  getVideoDuration,
} from "./utils";