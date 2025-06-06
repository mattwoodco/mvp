// @ts-nocheck
import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

export async function authMiddleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  console.log("🚀 ~ authMiddleware ~ sessionCookie:", sessionCookie);
  // if (!sessionCookie) {
  //   return NextResponse.redirect(new URL("/", request.url));
  // }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard"],
};
