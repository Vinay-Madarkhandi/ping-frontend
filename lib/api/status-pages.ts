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

/**
 * Unauthenticated — safe to call whether or not the caller has a session. Returns a 401
 * ({@code error.status === 401}) when the page is password protected; call
 * {@link unlockPublicStatusPage} with the password to get the same shape back.
 */
export async function getPublicStatusPage(slug: string) {
  return serverFetch<PublicStatusPage>(`/api/v1/public/status-pages/${encodeURIComponent(slug)}`, {
    method: "GET",
  });
}

/** Verifies a password against a protected status page; 401 on a wrong password. */
export async function unlockPublicStatusPage(slug: string, password: string) {
  return serverFetch<PublicStatusPage>(
    `/api/v1/public/status-pages/${encodeURIComponent(slug)}/unlock`,
    { method: "POST", body: { password } }
  );
}
