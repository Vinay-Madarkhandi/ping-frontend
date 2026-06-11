import "server-only";

import { ApiResponse, serverFetch } from "./server-client";
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
 */
export async function getMonitors() {
  return serverFetch<Monitor[]>("/api/v1/monitors", {
    method: "GET",
  });
}

/**
 * Get a single monitor by ID
 * The backend does not provide a single-monitor endpoint, so use the list.
 */
export async function getMonitorById(monitorId: string): Promise<ApiResponse<Monitor>> {
  const listResult = await serverFetch<Monitor[]>("/api/v1/monitors", {
    method: "GET",
  });

  if (listResult.error) {
    return { error: listResult.error };
  }

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
