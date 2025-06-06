import { betterAuth } from "better-auth";
import { twoFactor } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@mvp/database";
import { Twilio } from "twilio";

// Initialize Twilio client
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg"
  }),
  appName: process.env.APP_NAME || "ChatMTV",
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, verificationUrl }) => {
      // TODO: Implement email sending with Resend
      console.log("Send verification email to", user.email, verificationUrl);
    },
  },
  plugins: [
    twoFactor({
      issuer: process.env.APP_NAME || "ChatMTV",
      skipVerificationOnEnable: false,
      otpOptions: {
        async sendOTP({ user, otp }, request) {
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
  ],
});