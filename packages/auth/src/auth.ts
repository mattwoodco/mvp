import { db } from "@mvp/database";
import { compare, hash } from "bcrypt-ts";
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
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    password: {
      hash: async (password: string) => {
        return await hash(password, 12);
      },
      verify: async ({ password, hash: hashedPassword }) => {
        return await compare(password, hashedPassword);
      },
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, token, url }) => {
      const { sendMagicLinkEmail } = await import("@mvp/email");
      await sendMagicLinkEmail({
        email: user.email,
        token,
        url,
      });
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  plugins: [
    magicLink({
      sendMagicLink: async (params: MagicLinkParams) => {
        const { sendMagicLinkEmail } = await import("@mvp/email");
        await sendMagicLinkEmail(params);
      },
    }),
    nextCookies(),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      console.log("JWT callback", { token, user });
      if (user) {
        token.id = user.id;
      }

      return token;
    },
    user: {
      created: async ({ user }: { user: any }) => {
        console.log("User created:", user.email);
      },
      signedIn: async ({ user, session }: { user: any; session: any }) => {
        console.log("User signed in:", user.email);
      },
    },
    session: {
      created: async ({ session, user }: { session: any; user: any }) => {
        console.log("Session created for user:", user.email);
      },
    },
  },
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"],
});

export type BetterAuthSession = typeof auth.$Infer.Session;
export type BetterAuthUser = typeof auth.$Infer.Session.user;
