import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  name: text("name"),
  image: text("image"),
  role: text("role", {
    enum: ["admin", "user", "advertiser", "sales_rep", "sales_manager"],
  }).default("user"),

  // User type - vendor or customer
  userType: text("user_type", { enum: ["customer", "vendor"] }).default(
    "customer",
  ),

  // Social media platform credentials
  instagramUserId: text("instagram_user_id"),
  instagramToken: text("instagram_token"),
  youtubeChannelId: text("youtube_channel_id"),
  youtubeRefreshToken: text("youtube_refresh_token"),
  tiktokAccountId: text("tiktok_account_id"),
  tiktokToken: text("tiktok_token"),
  twitterUserId: text("twitter_user_id"),
  twitterToken: text("twitter_token"),
  twitterTokenSecret: text("twitter_token_secret"),

  // Stripe integration
  stripeCustomerId: text("stripe_customer_id").unique(),
  stripeConnectAccountId: text("stripe_connect_account_id").unique(),
  stripeConnectEnabled: boolean("stripe_connect_enabled").default(false),

  // Subscription management
  subscriptionStatus: text("subscription_status", {
    enum: ["active", "canceled", "past_due", "unpaid", "incomplete"],
  }),
  subscriptionId: text("subscription_id"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
