import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  name: text("name"),
  image: text("image"),

  // User type - vendor or customer
  userType: text("user_type", { enum: ["customer", "vendor"] }).default(
    "customer",
  ),

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
