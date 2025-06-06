import { z } from "zod";

export const videoGenerationSchema = z.object({
  prompt: z.string().min(10, "Prompt must be at least 10 characters"),
  aspectRatio: z.enum(["16:9", "9:16"]).default("16:9"),
  duration: z.enum(["8s"]).default("8s"),
  style: z.string().optional(),
  cameraMotion: z.string().optional(),
  composition: z.string().optional(),
  ambiance: z.string().optional(),
});

export type VideoGenerationFormData = z.infer<typeof videoGenerationSchema>;

export interface VideoGenerationResult {
  id: string;
  video: {
    url: string;
    content_type?: string;
    file_name?: string;
    file_size?: number;
  };
  metadata?: {
    prompt: string;
    aspectRatio: string;
    duration: string;
    generatedAt: Date;
  };
}

// Audio generation types
export const audioGenerationSchema = z.object({
  text: z.string().min(1, "Text is required"),
  type: z.enum(["voice", "music"]).default("voice"),
  // Voice options
  voice: z.string().optional(),
  language: z.string().optional(),
  emotion: z.string().optional(),
  stability: z.number().min(0).max(1).optional(),
  similarity_boost: z.number().min(0).max(1).optional(),
  // Music options
  genre: z.string().optional(),
  mood: z.string().optional(),
  tempo: z.string().optional(),
  instruments: z.string().optional(),
  duration: z.enum(["30s", "60s", "2m", "3m"]).optional(),
});

export type AudioGenerationFormData = z.infer<typeof audioGenerationSchema>;

export interface AudioGenerationResult {
  id: string;
  audio: {
    url?: string;
    base64?: string;
    content_type: string;
    duration?: number;
    file_size?: number;
  };
  metadata?: {
    text?: string;
    type: "voice" | "music";
    voice?: string;
    genre?: string;
    generatedAt: Date;
  };
}
