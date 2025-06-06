'use client';

import React, { useState } from 'react';
import { VideoGenerationForm } from './VideoGenerationForm';
import { VideoPlayer } from './VideoPlayer';
import type { VideoGenerationFormData, VideoGenerationResult } from '../types';
import { Sparkles } from 'lucide-react';
import clsx from 'clsx';

interface VideoGenerationWorkflowProps {
  onGenerate: (data: VideoGenerationFormData) => Promise<VideoGenerationResult>;
  className?: string;
}

export function VideoGenerationWorkflow({ onGenerate, className }: VideoGenerationWorkflowProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<VideoGenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: VideoGenerationFormData) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const result = await onGenerate(data);
      setGeneratedVideo(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate video');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={clsx('max-w-4xl mx-auto space-y-8', className)}>
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
          <Sparkles className="w-8 h-8 text-blue-500" />
          AI Video Generation
        </h2>
        <p className="text-gray-600">
          Create amazing videos using Google's Veo 3 model
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-4">Video Settings</h3>
          <VideoGenerationForm
            onSubmit={handleSubmit}
            isGenerating={isGenerating}
          />
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Generated Video</h3>
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          {generatedVideo ? (
            <VideoPlayer
              videoUrl={generatedVideo.video.url}
              title={generatedVideo.metadata?.prompt}
            />
          ) : (
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Your generated video will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}