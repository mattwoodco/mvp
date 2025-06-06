-- Create video_script_generation table
CREATE TABLE IF NOT EXISTS "video_script_generation" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "attributes" jsonb NOT NULL,
  "status" text NOT NULL,
  "progress" integer NOT NULL DEFAULT 0,
  "scripts" jsonb,
  "model_used" text NOT NULL,
  "total_tokens_used" integer,
  "processing_time_ms" integer,
  "error" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  "completed_at" timestamp
);

-- Create video_script_template table
CREATE TABLE IF NOT EXISTS "video_script_template" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "attributes" jsonb NOT NULL,
  "is_public" boolean NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE "video_script_generation" ADD CONSTRAINT "video_script_generation_user_id_user_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "video_script_template" ADD CONSTRAINT "video_script_template_user_id_user_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "video_script_generation_user_id_idx" ON "video_script_generation" ("user_id");
CREATE INDEX IF NOT EXISTS "video_script_generation_status_idx" ON "video_script_generation" ("status");
CREATE INDEX IF NOT EXISTS "video_script_generation_created_at_idx" ON "video_script_generation" ("created_at");

CREATE INDEX IF NOT EXISTS "video_script_template_user_id_idx" ON "video_script_template" ("user_id");
CREATE INDEX IF NOT EXISTS "video_script_template_is_public_idx" ON "video_script_template" ("is_public");
CREATE INDEX IF NOT EXISTS "video_script_template_created_at_idx" ON "video_script_template" ("created_at");