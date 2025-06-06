# MVP

## Setup

This project uses a monorepo structure with multiple environments through environment files:
- `.env.local` (default)
- `.env.dev`
- `.env.prev` 
- `.env.prod`

Install dependencies:
```bash
bun install
```

## Usage

All scripts accept an environment parameter. If no environment is specified, `local` is used by default.

### Development
```bash
bun dev           # uses .env.local
bun dev dev       # uses .env.dev
bun dev prod      # uses .env.prod
```

### Building
```bash
bun build         # uses .env.local
bun build dev     # uses .env.dev
bun build prod    # uses .env.prod
```

### Database Operations
```bash
bun db:push       # uses .env.local
bun db:push dev   # uses .env.dev
bun db:push prod  # uses .env.prod

bun db:gen        # uses .env.local
bun db:gen dev    # uses .env.dev

bun db:std        # uses .env.local
bun db:std dev    # uses .env.dev
```

### Environment Sync
Sync environment variables to Vercel:
```bash
bun sync-envs
```

### Other Commands
```bash
bun lint          # lint all workspaces
bun typecheck     # typecheck all workspaces
bun test          # test all workspaces
bun format        # format all workspaces
bun clean         # clean root node_modules
```

## Features

- 🚀 Built with Next.js 15 and React 19
- 🎨 Tailwind CSS for styling
- 🔧 TypeScript for type safety
- 📦 Monorepo structure with Turborepo
- 🎥 AI Video Generation with fal.ai
- 🎵 AI Audio Generation (Voice & Music)
- 🗣️ Text-to-Speech with ElevenLabs
- 🤖 Multiple AI Provider Support

### AI Generation Features

#### Video Generation
- Navigate to `/videos` to access AI video generation
- Uses fal.ai's Veo 3 model for high-quality video creation
- Supports different aspect ratios and durations

#### Audio Generation (NEW)
- Navigate to `/audio` to access AI audio generation
- **Voice Generation**: Convert text to natural speech using ElevenLabs
  - Multiple voice options (male/female)
  - Adjustable stability and similarity settings
  - High-quality audio output
- **Music Generation**: (Coming soon with Riffusion integration)
  - Generate music from text descriptions
  - Multiple genres and moods
  - Customizable duration

## Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Database
DATABASE_URL=your-database-url

# AI Providers
OPENAI_API_KEY=your-openai-api-key
FAL_API_KEY=your-fal-api-key
ELEVENLABS_API_KEY=your-elevenlabs-api-key

# Add other required environment variables
```
