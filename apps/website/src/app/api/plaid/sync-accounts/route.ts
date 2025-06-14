import { db } from "@myapp/database";
import { plaidAccount, plaidItem, plaidTransaction } from "@myapp/database";
import {
  categorizeTransaction,
  syncAccountsForUser,
  syncTransactionsForAccount,
} from "@myapp/plaid";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userItems = await db
      .select()
      .from(plaidItem)
      .where(eq(plaidItem.userId, session.user.id));

    for (const item of userItems) {
      const accountsData = await syncAccountsForUser(
        session.user.id,
        item.accessToken,
        item.id,
      );

      for (const accountData of accountsData) {
        await db
          .insert(plaidAccount)
          .values(accountData)
          .onConflictDoUpdate({
            target: plaidAccount.id,
            set: {
              currentBalance: accountData.currentBalance,
              availableBalance: accountData.availableBalance,
              updatedAt: new Date(),
            },
          });

        const endDate = new Date().toISOString().split("T")[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];

        const transactionsData = await syncTransactionsForAccount(
          session.user.id,
          item.accessToken,
          accountData.id,
          startDate,
          endDate,
        );

        for (const transactionData of transactionsData) {
          const categorizedTransaction = {
            ...transactionData,
            category: categorizeTransaction(
              transactionData.description || "",
              transactionData.category,
            ),
          };

          await db
            .insert(plaidTransaction)
            .values(categorizedTransaction)
            .onConflictDoNothing();
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error syncing accounts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
