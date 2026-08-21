import "server-only";

import { serverFetch } from "./server-client";
import {
  CreateMonitorResponse,
  CreateMonitorRequest,
  Incident,
  Monitor,
  MonitorLog,
  MonitorStatus,
  PaginatedResponse,
  Uptime,
  AlertDelivery,
} from "@/lib/types";

/**
 * Create a new monitor
 */
export async function createMonitor(data: CreateMonitorRequest) {
  return serverFetch<CreateMonitorResponse>("/api/v1/monitors", {
    method: "POST",
    body: data,
  });
}

/**
 * Get all monitors for the authenticated user.
 *
 * The list DTO now carries state (currentState/displayState/paused/quotaBlocked), so callers no
 * longer need a follow-up /status request per monitor.
 */
export async function getMonitors(archived: boolean = false) {
  const query = archived ? "?archived=true" : "";
  return serverFetch<Monitor[]>(`/api/v1/monitors${query}`, {
    method: "GET",
  });
}

/**
 * Get a single monitor by ID. Returns 403 when the monitor is not owned by the caller or archived,
 * so a missing monitor never reveals whether it exists for someone else.
 */
export async function getMonitorById(monitorId: string) {
  return serverFetch<Monitor>(`/api/v1/monitors/${monitorId}`, {
    method: "GET",
  });
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
 * Get paginated monitor incidents
 */
export async function getMonitorIncidents(
  monitorId: string,
  page: number = 0,
  size: number = 10
) {
  return serverFetch<PaginatedResponse<Incident>>(
    `/api/v1/monitors/${monitorId}/incidents?page=${page}&size=${size}`,
    {
      method: "GET",
    }
  );
}

/**
 * Get duration-based uptime for a monitor.
 */
export async function getMonitorUptime(
  monitorId: string,
  window: "30m" | "24h" | "7d" | "30d" = "24h"
) {
  return serverFetch<Uptime>(
    `/api/v1/monitors/${monitorId}/uptime?window=${window}`,
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
  return serverFetch<void>(`/api/v1/monitors/${monitorId}/toggle`, {
    method: "PATCH",
    body: { active },
  });
}

/**
 * Pause monitor checks while excluding the paused span from uptime.
 */
export async function pauseMonitor(monitorId: string) {
  return serverFetch<void>(`/api/v1/monitors/${monitorId}/pause`, {
    method: "POST",
  });
}

/**
 * Resume monitor checks after an administrative pause.
 */
export async function resumeMonitor(monitorId: string) {
  return serverFetch<void>(`/api/v1/monitors/${monitorId}/resume`, {
    method: "POST",
  });
}

/**
 * Full replacement of a monitor's configuration. Re-validates SSRF and plan limits.
 * `kind` is immutable after creation, so it is not part of this payload — the backend infers
 * HTTP-vs-HEARTBEAT handling from the monitor's existing kind.
 */
export async function editMonitor(monitorId: string, data: Omit<CreateMonitorRequest, "kind">) {
  return serverFetch<Monitor>(`/api/v1/monitors/${monitorId}`, {
    method: "PUT",
    body: data,
  });
}

/**
 * Run an immediate check and return its outcome, bypassing the scheduler.
 */
export async function checkMonitorNow(monitorId: string) {
  return serverFetch<{
    outcome: string;
    statusCode: number;
    responseTimeMs: number;
    errorMessage?: string;
    message: string;
  }>(`/api/v1/monitors/${monitorId}/check-now`, {
    method: "POST",
  });
}

/**
 * Un-archive a monitor and schedule it immediately. Counts against plan's monitor limit.
 */
export async function restoreMonitor(monitorId: string) {
  return serverFetch<Monitor>(`/api/v1/monitors/${monitorId}/restore`, {
    method: "POST",
  });
}

/**
 * Get alert delivery history for a specific monitor.
 */
export async function getMonitorAlerts(
  monitorId: string,
  page: number = 0,
  size: number = 20
) {
  return serverFetch<PaginatedResponse<AlertDelivery>>(
    `/api/v1/monitors/${monitorId}/alerts?page=${page}&size=${size}`,
    {
      method: "GET",
    }
  );
}

/**
 * Get account-wide alert delivery history.
 */
export async function getAllAlerts(page: number = 0, size: number = 20) {
  return serverFetch<PaginatedResponse<AlertDelivery>>(
    `/api/v1/alerts?page=${page}&size=${size}`,
    {
      method: "GET",
    }
  );
}
