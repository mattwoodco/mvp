import { z } from "zod";

// Video Script Attributes Schema based on the research report
export const VideoScriptAttributesSchema = z.object({
  // Content Structure & Format
  format: z
    .enum([
      "product_demo",
      "testimonial_ugc",
      "before_after",
      "narrative_story",
    ])
    .describe("Short-form video ad format type"),
  duration: z
    .number()
    .min(5)
    .max(60)
    .describe("Video duration in seconds (5-60s for short-form)"),
  pacing: z
    .enum(["fast", "medium", "dynamic"])
    .describe("Overall pacing and rhythm"),

  // Hook & Opening
  hookType: z
    .enum(["bold_statement", "question", "problem_snapshot", "startling_fact"])
    .describe("Type of attention-grabbing opening"),
  hookTiming: z
    .number()
    .min(1)
    .max(3)
    .describe("Hook delivery time in seconds (1-3s)"),

  // Narrative Structure
  narrativeStructure: z
    .enum([
      "problem_solution",
      "lifestyle_integration",
      "transformation",
      "educational",
    ])
    .describe("Underlying story framework"),
  conflictType: z
    .enum([
      "relatable_pain",
      "aspirational_gap",
      "before_state",
      "common_frustration",
    ])
    .describe("Central conflict or tension"),
  resolution: z
    .enum([
      "product_hero",
      "lifestyle_benefit",
      "dramatic_reveal",
      "educational_insight",
    ])
    .describe("How conflict is resolved"),

  // Tone & Style
  tone: z
    .enum(["conversational", "casual", "authentic", "energetic", "empathetic"])
    .describe("Overall communication tone"),
  voiceStyle: z
    .enum([
      "first_person",
      "peer_to_peer",
      "friendly_expert",
      "relatable_storyteller",
    ])
    .describe("Narrative voice approach"),
  language: z
    .enum(["everyday", "accessible", "platform_native", "trendy_slang"])
    .describe("Language complexity and style"),

  // Visual & Editing
  visualStyle: z
    .enum([
      "jump_cuts",
      "split_screen",
      "before_after_comparison",
      "step_by_step",
    ])
    .describe("Primary visual technique"),
  sceneChanges: z
    .number()
    .min(2)
    .max(8)
    .describe("Number of scene changes (2-8 for engagement)"),
  textOverlays: z.boolean().describe("Include on-screen text and captions"),

  // Call to Action
  ctaPlacement: z
    .enum([
      "integrated_natural",
      "soft_recommendation",
      "end_focused",
      "story_embedded",
    ])
    .describe("How CTA is positioned"),
  ctaType: z
    .enum(["link_in_bio", "discount_code", "try_now", "learn_more"])
    .describe("Type of call to action"),
  urgency: z
    .enum(["limited_time", "scarcity", "fomo", "none"])
    .describe("Urgency or scarcity element"),

  // Social Proof & Credibility
  socialProof: z
    .enum([
      "testimonial",
      "user_ratings",
      "popularity_mention",
      "trending_reference",
    ])
    .describe("Type of social validation"),
  credibilityElement: z
    .enum([
      "real_person",
      "before_after_proof",
      "demonstration",
      "expert_mention",
    ])
    .describe("Trust-building component"),

  // Platform Optimization
  platform: z
    .enum(["tiktok", "instagram_reels", "youtube_shorts", "cross_platform"])
    .describe("Target platform for optimization"),
  aspectRatio: z.enum(["9:16", "1:1", "16:9"]).describe("Video aspect ratio"),
  soundStrategy: z
    .enum(["trending_audio", "custom_music", "voice_over", "ambient"])
    .describe("Audio/sound approach"),

  // Engagement Tactics
  interactionPrompt: z
    .enum([
      "question_to_audience",
      "comment_encouragement",
      "share_worthy_moment",
      "duet_invitation",
    ])
    .describe("Audience engagement strategy"),
  trendAlignment: z
    .enum([
      "viral_challenge",
      "trending_format",
      "seasonal_relevance",
      "cultural_moment",
    ])
    .describe("How it aligns with current trends"),
  shareability: z
    .enum([
      "quotable_moment",
      "transformation_reveal",
      "educational_value",
      "entertainment",
    ])
    .describe("What makes it shareable"),
});

export type VideoScriptAttributes = z.infer<typeof VideoScriptAttributesSchema>;

// Agent System Types
export const AgentTaskSchema = z.object({
  id: z.string(),
  type: z.enum([
    "script_generation",
    "attribute_analysis",
    "optimization",
    "validation",
  ]),
  status: z.enum(["pending", "running", "completed", "failed"]),
  input: z.any(),
  output: z.any().optional(),
  error: z.string().optional(),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
  parentTaskId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type AgentTask = z.infer<typeof AgentTaskSchema>;

export const AgentStateSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(["idle", "thinking", "acting", "waiting", "error"]),
  currentTask: z.string().optional(),
  progress: z.number().min(0).max(100),
  memory: z.record(z.any()),
  tools: z.array(z.string()),
  lastActivity: z.date(),
  errorCount: z.number().default(0),
  maxRetries: z.number().default(3),
});

export type AgentState = z.infer<typeof AgentStateSchema>;

export const WorkflowNodeSchema = z.object({
  id: z.string(),
  type: z.enum(["agent", "tool", "decision", "parallel", "sequential"]),
  name: z.string(),
  description: z.string().optional(),
  agentId: z.string().optional(),
  toolId: z.string().optional(),
  inputs: z.array(z.string()),
  outputs: z.array(z.string()),
  condition: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type WorkflowNode = z.infer<typeof WorkflowNodeSchema>;

export const WorkflowExecutionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  status: z.enum(["pending", "running", "completed", "failed", "cancelled"]),
  nodes: z.array(WorkflowNodeSchema),
  currentNode: z.string().optional(),
  results: z.record(z.any()),
  startTime: z.date(),
  endTime: z.date().optional(),
  error: z.string().optional(),
  scriptVariations: z
    .array(
      z.object({
        id: z.string(),
        attributes: VideoScriptAttributesSchema,
        script: z.string(),
        score: z.number().optional(),
        feedback: z.string().optional(),
      }),
    )
    .default([]),
});

export type WorkflowExecution = z.infer<typeof WorkflowExecutionSchema>;

// LLM Provider Types
export const LLMProviderSchema = z.enum(["mistral", "cerebras", "anthropic"]);
export type LLMProvider = z.infer<typeof LLMProviderSchema>;

export const LLMConfigSchema = z.object({
  provider: LLMProviderSchema,
  model: z.string(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).max(32000).default(2000),
  topP: z.number().min(0).max(1).default(1),
  apiKey: z.string(),
  baseUrl: z.string().optional(),
  retryAttempts: z.number().default(3),
  timeout: z.number().default(30000),
});

export type LLMConfig = z.infer<typeof LLMConfigSchema>;

// Tool Types
export const ToolParameterSchema = z.object({
  name: z.string(),
  type: z.enum(["string", "number", "boolean", "object", "array"]),
  description: z.string(),
  required: z.boolean().default(false),
  enum: z.array(z.string()).optional(),
  default: z.any().optional(),
});

export type ToolParameter = z.infer<typeof ToolParameterSchema>;

export const ToolDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  parameters: z.array(ToolParameterSchema),
  handler: z.function().args(z.record(z.any())).returns(z.promise(z.any())),
  category: z.enum(["analysis", "generation", "validation", "optimization"]),
  metadata: z.record(z.any()).optional(),
});

export type ToolDefinition = z.infer<typeof ToolDefinitionSchema>;

// React Flow Types for Visualization
export interface FlowNode {
  id: string;
  type: "agent" | "tool" | "decision" | "start" | "end";
  position: { x: number; y: number };
  data: {
    label: string;
    status: "pending" | "running" | "completed" | "failed";
    progress?: number;
    agentState?: AgentState;
    taskResult?: any;
    error?: string;
  };
  style?: React.CSSProperties;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  type?: "default" | "smoothstep" | "step";
  animated?: boolean;
  style?: React.CSSProperties;
  label?: string;
  data?: {
    condition?: string;
    weight?: number;
  };
}

// Event System Types
export const AgentEventSchema = z.object({
  id: z.string(),
  type: z.enum([
    "task_started",
    "task_completed",
    "task_failed",
    "agent_state_changed",
    "workflow_progress",
  ]),
  agentId: z.string(),
  timestamp: z.date(),
  data: z.any(),
  workflowId: z.string().optional(),
});

export type AgentEvent = z.infer<typeof AgentEventSchema>;

// Database Schema Types for Script Generations
export const ScriptGenerationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  workflowExecutionId: z.string(),
  attributes: VideoScriptAttributesSchema,
  script: z.string(),
  variations: z.array(
    z.object({
      id: z.string(),
      attributes: VideoScriptAttributesSchema,
      script: z.string(),
      score: z.number().optional(),
      feedback: z.string().optional(),
    }),
  ),
  status: z.enum(["generating", "completed", "failed"]),
  score: z.number().optional(),
  feedback: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ScriptGeneration = z.infer<typeof ScriptGenerationSchema>;

// Error Types
export class AgentError extends Error {
  constructor(
    message: string,
    public code: string,
    public agentId?: string,
    public taskId?: string,
    public retryable = true,
  ) {
    super(message);
    this.name = "AgentError";
  }
}

export class WorkflowError extends Error {
  constructor(
    message: string,
    public code: string,
    public workflowId?: string,
    public nodeId?: string,
  ) {
    super(message);
    this.name = "WorkflowError";
  }
}

export class LLMError extends Error {
  constructor(
    message: string,
    public provider: LLMProvider,
    public model: string,
    public retryable = true,
  ) {
    super(message);
    this.name = "LLMError";
  }
}
