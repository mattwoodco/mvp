import { db } from "@mvp/database";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { magicLink } from "better-auth/plugins/magic-link";

type MagicLinkParams = {
  email: string;
  token: string;
  url: string;
};

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  // socialProviders: {
  //   google: {
  //     clientId: process.env.AUTH_GOOGLE_ID!,
  //     clientSecret: process.env.AUTH_GOOGLE_SECRET!,
  //   },
  // },
  plugins: [
    magicLink({
      sendMagicLink: async (params: MagicLinkParams) => {
        const { sendMagicLinkEmail } = await import("@mvp/email");
        await sendMagicLinkEmail(params);
      },
    }),
    nextCookies(),
  ],
});
