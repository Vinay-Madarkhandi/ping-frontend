import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  return new NextResponse("Service Unavailable", {
    status: 503,
  });
}

export const config = {
  matcher: "/:path*",
};
