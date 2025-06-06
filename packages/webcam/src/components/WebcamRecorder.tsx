import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { useWebcam } from "../hooks/useWebcam";
import type { RecordingOptions, VideoMetadata } from "../types";
import { formatDuration, formatFileSize } from "../utils";

export interface WebcamRecorderProps {
  options?: RecordingOptions;
  onRecordingComplete?: (blob: Blob, metadata: VideoMetadata) => void;
  onError?: (error: string) => void;
  showMetadata?: boolean;
  className?: string;
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
  },
  videoContainer: {
    position: "relative" as const,
    background: "#000",
    borderRadius: "8px",
    overflow: "hidden",
  },
  video: {
    display: "block",
    width: "100%",
    maxWidth: "800px",
    borderRadius: "8px",
    transform: "scaleX(-1)",
  },
  metadataOverlay: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    padding: "1rem",
    background: "linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recordingIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontWeight: 600,
  },
  recordingDot: {
    width: "12px",
    height: "12px",
    background: "#ff4444",
    borderRadius: "50%",
    animation: "pulse 1.5s ease-in-out infinite",
  },
  recordingTime: {
    fontFamily: "monospace",
    fontSize: "1.2rem",
  },
  controls: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap" as const,
  },
  btn: {
    padding: "0.75rem 1.5rem",
    border: "none",
    borderRadius: "6px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  btnDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  btnRecord: {
    background: "#ff4444",
    color: "white",
  },
  btnPause: {
    background: "#ffaa00",
    color: "white",
  },
  btnStop: {
    background: "#666",
    color: "white",
  },
  errorMessage: {
    color: "#ff4444",
    padding: "0.5rem",
    background: "rgba(255, 68, 68, 0.1)",
    borderRadius: "4px",
    fontSize: "0.9rem",
  },
};

// Add keyframes for pulse animation
const pulseKeyframes = `
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

export function WebcamRecorder({
  options,
  onRecordingComplete,
  onError,
  showMetadata = true,
  className = "",
}: WebcamRecorderProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    isRecording,
    isPaused,
    recordingTime,
    stream,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
  } = useWebcam(options);

  useEffect(() => {
    // Add pulse animation to document
    if (typeof document !== "undefined") {
      const styleElement = document.createElement("style");
      styleElement.textContent = pulseKeyframes;
      document.head.appendChild(styleElement);
      return () => {
        document.head.removeChild(styleElement);
      };
    }
  }, []);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  const handleStartRecording = async () => {
    await startRecording();
  };

  const handleStopRecording = async () => {
    setIsProcessing(true);
    try {
      const result = await stopRecording();
      if (result && onRecordingComplete) {
        onRecordingComplete(result.blob, result.metadata);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTogglePause = () => {
    if (isPaused) {
      resumeRecording();
    } else {
      pauseRecording();
    }
  };

  return (
    <div className={`webcam-recorder ${className}`} style={styles.container}>
      <div style={styles.videoContainer}>
        <video ref={videoRef} autoPlay muted playsInline style={styles.video} />

        {showMetadata && isRecording && (
          <div style={styles.metadataOverlay}>
            <div style={styles.recordingIndicator}>
              <span style={styles.recordingDot}></span>
              {isPaused ? "PAUSED" : "RECORDING"}
            </div>
            <div style={styles.recordingTime}>
              {formatDuration(recordingTime)}
            </div>
          </div>
        )}
      </div>

      <div style={styles.controls}>
        {!isRecording ? (
          <button
            onClick={handleStartRecording}
            disabled={isProcessing}
            style={{
              ...styles.btn,
              ...styles.btnRecord,
              ...(isProcessing ? styles.btnDisabled : {}),
            }}
          >
            Start Recording
          </button>
        ) : (
          <>
            <button
              onClick={handleTogglePause}
              disabled={isProcessing}
              style={{
                ...styles.btn,
                ...styles.btnPause,
                ...(isProcessing ? styles.btnDisabled : {}),
              }}
            >
              {isPaused ? "Resume" : "Pause"}
            </button>
            <button
              onClick={handleStopRecording}
              disabled={isProcessing}
              style={{
                ...styles.btn,
                ...styles.btnStop,
                ...(isProcessing ? styles.btnDisabled : {}),
              }}
            >
              {isProcessing ? "Processing..." : "Stop Recording"}
            </button>
          </>
        )}

        {error && <div style={styles.errorMessage}>{error}</div>}
      </div>
    </div>
  );
}
