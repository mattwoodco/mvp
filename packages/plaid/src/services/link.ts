import {
  CountryCode,
  type ItemPublicTokenExchangeRequest,
  type LinkTokenCreateRequest,
  Products,
} from "plaid";
import { plaidClient } from "../client";

export async function createLinkToken(userId: string, clientName = "MyApp") {
  const request: LinkTokenCreateRequest = {
    user: { client_user_id: userId },
    client_name: clientName,
    products: [Products.Auth, Products.Transactions],
    country_codes: [CountryCode.Us],
    language: "en",
  };

  const response = await plaidClient.linkTokenCreate(request);
  return response.data;
}

export async function exchangePublicToken(publicToken: string) {
  const request: ItemPublicTokenExchangeRequest = {
    public_token: publicToken,
  };

  const response = await plaidClient.itemPublicTokenExchange(request);
  return {
    accessToken: response.data.access_token,
    itemId: response.data.item_id,
  };
}
