import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.BACKEND_API_URL || "http://localhost:8080";

/** Proxies a monitor's check-logs CSV export. See app/api/export/monitors/route.ts for why. */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ monitorId: string }> }
) {
  const { monitorId } = await params;
  const token = request.cookies.get("JwtToken")?.value;

  if (!token) {
    return NextResponse.json({ message: "Please sign in again." }, { status: 401 });
  }

  const search = request.nextUrl.search;
  const response = await fetch(
    `${API_BASE_URL}/api/v1/monitors/${encodeURIComponent(monitorId)}/logs/export${search}`,
    {
      headers: { Cookie: `JwtToken=${token}` },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return NextResponse.json(
      { message: "Failed to export logs." },
      { status: response.status }
    );
  }

  const csv = await response.arrayBuffer();

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=UTF-8",
      "Content-Disposition":
        response.headers.get("content-disposition") || 'attachment; filename="monitor-logs.csv"',
    },
  });
}
