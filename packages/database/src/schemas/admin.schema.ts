import { pgTable, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { user } from "./users.schema";

// Admin roles enum
export const adminRoles = ["super_admin", "admin", "moderator", "viewer"] as const;
export type AdminRole = (typeof adminRoles)[number];

// Admin role table
export const adminRole = pgTable("admin_role", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique().$type<AdminRole>(),
  description: text("description"),
  permissions: jsonb("permissions").notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// User admin roles relationship
export const userAdminRole = pgTable("user_admin_role", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  roleId: text("role_id")
    .notNull()
    .references(() => adminRole.id),
  assignedBy: text("assigned_by")
    .notNull()
    .references(() => user.id),
  assignedAt: timestamp("assigned_at").notNull().defaultNow(),
  isActive: boolean("is_active").notNull().default(true),
});

// Admin activity logs
export const adminActivityLog = pgTable("admin_activity_log", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  action: text("action").notNull(),
  entityType: text("entity_type"),
  entityId: text("entity_id"),
  metadata: jsonb("metadata"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});