# Video Editor Service

A high-performance video editing service built with Bun, Hono, and FFmpeg. Adds chyron (text overlay) functionality to videos with extensive customization options.

## Features

- **Chyron Overlays**: Add text overlays with customizable styling
- **Flexible Positioning**: Support for anchor-based positioning
- **Rich Styling**: Colors, fonts, backgrounds, borders, shadows
- **Timing Control**: Precise start time and duration control
- **Web Optimized**: Output optimized for web delivery
- **Easy to Swap**: Modular design allows easy library replacement

## Quick Start

```bash
# Install dependencies
bun install

# Copy environment configuration
cp .env.example .env.local

# Start development server
bun dev

# Build for production
bun build

# Start production server
bun start
```

## Environment Configuration

The service requires certain environment variables to be configured. Copy `.env.example` to `.env.local` and adjust values as needed:

- **PORT**: Service port (default: 8081)
- **NEXT_PUBLIC_APP_ENV**: Environment setting (local/production)  
- **NEXT_PUBLIC_USE_MINIO**: Use MinIO for local storage (true/false)
- **MINIO_***: MinIO configuration for local development
- **BLOB_READ_WRITE_TOKEN**: Vercel Blob token for production

## API Reference

### POST /edit

Add a chyron overlay to a video.

**Request Body:**
```json
{
  "videoUrl": "http://localhost:9000/storage/storage/IMG_4693.MOV-1750057803474",
  "chyron": {
    "text": "BREAKING NEWS",
    "position": {
      "x": 50,
      "y": 90,
      "anchor": "bottom-center"
    },
    "style": {
      "fontFamily": "Arial",
      "fontSize": 32,
      "fontColor": "white",
      "backgroundColor": "red",
      "backgroundOpacity": 0.9,
      "padding": 15,
      "borderRadius": 5
    },
    "timing": {
      "startTime": 0,
      "duration": 5
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "originalVideo": "http://localhost:9000/storage/storage/IMG_4693.MOV-1750057803474",
  "editedVideo": "http://storage-url/edited-1234567890.mp4",
  "chyronConfig": { ... },
  "message": "Video successfully edited with chyron overlay"
}
```

### GET /

Service status and example configurations.

### GET /examples

Get example chyron configurations.

## Configuration Options

### Position
- `x`: Horizontal position (pixels)
- `y`: Vertical position (pixels)
- `anchor`: Position anchor point
  - `top-left`, `top-center`, `top-right`
  - `center-left`, `center`, `center-right`
  - `bottom-left`, `bottom-center`, `bottom-right`

### Style
- `fontFamily`: Font family (default: "Arial")
- `fontSize`: Font size in pixels (8-200, default: 24)
- `fontColor`: Text color (default: "white")
- `backgroundColor`: Background color (default: "black")
- `backgroundOpacity`: Background opacity (0-1, default: 0.7)
- `borderColor`: Border color (optional)
- `borderWidth`: Border width in pixels (default: 0)
- `padding`: Inner padding in pixels (default: 10)
- `borderRadius`: Corner radius in pixels (default: 0)
- `shadowColor`: Shadow color (optional)
- `shadowOffset`: Shadow offset `{x, y}` (optional)
- `shadowBlur`: Shadow blur radius (optional)

### Timing
- `startTime`: Start time in seconds
- `duration`: Duration in seconds (minimum: 0.1)

## Example Configurations

### News Chyron
```json
{
  "text": "BREAKING NEWS",
  "position": { "x": 50, "y": 90, "anchor": "bottom-center" },
  "style": {
    "fontFamily": "Arial",
    "fontSize": 32,
    "fontColor": "white",
    "backgroundColor": "red",
    "backgroundOpacity": 0.9,
    "padding": 15,
    "borderRadius": 5
  },
  "timing": { "startTime": 0, "duration": 5 }
}
```

### Social Media Tag
```json
{
  "text": "@username",
  "position": { "x": 10, "y": 10, "anchor": "top-left" },
  "style": {
    "fontFamily": "Helvetica",
    "fontSize": 18,
    "fontColor": "white",
    "backgroundColor": "rgba(0,0,0,0.5)",
    "backgroundOpacity": 0.7,
    "padding": 8,
    "borderRadius": 12
  },
  "timing": { "startTime": 0, "duration": 10 }
}
```

### Title Card
```json
{
  "text": "Video Title Here",
  "position": { "x": 50, "y": 50, "anchor": "center" },
  "style": {
    "fontFamily": "Arial",
    "fontSize": 48,
    "fontColor": "yellow",
    "backgroundColor": "black",
    "backgroundOpacity": 0.8,
    "borderColor": "yellow",
    "borderWidth": 2,
    "padding": 20,
    "borderRadius": 10
  },
  "timing": { "startTime": 1, "duration": 3 }
}
```

## Testing

### Comprehensive Test Suite

Run the complete test suite to validate all functionality:

```bash
# Run all tests (default)
./test-comprehensive.sh

# Run quick tests only
./test-comprehensive.sh --quick

# Run validation error tests
./test-comprehensive.sh --validation

# Show help
./test-comprehensive.sh --help
```

The test suite includes:
- ✅ Service status validation
- ✅ Basic video editing functionality  
- ✅ All chyron style examples (news, social, title card)
- ✅ Input validation and error handling
- ✅ Performance benchmarking
- ✅ Output video quality verification

### Manual Testing

Test individual endpoints manually:

```bash
# Test service status
curl -s http://localhost:8081/ | jq '.'

# Test basic video edit
curl -X POST http://localhost:8081/edit \
  -H "Content-Type: application/json" \
  -d '{
    "videoUrl": "http://localhost:9000/storage/storage/test-video.mp4",
    "chyron": {
      "text": "Sample Text",
      "position": { "x": 50, "y": 80, "anchor": "bottom-center" },
      "style": {
        "fontSize": 24,
        "fontColor": "white",
        "backgroundColor": "black",
        "backgroundOpacity": 0.8
      },
      "timing": { "startTime": 0, "duration": 3 }
    }
  }'
```

## Architecture

The service is designed for easy library swapping:

- **Video Processing Layer**: FFmpeg-based (can be swapped with other processors)
- **HTTP Layer**: Hono framework (easily replaceable)
- **Storage Layer**: Uses `@mvp/storage` (abstracted interface)
- **Validation Layer**: Zod schemas (type-safe validation)

## Dependencies

- **FFmpeg**: Required for video processing
- **Node.js**: Runtime environment
- **Bun**: Package manager and runtime
- **Hono**: Web framework
- **Zod**: Schema validation

## Environment Variables

- `PORT`: Service port (default: 8081)

## Docker Support

Build and run with Docker:

```bash
docker build -t video-editor .
docker run -p 8081:8081 video-editor
```

## Performance Notes

- Videos are processed in temporary directories
- Automatic cleanup after processing
- Optimized FFmpeg settings for web delivery
- Supports progress tracking during processing

## Error Handling

The service includes comprehensive error handling:
- Input validation with detailed error messages
- FFmpeg process monitoring
- Automatic temporary file cleanup
- Graceful error responses
