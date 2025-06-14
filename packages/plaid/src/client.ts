import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

export const plaidClient = new PlaidApi(
  new Configuration({
    basePath:
      process.env.NODE_ENV === "production"
        ? PlaidEnvironments.production
        : PlaidEnvironments.sandbox,
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID!,
        "PLAID-SECRET":
          process.env.NODE_ENV === "production"
            ? process.env.PLAID_PRODUCTION_SECRET!
            : process.env.PLAID_SANDBOX_SECRET!,
      },
    },
  }),
);

export { PlaidApi } from "plaid";
