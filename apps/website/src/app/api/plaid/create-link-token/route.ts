import { createLinkToken } from "@myapp/plaid";
import { getServerSession } from "next-auth";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const linkToken = await createLinkToken(session.user.id);

    return NextResponse.json({ link_token: linkToken.link_token });
  } catch (error) {
    console.error("Error creating link token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
