'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { VideoGenerationFormData, videoGenerationSchema } from '../types';
import { Video, Loader2 } from 'lucide-react';
import clsx from 'clsx';

interface VideoGenerationFormProps {
  onSubmit: (data: VideoGenerationFormData) => void | Promise<void>;
  isGenerating?: boolean;
  className?: string;
}

export function VideoGenerationForm({ onSubmit, isGenerating, className }: VideoGenerationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VideoGenerationFormData>({
    resolver: zodResolver(videoGenerationSchema),
    defaultValues: {
      aspectRatio: '16:9',
      duration: '8s',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={clsx('space-y-6', className)}>
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
          Video Prompt
        </label>
        <textarea
          {...register('prompt')}
          id="prompt"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe the video you want to generate..."
        />
        {errors.prompt && (
          <p className="mt-1 text-sm text-red-600">{errors.prompt.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="aspectRatio" className="block text-sm font-medium text-gray-700 mb-2">
            Aspect Ratio
          </label>
          <select
            {...register('aspectRatio')}
            id="aspectRatio"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="16:9">16:9 (Landscape)</option>
            <option value="9:16">9:16 (Portrait)</option>
          </select>
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
            Duration
          </label>
          <select
            {...register('duration')}
            id="duration"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="8s">8 seconds</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="style" className="block text-sm font-medium text-gray-700 mb-2">
          Style (optional)
        </label>
        <input
          {...register('style')}
          id="style"
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., horror, noir, cartoon"
        />
      </div>

      <div>
        <label htmlFor="cameraMotion" className="block text-sm font-medium text-gray-700 mb-2">
          Camera Motion (optional)
        </label>
        <input
          {...register('cameraMotion')}
          id="cameraMotion"
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., aerial view, tracking shot"
        />
      </div>

      <button
        type="submit"
        disabled={isGenerating}
        className={clsx(
          'w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-colors duration-200'
        )}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating Video...
          </>
        ) : (
          <>
            <Video className="w-5 h-5" />
            Generate Video
          </>
        )}
      </button>
    </form>
  );
}