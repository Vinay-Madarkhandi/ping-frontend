import type { NextConfig } from "next";

// Content-Security-Policy is set per-request in proxy.ts (it needs a fresh nonce every time),
// not here. These are the headers that don't vary per request.
const SECURITY_HEADERS = [
  // Belt-and-suspenders with the CSP's frame-ancestors for browsers that predate CSP support.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(self \"https://checkout.razorpay.com\")",
  },
  // Only takes effect over HTTPS (browsers ignore it on plain HTTP), so it's safe to always send.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${process.env.BACKEND_API_URL || "http://localhost:8080"}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
