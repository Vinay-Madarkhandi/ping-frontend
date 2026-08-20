import "server-only";

import { serverFetch } from "./server-client";
import { CurrentUserResponse } from "@/lib/types";

/**
 * Get current authenticated user's profile
 */
export async function getCurrentUser() {
  return serverFetch<CurrentUserResponse>("/api/v1/auth/me", {
    method: "GET",
  });
}

/**
 * Validate current session (checks if JWT is valid)
 */
export async function validateSession() {
  return serverFetch<{ success: boolean }>("/api/v1/auth/validate", {
    method: "GET",
  });
}

/**
 * Change password (requires current password)
 */
export async function changePassword(currentPassword: string, newPassword: string) {
  return serverFetch<void>("/api/v1/auth/password", {
    method: "PATCH",
    body: { currentPassword, newPassword },
  });
}

/**
 * Request password reset email
 */
export async function forgotPassword(email: string) {
  return serverFetch<void>("/api/v1/auth/forgot-password", {
    method: "POST",
    body: { email },
  });
}

/**
 * Reset password using token from email
 */
export async function resetPassword(token: string, newPassword: string) {
  return serverFetch<void>("/api/v1/auth/reset-password", {
    method: "POST",
    body: { token, newPassword },
  });
}

/**
 * Verify email using token from verification email
 */
export async function verifyEmail(token: string) {
  return serverFetch<void>("/api/v1/auth/verify-email", {
    method: "POST",
    body: { token },
  });
}

/**
 * Resend verification email
 */
export async function resendVerification() {
  return serverFetch<void>("/api/v1/auth/resend-verification", {
    method: "POST",
  });
}

/**
 * Logout and revoke current token
 */
export async function logout() {
  return serverFetch<void>("/api/v1/auth/logout", {
    method: "POST",
  });
}

/**
 * Delete account (soft delete with anonymization)
 */
export async function deleteAccount() {
  return serverFetch<void>("/api/v1/auth/me", {
    method: "DELETE",
  });
}
