import { db } from "@mvp/database/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { magicLink } from "better-auth/plugins/magic-link";

const googleConfig =
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
    ? {
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
      }
    : undefined;

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_SITE_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: googleConfig
    ? {
        google: googleConfig,
      }
    : undefined,
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url, token }) => {
        const { sendMagicLinkEmail } = await import("@mvp/email/utils");
        await sendMagicLinkEmail({
          email,
          url,
          token,
        });
      },
    }),
    nextCookies(),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});

export type Auth = typeof auth;
