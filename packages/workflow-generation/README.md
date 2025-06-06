# @mvp/workflow-generation

Components for AI-powered workflow generation, including video generation with fal.ai's Veo 3 model.

## Installation

This package is part of the monorepo and is available as a workspace dependency.

```json
{
  "dependencies": {
    "@mvp/workflow-generation": "workspace:*"
  }
}
```

## Components

### VideoGenerationWorkflow

The main component that provides a complete video generation workflow.

```tsx
import { VideoGenerationWorkflow } from '@mvp/workflow-generation';

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
import { VideoGenerationForm } from '@mvp/workflow-generation';

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
import { VideoPlayer } from '@mvp/workflow-generation';

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

### AudioGenerationWorkflow

The main component for AI-powered audio generation, supporting both voice synthesis and music generation.

```tsx
import { AudioGenerationWorkflow } from '@mvp/workflow-generation';

function AudioPage() {
  const handleGenerate = async (data) => {
    // Call your API to generate audio
    const response = await fetch('/api/generate-audio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    return response.json();
  };

  return (
    <AudioGenerationWorkflow 
      onGenerate={handleGenerate}
      className="py-8"
    />
  );
}
```

### AudioGenerationForm

Form component for configuring audio generation parameters.

```tsx
import { AudioGenerationForm } from '@mvp/workflow-generation';

function MyForm() {
  const handleSubmit = async (data) => {
    console.log('Form data:', data);
    // data includes: text, type, voice, stability, genre, mood, etc.
  };

  return (
    <AudioGenerationForm
      onSubmit={handleSubmit}
      isGenerating={false}
    />
  );
}
```

### AudioPlayer

Component for playing and downloading generated audio.

```tsx
import { AudioPlayer } from '@mvp/workflow-generation';

function MyAudioPlayer() {
  return (
    <AudioPlayer
      audioBase64="..." // Base64 encoded audio
      contentType="audio/mpeg"
      title="Generated Voice"
      description="AI-generated voice narration"
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

### AudioGenerationFormData

```typescript
interface AudioGenerationFormData {
  text: string;
  type: 'voice' | 'music';
  // Voice options
  voice?: string;
  language?: string;
  emotion?: string;
  stability?: number;
  similarity_boost?: number;
  // Music options
  genre?: string;
  mood?: string;
  tempo?: string;
  instruments?: string;
  duration?: '30s' | '60s' | '2m' | '3m';
}
```

### AudioGenerationResult

```typescript
interface AudioGenerationResult {
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
    type: 'voice' | 'music';
    voice?: string;
    genre?: string;
    generatedAt: Date;
  };
}
```

## Example with Server Action

```tsx
// app/actions.ts
'use server';

import { generateVideo } from '@mvp/ai/providers/fal';
import type { VideoGenerationFormData, VideoGenerationResult } from '@mvp/workflow-generation';

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
import { VideoGenerationWorkflow } from '@mvp/workflow-generation';
import { generateVideoAction } from './actions';

export default function Page() {
  return (
    <VideoGenerationWorkflow onGenerate={generateVideoAction} />
  );
}
```

## Example with Server Action (Audio)

```tsx
// app/actions.ts
'use server';

import { generateVoice } from '@mvp/ai/providers/elevenlabs';
import type { AudioGenerationFormData, AudioGenerationResult } from '@mvp/workflow-generation';

export async function generateAudioAction(data: AudioGenerationFormData): Promise<AudioGenerationResult> {
  if (data.type === 'voice') {
    const result = await generateVoice(data.text, {
      voice: data.voice,
      stability: data.stability,
      similarity_boost: data.similarity_boost,
    });

    return {
      id: `audio-${Date.now()}`,
      audio: {
        base64: result.audio_base64,
        content_type: result.contentType,
      },
      metadata: {
        text: data.text,
        type: 'voice',
        voice: data.voice,
        generatedAt: new Date(),
      },
    };
  }
  
  // Handle music generation...
}
```

```tsx
// app/page.tsx
import { AudioGenerationWorkflow } from '@mvp/workflow-generation';
import { generateAudioAction } from './actions';

export default function Page() {
  return (
    <AudioGenerationWorkflow onGenerate={generateAudioAction} />
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
