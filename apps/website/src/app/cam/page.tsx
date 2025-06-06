"use client";

import { authClient } from "@mvp/auth/client";
import {
  type Video,
  VideoLibrary,
  type VideoMetadata,
  VideoPlayer,
  WebcamRecorder,
  getUserVideos,
  incrementVideoViews,
  uploadVideo,
} from "@mvp/webcam";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f5f5",
    padding: "2rem 0",
  },
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "0 1rem",
  },
  loadingContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    fontSize: "1.2rem",
    color: "#666",
  },
  header: {
    textAlign: "center" as const,
    marginBottom: "3rem",
  },
  headerTitle: {
    fontSize: "2.5rem",
    marginBottom: "0.5rem",
    color: "#333",
  },
  headerText: {
    fontSize: "1.1rem",
    color: "#666",
  },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "3rem",
  },
  contentGridDesktop: {
    gridTemplateColumns: "2fr 1fr",
  },
  section: {
    background: "white",
    padding: "2rem",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },
  sectionTitle: {
    marginBottom: "1.5rem",
    color: "#333",
  },
  uploadProgress: {
    marginTop: "1rem",
    padding: "1rem",
    background: "#f0f0f0",
    borderRadius: "8px",
  },
  progressBar: {
    width: "100%",
    height: "8px",
    background: "#e0e0e0",
    borderRadius: "4px",
    overflow: "hidden",
    margin: "0.5rem 0",
  },
  progressFill: {
    height: "100%",
    background: "#4caf50",
    transition: "width 0.3s ease",
  },
  errorAlert: {
    marginTop: "1rem",
    padding: "1rem",
    background: "#fee",
    border: "1px solid #fcc",
    borderRadius: "8px",
    color: "#c00",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorButton: {
    background: "none",
    border: "none",
    color: "#c00",
    cursor: "pointer",
    fontWeight: 600,
  },
  videoModal: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    zIndex: 1000,
  },
  modalContent: {
    position: "relative" as const,
    width: "100%",
    maxWidth: "900px",
    background: "white",
    borderRadius: "12px",
    overflow: "hidden",
  },
  closeButton: {
    position: "absolute" as const,
    top: "1rem",
    right: "1rem",
    background: "rgba(0, 0, 0, 0.5)",
    color: "white",
    border: "none",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    fontSize: "1.5rem",
    cursor: "pointer",
    zIndex: 10,
    transition: "background 0.2s",
  },
};

export default function CamPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  // Check authentication
  useEffect(() => {
    checkAuth();
  }, []);

  // Check if desktop
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  // Load user videos
  useEffect(() => {
    if (user?.id) {
      loadUserVideos();
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      const session = await authClient.getSession();
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.name || "User",
        });
      } else {
        router.push("/login?redirect=/cam");
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      router.push("/login?redirect=/cam");
    }
  };

  const loadUserVideos = async () => {
    if (!user?.id) return;
    const userVideos = await getUserVideos(user.id);
    setVideos(userVideos);
  };

  const handleRecordingComplete = async (
    blob: Blob,
    metadata: VideoMetadata,
  ) => {
    if (!user?.id) {
      setError("You must be logged in to save videos");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const video = await uploadVideo({
        userId: user.id,
        videoBlob: blob,
        metadata,
        onProgress: (progress) => {
          const percentage = Math.round(
            (progress.loaded / progress.total) * 100,
          );
          setUploadProgress(percentage);
        },
      });

      // Add new video to the list
      setVideos((prev) => [video, ...prev]);
      setIsUploading(false);
      setUploadProgress(0);
    } catch (error) {
      console.error("Error uploading video:", error);
      setError("Failed to upload video. Please try again.");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleVideoSelect = async (video: Video) => {
    setSelectedVideo(video);
    // Increment view count
    await incrementVideoViews(video.id);
  };

  const handleVideoPlay = () => {
    if (selectedVideo) {
      incrementVideoViews(selectedVideo.id);
    }
  };

  if (!user) {
    return (
      <div style={styles.loadingContainer}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.headerTitle}>Video Recorder</h1>
          <p style={styles.headerText}>
            Welcome, {user.name}! Record and manage your videos.
          </p>
        </header>

        <div
          style={{
            ...styles.contentGrid,
            ...(isDesktop ? styles.contentGridDesktop : {}),
          }}
        >
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Record New Video</h2>
            <WebcamRecorder
              onRecordingComplete={handleRecordingComplete}
              onError={setError}
              options={{
                maxDuration: 300, // 5 minutes
                width: 1280,
                height: 720,
              }}
            />

            {isUploading && (
              <div style={styles.uploadProgress}>
                <p>Uploading video...</p>
                <div style={styles.progressBar}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${uploadProgress}%`,
                    }}
                  />
                </div>
                <span>{uploadProgress}%</span>
              </div>
            )}

            {error && (
              <div style={styles.errorAlert}>
                <p>{error}</p>
                <button
                  style={styles.errorButton}
                  onClick={() => setError(null)}
                >
                  Dismiss
                </button>
              </div>
            )}
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Your Video Library</h2>
            <VideoLibrary
              videos={videos}
              onVideoSelect={handleVideoSelect}
              emptyMessage="No videos yet. Record your first video!"
            />
          </section>
        </div>

        {selectedVideo && (
          <div style={styles.videoModal} onClick={() => setSelectedVideo(null)}>
            <div
              style={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                style={styles.closeButton}
                onClick={() => setSelectedVideo(null)}
              >
                ×
              </button>
              <VideoPlayer video={selectedVideo} onPlay={handleVideoPlay} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
