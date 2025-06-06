import { db } from "@mvp/database";
import { compare, hash } from "bcrypt-ts";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  secret:
    process.env.BETTER_AUTH_SECRET || "default-32-char-secret-for-dev-only",
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  appName: process.env.APP_NAME || "ChatMTV",
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    password: {
      hash: async (password: string) => {
        return await hash(password, 12);
      },
      verify: async ({ password, hash: hashedPassword }) => {
        return await compare(password, hashedPassword);
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  plugins: [nextCookies()],
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"],
});

export type BetterAuthSession = typeof auth.$Infer.Session;
export type BetterAuthUser = typeof auth.$Infer.Session.user;
