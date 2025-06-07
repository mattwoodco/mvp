import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
});

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

// Membership price IDs
export const MEMBERSHIP_PRICES = {
  BASIC: process.env.STRIPE_BASIC_PRICE_ID!, // $5/mo
  PREMIUM: process.env.STRIPE_PREMIUM_PRICE_ID!, // $20/mo
} as const;

export type MembershipTier = keyof typeof MEMBERSHIP_PRICES;
