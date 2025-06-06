// @ts-nocheck
import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

export async function authMiddleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard"],
};
