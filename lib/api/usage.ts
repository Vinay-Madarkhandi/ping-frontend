import "server-only";

import { serverFetch } from "./server-client";
import { AdminUsageResponse, UsageResponse } from "@/lib/types";

/**
 * Get the authenticated user's current monthly usage.
 */
export async function getUsage() {
  return serverFetch<UsageResponse>("/api/v1/usage", {
    method: "GET",
  });
}

/**
 * Admin-only usage overview. A 403 means the signed-in user is not an admin.
 */
export async function getAdminUsage() {
  return serverFetch<AdminUsageResponse[]>("/api/v1/admin/usage", {
    method: "GET",
  });
}
