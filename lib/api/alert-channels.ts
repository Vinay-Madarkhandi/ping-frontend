import "server-only";

import { serverFetch } from "./server-client";
import { AlertChannel, AlertChannelRequest, AlertChannelTestResult } from "@/lib/types";

export async function getAlertChannels() {
  return serverFetch<AlertChannel[]>("/api/v1/alert-channels", {
    method: "GET",
  });
}

export async function createAlertChannel(data: AlertChannelRequest) {
  return serverFetch<AlertChannel>("/api/v1/alert-channels", {
    method: "POST",
    body: data,
  });
}

export async function deleteAlertChannel(id: string) {
  return serverFetch<void>(`/api/v1/alert-channels/${id}`, {
    method: "DELETE",
  });
}

export async function testAlertChannel(id: string) {
  return serverFetch<AlertChannelTestResult>(`/api/v1/alert-channels/${id}/test`, {
    method: "POST",
  });
}

export async function getMonitorAlertChannels(monitorId: string) {
  return serverFetch<string[]>(`/api/v1/monitors/${monitorId}/alert-channels`, {
    method: "GET",
  });
}

export async function setMonitorAlertChannels(monitorId: string, channelIds: string[]) {
  return serverFetch<void>(`/api/v1/monitors/${monitorId}/alert-channels`, {
    method: "PUT",
    body: { channelIds },
  });
}
