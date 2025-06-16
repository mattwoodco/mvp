import { db } from "@mvp/database/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { magicLink } from "better-auth/plugins/magic-link";
import { sendEmail } from "./email";

const isProd = process.env.NODE_ENV === "production";
const cookieDomain = isProd ? process.env.COOKIE_DOMAIN : undefined;
const google =
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
    ? {
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
      }
    : undefined;

export const auth = betterAuth({
  baseURL:
    process.env.BETTER_AUTH_URL ||
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth`,
  secret: process.env.BETTER_AUTH_SECRET!,
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: true },
  socialProviders: google ? { google } : undefined,
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url, token }) => {
        const { sendMagicLinkEmail } = await import("./magic-link");
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
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  cookies: {
    sessionToken: {
      name: "better-auth.session_token",
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      domain: cookieDomain,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    },
  },
});

export type Auth = typeof auth;
