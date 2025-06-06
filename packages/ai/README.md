# @repo/ai

A unified AI SDK wrapper that provides a consistent interface for multiple AI providers.

## Installation

This package is part of the monorepo and is available as a workspace dependency.

```json
{
  "dependencies": {
    "@repo/ai": "workspace:*"
  }
}
```

## Supported Providers

- **OpenAI** - GPT models
- **Google Vertex AI / Gemini** - Google's AI models
- **Mistral AI** - Mistral models
- **Cerebras** - Fast inference (OpenAI-compatible)
- **Ollama** - Local models (OpenAI-compatible)
- **fal.ai** - Video generation (Veo 3)

## Environment Variables

Set the following environment variables for the providers you want to use:

```bash
# OpenAI
OPENAI_API_KEY=your-api-key
OPENAI_MODEL=gpt-4o

# Google
GOOGLE_API_KEY=your-api-key
GOOGLE_MODEL=gemini-pro

# Mistral
MISTRAL_API_KEY=your-api-key
MISTRAL_MODEL=mistral-large-latest

# Cerebras
CEREBRAS_API_KEY=your-api-key
CEREBRAS_MODEL=llama3.1-70b

# Ollama (local)
OLLAMA_API_URL=http://localhost:11434/v1
OLLAMA_MODEL=llama2

# fal.ai
FAL_API_KEY=your-api-key
```

## Usage

### Basic Text Generation

```typescript
import { generateText } from '@repo/ai';
import { createOpenAIProvider } from '@repo/ai';

const openai = createOpenAIProvider();

const result = await generateText({
  model: openai('gpt-4o'),
  prompt: 'What is the meaning of life?',
});

console.log(result.text);
```

### Video Generation with fal.ai

```typescript
import { generateVideo } from '@repo/ai/providers/fal';

const result = await generateVideo('A serene sunset over the ocean', {
  aspectRatio: '16:9',
  duration: '8s',
});

console.log(result.data.video.url);
```

### Using Different Providers

```typescript
import { generateText } from '@repo/ai';
import { 
  createOpenAIProvider,
  createGoogleVertexProvider,
  createMistralProvider,
  createCerebrasProvider,
  createOllamaProvider 
} from '@repo/ai';

// OpenAI
const openai = createOpenAIProvider();
const openaiResult = await generateText({
  model: openai('gpt-4o'),
  prompt: 'Hello, world!',
});

// Google
const google = createGoogleVertexProvider();
const googleResult = await generateText({
  model: google('gemini-pro'),
  prompt: 'Hello, world!',
});

// Mistral
const mistral = createMistralProvider();
const mistralResult = await generateText({
  model: mistral('mistral-large-latest'),
  prompt: 'Hello, world!',
});

// Cerebras (fast inference)
const cerebras = createCerebrasProvider();
const cerebrasResult = await generateText({
  model: cerebras('llama3.1-70b'),
  prompt: 'Hello, world!',
});

// Ollama (local)
const ollama = createOllamaProvider();
const ollamaResult = await generateText({
  model: ollama('llama2'),
  prompt: 'Hello, world!',
});
```

### Streaming

```typescript
import { streamText } from '@repo/ai';
import { createOpenAIProvider } from '@repo/ai';

const openai = createOpenAIProvider();

const stream = await streamText({
  model: openai('gpt-4o'),
  prompt: 'Write a story about a robot',
});

for await (const chunk of stream) {
  process.stdout.write(chunk.text);
}
```

### Structured Output

```typescript
import { generateObject } from '@repo/ai';
import { createOpenAIProvider } from '@repo/ai';
import { z } from 'zod';

const openai = createOpenAIProvider();

const result = await generateObject({
  model: openai('gpt-4o'),
  schema: z.object({
    name: z.string(),
    age: z.number(),
    email: z.string().email(),
  }),
  prompt: 'Generate a random person',
});

console.log(result.object);
```