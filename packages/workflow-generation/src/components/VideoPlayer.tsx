'use client';

import React from 'react';
import { Download, Play } from 'lucide-react';
import clsx from 'clsx';

interface VideoPlayerProps {
  videoUrl: string;
  className?: string;
  title?: string;
}

export function VideoPlayer({ videoUrl, className, title }: VideoPlayerProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = title || 'generated-video.mp4';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={clsx('relative rounded-lg overflow-hidden shadow-lg', className)}>
      <video
        src={videoUrl}
        controls
        autoPlay
        loop
        className="w-full h-full"
      >
        Your browser does not support the video tag.
      </video>
      
      <div className="absolute top-2 right-2">
        <button
          onClick={handleDownload}
          className="p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all duration-200"
          title="Download video"
        >
          <Download className="w-5 h-5 text-gray-700" />
        </button>
      </div>
    </div>
  );
}