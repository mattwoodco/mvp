import { db, user } from "@chatmtv/database";
import { eq } from "drizzle-orm";
import { stripe } from "./stripe";

export async function createStripeCustomer(
  userId: string,
  email: string,
  name?: string,
): Promise<string> {
  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: {
      userId,
    },
  });

  // Update user with Stripe customer ID
  await db
    .update(user)
    .set({ stripeCustomerId: customer.id })
    .where(eq(user.id, userId));

  return customer.id;
}

export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name?: string,
): Promise<string> {
  const userData = await db
    .select({ stripeCustomerId: user.stripeCustomerId })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (userData[0]?.stripeCustomerId) {
    return userData[0].stripeCustomerId;
  }

  return createStripeCustomer(userId, email, name);
}

export async function getCustomerPortalUrl(
  customerId: string,
): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: process.env.NEXT_PUBLIC_SITE_URL!,
  });

  return session.url;
}
