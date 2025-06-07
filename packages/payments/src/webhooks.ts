import { db, user } from "@mvp/database";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { STRIPE_WEBHOOK_SECRET, stripe } from "./stripe";

export function verifyWebhookSignature(
  body: string,
  signature: string,
): Stripe.Event | null {
  try {
    return stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return null;
  }
}

export async function handleSubscriptionCreated(
  subscription: Stripe.Subscription,
) {
  const customerId = subscription.customer as string;

  // Find user by customer ID and update subscription status
  await db
    .update(user)
    .set({
      subscriptionStatus: "active",
      subscriptionId: subscription.id,
    })
    .where(eq(user.stripeCustomerId, customerId));
}

export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
) {
  const customerId = subscription.customer as string;

  await db
    .update(user)
    .set({
      subscriptionStatus: subscription.status as any,
      subscriptionId: subscription.id,
    })
    .where(eq(user.stripeCustomerId, customerId));
}

export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
) {
  const customerId = subscription.customer as string;

  await db
    .update(user)
    .set({
      subscriptionStatus: "canceled",
      subscriptionId: null,
    })
    .where(eq(user.stripeCustomerId, customerId));
}

export async function handleAccountUpdated(account: Stripe.Account) {
  const userId = account.metadata?.userId;

  if (userId) {
    await db
      .update(user)
      .set({
        stripeConnectEnabled:
          account.charges_enabled && account.payouts_enabled,
      })
      .where(eq(user.id, userId));
  }
}

export async function processWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case "customer.subscription.created":
      await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
      break;
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
    case "account.updated":
      await handleAccountUpdated(event.data.object as Stripe.Account);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}
