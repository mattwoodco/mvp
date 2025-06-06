import * as React from "react";
import type { Video } from "../types";
import { formatDuration, formatFileSize } from "../utils";

export interface VideoLibraryProps {
  videos: Video[];
  onVideoSelect?: (video: Video) => void;
  emptyMessage?: string;
  className?: string;
}

const styles = {
  library: {
    padding: "1rem",
  },
  empty: {
    textAlign: "center" as const,
    padding: "3rem",
    background: "#f5f5f5",
    borderRadius: "8px",
  },
  emptyMessage: {
    color: "#666",
    fontSize: "1.1rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "1.5rem",
  },
  card: {
    background: "white",
    borderRadius: "8px",
    overflow: "hidden",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  cardHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  },
  thumbnail: {
    position: "relative" as const,
    width: "100%",
    paddingBottom: "56.25%",
    background: "#000",
    overflow: "hidden",
  },
  thumbnailImg: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
  },
  thumbnailPlaceholder: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#222",
    color: "#666",
  },
  durationBadge: {
    position: "absolute" as const,
    bottom: "8px",
    right: "8px",
    background: "rgba(0, 0, 0, 0.8)",
    color: "white",
    padding: "2px 6px",
    borderRadius: "4px",
    fontSize: "0.75rem",
    fontFamily: "monospace",
  },
  info: {
    padding: "1rem",
  },
  title: {
    margin: "0 0 0.5rem 0",
    fontSize: "1rem",
    fontWeight: 600,
    color: "#333",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  description: {
    margin: "0 0 0.5rem 0",
    fontSize: "0.875rem",
    color: "#666",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical" as const,
  },
  meta: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.75rem",
    color: "#999",
  },
};

export function VideoLibrary({
  videos,
  onVideoSelect,
  emptyMessage = "No videos in your library yet",
  className = "",
}: VideoLibraryProps) {
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);

  if (videos.length === 0) {
    return (
      <div
        className={`video-library empty ${className}`}
        style={{ ...styles.library, ...styles.empty }}
      >
        <p style={styles.emptyMessage}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`video-library ${className}`} style={styles.library}>
      <div style={styles.grid}>
        {videos.map((video) => (
          <div
            key={video.id}
            style={{
              ...styles.card,
              ...(hoveredId === video.id ? styles.cardHover : {}),
            }}
            onClick={() => onVideoSelect?.(video)}
            onMouseEnter={() => setHoveredId(video.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div style={styles.thumbnail}>
              {video.thumbnailUrl ? (
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  style={styles.thumbnailImg}
                />
              ) : (
                <div style={styles.thumbnailPlaceholder}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path d="M10 8L16 12L10 16V8Z" fill="currentColor" />
                  </svg>
                </div>
              )}
              {video.duration && (
                <span style={styles.durationBadge}>
                  {formatDuration(video.duration)}
                </span>
              )}
            </div>

            <div style={styles.info}>
              <h4 style={styles.title}>{video.title}</h4>
              {video.description && (
                <p style={styles.description}>{video.description}</p>
              )}
              <div style={styles.meta}>
                <span>{video.viewCount} views</span>
                <span>{new Date(video.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
