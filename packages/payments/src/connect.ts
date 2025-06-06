import { stripe } from "./stripe";
import { db, vendor, user, eq } from "@mvp/database";
import { nanoid } from "nanoid";

export async function createConnectAccount(userId: string, email: string) {
  // Check if vendor already exists
  const [existingVendor] = await db
    .select()
    .from(vendor)
    .where(eq(vendor.userId, userId))
    .limit(1);

  if (existingVendor?.stripeAccountId) {
    return existingVendor;
  }

  // Create Stripe Connect account
  const account = await stripe.accounts.create({
    type: "express",
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    metadata: {
      userId,
    },
  });

  // Create vendor record
  const vendorId = nanoid();
  const now = new Date();
  const [newVendor] = await db
    .insert(vendor)
    .values({
      id: vendorId,
      userId,
      stripeAccountId: account.id,
      stripeAccountType: "express",
      stripeAccountStatus: "pending",
      onboardingCompleted: false,
      chargesEnabled: false,
      payoutsEnabled: false,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  // Update user type to vendor
  await db
    .update(user)
    .set({
      userType: "vendor",
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId));

  return newVendor;
}

export async function createAccountLink(accountId: string, refreshUrl: string, returnUrl: string) {
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: "account_onboarding",
  });

  return accountLink;
}

export async function retrieveAccount(accountId: string) {
  return await stripe.accounts.retrieve(accountId);
}

export async function updateVendorStatus(stripeAccountId: string) {
  const account = await retrieveAccount(stripeAccountId);

  await db
    .update(vendor)
    .set({
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      onboardingCompleted: account.details_submitted,
      stripeAccountStatus: account.charges_enabled ? "active" : "pending",
      updatedAt: new Date(),
    })
    .where(eq(vendor.stripeAccountId, stripeAccountId));

  return account;
}

export async function createLoginLink(accountId: string) {
  const loginLink = await stripe.accounts.createLoginLink(accountId);
  return loginLink;
}

export async function createPayout(accountId: string, amount: number, currency = "usd") {
  const payout = await stripe.payouts.create(
    {
      amount,
      currency,
    },
    {
      stripeAccount: accountId,
    }
  );

  return payout;
}

export async function getAccountBalance(accountId: string) {
  const balance = await stripe.balance.retrieve({
    stripeAccount: accountId,
  });

  return balance;
}