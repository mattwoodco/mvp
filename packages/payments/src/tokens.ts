import {
  decrementUserTokens,
  incrementUserTokens,
  updateUserTokens,
} from "@mvp/database";
import { stripe } from "./stripe";

export const TOKEN_PRICES = {
  TOKEN_1000: process.env.STRIPE_TOKEN_1000_PRICE_ID || "price_token_1000",
} as const;

export type TokenPackage = keyof typeof TOKEN_PRICES;

export async function createTokenCheckoutSession({
  userId,
  tokens,
  successUrl,
  cancelUrl,
  stripeCustomerId,
}: {
  userId: string;
  tokens: number;
  successUrl: string;
  cancelUrl: string;
  stripeCustomerId?: string;
}) {
  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    line_items: [
      {
        price: TOKEN_PRICES.TOKEN_1000,
        quantity: tokens / 1000,
      },
    ],
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      tokens: tokens.toString(),
      type: "token_purchase",
    },
  });

  return session;
}

export async function handleTokenPurchase(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status === "paid" && session.metadata?.userId) {
    const userId = session.metadata.userId;
    const tokens = Number.parseInt(session.metadata.tokens || "0");

    if (tokens > 0) {
      await incrementUserTokens(userId, tokens);
    }
  }

  return session;
}

export async function useTokens(userId: string, amount: number) {
  return decrementUserTokens(userId, amount);
}

export async function addTokens(userId: string, amount: number) {
  return incrementUserTokens(userId, amount);
}

export async function setTokens(userId: string, amount: number) {
  return updateUserTokens(userId, amount);
}

export function calculateTokenCost(
  inputTokens: number,
  outputTokens: number,
  inputCostPer1k = 0.01,
  outputCostPer1k = 0.03,
) {
  const inputCost = (inputTokens / 1000) * inputCostPer1k;
  const outputCost = (outputTokens / 1000) * outputCostPer1k;
  return Math.ceil((inputCost + outputCost) * 100);
}
