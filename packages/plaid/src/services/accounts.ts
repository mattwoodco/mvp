import type { AccountsGetRequest, TransactionsGetRequest } from "plaid";
import { plaidClient } from "../client";

export async function getAccounts(accessToken: string) {
  const request: AccountsGetRequest = {
    access_token: accessToken,
  };

  const response = await plaidClient.accountsGet(request);
  return response.data.accounts;
}

export async function getTransactions(
  accessToken: string,
  startDate: string,
  endDate: string,
  accountIds?: string[],
) {
  const request: TransactionsGetRequest = {
    access_token: accessToken,
    start_date: startDate,
    end_date: endDate,
    ...(accountIds && { account_ids: accountIds }),
  };

  const response = await plaidClient.transactionsGet(request);
  return response.data.transactions;
}
