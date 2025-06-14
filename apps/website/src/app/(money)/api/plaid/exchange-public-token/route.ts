import { auth } from "@money/auth/server";
import { db, plaidItem } from "@money/database";
import { exchangePublicToken } from "@money/plaid";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { public_token, metadata } = await request.json();

    if (!public_token) {
      return NextResponse.json(
        { error: "Missing public token" },
        { status: 400 },
      );
    }

    const { accessToken, itemId } = await exchangePublicToken(public_token);

    await db.insert(plaidItem).values({
      id: itemId,
      userId: session.user.id,
      accessToken,
      institutionId: metadata.institution.institution_id,
      institutionName: metadata.institution.name,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error exchanging public token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
