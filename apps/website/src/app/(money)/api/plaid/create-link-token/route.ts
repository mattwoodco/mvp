import { auth } from "@money/auth/server";
import { createLinkToken } from "@money/plaid";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log("🔗 Creating Plaid Link Token...");

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      console.log("❌ No session or user ID found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("✅ User authenticated:", session.user.id);
    console.log("🚀 Calling createLinkToken...");

    const linkToken = await createLinkToken(session.user.id);

    console.log("✅ Link token created successfully");
    return NextResponse.json({ link_token: linkToken.link_token });
  } catch (error: any) {
    console.error("❌ Error creating link token:");
    console.error("Error type:", error?.constructor?.name);
    console.error("Error message:", error?.message);
    console.error("Full error:", error);

    if (error?.response?.data) {
      console.error("Plaid API Response:", error.response.data);
    }

    return NextResponse.json(
      { error: "Internal server error", details: error?.message },
      { status: 500 },
    );
  }
}
