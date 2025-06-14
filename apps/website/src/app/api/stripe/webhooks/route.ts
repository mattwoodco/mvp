import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // TODO: Implement webhook signature verification and event processing
    // This would integrate with the @money/payments package once ready

    console.log("Received Stripe webhook:", {
      signature: `${signature.substring(0, 20)}...`,
      bodyLength: body.length,
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
