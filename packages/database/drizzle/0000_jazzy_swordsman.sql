CREATE TYPE "public"."ad_category" AS ENUM('product_demo', 'tutorial', 'customer_testimonial', 'ugc_style', 'before_after_transformation', 'storytelling_narrative');--> statement-breakpoint
CREATE TYPE "public"."copywriting_tone" AS ENUM('conversational_casual', 'direct_authentic', 'peer_to_peer', 'empathetic_relatable');--> statement-breakpoint
CREATE TYPE "public"."cta_approach" AS ENUM('soft_recommendation', 'urgent_scarcity', 'social_proof_driven', 'embedded_natural');--> statement-breakpoint
CREATE TYPE "public"."engagement_level" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."generation_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."hook_style" AS ENUM('bold_statement', 'provocative_question', 'problem_snapshot', 'startling_visual');--> statement-breakpoint
CREATE TYPE "public"."pacing_style" AS ENUM('rapid_fire_15sec', 'steady_build_30sec', 'story_arc_45sec');--> statement-breakpoint
CREATE TYPE "public"."platform" AS ENUM('tiktok', 'instagram_reels', 'youtube_shorts');--> statement-breakpoint
CREATE TYPE "public"."problem_solution_framing" AS ENUM('pain_point_focus', 'lifestyle_aspiration', 'social_proof_validation', 'trend_alignment');--> statement-breakpoint
CREATE TYPE "public"."visual_style" AS ENUM('quick_cuts_dynamic', 'split_screen_comparison', 'text_overlay_heavy', 'ugc_handheld_style', 'transformation_reveal');--> statement-breakpoint
CREATE TYPE "public"."workflow_status" AS ENUM('pending', 'running', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "agent_workflow" (
	"id" text PRIMARY KEY NOT NULL,
	"generation_id" text NOT NULL,
	"status" "workflow_status" DEFAULT 'pending' NOT NULL,
	"total_steps" integer NOT NULL,
	"completed_steps" integer DEFAULT 0 NOT NULL,
	"start_time" timestamp DEFAULT now() NOT NULL,
	"end_time" timestamp
);
--> statement-breakpoint
CREATE TABLE "agent_workflow_step" (
	"id" text PRIMARY KEY NOT NULL,
	"workflow_id" text NOT NULL,
	"name" text NOT NULL,
	"status" "workflow_status" DEFAULT 'pending' NOT NULL,
	"step_order" integer NOT NULL,
	"output" jsonb,
	"error" text,
	"start_time" timestamp,
	"end_time" timestamp
);
--> statement-breakpoint
CREATE TABLE "script_favorite" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"variation_id" text NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "script_generation" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"product_name" text NOT NULL,
	"product_description" text NOT NULL,
	"target_audience" text NOT NULL,
	"key_benefits" jsonb NOT NULL,
	"brand_tone" text,
	"competitor_info" text,
	"custom_prompt" text,
	"variation_count" integer DEFAULT 12 NOT NULL,
	"status" "generation_status" DEFAULT 'pending' NOT NULL,
	"total_processing_time" integer,
	"error" text,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "script_performance" (
	"id" text PRIMARY KEY NOT NULL,
	"variation_id" text NOT NULL,
	"user_id" text NOT NULL,
	"platform" "platform" NOT NULL,
	"views" integer,
	"likes" integer,
	"comments" integer,
	"shares" integer,
	"click_through" integer,
	"conversions" integer,
	"campaign_name" text,
	"ad_spend" integer,
	"revenue" integer,
	"reported_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "script_variation" (
	"id" text PRIMARY KEY NOT NULL,
	"generation_id" text NOT NULL,
	"title" text NOT NULL,
	"script" text NOT NULL,
	"duration" integer NOT NULL,
	"hook" text NOT NULL,
	"main_content" text NOT NULL,
	"call_to_action" text NOT NULL,
	"hook_style" "hook_style" NOT NULL,
	"ad_category" "ad_category" NOT NULL,
	"copywriting_tone" "copywriting_tone" NOT NULL,
	"visual_style" "visual_style" NOT NULL,
	"problem_solution_framing" "problem_solution_framing" NOT NULL,
	"pacing_style" "pacing_style" NOT NULL,
	"cta_approach" "cta_approach" NOT NULL,
	"estimated_engagement" "engagement_level" NOT NULL,
	"target_platforms" jsonb NOT NULL,
	"processing_time" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"name" text,
	"image" text,
	"tokens" integer DEFAULT 10000 NOT NULL,
	"user_type" text DEFAULT 'customer',
	"stripe_customer_id" text,
	"stripe_connect_account_id" text,
	"stripe_connect_enabled" boolean DEFAULT false,
	"subscription_status" text,
	"subscription_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_stripe_customer_id_unique" UNIQUE("stripe_customer_id"),
	CONSTRAINT "user_stripe_connect_account_id_unique" UNIQUE("stripe_connect_account_id")
);
--> statement-breakpoint
ALTER TABLE "agent_workflow" ADD CONSTRAINT "agent_workflow_generation_id_script_generation_id_fk" FOREIGN KEY ("generation_id") REFERENCES "public"."script_generation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_workflow_step" ADD CONSTRAINT "agent_workflow_step_workflow_id_agent_workflow_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."agent_workflow"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "script_favorite" ADD CONSTRAINT "script_favorite_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "script_favorite" ADD CONSTRAINT "script_favorite_variation_id_script_variation_id_fk" FOREIGN KEY ("variation_id") REFERENCES "public"."script_variation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "script_generation" ADD CONSTRAINT "script_generation_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "script_performance" ADD CONSTRAINT "script_performance_variation_id_script_variation_id_fk" FOREIGN KEY ("variation_id") REFERENCES "public"."script_variation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "script_performance" ADD CONSTRAINT "script_performance_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "script_variation" ADD CONSTRAINT "script_variation_generation_id_script_generation_id_fk" FOREIGN KEY ("generation_id") REFERENCES "public"."script_generation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;