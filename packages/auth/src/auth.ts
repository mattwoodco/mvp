import { db } from "@mvp/database";
import { compare, hash } from "bcrypt-ts";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { twoFactor } from "better-auth/plugins";
import { magicLink } from "better-auth/plugins/magic-link";

type MagicLinkParams = {
  email: string;
  token: string;
  url: string;
};

// Lazy Twilio client initialization
const getTwilioClient = async () => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;

  if (!sid || !token || sid.trim() === "" || token.trim() === "") {
    return null;
  }

  try {
    const { Twilio } = await import("twilio");
    return new Twilio(sid, token);
  } catch (error) {
    console.error("Failed to initialize Twilio client:", error);
    return null;
  }
};

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  appName: process.env.APP_NAME || "ChatMTV",
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
      try {
        const { sendMagicLinkEmail } = await import("@mvp/email");
        await sendMagicLinkEmail({
          email: user.email,
          token,
          url,
        });
      } catch (error) {
        console.error("Failed to send verification email:", error);
      }
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  plugins: [
    magicLink({
      sendMagicLink: async (params: MagicLinkParams) => {
        try {
          const { sendMagicLinkEmail } = await import("@mvp/email");
          await sendMagicLinkEmail(params);
        } catch (error) {
          console.error("Failed to send magic link:", error);
        }
      },
    }),
    twoFactor({
      issuer: process.env.APP_NAME || "ChatMTV",
      skipVerificationOnEnable: false,
      otpOptions: {
        async sendOTP({ user, otp }, request) {
          const twilioClient = await getTwilioClient();

          if (!twilioClient) {
            throw new Error("Twilio client not configured");
          }

          // Check if user has phone number
          const userWithPhone = user as { phoneNumber?: string };
          if (!userWithPhone.phoneNumber) {
            throw new Error("User phone number not found");
          }

          try {
            await twilioClient.messages.create({
              body: `Your ${process.env.APP_NAME || "ChatMTV"} verification code is: ${otp}`,
              from: process.env.TWILIO_PHONE_NUMBER!,
              to: userWithPhone.phoneNumber,
            });
          } catch (error) {
            console.error("Failed to send OTP via Twilio:", error);
            throw new Error("Failed to send OTP");
          }
        },
        period: 60, // OTP valid for 60 seconds
      },
      totpOptions: {
        period: 30,
        digits: 6,
      },
      backupCodeOptions: {
        amount: 10,
        length: 8,
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
