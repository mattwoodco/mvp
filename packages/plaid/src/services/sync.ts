import { getAccounts, getTransactions } from "./accounts";

export async function syncAccountsForUser(
  userId: string,
  accessToken: string,
  itemId: string,
) {
  const accounts = await getAccounts(accessToken);

  return accounts.map((account) => ({
    id: account.account_id,
    itemId,
    userId,
    name: account.name,
    officialName: account.official_name,
    mask: account.mask,
    type: account.type,
    subtype: account.subtype,
    currentBalance: account.balances.current?.toString(),
    availableBalance: account.balances.available?.toString(),
    isoCurrencyCode: account.balances.iso_currency_code,
  }));
}

export async function syncTransactionsForAccount(
  userId: string,
  accessToken: string,
  accountId: string,
  startDate: string,
  endDate: string,
) {
  const transactions = await getTransactions(accessToken, startDate, endDate, [
    accountId,
  ]);

  return transactions.map((transaction) => ({
    id: transaction.transaction_id,
    accountId: transaction.account_id,
    userId,
    amount: transaction.amount.toString(),
    isoCurrencyCode: transaction.iso_currency_code,
    description: transaction.name,
    merchantName: transaction.merchant_name,
    category: transaction.category?.[0],
    subcategory: transaction.category?.[1],
    date: transaction.date,
    authorizedDate: transaction.authorized_date,
    pending: transaction.pending,
  }));
}

export function categorizeTransaction(description: string, category?: string) {
  const categories = {
    "Food and Drink": ["restaurant", "grocery", "coffee", "bar"],
    Transportation: ["gas", "uber", "taxi", "parking"],
    Shopping: ["amazon", "target", "walmart", "mall"],
    Entertainment: ["movie", "netflix", "spotify", "game"],
    Bills: ["utility", "phone", "internet", "insurance"],
    Healthcare: ["pharmacy", "doctor", "hospital", "dental"],
  };

  if (category) return category;

  const desc = description.toLowerCase();
  for (const [cat, keywords] of Object.entries(categories)) {
    if (keywords.some((keyword) => desc.includes(keyword))) {
      return cat;
    }
  }

  return "Other";
}
