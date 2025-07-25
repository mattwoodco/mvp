import MagicLinkEmail from "@mvp/email/emails/magic-link";
import { sendEmail } from "./email";

type MagicLinkParams = {
  email: string;
  token: string;
  url: string;
};

export async function sendMagicLinkEmail({
  email,
  token,
  url,
}: MagicLinkParams) {
  try {
    const result = await sendEmail({
      to: email,
      subject: "Sign in to your account",
      react: MagicLinkEmail({ url, email, token }),
    });

    return result;
  } catch (error) {
    console.error("Failed to send magic link email:", error);
    return { success: false, error };
  }
}
