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
    required_if_supported_products: [Products.Auth, Products.Transactions],
    optional_products: [],
    user_token: undefined,
    webhook: undefined,
  };

  console.log("🔗 Creating Plaid Link token with config:", {
    client_name: request.client_name,
    products: request.products,
    country_codes: request.country_codes,
    user_id: userId,
  });

  const response = await plaidClient.linkTokenCreate(request);

  console.log("✅ Plaid Link token created:", {
    token_length: response.data.link_token.length,
    expiration: response.data.expiration,
  });

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
