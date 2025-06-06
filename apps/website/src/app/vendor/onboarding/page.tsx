import { Button } from "@mvp/ui/button";
import { auth } from "@mvp/auth";
import { createConnectAccount, createAccountLink } from "@mvp/payments";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AlertCircle, ArrowRight, Shield, Zap, CreditCard } from "lucide-react";

export default async function VendorOnboardingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  if (!session.user.emailVerified) {
    redirect("/verify-email");
  }

  async function startOnboarding() {
    "use server";
    
    const h = await headers();
    const session = await auth.api.getSession({ headers: h });
    
    if (!session?.user || !session.user.emailVerified) {
      redirect("/login");
    }

    try {
      // Create or retrieve Connect account
      const vendor = await createConnectAccount(session.user.id, session.user.email);

      // Create account link for onboarding
      const accountLink = await createAccountLink(
        vendor.stripeAccountId!,
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/vendor/onboarding`,
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/vendor/dashboard`
      );

      redirect(accountLink.url);
    } catch (error) {
      console.error("Onboarding error:", error);
      redirect("/vendor/onboarding?error=true");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Become a Vendor
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start accepting payments and grow your business with our secure payment infrastructure
          </p>
        </div>

        <div className="bg-card border rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Why Partner With Us?</h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="size-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Secure Payments</h3>
              <p className="text-sm text-muted-foreground">
                Industry-leading security with Stripe's payment infrastructure
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Zap className="size-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Fast Payouts</h3>
              <p className="text-sm text-muted-foreground">
                Receive your earnings quickly with automated daily payouts
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CreditCard className="size-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Low Fees</h3>
              <p className="text-sm text-muted-foreground">
                Competitive transaction fees with transparent pricing
              </p>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <AlertCircle className="size-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">
                  <strong>Requirements:</strong> To become a vendor, you must:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Have a verified email address</li>
                  <li>Provide valid business information</li>
                  <li>Complete identity verification</li>
                  <li>Have a bank account for payouts</li>
                </ul>
              </div>
            </div>
          </div>

          <form action={startOnboarding} className="text-center">
            <Button size="lg" className="gap-2">
              Start Onboarding
              <ArrowRight className="size-4" />
            </Button>
          </form>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>By continuing, you agree to Stripe's terms and conditions.</p>
          <p className="mt-2">The onboarding process typically takes 5-10 minutes.</p>
        </div>
      </div>
    </div>
  );
}