import { auth } from "@money/auth/server";
import { db, plaidAccount, plaidTransaction } from "@money/database";
import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accounts = await db
      .select()
      .from(plaidAccount)
      .where(eq(plaidAccount.userId, session.user.id));

    const transactions = await db
      .select()
      .from(plaidTransaction)
      .where(eq(plaidTransaction.userId, session.user.id))
      .orderBy(desc(plaidTransaction.date))
      .limit(50);

    return NextResponse.json({ accounts, transactions });
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
