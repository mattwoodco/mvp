import { getSessionFromRequest } from "@mvp/auth/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is a protected route
  const isProtectedRoute =
    pathname.startsWith("/settings") || pathname.startsWith("/agent");

  if (isProtectedRoute) {
    try {
      // Check for valid session
      const session = await getSessionFromRequest(request);
      const hasValidSession = !!session?.user;

      console.log(`[Middleware] ${pathname}:`, {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        cookies: request.cookies.getAll().map((c) => c.name),
      });

      if (!hasValidSession) {
        console.log(`[Middleware] Redirecting ${pathname} to login`);
        // Store the original URL to redirect back after login
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
      }
    } catch (error) {
      console.error(
        `[Middleware] Error validating session for ${pathname}:`,
        error,
      );
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
