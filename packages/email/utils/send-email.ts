import { config } from "dotenv";
import type { ReactElement } from "react";
import { Resend } from "resend";

config({ path: "../../.env" });
config({ path: "../../.env.local" });

if (process.env.VERCEL_ENV) {
  config({ path: `../../.vercel/.env.${process.env.VERCEL_ENV}.local` });
}

const resend = new Resend(process.env.RESEND_API_KEY);

export type EmailPayload = {
  to: string | string[];
  subject: string;
  react?: ReactElement;
  text?: string;
  html?: string;
  from?: string;
};

export async function sendEmail(payload: EmailPayload) {
  const { to, subject, react, text, html, from } = payload;

  try {
    const data = await resend.emails.send({
      from: from || process.env.FROM_EMAIL || "no-reply@example.com",
      to,
      subject,
      react,
      text,
      html,
    });

    return { success: true, data };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}
