import {
  boolean,
  integer,
  json,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./users.schema";

// Enums for agent-related status values
export const taskStatusEnum = pgEnum("task_status", [
  "pending",
  "running",
  "completed",
  "failed",
]);

export const workflowStatusEnum = pgEnum("workflow_status", [
  "pending",
  "running",
  "completed",
  "failed",
  "cancelled",
]);

export const scriptGenerationStatusEnum = pgEnum("script_generation_status", [
  "generating",
  "completed",
  "failed",
]);

export const agentStateStatusEnum = pgEnum("agent_state_status", [
  "idle",
  "thinking",
  "acting",
  "waiting",
  "error",
]);

// Workflow Executions Table
export const workflowExecution = pgTable("workflow_execution", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  status: workflowStatusEnum("status").notNull().default("pending"),
  nodes: json("nodes").notNull(), // Array of WorkflowNode objects
  currentNode: text("current_node"),
  results: json("results").notNull().default({}), // Record of results
  startTime: timestamp("start_time").notNull().defaultNow(),
  endTime: timestamp("end_time"),
  error: text("error"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Script Generations Table
export const scriptGeneration = pgTable("script_generation", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  workflowExecutionId: text("workflow_execution_id")
    .notNull()
    .references(() => workflowExecution.id, { onDelete: "cascade" }),
  attributes: json("attributes").notNull(), // VideoScriptAttributes object
  script: text("script").notNull(),
  variations: json("variations").notNull().default([]), // Array of script variations
  status: scriptGenerationStatusEnum("status").notNull().default("generating"),
  score: numeric("score", { precision: 5, scale: 2 }),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Agent Tasks Table
export const agentTask = pgTable("agent_task", {
  id: text("id").primaryKey(),
  type: text("type").notNull(), // script_generation, attribute_analysis, etc.
  status: taskStatusEnum("status").notNull().default("pending"),
  input: json("input").notNull(),
  output: json("output"),
  error: text("error"),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  parentTaskId: text("parent_task_id"),
  workflowExecutionId: text("workflow_execution_id").references(
    () => workflowExecution.id,
    { onDelete: "cascade" },
  ),
  metadata: json("metadata").default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Agent States Table (for tracking individual agent instances)
export const agentState = pgTable("agent_state", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  status: agentStateStatusEnum("status").notNull().default("idle"),
  currentTask: text("current_task"),
  progress: integer("progress").notNull().default(0), // 0-100
  memory: json("memory").notNull().default({}), // Agent memory store
  tools: json("tools").notNull().default([]), // Array of tool IDs
  lastActivity: timestamp("last_activity").notNull().defaultNow(),
  errorCount: integer("error_count").notNull().default(0),
  maxRetries: integer("max_retries").notNull().default(3),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Agent Events Table (for tracking all agent activities)
export const agentEvent = pgTable("agent_event", {
  id: text("id").primaryKey(),
  type: text("type").notNull(), // task_started, task_completed, etc.
  agentId: text("agent_id")
    .notNull()
    .references(() => agentState.id, { onDelete: "cascade" }),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  data: json("data").notNull(),
  workflowId: text("workflow_id").references(() => workflowExecution.id, {
    onDelete: "cascade",
  }),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
});
