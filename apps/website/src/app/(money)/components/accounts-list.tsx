"use client";

import { Badge } from "@mvp/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@mvp/ui/card";
import { formatCurrency, formatDate } from "@mvp/ui/utils";
import { useEffect, useState } from "react";

interface Account {
  id: string;
  name: string;
  type: string;
  subtype?: string;
  currentBalance: string;
  availableBalance?: string;
  mask?: string;
}

interface Transaction {
  id: string;
  amount: string;
  description: string;
  category: string;
  date: string;
  pending: boolean;
}

interface Analytics {
  totalSpending: number;
  totalBalance: number;
  spendingByCategory: Array<{
    category: string;
    total: number;
    count: number;
  }>;
  accountBalances: Account[];
}

export function AccountsList() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [accountsRes, analyticsRes] = await Promise.all([
        fetch("/api/plaid/accounts"),
        fetch("/api/plaid/analytics/summary"),
      ]);

      if (accountsRes.ok) {
        const accountsData = await accountsRes.json();
        setAccounts(accountsData.accounts || []);
        setTransactions(accountsData.transactions || []);
      }

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData.summary);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading financial data...</div>;
  }

  return (
    <div className="space-y-6">
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {formatCurrency(analytics.totalBalance)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Spending</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">
                -{formatCurrency(analytics.totalSpending)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Linked Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{accounts.length}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex justify-between items-center p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{account.name}</h3>
                  <p className="text-sm text-gray-600">
                    {account.type} • {account.subtype} • ****{account.mask}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">
                    {formatCurrency(Number.parseFloat(account.currentBalance))}
                  </p>
                  {account.availableBalance && (
                    <p className="text-sm text-gray-600">
                      Available:{" "}
                      {formatCurrency(
                        Number.parseFloat(account.availableBalance),
                      )}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {analytics?.spendingByCategory && (
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.spendingByCategory.map((category) => (
                <div
                  key={category.category}
                  className="flex justify-between items-center"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{category.category}</Badge>
                    <span className="text-sm text-gray-600">
                      {category.count} transactions
                    </span>
                  </div>
                  <span className="font-medium">
                    {formatCurrency(category.total)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.slice(0, 10).map((transaction) => (
              <div
                key={transaction.id}
                className="flex justify-between items-center p-3 border rounded"
              >
                <div>
                  <h4 className="font-medium">{transaction.description}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Badge variant="secondary" size="sm">
                      {transaction.category}
                    </Badge>
                    <span>{formatDate(transaction.date)}</span>
                    {transaction.pending && (
                      <Badge variant="outline" size="sm">
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
                <span
                  className={`font-medium ${
                    Number.parseFloat(transaction.amount) < 0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {Number.parseFloat(transaction.amount) < 0 ? "-" : "+"}
                  {formatCurrency(
                    Math.abs(Number.parseFloat(transaction.amount)),
                  )}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
