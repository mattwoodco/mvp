import { db } from "@myapp/database";
import { plaidAccount, plaidTransaction } from "@myapp/database";
import { and, eq, gte, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30";

    const startDate = new Date(
      Date.now() - Number.parseInt(period) * 24 * 60 * 60 * 1000,
    )
      .toISOString()
      .split("T")[0];

    const spendingByCategory = await db
      .select({
        category: plaidTransaction.category,
        total: sql<number>`sum(abs(${plaidTransaction.amount}))`,
        count: sql<number>`count(*)`,
      })
      .from(plaidTransaction)
      .where(
        and(
          eq(plaidTransaction.userId, session.user.id),
          gte(plaidTransaction.date, startDate),
          sql`${plaidTransaction.amount} < 0`,
        ),
      )
      .groupBy(plaidTransaction.category);

    const totalSpending = spendingByCategory.reduce(
      (sum, cat) => sum + cat.total,
      0,
    );

    const accountBalances = await db
      .select({
        id: plaidAccount.id,
        name: plaidAccount.name,
        type: plaidAccount.type,
        balance: plaidAccount.currentBalance,
      })
      .from(plaidAccount)
      .where(eq(plaidAccount.userId, session.user.id));

    const totalBalance = accountBalances.reduce(
      (sum, acc) => sum + Number.parseFloat(acc.balance || "0"),
      0,
    );

    const monthlySpending = await db
      .select({
        month: sql<string>`date_trunc('month', ${plaidTransaction.date}::date)`,
        total: sql<number>`sum(abs(${plaidTransaction.amount}))`,
      })
      .from(plaidTransaction)
      .where(
        and(
          eq(plaidTransaction.userId, session.user.id),
          gte(
            plaidTransaction.date,
            new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
          ),
          sql`${plaidTransaction.amount} < 0`,
        ),
      )
      .groupBy(sql`date_trunc('month', ${plaidTransaction.date}::date)`)
      .orderBy(sql`date_trunc('month', ${plaidTransaction.date}::date)`);

    return NextResponse.json({
      summary: {
        totalSpending,
        totalBalance,
        spendingByCategory,
        accountBalances,
        monthlySpending,
      },
    });
  } catch (error) {
    console.error("Error getting analytics summary:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
