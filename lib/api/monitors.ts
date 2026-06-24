import "server-only";

import { ApiResponse, serverFetch } from "./server-client";
import {
  CreateMonitorResponse,
  CreateMonitorRequest,
  Incident,
  Monitor,
  MonitorLog,
  MonitorStatus,
  PaginatedResponse,
  Uptime,
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
 * Get all monitors for the authenticated user
 */
export async function getMonitors() {
  return serverFetch<Monitor[]>("/api/v1/monitors", {
    method: "GET",
  });
}

/**
 * Get monitors and merge per-monitor status until the list DTO exposes state.
 */
export async function getMonitorsWithStatus(): Promise<ApiResponse<Monitor[]>> {
  const monitorsResult = await getMonitors();

  if (monitorsResult.error || !monitorsResult.data) {
    return monitorsResult;
  }

  const statusResults = await Promise.all(
    monitorsResult.data.map((monitor) => getMonitorStatus(monitor.id))
  );

  return {
    data: monitorsResult.data.map((monitor, index) => {
      const status = statusResults[index].data;

      if (!status) {
        return monitor;
      }

      return {
        ...monitor,
        currentState: status.currentState,
        displayState: status.displayState,
        paused: status.displayState === "PAUSED",
        uptimePercentage: monitor.uptimePercentage ?? status.uptimePercentage,
      };
    }),
  };
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
