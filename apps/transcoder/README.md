# FFmpeg Video Transcoder Service

A lightweight Bun server that optimizes videos for web delivery using FFmpeg.

## Features

- Downloads videos from storage using file ID
- Transcodes videos to web-optimized H.264/AAC format
- Uploads optimized videos back to storage
- Provides detailed logging and progress tracking
- Easy deployment with Docker

## Requirements

- Bun runtime
- FFmpeg installed on system
- Access to storage service

## Installation

```bash
# Install ffmpeg
# macOS:
brew install ffmpeg

# Ubuntu/Debian:
sudo apt install ffmpeg

# Install dependencies
bun install
```

## Usage

### Development
```bash
# From project root
bun transcoder:dev

# Or from transcoder directory
bun dev
```

### Production
```bash
bun start
```

### Docker
```bash
docker build -t transcoder .
docker run -p 8080:8080 transcoder
```

## API

### GET /

Health check endpoint.

**Response:**
```json
{
  "service": "FFmpeg Video Transcoder",
  "version": "1.0.0",
  "status": "running"
}
```

### POST /transcode

Transcodes a video file to web-optimized format.

**Request:**
```json
{
  "fileId": "unique-file-id",
  "fileUrl": "http://localhost:9000/storage/storage/video.mov"
}
```

**Response:**
```json
{
  "success": true,
  "originalFile": "http://localhost:9000/storage/storage/video.mov",
  "optimizedFile": "http://localhost:9000/storage/storage/optimized-unique-file-id.mp4",
  "fileId": "unique-file-id",
  "message": "Video successfully optimized for web delivery"
}
```

## Example Usage

```bash
# Test the service
curl -X POST http://localhost:8080/transcode \
  -H "Content-Type: application/json" \
  -d '{
    "fileId": "test-video",
    "fileUrl": "http://localhost:9000/storage/storage/your-video.mov"
  }'
```

## FFmpeg Settings

The service uses these optimized settings for web delivery:

- **Video Codec:** H.264 (libx264) for universal compatibility
- **Quality:** CRF 23 (good balance of quality/size)
- **Preset:** Medium (balanced speed/compression)
- **Audio:** AAC at 128k bitrate
- **Fast Start:** Enabled for web streaming
- **Dimensions:** Ensures even pixel dimensions

## Environment Variables

- `PORT`: Server port (default: 8080)
- Storage service environment variables (from main project)

## Deployment

The service is designed to be stateless and easily deployable:

1. **Docker:** Use provided Dockerfile
2. **Cloud Run:** Compatible with Google Cloud Run
3. **Railway/Render:** Direct deployment supported
4. **VPS:** Simple systemd service setup

## Monitoring

The service provides detailed console logging:

- 🎬 Service status
- 📥 Download progress
- 🔄 Transcoding progress
- 📤 Upload status
- ✅ Completion status
- ❌ Error details

## Performance

- **Speed:** ~2-4x faster than real-time playback
- **Size:** Typically 60-80% of original file size
- **Quality:** Maintains visual quality while optimizing for web
- **Compatibility:** Universal browser support

## Project Scripts

From the project root:

```bash
# Start development server
bun transcoder:dev

# Build the service
bun transcoder:build

# Start production server
bun transcoder:start
``` 
