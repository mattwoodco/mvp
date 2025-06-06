"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { Loader2, Mic, Music } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { type AudioGenerationFormData, audioGenerationSchema } from "../types";

interface AudioGenerationFormProps {
  onSubmit: (data: AudioGenerationFormData) => void | Promise<void>;
  isGenerating?: boolean;
  className?: string;
}

export function AudioGenerationForm({
  onSubmit,
  isGenerating = false,
  className,
}: AudioGenerationFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AudioGenerationFormData>({
    resolver: zodResolver(audioGenerationSchema),
    defaultValues: {
      text: "",
      type: "voice",
      stability: 0.5,
      similarity_boost: 0.5,
    },
  });

  const generationType = watch("type");

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={clsx("space-y-6", className)}
    >
      <div>
        <label
          htmlFor="type"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Generation Type
        </label>
        <select
          {...register("type")}
          id="type"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="voice">Voice Generation</option>
          <option value="music">Music Generation</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="text"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {generationType === "voice" ? "Text to Speak" : "Music Description"}
        </label>
        <textarea
          {...register("text")}
          id="text"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={
            generationType === "voice"
              ? "Enter the text you want to convert to speech..."
              : "Describe the music you want to generate (e.g., 'upbeat electronic dance music with synth leads')"
          }
        />
        {errors.text && (
          <p className="mt-1 text-sm text-red-600">{errors.text.message}</p>
        )}
      </div>

      {generationType === "voice" ? (
        <>
          <div>
            <label
              htmlFor="voice"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Voice
            </label>
            <select
              {...register("voice")}
              id="voice"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a voice</option>
              <option value="21m00Tcm4TlvDq8ikWAM">Rachel (Female)</option>
              <option value="pNInz6obpgDQGcFmaJgB">Adam (Male)</option>
              <option value="ErXwobaYiN019PkySvjV">Antoni (Male)</option>
              <option value="MF3mGyEYCl7XYWbV9V6O">Bella (Female)</option>
              <option value="TxGEqnHWrfWFTfGW9XjX">Josh (Male)</option>
              <option value="EXAVITQu4vr4xnSDxMaL">Elli (Female)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="stability"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Stability
              </label>
              <input
                {...register("stability", { valueAsNumber: true })}
                id="stability"
                type="range"
                min="0"
                max="1"
                step="0.1"
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lower = more variation, Higher = more consistent
              </p>
            </div>

            <div>
              <label
                htmlFor="similarity_boost"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Similarity Boost
              </label>
              <input
                {...register("similarity_boost", { valueAsNumber: true })}
                id="similarity_boost"
                type="range"
                min="0"
                max="1"
                step="0.1"
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Higher = more similar to original voice
              </p>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="genre"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Genre (optional)
              </label>
              <input
                {...register("genre")}
                id="genre"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., electronic, jazz, rock"
              />
            </div>

            <div>
              <label
                htmlFor="mood"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Mood (optional)
              </label>
              <input
                {...register("mood")}
                id="mood"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., upbeat, relaxing, intense"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="duration"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Duration
            </label>
            <select
              {...register("duration")}
              id="duration"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select duration</option>
              <option value="30s">30 seconds</option>
              <option value="60s">1 minute</option>
              <option value="2m">2 minutes</option>
              <option value="3m">3 minutes</option>
            </select>
          </div>
        </>
      )}

      <button
        type="submit"
        disabled={isGenerating}
        className={clsx(
          "w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-colors duration-200",
        )}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating Audio...
          </>
        ) : (
          <>
            {generationType === "voice" ? (
              <Mic className="w-5 h-5" />
            ) : (
              <Music className="w-5 h-5" />
            )}
            Generate Audio
          </>
        )}
      </button>
    </form>
  );
}