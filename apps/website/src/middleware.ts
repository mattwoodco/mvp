import { getSessionFromRequest } from "@mvp/auth/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Debug logging for production
  console.log(`[Middleware Debug] ${new Date().toISOString()} - ${pathname}`);
  console.log(
    "[Middleware Debug] Headers:",
    Object.fromEntries(request.headers.entries()),
  );
  console.log("[Middleware Debug] Cookies:", request.cookies.getAll());

  // Check if this is a protected route
  const isProtectedRoute =
    pathname.startsWith("/settings") || pathname.startsWith("/agent");

  if (isProtectedRoute) {
    try {
      // Method 1: Try the auth package session validation
      console.log("[Middleware Debug] Attempting getSessionFromRequest...");
      const session = await getSessionFromRequest(request);
      console.log("[Middleware Debug] Session result:", {
        hasSession: !!session,
        sessionData: session
          ? `${JSON.stringify(session).substring(0, 100)}...`
          : null,
      });

      // Method 2: Fallback to direct cookie check if session is null
      if (!session) {
        console.log(
          "[Middleware Debug] Session null, checking cookies directly...",
        );
        const sessionCookie = request.cookies.get("better-auth.session_token");
        console.log("[Middleware Debug] Direct cookie check:", {
          cookieExists: !!sessionCookie,
          cookieName: sessionCookie?.name,
          cookieValueLength: sessionCookie?.value?.length,
        });

        // If cookie exists, try calling the API to validate
        if (sessionCookie) {
          console.log(
            "[Middleware Debug] Cookie exists, validating via API...",
          );
          try {
            const baseUrl = request.nextUrl.origin;
            const response = await fetch(`${baseUrl}/api/auth/get-session`, {
              headers: {
                cookie: request.headers.get("cookie") || "",
              },
            });
            const apiSession = await response.json();
            console.log("[Middleware Debug] API validation result:", {
              status: response.status,
              hasUser: !!apiSession?.user,
              userId: apiSession?.user?.id,
            });

            if (apiSession?.user) {
              console.log(
                "[Middleware Debug] API validation successful, allowing access",
              );
              return NextResponse.next();
            }
          } catch (apiError) {
            console.error("[Middleware Debug] API validation error:", apiError);
          }
        }
      }

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
