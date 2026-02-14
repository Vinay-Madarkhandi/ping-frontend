import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.BACKEND_API_URL || "http://localhost:8080";

/**
 * Proxy the signin request to the backend.
 * This allows the browser to receive the Set-Cookie header directly,
 * which properly sets HttpOnly cookies.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/signin/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // Create the response
    const nextResponse = NextResponse.json(data, { status: response.status });

    // Forward all Set-Cookie headers from backend to browser
    const setCookieHeaders = response.headers.getSetCookie();
    for (const cookie of setCookieHeaders) {
      nextResponse.headers.append("Set-Cookie", cookie);
    }

    return nextResponse;
  } catch (error) {
    console.error("Signin proxy error:", error);
    return NextResponse.json(
      { message: "Failed to connect to authentication server" },
      { status: 500 }
    );
  }
}

