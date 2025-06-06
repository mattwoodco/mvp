# @mvp/agent

Video Script Generation Agent Package

This package provides a multi-agent system for generating video script variations based on 24 key attributes from short-form video ad research. It uses Mistral for analysis and optimization, and Cerebras for fast script generation.

## Features

- 🤖 Multi-agent workflow with Cerebras LLama 3.3 70B
- 📊 24 research-backed video script attributes
- 🔄 Real-time progress tracking
- 💾 Database persistence
- 🎯 Attribute synergy analysis
- ⚡ Fast generation with Cerebras inference

## Usage

```typescript
import { VideoScriptAgent, VideoScriptDatabaseService } from '@mvp/agent';

// Create agent instance with progress callback
const agent = new VideoScriptAgent({
  onProgress: (progress) => {
    console.log(`${progress.stage}: ${progress.message}`);
  }
});

// Generate scripts
const scripts = await agent.generateScripts({
  attributes: {
    hookFastPaceRapidly: true,
    conversationalCopywriting: true,
    productDemo: true,
    strongCTA: true,
    // ... other attributes
  },
  numberOfVariations: 12,
  productName: "Amazing Product",
  productDescription: "A product that solves problems",
  targetAudience: "Young professionals",
  brandTone: "Friendly and approachable"
});

// Save to database
const dbService = new VideoScriptDatabaseService();
await dbService.completeGeneration(generationId, scripts, tokens, time);
```

## Architecture

The agent system follows Anthropic's best practices with:
- Clear tool interfaces
- Staged workflow (analyze → generate → optimize)
- Progress tracking
- Error handling
- Database persistence

## Video Script Attributes

The 24 attributes are organized into categories:

### Core Content
- `hookFastPaceRapidly` - Grab attention within 1-3 seconds
- `conversationalCopywriting` - Casual, authentic tone
- `dynamicVisualStyle` - Fast-moving visuals
- `relatableFraming` - Resonate with viewer interests
- `strongCTA` - Clear calls-to-action

### Ad Formats
- `productDemo` - Show product in action
- `customerTestimonial` - Authentic testimonials
- `beforeAfterTransformation` - Dramatic contrasts
- `storytellingNarrative` - Mini story structure

### Content Approach
- `problemSolutionFraming` - Problem → Solution
- `lifestyleIntegration` - Everyday scenarios
- `socialProof` - User validation
- `trendAlignment` - Viral trend integration

### Technical Elements
- `emotionalAppeal` - Humor/inspiration
- `visualRichness` - Engaging graphics
- `platformNativeStyle` - Platform-specific feel
- `musicSoundIntegration` - Audio elements
- `textOverlayCaptions` - On-screen text

### Optimization
- `brandIntegration` - Early brand presence
- `authenticity` - Genuine feel
- `brevity` - 15-30 second length
- `mobileFirstFormat` - Vertical viewing
- `interactiveElements` - Engagement prompts
- `urgencyScarcity` - FOMO elements