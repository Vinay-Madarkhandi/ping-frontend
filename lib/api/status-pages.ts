import "server-only";

import { serverFetch } from "./server-client";
import { PublicStatusPage, StatusPage, StatusPageRequest } from "@/lib/types";

export async function getStatusPages() {
  return serverFetch<StatusPage[]>("/api/v1/status-pages", {
    method: "GET",
  });
}

export async function getStatusPage(id: string) {
  return serverFetch<StatusPage>(`/api/v1/status-pages/${id}`, {
    method: "GET",
  });
}

export async function createStatusPage(data: StatusPageRequest) {
  return serverFetch<StatusPage>("/api/v1/status-pages", {
    method: "POST",
    body: data,
  });
}

export async function updateStatusPage(id: string, data: StatusPageRequest) {
  return serverFetch<StatusPage>(`/api/v1/status-pages/${id}`, {
    method: "PUT",
    body: data,
  });
}

export async function deleteStatusPage(id: string) {
  return serverFetch<void>(`/api/v1/status-pages/${id}`, {
    method: "DELETE",
  });
}

/** Unauthenticated — safe to call whether or not the caller has a session. */
export async function getPublicStatusPage(slug: string) {
  return serverFetch<PublicStatusPage>(`/api/v1/public/status-pages/${encodeURIComponent(slug)}`, {
    method: "GET",
  });
}
