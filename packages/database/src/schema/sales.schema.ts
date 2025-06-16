import {
  boolean,
  integer,
  json,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./users.schema";

export const companies = pgTable("companies", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  website: text("website"),
  domain: text("domain"),
  industry: text("industry"),
  employeeCount: integer("employee_count"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: text("id").primaryKey(),
  companyId: text("company_id").references(() => companies.id, {
    onDelete: "set null",
  }),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  phone: text("phone"),
  jobTitle: text("job_title"),
  linkedinUrl: text("linkedin_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const leads = pgTable("leads", {
  id: text("id").primaryKey(),
  contactId: text("contact_id").references(() => contacts.id, {
    onDelete: "cascade",
  }),
  source: text("source"),
  utmJson: json("utm_json"),
  status: text("status", { enum: ["new", "working", "disqualified"] }).default(
    "new",
  ),
  ownerId: text("owner_id").references(() => user.id, { onDelete: "set null" }),
  capturedAt: timestamp("captured_at").notNull().defaultNow(),
});

export const enrichments = pgTable("enrichments", {
  id: text("id").primaryKey(),
  entityType: text("entity_type", { enum: ["contact", "company"] }).notNull(),
  entityId: text("entity_id").notNull(),
  provider: text("provider").notNull(),
  dataJson: json("data_json"),
  confidence: integer("confidence"),
  fetchedAt: timestamp("fetched_at").notNull().defaultNow(),
});

export const pipelineStages = pgTable("pipeline_stages", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  order: integer("order").notNull(),
  isClosedWon: boolean("is_closed_won").default(false),
  isClosedLost: boolean("is_closed_lost").default(false),
});

export const deals = pgTable("deals", {
  id: text("id").primaryKey(),
  companyId: text("company_id").references(() => companies.id, {
    onDelete: "set null",
  }),
  primaryContactId: text("primary_contact_id").references(() => contacts.id, {
    onDelete: "set null",
  }),
  pipelineStageId: text("pipeline_stage_id")
    .notNull()
    .references(() => pipelineStages.id),
  valueCents: integer("value_cents"),
  currency: text("currency").default("USD"),
  expectedCloseDate: timestamp("expected_close_date"),
  ownerId: text("owner_id").references(() => user.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const activities = pgTable("activities", {
  id: text("id").primaryKey(),
  dealId: text("deal_id").references(() => deals.id, { onDelete: "cascade" }),
  contactId: text("contact_id").references(() => contacts.id, {
    onDelete: "cascade",
  }),
  type: text("type", { enum: ["call", "email", "note", "task"] }).notNull(),
  subject: text("subject"),
  body: text("body"),
  dueAt: timestamp("due_at"),
  completedAt: timestamp("completed_at"),
  ownerId: text("owner_id").references(() => user.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
