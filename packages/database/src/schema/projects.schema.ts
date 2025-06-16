import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./users.schema";

export const project = pgTable("project", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  ownerId: text("owner_id")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const projectMember = pgTable("project_member", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["owner", "admin", "member"] })
    .notNull()
    .default("member"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const video = pgTable("video", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  originalUrl: text("original_url"),
  transcodedUrl: text("transcoded_url"),
  thumbnailUrl: text("thumbnail_url"),
  duration: text("duration"),
  fileSize: text("file_size"),
  status: text("status", {
    enum: ["uploading", "processing", "ready", "error"],
  })
    .notNull()
    .default("uploading"),
  errorMessage: text("error_message"),
  uploadedBy: text("uploaded_by")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
