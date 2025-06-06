import { z } from 'zod';

export const videoGenerationSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters'),
  aspectRatio: z.enum(['16:9', '9:16']).default('16:9'),
  duration: z.enum(['8s']).default('8s'),
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