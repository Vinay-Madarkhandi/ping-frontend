import "server-only";

import { serverFetch } from "./server-client";
import { MaintenanceWindow, MaintenanceWindowRequest } from "@/lib/types";

export async function getMaintenanceWindows(monitorId: string) {
  return serverFetch<MaintenanceWindow[]>(`/api/v1/monitors/${monitorId}/maintenance-windows`, {
    method: "GET",
  });
}

export async function createMaintenanceWindow(monitorId: string, data: MaintenanceWindowRequest) {
  return serverFetch<MaintenanceWindow>(`/api/v1/monitors/${monitorId}/maintenance-windows`, {
    method: "POST",
    body: data,
  });
}

export async function cancelMaintenanceWindow(monitorId: string, windowId: string) {
  return serverFetch<void>(`/api/v1/monitors/${monitorId}/maintenance-windows/${windowId}`, {
    method: "DELETE",
  });
}
