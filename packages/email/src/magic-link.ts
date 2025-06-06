"use server";

import { render } from "@react-email/components";
import { MagicLinkEmail } from "../emails/magic-link";
import { sendEmail } from "./send-email";

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
    const html = await render(MagicLinkEmail({ url }));

    const result = await sendEmail({
      to: email,
      subject: "Magic Link - Sign in to your account",
      text: `Click here to login: ${url}`,
      html,
    });

    return result;
  } catch (error) {
    console.error("Failed to send magic link email:", error);
    return { success: false, error };
  }
}
