# Mistral AI TypeScript SDK Research

## Overview

The Mistral AI TypeScript SDK (`@mistralai/mistralai`) is the official client library for integrating Mistral AI's powerful language models into TypeScript and JavaScript applications. The SDK provides a comprehensive interface for text generation, embeddings, function calling, agents, fine-tuning, and more.

## Key Information

- **Latest Version**: 1.7.1 (as of January 2025)
- **Repository**: https://github.com/mistralai/client-ts
- **License**: Apache-2.0
- **Deprecated Package**: The old `@mistralai/client-js` package has been deprecated in favor of `@mistralai/mistralai`

## Installation

```bash
# NPM
npm install @mistralai/mistralai

# PNPM
pnpm add @mistralai/mistralai

# Bun
bun add @mistralai/mistralai

# Yarn (requires manual installation of peer dependencies)
yarn add @mistralai/mistralai zod
```

## Key Features

### 1. **Chat Completions**
- Standard text generation with support for system prompts, user messages, and assistant responses
- Streaming support for real-time response generation
- Temperature, top_p, and other generation parameters

### 2. **Function Calling**
- Define custom functions that models can call
- Supports both single and parallel function calls
- Tool choice options: "auto", "any", "none"
- Perfect for building agents and LAM (Language Action Model) applications

### 3. **Embeddings**
- Generate vector embeddings using `mistral-embed` model
- Batch processing support for multiple inputs

### 4. **Agents API**
- Create and manage AI agents with built-in tools
- Code interpreter, web search, image generation capabilities
- Persistent conversation memory
- Agent handoff mechanism for multi-agent workflows

### 5. **File Operations**
- Upload, list, retrieve, delete, and download files
- Stream-based file uploads to handle large files efficiently

### 6. **Fine-tuning**
- Create, manage, and monitor fine-tuning jobs
- Support for custom model training

### 7. **OCR & Document AI**
- Process documents with OCR capabilities
- Pricing: $1/1000 pages for OCR, $3/1000 pages for annotations

### 8. **Moderation & Classification**
- Built-in content moderation
- Custom classification tasks

## Available Models

### Premier Models
- **Mistral Medium 3**: State-of-the-art performance ($0.4/M input, $2/M output tokens)
- **Mistral Large**: Top-tier reasoning ($2/M input, $6/M output tokens)
- **Pixtral Large**: Vision-capable large model ($2/M input, $6/M output tokens)
- **Codestral**: Code-focused model ($0.3/M input, $0.9/M output tokens)

### Open Models
- **Mistral Small 3.1**: Multimodal, multilingual, Apache 2.0 ($0.1/M input, $0.3/M output tokens)
- **Devstral**: Best open-source model for coding agents
- **Pixtral 12B**: Vision-capable small model
- **Ministral 8B/3B**: Edge deployment models

## Basic Usage Examples

### Initialize Client
```typescript
import { Mistral } from "@mistralai/mistralai";

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY ?? "",
});
```

### Chat Completion
```typescript
const result = await mistral.chat.complete({
  model: "mistral-small-latest",
  messages: [
    {
      role: "user",
      content: "Who is the best French painter?",
    },
  ],
});

console.log(result.choices[0].message.content);
```

### Streaming
```typescript
const result = await mistral.chat.stream({
  model: "mistral-small-latest",
  messages: [{ role: "user", content: "Tell me a story" }],
});

for await (const chunk of result) {
  if (chunk.choices[0].delta.content) {
    process.stdout.write(chunk.choices[0].delta.content);
  }
}
```

### Function Calling
```typescript
const tools = [
  {
    type: "function",
    function: {
      name: "getWeather",
      description: "Get weather for a location",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "City name",
          },
        },
        required: ["location"],
      },
    },
  },
];

const response = await mistral.chat.complete({
  model: "mistral-large-latest",
  messages: [{ role: "user", content: "What's the weather in Paris?" }],
  tools: tools,
  toolChoice: "auto",
});
```

## Advanced Features

### Error Handling
- Comprehensive error types: `HTTPValidationError`, `SDKValidationError`, `SDKError`
- Network error handling with specific error types
- Pretty-print validation errors for debugging

### Retry Strategy
- Configurable retry strategies (backoff, custom)
- Per-operation or global retry configuration
- Connection error retry support

### Custom HTTP Client
- Hook system for request/response modification
- Custom headers and timeouts
- Integration with third-party HTTP clients

### Server-Sent Events (SSE)
- Async iterable support for streaming responses
- Automatic connection management
- Works with conversations and chat completions

## Pricing Tiers

### Free Tier Limitations
- 1 request per second
- 500,000 tokens per minute
- 1 billion tokens per month

### Le Chat Subscriptions
- **Free**: $0/month - Basic features
- **Pro**: $14.99/month - Enhanced productivity, agents
- **Team**: $24.99/user/month - Collaborative workspace
- **Enterprise**: Custom pricing - Private deployments

## Best Practices

1. **Environment Variables**: Always use environment variables for API keys
2. **Error Handling**: Implement comprehensive error handling for network and validation errors
3. **Streaming**: Use streaming for better user experience with long responses
4. **File Uploads**: Use stream-based uploads for large files to avoid memory issues
5. **Retry Logic**: Configure appropriate retry strategies for production
6. **Token Management**: Monitor token usage to stay within limits

## Alternative SDKs

### Vercel AI SDK Integration
```bash
npm install @ai-sdk/mistral
```

The Vercel AI SDK provides a unified interface for multiple AI providers including Mistral.

### Community Clients
- Various third-party clients available for other languages (Go, Rust, PHP, Ruby, etc.)
- Note: These are not officially maintained by Mistral AI

## Migration Notes

- If migrating from `mistralai/client-js`, update imports to use `@mistralai/mistralai`
- The new SDK uses a more modular architecture with namespaced methods
- Function calling API has been simplified compared to older versions

## Resources

- **Documentation**: https://docs.mistral.ai/
- **API Reference**: https://docs.mistral.ai/api/
- **GitHub**: https://github.com/mistralai/client-ts
- **Examples**: Available in the GitHub repository's examples directory
- **Support**: Available through help center, developer knowledge base, and chatbot for paid tiers

## Key Takeaways

1. The Mistral AI TypeScript SDK is a comprehensive, well-maintained library with excellent TypeScript support
2. It offers competitive pricing with a generous free tier for development
3. The SDK supports advanced features like function calling, agents, and streaming out of the box
4. Strong focus on developer experience with good error handling and debugging capabilities
5. Regular updates and active maintenance (weekly releases)
6. Suitable for both simple chatbots and complex agent-based applications