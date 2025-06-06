# Webcam Package Setup Guide

## Overview

A new webcam package has been created at `packages/webcam` that provides video recording, storage, and playback functionality.

## Features Implemented

### 1. **Video Recording**
- WebcamRecorder component with live preview
- Recording controls (start, stop, pause, resume)
- Real-time recording timer
- Metadata overlay showing recording status
- Configurable recording options (resolution, duration, format)

### 2. **Video Storage**
- Integration with @mvp/storage package for file uploads
- Automatic thumbnail generation
- Progress tracking during upload
- Videos stored in user-specific folders

### 3. **Video Library**
- VideoLibrary component displaying user's videos
- Grid layout with thumbnails
- Video metadata display (duration, date, views)
- Click to play functionality

### 4. **Video Player**
- VideoPlayer component with metadata overlay
- View count tracking
- Full video information display

### 5. **Database Schema**
- New `video` table created with fields:
  - id, userId, title, description
  - url, thumbnailUrl
  - duration, fileSize, mimeType
  - width, height
  - isPublic, viewCount
  - createdAt, updatedAt

### 6. **API Routes**
Created the following API routes:
- `GET /api/videos` - List user videos or public videos
- `POST /api/videos` - Create new video record
- `GET /api/videos/[videoId]` - Get specific video
- `PATCH /api/videos/[videoId]` - Update video metadata
- `DELETE /api/videos/[videoId]` - Delete video
- `POST /api/videos/[videoId]/views` - Increment view count
- `POST /api/handle-upload` - Handle file uploads

### 7. **Demo Page**
- New route at `/cam` demonstrating all features
- Authentication required
- Live webcam recording
- Video upload with progress
- Video library display
- Video playback in modal

## Environment Variables Required

Add these to your `.env` file:

```env
# Database connection (required for video metadata storage)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Storage configuration (for video file uploads)
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
# OR for local development:
NEXT_PUBLIC_APP_ENV=local

# Authentication (required for user sessions)
BETTER_AUTH_SECRET=your_32_char_secret_key_here
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
```

## Setup Instructions

1. **Install Dependencies**
   ```bash
   bun install
   ```

2. **Configure Environment Variables**
   - Copy `.env.example` to `.env`
   - Fill in the required values above

3. **Run Database Migrations**
   ```bash
   cd packages/database
   bun run db:push
   ```

4. **Start Development Server**
   ```bash
   bun dev
   ```

5. **Access the Demo**
   - Navigate to `http://localhost:3000/cam`
   - Login if required
   - Start recording videos!

## Package Exports

The webcam package (`@mvp/webcam`) exports:

### Components
- `WebcamRecorder` - Main recording component
- `VideoPlayer` - Video playback component
- `VideoLibrary` - Video grid display component

### Hooks
- `useWebcam` - Low-level webcam recording hook

### API Functions
- `uploadVideo` - Upload video with metadata
- `getUserVideos` - Get user's video library
- `getVideo` - Get specific video
- `deleteVideo` - Delete a video
- `updateVideoMetadata` - Update video info
- `incrementVideoViews` - Track video views

### Utilities
- `generateVideoId` - Create unique video IDs
- `formatDuration` - Format seconds to readable time
- `formatFileSize` - Format bytes to readable size
- `generateThumbnail` - Extract video thumbnail
- `getVideoDimensions` - Get video width/height
- `getVideoDuration` - Get video length

## Technical Details

- Uses MediaRecorder API for browser video recording
- Supports WebM format (with fallback)
- Integrates with Vercel Blob storage (or local Minio)
- PostgreSQL database for metadata
- Next.js API routes for backend
- React components with TypeScript
- Styled with inline styles (easily customizable)

## Browser Requirements

- Modern browser with MediaRecorder API support
- Camera/microphone permissions required
- HTTPS required in production (for getUserMedia)

## Known Limitations

1. Recording format limited to WebM in most browsers
2. Maximum file size depends on storage provider
3. Thumbnail generation happens client-side
4. No video transcoding (raw recording uploaded)

## Future Enhancements

Consider adding:
- Video compression before upload
- Multiple quality options
- Video editing capabilities
- Share functionality
- Comments/reactions
- Playlists
- Analytics dashboard