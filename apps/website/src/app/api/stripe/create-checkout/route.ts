import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check when auth is properly configured
    // const session = await auth();
    // if (!session?.user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const { tier } = await request.json();

    if (!tier || !["BASIC", "PREMIUM"].includes(tier)) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    // TODO: Implement Stripe checkout session creation
    // This would integrate with the @chatmtv/payments package once database issues are resolved

    // For now, return a placeholder URL
    const checkoutUrl = `https://checkout.stripe.com/pay/${tier.toLowerCase()}-membership`;

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
