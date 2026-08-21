import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const protectedRoutes = ["/dashboard", "/monitors", "/analytics", "/alerts", "/status-pages", "/settings"];

// Fonts are self-hosted via next/font (no external font-src needed). Razorpay's checkout widget
// is the one third-party surface — it injects a script from checkout.razorpay.com and opens its
// payment form in an iframe from api.razorpay.com. img-src allows https: broadly because status
// page / monitor logo URLs are arbitrary user-supplied https links (validated server-side to
// start with http(s)://, not to a fixed host). 'strict-dynamic' extends trust from Next's own
// nonce'd bundles to scripts they load at runtime (e.g. the Razorpay checkout.js injected via
// document.createElement on "Upgrade" click) without needing to pre-authorize every such host.
function buildCsp(nonce: string) {
  const isDev = process.env.NODE_ENV === "development";
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://checkout.razorpay.com${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com",
    "frame-src https://api.razorpay.com https://checkout.razorpay.com",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthenticated = !!request.cookies.get("JwtToken");

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/signin", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
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
