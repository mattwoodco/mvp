#!/usr/bin/env node

import {
  Configuration,
  CountryCode,
  PlaidApi,
  PlaidEnvironments,
  Products,
} from "plaid";

console.log("🔍 Testing Plaid Configuration...\n");

const clientId = process.env.PLAID_CLIENT_ID;
const sandboxSecret = process.env.PLAID_SANDBOX_SECRET;

console.log("Environment Variables:");
console.log("PLAID_CLIENT_ID:", clientId ? "✅ Set" : "❌ Missing");
console.log("PLAID_SANDBOX_SECRET:", sandboxSecret ? "✅ Set" : "❌ Missing");
console.log("NODE_ENV:", process.env.NODE_ENV || "undefined");
console.log("");

if (!clientId || !sandboxSecret) {
  console.error("❌ Missing required Plaid credentials");
  process.exit(1);
}

const client = new PlaidApi(
  new Configuration({
    basePath: PlaidEnvironments.sandbox,
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": clientId,
        "PLAID-SECRET": sandboxSecret,
      },
    },
  }),
);

console.log("✅ Plaid client created successfully");
console.log("🚀 Testing link token creation...\n");

async function testLinkToken() {
  try {
    const request = {
      user: { client_user_id: "test-user-123" },
      client_name: "Test App",
      products: [Products.Auth, Products.Transactions],
      country_codes: [CountryCode.Us],
      language: "en",
    };

    const response = await client.linkTokenCreate(request);
    console.log("✅ Link token created successfully!");
    console.log("Token length:", response.data.link_token.length);
    console.log("Expires at:", response.data.expiration);
  } catch (error) {
    console.error("❌ Error creating link token:");
    console.error("Error code:", error.response?.data?.error_code);
    console.error("Error type:", error.response?.data?.error_type);
    console.error("Error message:", error.response?.data?.error_message);
    console.error(
      "Full response:",
      JSON.stringify(error.response?.data, null, 2),
    );
  }
}

await testLinkToken();
