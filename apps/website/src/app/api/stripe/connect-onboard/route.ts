import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check when auth is properly configured
    // const session = await auth();
    // if (!session?.user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // TODO: Implement Stripe Connect account creation and onboarding
    // This would integrate with the @chatmtv/payments package once database issues are resolved

    // For now, return a placeholder onboarding URL
    const onboardingUrl =
      "https://connect.stripe.com/express/onboarding/placeholder";

    return NextResponse.json({
      success: true,
      onboardingUrl,
      accountEnabled: false,
    });
  } catch (error) {
    console.error("Error creating Connect onboarding:", error);
    return NextResponse.json(
      { error: "Failed to create onboarding link" },
      { status: 500 },
    );
  }
}
