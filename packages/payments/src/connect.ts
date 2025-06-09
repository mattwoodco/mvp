import { createRequire } from "node:module";
import { db, user } from "@mvp/database";
import { eq } from "drizzle-orm";
import { stripe } from "./stripe";

console.log(
  "drizzle-orm resolved path:",
  createRequire(import.meta.url).resolve("drizzle-orm"),
);

export async function createConnectAccount(
  userId: string,
  email: string,
  country = "US",
): Promise<string> {
  const account = await stripe.accounts.create({
    type: "express",
    country,
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: "individual",
    metadata: {
      userId,
    },
  });

  // Update user with Stripe Connect account ID
  await db
    .update(user)
    .set({
      stripeConnectAccountId: account.id,
      userType: "vendor",
    })
    .where(eq(user.id, userId));

  return account.id;
}

export async function createAccountLink(
  accountId: string,
  refreshUrl: string,
  returnUrl: string,
): Promise<string> {
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: "account_onboarding",
  });

  return accountLink.url;
}

export async function getAccount(accountId: string) {
  return stripe.accounts.retrieve(accountId);
}

export async function isAccountEnabled(accountId: string): Promise<boolean> {
  const account = await getAccount(accountId);
  return account.charges_enabled && account.payouts_enabled;
}

export async function createLoginLink(accountId: string): Promise<string> {
  const link = await stripe.accounts.createLoginLink(accountId);
  return link.url;
}

export async function getOrCreateConnectAccount(
  userId: string,
  email: string,
): Promise<string> {
  const userData = await db
    .select({ stripeConnectAccountId: user.stripeConnectAccountId })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (userData[0]?.stripeConnectAccountId) {
    return userData[0].stripeConnectAccountId;
  }

  return createConnectAccount(userId, email);
}
