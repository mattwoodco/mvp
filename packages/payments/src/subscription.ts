import { MEMBERSHIP_PRICES, type MembershipTier, stripe } from "./stripe";

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    billing_address_collection: "auto",
  });

  return session.url!;
}

export async function createMembershipCheckout(
  customerId: string,
  tier: MembershipTier,
  successUrl?: string,
  cancelUrl?: string,
): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  return createCheckoutSession(
    customerId,
    MEMBERSHIP_PRICES[tier],
    successUrl || `${baseUrl}/dashboard?success=true`,
    cancelUrl || `${baseUrl}/join?canceled=true`,
  );
}

export async function getActiveSubscriptions(customerId: string) {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "active",
  });

  return subscriptions.data;
}

export async function cancelSubscription(subscriptionId: string) {
  return stripe.subscriptions.cancel(subscriptionId);
}

export function getPriceFromSubscription(
  subscription: any,
): MembershipTier | null {
  const priceId = subscription.items.data[0]?.price?.id;

  for (const [tier, id] of Object.entries(MEMBERSHIP_PRICES)) {
    if (id === priceId) {
      return tier as MembershipTier;
    }
  }

  return null;
}
