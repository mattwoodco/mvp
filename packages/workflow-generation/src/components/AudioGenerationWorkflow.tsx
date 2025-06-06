"use client";

import clsx from "clsx";
import { Headphones, Sparkles } from "lucide-react";
import React, { useState } from "react";
import type {
  AudioGenerationFormData,
  AudioGenerationResult,
} from "../types";
import { AudioGenerationForm } from "./AudioGenerationForm";
import { AudioPlayer } from "./AudioPlayer";

interface AudioGenerationWorkflowProps {
  onGenerate: (data: AudioGenerationFormData) => Promise<AudioGenerationResult>;
  className?: string;
}

export function AudioGenerationWorkflow({
  onGenerate,
  className,
}: AudioGenerationWorkflowProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<AudioGenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: AudioGenerationFormData) => {
    setIsGenerating(true);
    setError(null);

    try {
      const result = await onGenerate(data);
      setGeneratedAudio(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate audio");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={clsx("max-w-4xl mx-auto space-y-8", className)}>
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
          <Sparkles className="w-8 h-8 text-blue-500" />
          AI Audio Generation
        </h2>
        <p className="text-gray-600">
          Generate realistic voices and music using advanced AI models
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Headphones className="w-5 h-5" />
            Configure Your Audio
          </h3>
          <AudioGenerationForm
            onSubmit={handleSubmit}
            isGenerating={isGenerating}
          />
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Generated Audio</h3>
          {error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          ) : generatedAudio ? (
            <AudioPlayer
              audioUrl={generatedAudio.audio.url}
              audioBase64={generatedAudio.audio.base64}
              contentType={generatedAudio.audio.content_type}
              title={
                generatedAudio.metadata?.type === "voice" 
                  ? "Generated Voice" 
                  : "Generated Music"
              }
              description={generatedAudio.metadata?.text || generatedAudio.metadata?.genre}
            />
          ) : (
            <div className="p-8 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-500">
                Your generated audio will appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}