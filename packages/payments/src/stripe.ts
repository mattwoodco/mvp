import Stripe from "stripe";

// Conditionally use live or test Stripe keys based on environment
const useLiveStripe = process.env.USE_LIVE_STRIPE === "true";

const secretKey = useLiveStripe
  ? process.env.STRIPE_LIVE_SECRET_KEY!
  : process.env.STRIPE_SECRET_KEY!;

export const stripe = new Stripe(secretKey, {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

export const STRIPE_WEBHOOK_SECRET = useLiveStripe
  ? process.env.STRIPE_LIVE_WEBHOOK_SECRET!
  : process.env.STRIPE_WEBHOOK_SECRET!;

// Price IDs for subscription tiers
export const PRICE_IDS = {
  BASIC: useLiveStripe
    ? process.env.STRIPE_LIVE_BASIC_PRICE_ID!
    : process.env.STRIPE_BASIC_PRICE_ID!, // $5/mo
  PREMIUM: useLiveStripe
    ? process.env.STRIPE_LIVE_PREMIUM_PRICE_ID!
    : process.env.STRIPE_PREMIUM_PRICE_ID!, // $20/mo
};

// Environment info for debugging
export const STRIPE_ENV_INFO = {
  useLiveStripe,
  environment: useLiveStripe ? "LIVE" : "TEST",
  secretKeyPrefix: `${secretKey.substring(0, 12)}...`,
  basicPriceId: PRICE_IDS.BASIC,
  premiumPriceId: PRICE_IDS.PREMIUM,
};

// Membership price IDs
export const MEMBERSHIP_PRICES = {
  BASIC: PRICE_IDS.BASIC,
  PREMIUM: PRICE_IDS.PREMIUM,
} as const;

export type MembershipTier = keyof typeof MEMBERSHIP_PRICES;
