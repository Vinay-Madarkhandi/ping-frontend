import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.BACKEND_API_URL || "http://localhost:8080";

/**
 * Proxies the monitors CSV export. Runs server-side so the JwtToken cookie is forwarded to the
 * backend — a browser request straight to the backend origin would not carry it.
 */
export async function GET(request: NextRequest) {
  const token = request.cookies.get("JwtToken")?.value;

  if (!token) {
    return NextResponse.json({ message: "Please sign in again." }, { status: 401 });
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/monitors/export`, {
    headers: { Cookie: `JwtToken=${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json(
      { message: "Failed to export monitors." },
      { status: response.status }
    );
  }

  const csv = await response.arrayBuffer();

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=UTF-8",
      "Content-Disposition":
        response.headers.get("content-disposition") || 'attachment; filename="monitors.csv"',
    },
  });
}
