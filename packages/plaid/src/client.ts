import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

console.log("🔍 Plaid Client Debug:");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log(
  "PLAID_CLIENT_ID:",
  process.env.PLAID_CLIENT_ID ? "✅ Set" : "❌ Missing",
);
console.log(
  "PLAID_SANDBOX_SECRET:",
  process.env.PLAID_SANDBOX_SECRET ? "✅ Set" : "❌ Missing",
);
console.log(
  "PLAID_PRODUCTION_SECRET:",
  process.env.PLAID_PRODUCTION_SECRET ? "✅ Set" : "❌ Missing",
);

const environment =
  process.env.NODE_ENV === "production"
    ? PlaidEnvironments.production
    : PlaidEnvironments.sandbox;
const secret =
  process.env.NODE_ENV === "production"
    ? process.env.PLAID_PRODUCTION_SECRET
    : process.env.PLAID_SANDBOX_SECRET;

console.log("Using environment:", environment);
console.log("Using secret:", secret ? "✅ Set" : "❌ Missing");

export const plaidClient = new PlaidApi(
  new Configuration({
    basePath: environment,
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID!,
        "PLAID-SECRET": secret!,
      },
    },
  }),
);

export { PlaidApi } from "plaid";
