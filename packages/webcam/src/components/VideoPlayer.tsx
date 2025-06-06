import * as React from "react";
import type { Video } from "../types";
import { formatDuration, formatFileSize } from "../utils";

export interface VideoPlayerProps {
  video: Video;
  showMetadata?: boolean;
  onPlay?: () => void;
  className?: string;
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
  },
  playerContainer: {
    background: "#f5f5f5",
    borderRadius: "8px",
    overflow: "hidden",
  },
  video: {
    display: "block",
    width: "100%",
    maxWidth: "800px",
    borderRadius: "8px",
    background: "#000",
  },
  metadataInfo: {
    padding: "1rem",
    background: "white",
  },
  title: {
    margin: "0 0 0.5rem 0",
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#333",
  },
  description: {
    margin: "0 0 1rem 0",
    color: "#666",
    lineHeight: 1.5,
  },
  stats: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "1rem",
    fontSize: "0.875rem",
    color: "#666",
  },
  stat: {
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
  },
};

export function VideoPlayer({
  video,
  showMetadata = true,
  onPlay,
  className = "",
}: VideoPlayerProps) {
  const handlePlay = () => {
    if (onPlay) {
      onPlay();
    }
  };

  return (
    <div className={`video-player ${className}`} style={styles.container}>
      <div style={styles.playerContainer}>
        <video
          src={video.url}
          controls
          onPlay={handlePlay}
          style={styles.video}
        />

        {showMetadata && (
          <div style={styles.metadataInfo}>
            <h3 style={styles.title}>{video.title}</h3>
            {video.description && (
              <p style={styles.description}>{video.description}</p>
            )}
            <div style={styles.stats}>
              {video.duration && (
                <span style={styles.stat}>
                  Duration: {formatDuration(video.duration)}
                </span>
              )}
              {video.fileSize && (
                <span style={styles.stat}>
                  Size: {formatFileSize(video.fileSize)}
                </span>
              )}
              {video.width && video.height && (
                <span style={styles.stat}>
                  Resolution: {video.width}x{video.height}
                </span>
              )}
              <span style={styles.stat}>Views: {video.viewCount}</span>
              <span style={styles.stat}>
                Uploaded: {new Date(video.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
