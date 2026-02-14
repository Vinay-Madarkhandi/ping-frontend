import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const protectedRoutes = ["/dashboard", "/monitors", "/analytics"];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ["/login", "/signup"];

// Common JWT cookie names - add your backend's cookie name here
const AUTH_COOKIE_NAMES = ["JwtToken", "token", "jwt", "session", "JSESSIONID", "auth_token", "access_token"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for any auth cookie
  let isAuthenticated = false;
  let foundCookie: string | null = null;

  for (const cookieName of AUTH_COOKIE_NAMES) {
    const cookie = request.cookies.get(cookieName);
    if (cookie) {
      isAuthenticated = true;
      foundCookie = cookieName;
      break;
    }
  }

  // Also check all cookies if none of the known names match
  if (!isAuthenticated) {
    const allCookies = request.cookies.getAll();
    // Log cookies for debugging in development
    if (process.env.NODE_ENV === "development" && allCookies.length > 0) {
      console.log("Available cookies:", allCookies.map(c => c.name));
    }
  }

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if current path is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname === route);

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from auth routes to dashboard
  if (isAuthRoute && isAuthenticated) {
    console.log(`Authenticated user (cookie: ${foundCookie}) accessing auth route, redirecting to dashboard`);
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)",
  ],
};

