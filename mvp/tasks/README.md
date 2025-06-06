# Trigger.dev Tasks Package

This package contains long-running background tasks powered by Trigger.dev, including video-to-GIF conversion using FFmpeg.

## Prerequisites

- Node.js 18+ 
- Bun package manager
- Trigger.dev account
- Vercel account (for production deployment)
- Vercel Blob Storage configured

## Setup for New Trigger.dev Users

### 1. Create a Trigger.dev Account

1. Go to [trigger.dev](https://trigger.dev) and sign up
2. Create a new project in the dashboard
3. Note your project ID (format: `proj_xxxxxxxxxxxxx`)

### 2. Install Trigger.dev CLI

```bash
npm install -g @trigger.dev/cli@latest
# or
bun add -g @trigger.dev/cli@latest
```

### 3. Login to Trigger.dev

```bash
npx @trigger.dev/cli login
```

### 4. Configure Environment Variables

Add these to your `.env` file:

```bash
# Trigger.dev
TRIGGER_SECRET_KEY=tr_dev_xxxxxxxxxx  # Get from Trigger.dev dashboard > API Keys
TRIGGER_PROJECT_ID=proj_xxxxxxxxxxxxx  # Your project ID
TRIGGER_API_URL=https://api.trigger.dev # Default API URL

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxxxxxxx  # Get from Vercel dashboard
```

### 5. Initialize the Tasks Package

From the root of your monorepo:

```bash
cd mvp/tasks
bun install
```

### 6. Test Locally

Start the Trigger.dev development server:

```bash
bun run dev
```

This will:
- Start a local tunnel to your machine
- Register your tasks with Trigger.dev
- Watch for changes in your task files

## Production Deployment on Vercel

### 1. Set Up Vercel Project

1. Install Vercel CLI: `npm i -g vercel`
2. Link your project: `vercel link`
3. Add environment variables in Vercel dashboard:
   - `TRIGGER_SECRET_KEY` (use production key from Trigger.dev)
   - `TRIGGER_PROJECT_ID`
   - `BLOB_READ_WRITE_TOKEN`
   - `NEXT_PUBLIC_TRIGGER_PUBLIC_API_KEY` (for client-side status updates)

### 2. Deploy Tasks to Trigger.dev

Deploy your tasks to Trigger.dev's infrastructure:

```bash
# From mvp/tasks directory
bun run deploy

# Or with specific environment
npx @trigger.dev/cli deploy --env production
```

This will:
- Build your tasks with FFmpeg support
- Upload them to Trigger.dev's infrastructure
- Make them available for triggering from your Next.js app

### 3. Deploy Website to Vercel

```bash
# From root directory
vercel --prod
```

### 4. Configure Webhooks (Optional)

If you need webhooks for task completion:

1. Go to Trigger.dev dashboard > Webhooks
2. Add your production URL: `https://your-app.vercel.app/api/trigger-webhook`
3. Select events to listen for (e.g., `run.completed`, `run.failed`)

## Available Tasks

### videoToGif

Converts a video to a 256x256 square GIF (5 seconds, 15fps).

**Payload:**
```typescript
{
  videoUrl: string;      // URL of the video to convert
  userId: string;        // User identifier
  sessionId: string;     // Session identifier for tracking
}
```

**Returns:**
```typescript
{
  gifUrl: string;        // URL of the generated GIF
  duration: number;      // Duration in seconds (always 5)
  size: number;          // File size in bytes
}
```

## Monitoring & Debugging

### View Task Runs

1. Go to [cloud.trigger.dev](https://cloud.trigger.dev)
2. Select your project
3. Navigate to "Runs" to see all task executions
4. Click on a run to see detailed logs and traces

### Common Issues

#### FFmpeg Not Found
- Ensure you're using the FFmpeg build extension in `trigger.config.ts`
- The extension only works in production (not local dev)

#### Large Video Files
- Videos are downloaded to temp storage before processing
- Consider implementing file size limits
- Use streaming for very large files

#### Rate Limits
- Trigger.dev has concurrency limits based on your plan
- Configure task concurrency in `trigger.config.ts`

## Architecture Notes

- Tasks run on Trigger.dev's infrastructure, not Vercel's edge/serverless functions
- FFmpeg binary is included via build extensions
- Temporary files are stored in `/tmp` during processing
- Final GIFs are uploaded to Vercel Blob Storage
- Original videos are deleted after successful conversion

## Development Workflow

1. Make changes to task files in `src/`
2. Test locally with `bun run dev`
3. Deploy to staging: `npx @trigger.dev/cli deploy --env staging`
4. Test in staging environment
5. Deploy to production: `npx @trigger.dev/cli deploy --env production`

## Security Considerations

- Never expose `TRIGGER_SECRET_KEY` to client-side code
- Use `NEXT_PUBLIC_TRIGGER_PUBLIC_API_KEY` for client-side status polling
- Validate video URLs and file sizes before processing
- Implement user authentication before allowing task triggers

## Support

- [Trigger.dev Documentation](https://trigger.dev/docs)
- [Trigger.dev Discord](https://discord.gg/triggerdotdev)
- [Vercel Documentation](https://vercel.com/docs)