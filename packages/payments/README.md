# Payments Package

A comprehensive Stripe integration package for handling subscriptions, customer management, and Stripe Connect for vendors.

## Features

- 🔄 **Subscription Management**: Handle recurring billing with customizable plans
- 👥 **Customer Management**: Automatic Stripe customer creation and management
- 💳 **Stripe Connect**: Support for vendor onboarding and payouts
- 🔒 **Email Verification**: Ensure users verify emails before subscribing
- 📱 **User Types**: Support for both customers and vendors
- 🎣 **Webhooks**: Process Stripe events for real-time updates
- 💰 **Billing Portal**: Customer self-service portal integration

## Setup

### 1. Environment Variables

Add the following environment variables to your `.env` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... # Your Stripe secret key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # Your Stripe publishable key
STRIPE_WEBHOOK_SECRET=whsec_... # Webhook signing secret

# Stripe Price IDs (create these in your Stripe dashboard)
STRIPE_BASIC_PRICE_ID=price_... # $5/mo subscription price ID
STRIPE_PREMIUM_PRICE_ID=price_... # $20/mo subscription price ID
```

### 2. Create Stripe Products and Prices

In your Stripe dashboard:

1. Create two products:
   - **Basic Membership** - $5/month
   - **Premium Membership** - $20/month

2. Copy the price IDs and add them to your environment variables

### 3. Set up Webhooks

Create a webhook endpoint in Stripe pointing to: `https://yourdomain.com/api/stripe/webhooks`

Listen for these events:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `account.updated`

### 4. Database Migration

The package requires additional fields in the user schema. Run your database migration to add:

```sql
-- User type (customer/vendor)
ALTER TABLE user ADD COLUMN user_type TEXT DEFAULT 'customer';

-- Stripe integration
ALTER TABLE user ADD COLUMN stripe_customer_id TEXT UNIQUE;
ALTER TABLE user ADD COLUMN stripe_connect_account_id TEXT UNIQUE;
ALTER TABLE user ADD COLUMN stripe_connect_enabled BOOLEAN DEFAULT FALSE;

-- Subscription management
ALTER TABLE user ADD COLUMN subscription_status TEXT;
ALTER TABLE user ADD COLUMN subscription_id TEXT;
```

## Usage

### Customer Subscriptions

```typescript
import { 
  getOrCreateStripeCustomer, 
  createMembershipCheckout,
  getActiveSubscriptions
} from "@repo/payments";

// Create or get customer
const customerId = await getOrCreateStripeCustomer(
  user.id,
  user.email,
  user.name
);

// Create checkout session
const checkoutUrl = await createMembershipCheckout(customerId, "BASIC");

// Get active subscriptions
const subscriptions = await getActiveSubscriptions(customerId);
```

### Vendor Onboarding

```typescript
import { 
  createConnectAccount, 
  createAccountLink,
  isAccountEnabled 
} from "@repo/payments";

// Create Stripe Connect account
const accountId = await createConnectAccount(user.id, user.email);

// Create onboarding link
const onboardingUrl = await createAccountLink(
  accountId,
  "https://yoursite.com/vendor/refresh",
  "https://yoursite.com/vendor/complete"
);

// Check if account is enabled
const isEnabled = await isAccountEnabled(accountId);
```

### Webhook Processing

```typescript
import { verifyWebhookSignature, processWebhookEvent } from "@repo/payments";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  
  const event = verifyWebhookSignature(body, signature);
  if (!event) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  
  await processWebhookEvent(event);
  return NextResponse.json({ received: true });
}
```

## API Routes

The package works with these API routes in your Next.js app:

### `/api/stripe/create-checkout`
Creates a checkout session for subscriptions.

**POST Body:**
```json
{
  "tier": "BASIC" | "PREMIUM"
}
```

### `/api/stripe/webhooks`
Handles Stripe webhook events for real-time updates.

## User Types

### Customers
- Can subscribe to memberships
- Automatic Stripe customer creation
- Access to billing portal
- Email verification required for subscriptions

### Vendors
- Must complete Stripe Connect onboarding
- Can receive payouts
- Subject to Stripe's terms and verification

## Subscription Tiers

| Tier | Price | Description |
|------|-------|-------------|
| Basic | $5/mo | Essential features for individuals |
| Premium | $20/mo | Advanced features for power users |

## Security

- All API routes require authentication
- Email verification enforced for subscriptions
- Webhook signatures verified
- Stripe customer/account IDs stored securely

## Testing

Use Stripe's test mode for development:

1. Use test API keys (starting with `sk_test_` and `pk_test_`)
2. Use test webhook endpoints
3. Test with Stripe's test card numbers

## Troubleshooting

### Common Issues

1. **Webhook signature verification fails**
   - Ensure `STRIPE_WEBHOOK_SECRET` is correct
   - Check that the webhook endpoint URL is accessible

2. **Customer creation fails**
   - Verify Stripe API keys are valid
   - Check user email format

3. **Subscription creation fails**
   - Ensure price IDs exist in Stripe
   - Verify customer has verified email

### Debug Mode

Set `NODE_ENV=development` to see detailed error logs in the console.

## License

This package is part of the monorepo and follows the same license terms.