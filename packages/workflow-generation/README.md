# @repo/workflow-generation

Components for AI-powered workflow generation, including video generation with fal.ai's Veo 3 model.

## Installation

This package is part of the monorepo and is available as a workspace dependency.

```json
{
  "dependencies": {
    "@repo/workflow-generation": "workspace:*"
  }
}
```

## Components

### VideoGenerationWorkflow

The main component that provides a complete video generation workflow.

```tsx
import { VideoGenerationWorkflow } from '@repo/workflow-generation';

function VideoPage() {
  const handleGenerate = async (data) => {
    // Call your API to generate video
    const response = await fetch('/api/generate-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    return response.json();
  };

  return (
    <VideoGenerationWorkflow 
      onGenerate={handleGenerate}
      className="py-8"
    />
  );
}
```

### VideoGenerationForm

Form component for configuring video generation parameters.

```tsx
import { VideoGenerationForm } from '@repo/workflow-generation';

function MyForm() {
  const handleSubmit = async (data) => {
    console.log('Form data:', data);
    // data includes: prompt, aspectRatio, duration, style, cameraMotion, etc.
  };

  return (
    <VideoGenerationForm
      onSubmit={handleSubmit}
      isGenerating={false}
    />
  );
}
```

### VideoPlayer

Component for displaying and downloading generated videos.

```tsx
import { VideoPlayer } from '@repo/workflow-generation';

function MyVideoPlayer() {
  return (
    <VideoPlayer
      videoUrl="https://example.com/video.mp4"
      title="My Generated Video"
      className="w-full"
    />
  );
}
```

## Types

### VideoGenerationFormData

```typescript
interface VideoGenerationFormData {
  prompt: string;
  aspectRatio: '16:9' | '9:16';
  duration: '8s';
  style?: string;
  cameraMotion?: string;
  composition?: string;
  ambiance?: string;
}
```

### VideoGenerationResult

```typescript
interface VideoGenerationResult {
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
```

## Example with Server Action

```tsx
// app/actions.ts
'use server';

import { generateVideo } from '@repo/ai/providers/fal';
import type { VideoGenerationFormData, VideoGenerationResult } from '@repo/workflow-generation';

export async function generateVideoAction(data: VideoGenerationFormData): Promise<VideoGenerationResult> {
  const result = await generateVideo(data.prompt, {
    aspectRatio: data.aspectRatio,
    duration: data.duration,
  });

  return {
    id: `video-${Date.now()}`,
    video: result.data.video,
    metadata: {
      prompt: data.prompt,
      aspectRatio: data.aspectRatio,
      duration: data.duration,
      generatedAt: new Date(),
    },
  };
}
```

```tsx
// app/page.tsx
import { VideoGenerationWorkflow } from '@repo/workflow-generation';
import { generateVideoAction } from './actions';

export default function Page() {
  return (
    <VideoGenerationWorkflow onGenerate={generateVideoAction} />
  );
}
```

## Prompting Tips for Veo 3

For best results with video generation:

1. **Be descriptive**: Include details about subjects, settings, and actions
2. **Specify style**: Add film style keywords (e.g., "horror", "noir", "cartoon")
3. **Camera motion** (optional): "aerial view", "tracking shot", etc.
4. **Composition** (optional): "wide shot", "close-up", etc.
5. **Ambiance** (optional): Color and lighting details

Example prompt:
```
A casual street interview on a busy New York City sidewalk. 
The interviewer holds a microphone and asks about AI.
Vertical video format, natural lighting, handheld camera movement.
```