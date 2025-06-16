import {
  boolean,
  date,
  integer,
  json,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./users.schema";

export const campaigns = pgTable("campaigns", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  budgetCents: integer("budget_cents").notNull(),
  status: text("status", {
    enum: ["draft", "active", "paused", "completed", "cancelled"],
  }).default("draft"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const assets = pgTable("assets", {
  id: text("id").primaryKey(),
  campaignId: text("campaign_id")
    .notNull()
    .references(() => campaigns.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  durationSec: integer("duration_sec"),
  format: text("format", { enum: ["mp4", "mov", "avi", "gif", "jpg", "png"] }),
  checksum: text("checksum"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const segments = pgTable("segments", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  geoJson: json("geo_json"),
  ageMin: integer("age_min"),
  ageMax: integer("age_max"),
  interestsJson: json("interests_json"),
  platforms: json("platforms"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const placements = pgTable("placements", {
  id: text("id").primaryKey(),
  campaignId: text("campaign_id")
    .notNull()
    .references(() => campaigns.id, { onDelete: "cascade" }),
  segmentId: text("segment_id")
    .notNull()
    .references(() => segments.id),
  assetId: text("asset_id")
    .notNull()
    .references(() => assets.id),
  bidCents: integer("bid_cents").notNull(),
  scheduleJson: json("schedule_json"),
  platformPlacements: json("platform_placements"),
  status: text("status", {
    enum: ["active", "paused", "completed", "cancelled"],
  }).default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const stats = pgTable("stats", {
  id: text("id").primaryKey(),
  placementId: text("placement_id")
    .notNull()
    .references(() => placements.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  impressions: integer("impressions").default(0),
  views: integer("views").default(0),
  clicks: integer("clicks").default(0),
  conversions: integer("conversions").default(0),
  costCents: integer("cost_cents").default(0),
});

export const events = pgTable("events", {
  id: text("id").primaryKey(),
  placementId: text("placement_id")
    .notNull()
    .references(() => placements.id, { onDelete: "cascade" }),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  eventType: text("event_type", {
    enum: [
      "impression",
      "view",
      "click",
      "conversion",
      "watch_25",
      "watch_50",
      "watch_75",
      "watch_100",
    ],
  }).notNull(),
  videoTimeMs: integer("video_time_ms"),
  userAgent: text("user_agent"),
  geoIp: text("geo_ip"),
});

export const billing = pgTable("billing", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").default("USD"),
  txnType: text("txn_type", { enum: ["charge", "credit", "refund"] }).notNull(),
  externalTxnId: text("external_txn_id"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});
