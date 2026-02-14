import "server-only";

import { serverFetch } from "./server-client";
import {
  CreateMonitorRequest,
  Monitor,
  MonitorLog,
  MonitorStatus,
  PaginatedResponse,
} from "@/lib/types";

/**
 * Create a new monitor
 */
export async function createMonitor(data: CreateMonitorRequest) {
  return serverFetch<Monitor>("/api/v1/monitors", {
    method: "POST",
    body: data,
  });
}

/**
 * Get all monitors for the authenticated user
 * NOTE: This endpoint needs to be implemented in the backend
 * Expected: GET /api/v1/monitors -> Monitor[]
 */
export async function getMonitors() {
  return serverFetch<Monitor[]>("/api/v1/monitors", {
    method: "GET",
  });
}

/**
 * Get a single monitor by ID
 * Falls back to fetching all monitors and filtering if single endpoint doesn't exist
 */
export async function getMonitorById(monitorId: string) {
  // Try direct endpoint first
  const result = await serverFetch<Monitor>(`/api/v1/monitors/${monitorId}`, {
    method: "GET",
  });

  // If successful, return the result
  if (!result.error) {
    return result;
  }

  // For 404/405/401/403, try fetching from the monitors list as fallback
  // (The single monitor endpoint may not exist in the backend)
  const listResult = await serverFetch<Monitor[]>("/api/v1/monitors", {
    method: "GET",
  });

  if (listResult.error) {
    // If list also fails, return the original error
    return result;
  }

  // Find the monitor in the list
  const monitor = listResult.data?.find(m => m.id === monitorId);

  if (monitor) {
    return { data: monitor };
  }

  return { error: { message: "Monitor not found", status: 404 } };
}

/**
 * Get monitor status/summary
 */
export async function getMonitorStatus(monitorId: string) {
  return serverFetch<MonitorStatus>(`/api/v1/monitors/${monitorId}/status`, {
    method: "GET",
  });
}

/**
 * Get paginated monitor logs
 */
export async function getMonitorLogs(
  monitorId: string,
  page: number = 0,
  size: number = 20
) {
  return serverFetch<PaginatedResponse<MonitorLog>>(
    `/api/v1/monitors/${monitorId}/logs?page=${page}&size=${size}`,
    {
      method: "GET",
    }
  );
}

/**
 * Delete a monitor
 */
export async function deleteMonitor(monitorId: string) {
  return serverFetch<void>(`/api/v1/monitors/${monitorId}`, {
    method: "DELETE",
  });
}

/**
 * Toggle monitor active status
 */
export async function toggleMonitorStatus(monitorId: string, active: boolean) {
  return serverFetch<Monitor>(`/api/v1/monitors/${monitorId}/toggle`, {
    method: "PATCH",
    body: { active },
  });
}

