import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is a protected route
  const isProtectedRoute =
    pathname.startsWith("/settings") || pathname.startsWith("/agent");

  if (isProtectedRoute) {
    // Check for session cookie
    const sessionCookie = request.cookies.get("better-auth.session_token");
    const hasValidSession = !!sessionCookie;

    if (!hasValidSession) {
      // Store the original URL to redirect back after login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     * - register (register page)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|login|register).*)",
  ],
};
