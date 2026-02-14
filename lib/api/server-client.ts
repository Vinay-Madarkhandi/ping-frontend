import "server-only";

import { cookies } from "next/headers";
import { ApiError } from "@/lib/types";

const API_BASE_URL = process.env.BACKEND_API_URL || "http://localhost:8080";

interface FetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  setCookies?: string[];
}

/**
 * Server-only fetch wrapper that automatically handles:
 * - Cookie forwarding for authentication
 * - JSON serialization
 * - Error handling
 * - Response parsing
 */
export async function serverFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const { body, headers: customHeaders, ...restOptions } = options;

  // Get cookies from the incoming request and format them properly
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  // Get specifically the JwtToken
  const jwtCookie = cookieStore.get("JwtToken");

  // Log all available cookies for debugging
  console.log(`[API] ${options.method || "GET"} ${endpoint}`);
  console.log(`[API] JwtToken present: ${!!jwtCookie}, value length: ${jwtCookie?.value?.length || 0}`);

  // Format cookies as "name=value; name2=value2" for the Cookie header
  const cookieHeader = allCookies
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  if (!jwtCookie) {
    console.log(`[API] WARNING: JwtToken cookie not found!`);
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(cookieHeader && { Cookie: cookieHeader }),
    ...customHeaders,
  };

  const config: RequestInit = {
    ...restOptions,
    headers,
    credentials: "include",
    // Disable caching to ensure fresh auth state
    cache: "no-store",
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    console.log(`[API] Sending request to: ${API_BASE_URL}${endpoint}`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Log response status for debugging
    console.log(`[API] Response for ${endpoint}: ${response.status} ${response.statusText}`);

    // Extract Set-Cookie headers for auth responses
    const setCookies = response.headers.getSetCookie();

    // Handle non-JSON responses
    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      if (!response.ok) {
        return {
          error: {
            message: "An unexpected error occurred",
            status: response.status,
          },
        };
      }
      return { data: undefined as T, setCookies };
    }

    const data = await response.json();

    if (!response.ok) {
      console.log(`[API] Error response:`, data);
      return {
        error: {
          message: data.message || data.error || "An unexpected error occurred",
          status: response.status,
        },
      };
    }

    return { data: data as T, setCookies };
  } catch (error) {
    console.error("API fetch error:", error);
    return {
      error: {
        message: "Failed to connect to the server. Please try again later.",
        status: 500,
      },
    };
  }
}

/**
 * Helper to check if the user is authenticated
 * by verifying the presence of auth cookie
 */
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  // Check for JWT cookie (adjust name based on your backend)
  const token = cookieStore.get("JwtToken") || cookieStore.get("token") || cookieStore.get("jwt") || cookieStore.get("session");
  return !!token;
}

/**
 * Get the auth cookie value for server-side operations
 */
export async function getAuthCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const token = cookieStore.get("JwtToken") || cookieStore.get("token") || cookieStore.get("jwt") || cookieStore.get("session");
  return token?.value;
}

