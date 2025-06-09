import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./users.schema";

// Enums for script attributes
export const hookStyleEnum = pgEnum("hook_style", [
  "bold_statement",
  "provocative_question",
  "problem_snapshot",
  "startling_visual",
]);

export const adCategoryEnum = pgEnum("ad_category", [
  "product_demo",
  "tutorial",
  "customer_testimonial",
  "ugc_style",
  "before_after_transformation",
  "storytelling_narrative",
]);

export const copywritingToneEnum = pgEnum("copywriting_tone", [
  "conversational_casual",
  "direct_authentic",
  "peer_to_peer",
  "empathetic_relatable",
]);

export const visualStyleEnum = pgEnum("visual_style", [
  "quick_cuts_dynamic",
  "split_screen_comparison",
  "text_overlay_heavy",
  "ugc_handheld_style",
  "transformation_reveal",
]);

export const problemSolutionFramingEnum = pgEnum("problem_solution_framing", [
  "pain_point_focus",
  "lifestyle_aspiration",
  "social_proof_validation",
  "trend_alignment",
]);

export const pacingStyleEnum = pgEnum("pacing_style", [
  "rapid_fire_15sec",
  "steady_build_30sec",
  "story_arc_45sec",
]);

export const ctaApproachEnum = pgEnum("cta_approach", [
  "soft_recommendation",
  "urgent_scarcity",
  "social_proof_driven",
  "embedded_natural",
]);

export const engagementLevelEnum = pgEnum("engagement_level", [
  "low",
  "medium",
  "high",
]);
export const platformEnum = pgEnum("platform", [
  "tiktok",
  "instagram_reels",
  "youtube_shorts",
]);
export const generationStatusEnum = pgEnum("generation_status", [
  "pending",
  "processing",
  "completed",
  "failed",
]);
export const workflowStatusEnum = pgEnum("workflow_status", [
  "pending",
  "running",
  "completed",
  "failed",
]);

// Script generations table
export const scriptGeneration = pgTable("script_generation", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  // Request details
  productName: text("product_name").notNull(),
  productDescription: text("product_description").notNull(),
  targetAudience: text("target_audience").notNull(),
  keyBenefits: jsonb("key_benefits").notNull(), // Array of strings
  brandTone: text("brand_tone"),
  competitorInfo: text("competitor_info"),
  customPrompt: text("custom_prompt"),
  variationCount: integer("variation_count").notNull().default(12),

  // Generation metadata
  status: generationStatusEnum("status").notNull().default("pending"),
  totalProcessingTime: integer("total_processing_time"), // in milliseconds
  error: text("error"),
  retryCount: integer("retry_count").notNull().default(0),

  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Script variations table
export const scriptVariation = pgTable("script_variation", {
  id: text("id").primaryKey(),
  generationId: text("generation_id")
    .notNull()
    .references(() => scriptGeneration.id, { onDelete: "cascade" }),

  // Script content
  title: text("title").notNull(),
  script: text("script").notNull(),
  duration: integer("duration").notNull(), // in seconds

  // Script structure
  hook: text("hook").notNull(),
  mainContent: text("main_content").notNull(),
  callToAction: text("call_to_action").notNull(),

  // Attributes
  hookStyle: hookStyleEnum("hook_style").notNull(),
  adCategory: adCategoryEnum("ad_category").notNull(),
  copywritingTone: copywritingToneEnum("copywriting_tone").notNull(),
  visualStyle: visualStyleEnum("visual_style").notNull(),
  problemSolutionFraming: problemSolutionFramingEnum(
    "problem_solution_framing",
  ).notNull(),
  pacingStyle: pacingStyleEnum("pacing_style").notNull(),
  ctaApproach: ctaApproachEnum("cta_approach").notNull(),

  // Performance predictions
  estimatedEngagement: engagementLevelEnum("estimated_engagement").notNull(),
  targetPlatforms: jsonb("target_platforms").notNull(), // Array of platform enums

  // Metadata
  processingTime: integer("processing_time").notNull(), // in milliseconds
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Agent workflows table
export const agentWorkflow = pgTable("agent_workflow", {
  id: text("id").primaryKey(),
  generationId: text("generation_id")
    .notNull()
    .references(() => scriptGeneration.id, { onDelete: "cascade" }),

  // Workflow details
  status: workflowStatusEnum("status").notNull().default("pending"),
  totalSteps: integer("total_steps").notNull(),
  completedSteps: integer("completed_steps").notNull().default(0),

  // Timestamps
  startTime: timestamp("start_time").notNull().defaultNow(),
  endTime: timestamp("end_time"),
});

// Agent workflow steps table
export const agentWorkflowStep = pgTable("agent_workflow_step", {
  id: text("id").primaryKey(),
  workflowId: text("workflow_id")
    .notNull()
    .references(() => agentWorkflow.id, { onDelete: "cascade" }),

  // Step details
  name: text("name").notNull(),
  status: workflowStatusEnum("status").notNull().default("pending"),
  stepOrder: integer("step_order").notNull(),

  // Execution details
  output: jsonb("output"),
  error: text("error"),

  // Timestamps
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
});

// User favorites/bookmarks for generated scripts
export const scriptFavorite = pgTable("script_favorite", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  variationId: text("variation_id")
    .notNull()
    .references(() => scriptVariation.id, { onDelete: "cascade" }),

  // Optional user notes
  notes: text("notes"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Script performance analytics (if user implements the scripts)
export const scriptPerformance = pgTable("script_performance", {
  id: text("id").primaryKey(),
  variationId: text("variation_id")
    .notNull()
    .references(() => scriptVariation.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  // Performance metrics
  platform: platformEnum("platform").notNull(),
  views: integer("views"),
  likes: integer("likes"),
  comments: integer("comments"),
  shares: integer("shares"),
  clickThrough: integer("click_through"),
  conversions: integer("conversions"),

  // Campaign details
  campaignName: text("campaign_name"),
  adSpend: integer("ad_spend"), // in cents
  revenue: integer("revenue"), // in cents

  // Metadata
  reportedAt: timestamp("reported_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
