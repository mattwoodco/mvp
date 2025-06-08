export function getStripePublishableKey(): string {
  const useLiveStripe = process.env.USE_LIVE_STRIPE === "true";

  return useLiveStripe
    ? process.env.NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY!
    : process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!;
}

export const STRIPE_PUBLISHABLE_KEY = getStripePublishableKey();

export const STRIPE_CLIENT_ENV_INFO = {
  useLiveStripe: process.env.USE_LIVE_STRIPE === "true",
  environment: process.env.USE_LIVE_STRIPE === "true" ? "LIVE" : "TEST",
  publishableKeyPrefix: `${STRIPE_PUBLISHABLE_KEY.substring(0, 12)}...`,
};
