import { Button } from "@mvp/ui/button";
import { auth } from "@mvp/auth";
import { createOrRetrieveCustomer, createCheckoutSession, SUBSCRIPTION_PRICES } from "@mvp/payments";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CheckIcon } from "lucide-react";

export default async function JoinPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  if (!session.user.emailVerified) {
    redirect("/verify-email");
  }

  async function subscribe(formData: FormData) {
    "use server";
    
    const priceId = formData.get("priceId") as string;
    const h = await headers();
    const session = await auth.api.getSession({ headers: h });
    
    if (!session?.user) {
      redirect("/login");
    }

    if (!session.user.emailVerified) {
      redirect("/verify-email");
    }

    try {
      // Create or retrieve Stripe customer
      const customer = await createOrRetrieveCustomer(
        session.user.id,
        session.user.email,
        session.user.name || ""
      );

      // Create checkout session
      const checkoutSession = await createCheckoutSession({
        customerId: customer.id,
        priceId,
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?success=true`,
        cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/join?canceled=true`,
        userId: session.user.id,
      });

      if (checkoutSession.url) {
        redirect(checkoutSession.url);
      }
    } catch (error) {
      console.error("Subscription error:", error);
      redirect("/join?error=true");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Choose Your Membership
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join our community and unlock exclusive features with our flexible membership plans
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Basic Plan */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
            <div className="relative bg-card border rounded-2xl p-8 hover:shadow-xl transition-all duration-300">
              <h2 className="text-2xl font-bold mb-2">Basic</h2>
              <div className="mb-6">
                <span className="text-4xl font-bold">$5</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckIcon className="size-5 text-primary shrink-0" />
                  <span>Access to all basic features</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="size-5 text-primary shrink-0" />
                  <span>Community support</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="size-5 text-primary shrink-0" />
                  <span>Monthly newsletter</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="size-5 text-primary shrink-0" />
                  <span>Basic analytics</span>
                </li>
              </ul>

              <form action={subscribe}>
                <input type="hidden" name="priceId" value={SUBSCRIPTION_PRICES.BASIC} />
                <Button className="w-full" size="lg">
                  Get Started
                </Button>
              </form>
            </div>
          </div>

          {/* Premium Plan */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-primary/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
            <div className="relative bg-card border-2 border-primary/20 rounded-2xl p-8 hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              
              <h2 className="text-2xl font-bold mb-2">Premium</h2>
              <div className="mb-6">
                <span className="text-4xl font-bold">$20</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckIcon className="size-5 text-primary shrink-0" />
                  <span>Everything in Basic</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="size-5 text-primary shrink-0" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="size-5 text-primary shrink-0" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="size-5 text-primary shrink-0" />
                  <span>API access</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="size-5 text-primary shrink-0" />
                  <span>Custom integrations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="size-5 text-primary shrink-0" />
                  <span>Early access to new features</span>
                </li>
              </ul>

              <form action={subscribe}>
                <input type="hidden" name="priceId" value={SUBSCRIPTION_PRICES.PREMIUM} />
                <Button className="w-full" size="lg">
                  Get Premium
                </Button>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>All plans include a 7-day free trial. Cancel anytime.</p>
          <p className="mt-2">Prices are in USD. Taxes may apply.</p>
        </div>
      </div>
    </div>
  );
}