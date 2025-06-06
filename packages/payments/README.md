# @mvp/payments

Stripe payments integration package for handling customer subscriptions and vendor payments through Stripe Connect.

## Features

- Customer subscription management ($5/mo basic, $20/mo premium)
- Stripe Connect integration for vendors
- Email verification requirement for vendors and customers
- Webhook handling for payment events
- Billing portal integration

## Environment Variables

Add these to your `.env` files:

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_... # Your Stripe secret key
STRIPE_PUBLISHABLE_KEY=pk_test_... # Your Stripe publishable key
STRIPE_WEBHOOK_SECRET=whsec_... # Your webhook endpoint secret

# Stripe Price IDs (create these in Stripe Dashboard)
STRIPE_PRICE_BASIC_ID=price_... # $5/month subscription
STRIPE_PRICE_PREMIUM_ID=price_... # $20/month subscription

# Stripe Connect
STRIPE_CONNECT_CLIENT_ID=ca_... # For OAuth flow (optional)
```

## Setup

1. Install the package in your app:
```bash
bun add @mvp/payments
```

2. Set up Stripe products and prices:
   - Log into your Stripe dashboard
   - Create a product called "Membership"
   - Add two prices:
     - Basic: $5/month
     - Premium: $20/month
   - Copy the price IDs to your environment variables

3. Set up webhook endpoint:
   - In Stripe dashboard, add a webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Select events: 
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `account.updated`
     - `checkout.session.completed`
   - Copy the webhook secret to your environment variables

## Database Schema

This package requires the following database tables (automatically created via migrations):

- `user`: Extended with `userType` (customer/vendor) and `stripeCustomerId`
- `vendor`: Stripe Connect account information
- `subscription`: Customer subscription records
- `price`: Cached price information

## Usage

### Customer Subscriptions

```typescript
import { 
  createOrRetrieveCustomer, 
  createCheckoutSession,
  createBillingPortalSession 
} from "@mvp/payments";

// Create or retrieve a Stripe customer
const customer = await createOrRetrieveCustomer(userId, email, name);

// Create checkout session for subscription
const session = await createCheckoutSession({
  customerId: customer.id,
  priceId: process.env.STRIPE_PRICE_BASIC_ID,
  successUrl: "https://yourdomain.com/success",
  cancelUrl: "https://yourdomain.com/cancel",
  userId: userId,
});

// Redirect to Stripe Checkout
redirect(session.url);

// Create billing portal session for managing subscription
const portalSession = await createBillingPortalSession(
  customer.id,
  "https://yourdomain.com/account"
);
```

### Vendor Connect

```typescript
import { 
  createConnectAccount, 
  createAccountLink,
  updateVendorStatus 
} from "@mvp/payments";

// Create Connect account for vendor
const vendor = await createConnectAccount(userId, email);

// Create onboarding link
const accountLink = await createAccountLink(
  vendor.stripeAccountId,
  "https://yourdomain.com/onboarding/refresh",
  "https://yourdomain.com/onboarding/complete"
);

// Redirect to Stripe onboarding
redirect(accountLink.url);

// Update vendor status after onboarding
const account = await updateVendorStatus(vendor.stripeAccountId);
```

### Webhook Handler

```typescript
// app/api/stripe/webhook/route.ts
import { constructWebhookEvent, handleWebhookEvent } from "@mvp/payments";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  try {
    const event = await constructWebhookEvent(body, signature);
    await handleWebhookEvent(event);
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("Webhook error", { status: 400 });
  }
}
```

## Email Verification

Both vendors and customers must have `emailVerified: true` in the database before they can:
- Create subscriptions (customers)
- Create Connect accounts (vendors)

Implement email verification in your auth flow before allowing payment operations.

## Testing

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

For Connect testing, use test data in the onboarding flow.

## Security

- Always verify webhook signatures
- Check email verification before payment operations
- Use environment variables for all keys
- Implement proper error handling
- Log all payment events for audit trail