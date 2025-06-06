import { z } from 'zod';

// The 24 attributes from the report
export const VideoScriptAttributesSchema = z.object({
  // Core content attributes
  hookFastPaceRapidly: z.boolean().describe("Grab attention within 1-3 seconds with rapid pacing"),
  conversationalCopywriting: z.boolean().describe("Use casual, direct, authentic tone"),
  dynamicVisualStyle: z.boolean().describe("Fast-moving visuals with quick cuts"),
  relatableFraming: z.boolean().describe("Frame content to resonate with viewer interests"),
  strongCTA: z.boolean().describe("Include clear, soft calls-to-action"),
  
  // Ad format types
  productDemo: z.boolean().describe("Show product in action with demonstration"),
  customerTestimonial: z.boolean().describe("Feature authentic user testimonials"),
  beforeAfterTransformation: z.boolean().describe("Show dramatic before/after contrast"),
  storytellingNarrative: z.boolean().describe("Tell a mini story with beginning, middle, end"),
  
  // Content approach
  problemSolutionFraming: z.boolean().describe("Open with problem, position product as solution"),
  lifestyleIntegration: z.boolean().describe("Integrate product into everyday scenarios"),
  socialProof: z.boolean().describe("Mention how many people use/love the product"),
  trendAlignment: z.boolean().describe("Align with viral trends or challenges"),
  
  // Technical elements
  emotionalAppeal: z.boolean().describe("Use humor, inspiration, or touching moments"),
  visualRichness: z.boolean().describe("Use engaging visuals and graphics"),
  platformNativeStyle: z.boolean().describe("Match platform's native content style"),
  musicSoundIntegration: z.boolean().describe("Use trending audio or custom music"),
  textOverlayCaptions: z.boolean().describe("Include on-screen text and captions"),
  
  // Optimization
  brandIntegration: z.boolean().describe("Seamlessly integrate brand/product early"),
  authenticity: z.boolean().describe("Feel genuine and not overly polished"),
  brevity: z.boolean().describe("Keep to 15-30 seconds optimal length"),
  mobileFirstFormat: z.boolean().describe("Optimize for vertical mobile viewing"),
  interactiveElements: z.boolean().describe("Encourage engagement or continuation"),
  urgencyScarcity: z.boolean().describe("Include limited time offers or FOMO elements"),
});

export type VideoScriptAttributes = z.infer<typeof VideoScriptAttributesSchema>;

export const ScriptGenerationRequestSchema = z.object({
  attributes: VideoScriptAttributesSchema,
  numberOfVariations: z.number().min(1).max(20).default(12),
  productName: z.string().optional(),
  productDescription: z.string().optional(),
  targetAudience: z.string().optional(),
  brandTone: z.string().optional(),
});

export type ScriptGenerationRequest = z.infer<typeof ScriptGenerationRequestSchema>;

export interface GeneratedScript {
  id: string;
  scriptText: string;
  duration: string; // e.g., "15s", "30s"
  visualDirections: string[];
  audioDirections: string;
  keyHooks: string[];
  primaryAttributes: string[]; // Which attributes were emphasized
  confidence: number; // 0-1 confidence score
}

export interface AgentProgress {
  stage: 'initializing' | 'analyzing' | 'generating' | 'optimizing' | 'finalizing';
  currentScript: number;
  totalScripts: number;
  message: string;
  timestamp: number;
}

export interface AgentNode {
  id: string;
  type: 'input' | 'analyzer' | 'generator' | 'optimizer' | 'output';
  data: {
    label: string;
    status: 'idle' | 'active' | 'completed' | 'error';
    progress?: number;
    details?: string;
  };
}

export interface AgentEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
  style?: {
    stroke?: string;
    strokeWidth?: number;
  };
}