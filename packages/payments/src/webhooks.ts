import { stripe, stripeWebhookSecret } from "./stripe";
import { db, subscription, vendor, eq } from "@mvp/database";
import { nanoid } from "nanoid";
import type Stripe from "stripe";

export async function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Promise<Stripe.Event> {
  return stripe.webhooks.constructEvent(payload, signature, stripeWebhookSecret);
}

export async function handleWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdate(subscription);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionDeleted(subscription);
      break;
    }

    case "account.updated": {
      const account = event.data.object as Stripe.Account;
      await handleAccountUpdate(account);
      break;
    }

    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutCompleted(session);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

async function handleSubscriptionUpdate(stripeSubscription: Stripe.Subscription) {
  const userId = stripeSubscription.metadata.userId;
  if (!userId) {
    console.error("No userId in subscription metadata");
    return;
  }

  const [existingSubscription] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.stripeSubscriptionId, stripeSubscription.id))
    .limit(1);

  const subscriptionData = {
    userId,
    stripeSubscriptionId: stripeSubscription.id,
    stripeCustomerId: stripeSubscription.customer as string,
    stripePriceId: stripeSubscription.items.data[0].price.id,
    status: stripeSubscription.status,
    currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
    currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
    cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
    canceledAt: stripeSubscription.canceled_at
      ? new Date(stripeSubscription.canceled_at * 1000)
      : null,
    updatedAt: new Date(),
  };

  if (existingSubscription) {
    await db
      .update(subscription)
      .set(subscriptionData)
      .where(eq(subscription.id, existingSubscription.id));
  } else {
    await db.insert(subscription).values({
      id: nanoid(),
      ...subscriptionData,
      createdAt: new Date(),
    });
  }
}

async function handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription) {
  await db
    .update(subscription)
    .set({
      status: "canceled",
      updatedAt: new Date(),
    })
    .where(eq(subscription.stripeSubscriptionId, stripeSubscription.id));
}

async function handleAccountUpdate(account: Stripe.Account) {
  if (!account.id) return;

  await db
    .update(vendor)
    .set({
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      onboardingCompleted: account.details_submitted,
      stripeAccountStatus: account.charges_enabled ? "active" : "pending",
      updatedAt: new Date(),
    })
    .where(eq(vendor.stripeAccountId, account.id));
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  // Checkout completion is handled by subscription.created event
  // This is here for any additional processing if needed
  console.log("Checkout completed:", session.id);
}