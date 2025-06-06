import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia",
  typescript: true,
});

// Webhook secret for verifying webhook signatures
export const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

// Price IDs for subscriptions
export const SUBSCRIPTION_PRICES = {
  BASIC: process.env.STRIPE_PRICE_BASIC_ID || "",
  PREMIUM: process.env.STRIPE_PRICE_PREMIUM_ID || "",
} as const;