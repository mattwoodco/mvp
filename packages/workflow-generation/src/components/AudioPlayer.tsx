"use client";

import clsx from "clsx";
import { Download, Pause, Play } from "lucide-react";
import React, { useRef, useState } from "react";

interface AudioPlayerProps {
  audioUrl?: string;
  audioBase64?: string;
  contentType: string;
  title?: string;
  description?: string;
  className?: string;
}

export function AudioPlayer({
  audioUrl,
  audioBase64,
  contentType,
  title = "Generated Audio",
  description,
  className,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioSrc = audioUrl || (audioBase64 ? `data:${contentType};base64,${audioBase64}` : "");

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = audioSrc;
    link.download = `${title.replace(/\s+/g, "_").toLowerCase()}.${contentType.split("/")[1] || "mp3"}`;
    link.click();
  };

  if (!audioSrc) {
    return (
      <div className={clsx("p-4 bg-gray-100 rounded-lg text-center", className)}>
        <p className="text-gray-500">No audio available</p>
      </div>
    );
  }

  return (
    <div className={clsx("bg-white rounded-lg shadow-md p-6", className)}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>

      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlay}
            className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>

          <div className="flex-1">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <button
            onClick={handleDownload}
            className="p-2 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-md transition-colors"
            title="Download audio"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}