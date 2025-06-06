import { pgTable, text, timestamp, jsonb, integer, boolean } from "drizzle-orm/pg-core";
import { user } from "./users.schema";

export const videoScriptGeneration = pgTable("video_script_generation", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  
  // Input attributes
  attributes: jsonb("attributes").notNull(), // Store the 24 attributes as JSON
  
  // Status tracking
  status: text("status").notNull(), // 'pending', 'processing', 'completed', 'failed'
  progress: integer("progress").notNull().default(0), // 0-100
  
  // Generated scripts
  scripts: jsonb("scripts"), // Array of generated script variations
  
  // Metadata
  modelUsed: text("model_used").notNull(),
  totalTokensUsed: integer("total_tokens_used"),
  processingTimeMs: integer("processing_time_ms"),
  
  // Error handling
  error: text("error"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const videoScriptTemplate = pgTable("video_script_template", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  
  name: text("name").notNull(),
  description: text("description"),
  attributes: jsonb("attributes").notNull(), // Saved attribute configurations
  isPublic: boolean("is_public").notNull().default(false),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});