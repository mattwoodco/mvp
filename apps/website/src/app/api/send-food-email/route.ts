"use server";

import { FoodEmail } from "@chatmtv/email/emails/food";
import { sendEmail } from "@chatmtv/email/utils";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const result = await sendEmail({
      to: "matt@mattwood.co",
      subject: "Food Email",
      react: FoodEmail({
        url: "https://example.com",
        email: "matt@mattwood.co",
      }),
    });

    if (result.success) {
      return NextResponse.json({ success: true, message: "Food email sent!" });
    }

    return NextResponse.json(
      { success: false, error: "Failed to send email" },
      { status: 500 },
    );
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send email" },
      { status: 500 },
    );
  }
}
