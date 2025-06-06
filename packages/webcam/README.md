# @mvp/webcam

A comprehensive webcam recording package for video capture, storage, and playback.

## Installation

```bash
bun add @mvp/webcam
```

## Quick Start

```tsx
import { WebcamRecorder, uploadVideo } from '@mvp/webcam';

function MyRecorder() {
  const handleRecordingComplete = async (blob, metadata) => {
    const video = await uploadVideo({
      userId: 'user123',
      videoBlob: blob,
      metadata,
    });
    console.log('Video uploaded:', video);
  };

  return (
    <WebcamRecorder
      onRecordingComplete={handleRecordingComplete}
      options={{
        maxDuration: 300, // 5 minutes
        width: 1280,
        height: 720,
      }}
    />
  );
}
```

## Components

### WebcamRecorder

Main recording component with built-in controls.

```tsx
<WebcamRecorder
  onRecordingComplete={(blob, metadata) => {}}
  onError={(error) => console.error(error)}
  showMetadata={true}
  options={{
    maxDuration: 300,
    videoBitsPerSecond: 2500000,
    mimeType: "video/webm",
    facingMode: "user",
    width: 1280,
    height: 720,
  }}
/>
```

### VideoPlayer

Display videos with metadata overlay.

```tsx
<VideoPlayer
  video={videoObject}
  showMetadata={true}
  onPlay={() => incrementVideoViews(video.id)}
/>
```

### VideoLibrary

Grid display of multiple videos.

```tsx
<VideoLibrary
  videos={userVideos}
  onVideoSelect={(video) => setSelectedVideo(video)}
  emptyMessage="No videos yet"
/>
```

## Hooks

### useWebcam

Low-level hook for custom recording implementations.

```tsx
const {
  isRecording,
  isPaused,
  recordingTime,
  stream,
  error,
  startRecording,
  stopRecording,
  pauseRecording,
  resumeRecording,
  resetRecording,
} = useWebcam(options);
```

## API Functions

### uploadVideo

Upload recorded video with metadata.

```tsx
const video = await uploadVideo({
  userId: 'user123',
  videoBlob: blob,
  metadata: {
    title: 'My Video',
    description: 'Description',
    duration: 120,
    fileSize: blob.size,
    mimeType: blob.type,
    width: 1280,
    height: 720,
    recordedAt: new Date(),
  },
  generateThumbnail: true,
  onProgress: ({ loaded, total }) => {
    console.log(`${Math.round(loaded / total * 100)}% uploaded`);
  },
});
```

### getUserVideos

Get all videos for a user.

```tsx
const videos = await getUserVideos('user123');
```

### Other Functions

- `getVideo(videoId)` - Get a specific video
- `deleteVideo(videoId)` - Delete a video
- `updateVideoMetadata(videoId, updates)` - Update video info
- `incrementVideoViews(videoId)` - Track video views

## Database Setup

Add the video schema to your database:

```sql
CREATE TABLE video (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user(id),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER,
  file_size INTEGER,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  is_public BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## API Routes

Create these API routes in your Next.js app:

```typescript
// app/api/videos/route.ts
export async function GET() { /* List videos */ }
export async function POST() { /* Create video */ }

// app/api/videos/[videoId]/route.ts
export async function GET() { /* Get video */ }
export async function PATCH() { /* Update video */ }
export async function DELETE() { /* Delete video */ }

// app/api/videos/[videoId]/views/route.ts
export async function POST() { /* Increment views */ }
```

## License

MIT