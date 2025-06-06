import { useCallback, useEffect, useRef, useState } from "react";
import type { RecordingOptions, VideoMetadata } from "../types";
import { getVideoDimensions, getVideoDuration } from "../utils";

export interface UseWebcamReturn {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  stream: MediaStream | null;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<{ blob: Blob; metadata: VideoMetadata } | null>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  resetRecording: () => void;
}

export function useWebcam(options: RecordingOptions = {}): UseWebcamReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const {
    maxDuration = 300, // 5 minutes default
    videoBitsPerSecond = 2500000, // 2.5 Mbps
    mimeType = "video/webm",
    facingMode = "user",
    width = 1280,
    height = 720,
  } = options;

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now() - recordingTime * 1000;
    timerRef.current = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setRecordingTime(elapsed);

      if (maxDuration && elapsed >= maxDuration) {
        stopRecording();
      }
    }, 100);
  }, [recordingTime, maxDuration]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: width },
          height: { ideal: height },
        },
        audio: true,
      });

      setStream(mediaStream);
      chunksRef.current = [];

      const recorder = new MediaRecorder(mediaStream, {
        mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : "video/webm",
        videoBitsPerSecond,
      });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);
      startTimer();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start recording");
      console.error("Error starting recording:", err);
    }
  }, [facingMode, width, height, mimeType, videoBitsPerSecond, startTimer]);

  const stopRecording = useCallback(async (): Promise<{ blob: Blob; metadata: VideoMetadata } | null> => {
    if (!mediaRecorderRef.current || !stream) {
      return null;
    }

    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current!;
      
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        
        try {
          const [duration, dimensions] = await Promise.all([
            getVideoDuration(blob),
            getVideoDimensions(blob),
          ]);

          const metadata: VideoMetadata = {
            title: `Recording ${new Date().toLocaleString()}`,
            duration,
            fileSize: blob.size,
            mimeType: blob.type,
            width: dimensions.width,
            height: dimensions.height,
            recordedAt: new Date(),
          };

          resolve({ blob, metadata });
        } catch (error) {
          console.error("Error extracting video metadata:", error);
          resolve(null);
        }

        // Clean up
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
        setIsRecording(false);
        setIsPaused(false);
        stopTimer();
      };

      recorder.stop();
      mediaRecorderRef.current = null;
    });
  }, [stream, mimeType, stopTimer]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      stopTimer();
    }
  }, [stopTimer]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      startTimer();
    }
  }, [startTimer]);

  const resetRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
    setError(null);
    chunksRef.current = [];
    stopTimer();
  }, [stream, stopTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetRecording();
    };
  }, []);

  return {
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
  };
}