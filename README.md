# MVP Monorepo with Video Processing

A modern monorepo setup with Next.js 15, Trigger.dev for background tasks, and video-to-GIF conversion capabilities.

## Features

- **Video to GIF Converter**: Convert videos to 5-second, 256x256 animated GIFs using FFmpeg
- **Background Processing**: Powered by Trigger.dev for reliable, long-running tasks
- **Real-time Progress**: Live progress updates using Trigger.dev Realtime
- **File Storage**: Vercel Blob Storage for video and GIF hosting
- **Modern Stack**: Next.js 15, TypeScript, Tailwind CSS, and Turbo

## Project Structure

```
.
├── apps/
│   └── website/          # Next.js 15 app with video upload UI
├── mvp/
│   └── tasks/           # Trigger.dev background tasks (FFmpeg)
└── packages/
    ├── database/        # Database configuration
    ├── storage/         # Storage utilities
    ├── tsconfig/        # Shared TypeScript configs
    └── ui/              # Shared UI components
```

## Prerequisites

- Node.js 18+
- Bun package manager
- Trigger.dev account
- Vercel account (for production)
- Vercel Blob Storage configured

## Quick Start

### 1. Clone and Install

```bash
git clone <repository>
cd mvp2
bun install
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp .env.local .env
```

Configure the following in your `.env` file:

```bash
# Trigger.dev (Required)
TRIGGER_SECRET_KEY=tr_dev_xxxxxxxxxx        # From cloud.trigger.dev > API Keys
TRIGGER_PROJECT_ID=proj_xxxxxxxxxxxxx       # From cloud.trigger.dev > Settings
NEXT_PUBLIC_TRIGGER_PUBLIC_API_KEY=pk_xxxxx # From cloud.trigger.dev > API Keys

# Vercel Blob Storage (Required)
BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxxxxxxx

# Database (Required)
DATABASE_URL=postgres://user:password@localhost:5432/mvp
```

### 3. Start Development

Start all services concurrently:

```bash
# Terminal 1: Start the development servers
bun run dev

# Terminal 2: Start Trigger.dev worker (from mvp/tasks)
cd mvp/tasks
bun run dev
```

### 4. Access the Application

- **Website**: http://localhost:3000
- **Video to GIF Converter**: http://localhost:3000/video-to-gif
- **Trigger.dev Dashboard**: https://cloud.trigger.dev

## Video to GIF Converter

The video-to-GIF converter allows users to:
1. Upload a video file (max 100MB)
2. Convert it to a 5-second, 256x256 animated GIF
3. View real-time progress updates
4. Download or share the generated GIF

### How It Works

1. **Upload**: Videos are uploaded to Vercel Blob Storage
2. **Processing**: Trigger.dev task uses FFmpeg to convert the video
3. **Progress**: Real-time updates via Trigger.dev Realtime API
4. **Result**: GIF is stored in Vercel Blob and displayed to user

## Production Deployment

### Deploy to Vercel

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Configure Vercel**:
   ```bash
   vercel link
   ```

3. **Add Production Environment Variables** in Vercel Dashboard:
   - All variables from `.env` file
   - Use production values for Trigger.dev keys

4. **Deploy Tasks to Trigger.dev**:
   ```bash
   cd mvp/tasks
   bun run deploy
   ```

5. **Deploy Website to Vercel**:
   ```bash
   vercel --prod
   ```

## Available Scripts

From the root directory:

- `bun run dev` - Start all development servers
- `bun run build` - Build all packages
- `bun run lint` - Lint all packages
- `bun run typecheck` - Type check all packages
- `bun run clean` - Clean all build artifacts

## Troubleshooting

### FFmpeg Not Found in Development
FFmpeg build extension only works in production. For local development, install FFmpeg:
- macOS: `brew install ffmpeg`
- Ubuntu: `sudo apt-get install ffmpeg`
- Windows: Download from [ffmpeg.org](https://ffmpeg.org)

### Trigger.dev Connection Issues
1. Ensure `TRIGGER_SECRET_KEY` is correct
2. Check if Trigger.dev dev server is running
3. Verify project ID matches your dashboard

### Video Upload Fails
1. Check `BLOB_READ_WRITE_TOKEN` is configured
2. Verify file size is under 100MB
3. Ensure video format is supported (mp4, mov, avi, webm)

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

MIT

## Support

- [Trigger.dev Documentation](https://trigger.dev/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
