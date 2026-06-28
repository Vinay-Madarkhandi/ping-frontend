import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.BACKEND_API_URL || "http://localhost:8080";

/**
 * Verify a Razorpay payment. Runs server-side so the JwtToken cookie reaches the backend, which
 * cryptographically verifies the signature and performs the plan upgrade.
 */
export async function POST(request: NextRequest) {
  const token = request.cookies.get("JwtToken")?.value;

  if (!token) {
    return NextResponse.json(
      { message: "Please sign in again before verifying payment." },
      {
        status: 401,
        headers: {
          "X-Ping-Billing-Proxy": "missing-jwt",
        },
      }
    );
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/billing/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Cookie: `JwtToken=${token}`,
    },
    body: await request.text(),
    cache: "no-store",
  });

  const text = await response.text();

  return new NextResponse(text, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") || "application/json",
      "X-Ping-Billing-Proxy": "jwt-present",
      "X-Ping-Backend-Status": String(response.status),
    },
  });
}
