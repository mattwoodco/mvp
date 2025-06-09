import { z } from "zod";

// Script generation attributes based on the video ad report
export const ScriptAttributesSchema = z.object({
  // Core script structure
  hookStyle: z
    .enum([
      "bold_statement",
      "provocative_question",
      "problem_snapshot",
      "startling_visual",
    ])
    .describe("Hook approach for the first 1-3 seconds"),

  adCategory: z
    .enum([
      "product_demo",
      "tutorial",
      "customer_testimonial",
      "ugc_style",
      "before_after_transformation",
      "storytelling_narrative",
    ])
    .describe("Primary ad format category"),

  copywritingTone: z
    .enum([
      "conversational_casual",
      "direct_authentic",
      "peer_to_peer",
      "empathetic_relatable",
    ])
    .describe("Overall tone and voice style"),

  visualStyle: z
    .enum([
      "quick_cuts_dynamic",
      "split_screen_comparison",
      "text_overlay_heavy",
      "ugc_handheld_style",
      "transformation_reveal",
    ])
    .describe("Visual editing and presentation style"),

  problemSolutionFraming: z
    .enum([
      "pain_point_focus",
      "lifestyle_aspiration",
      "social_proof_validation",
      "trend_alignment",
    ])
    .describe("How the product benefit is positioned"),

  pacingStyle: z
    .enum(["rapid_fire_15sec", "steady_build_30sec", "story_arc_45sec"])
    .describe("Overall video pacing and duration approach"),

  ctaApproach: z
    .enum([
      "soft_recommendation",
      "urgent_scarcity",
      "social_proof_driven",
      "embedded_natural",
    ])
    .describe("Call-to-action style and integration"),
});

export const ScriptGenerationRequestSchema = z.object({
  userId: z.string(),
  productName: z.string(),
  productDescription: z.string(),
  targetAudience: z.string(),
  keyBenefits: z.array(z.string()),
  brandTone: z.string().optional(),
  competitorInfo: z.string().optional(),
  customPrompt: z.string().optional(),

  // Script variations to generate (up to 12)
  variationCount: z.number().min(1).max(12).default(12),

  // Optional attribute constraints
  requiredAttributes: ScriptAttributesSchema.partial().optional(),
});

export const ScriptVariationSchema = z.object({
  id: z.string(),
  title: z.string(),
  script: z.string(),
  duration: z.number(), // in seconds
  attributes: ScriptAttributesSchema,

  // Structure breakdown
  hook: z.string(),
  mainContent: z.string(),
  callToAction: z.string(),

  // Performance predictions
  estimatedEngagement: z.enum(["low", "medium", "high"]),
  targetPlatforms: z.array(
    z.enum(["tiktok", "instagram_reels", "youtube_shorts"]),
  ),

  // Metadata
  generatedAt: z.date(),
  processingTime: z.number(), // in milliseconds
});

export const ScriptGenerationResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  status: z.enum(["pending", "processing", "completed", "failed"]),

  // Request details
  request: ScriptGenerationRequestSchema,

  // Generated variations
  variations: z.array(ScriptVariationSchema),

  // Generation metadata
  totalProcessingTime: z.number(),
  generatedAt: z.date(),
  completedAt: z.date().optional(),

  // Error handling
  error: z.string().optional(),
  retryCount: z.number().default(0),
});

// Agent workflow types
export const AgentStepSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(["pending", "running", "completed", "failed"]),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
  output: z.any().optional(),
  error: z.string().optional(),
});

export const AgentWorkflowSchema = z.object({
  id: z.string(),
  generationId: z.string(),
  status: z.enum(["pending", "running", "completed", "failed"]),
  steps: z.array(AgentStepSchema),
  startTime: z.date(),
  endTime: z.date().optional(),
  totalSteps: z.number(),
  completedSteps: z.number(),
});

// Export types
export type ScriptAttributes = z.infer<typeof ScriptAttributesSchema>;
export type ScriptGenerationRequest = z.infer<
  typeof ScriptGenerationRequestSchema
>;
export type ScriptVariation = z.infer<typeof ScriptVariationSchema>;
export type ScriptGenerationResponse = z.infer<
  typeof ScriptGenerationResponseSchema
>;
export type AgentStep = z.infer<typeof AgentStepSchema>;
export type AgentWorkflow = z.infer<typeof AgentWorkflowSchema>;
