import "server-only";

import { serverFetch } from "./server-client";
import {
  CurrentUserResponse,
  SignupRequest,
  SignupResponse,
  SigninRequest,
  SigninResponse,
} from "@/lib/types";

/**
 * Register a new user account
 */
export async function signupUser(data: SignupRequest) {
  return serverFetch<SignupResponse>("/api/v1/auth/signup/user", {
    method: "POST",
    body: data,
  });
}

/**
 * Sign in with email and password
 * Returns the response with Set-Cookie headers for JWT
 */
export async function signinUser(data: SigninRequest) {
  return serverFetch<SigninResponse>("/api/v1/auth/signin/user", {
    method: "POST",
    body: data,
  });
}

/**
 * Validate the current cookie-based session
 */
export async function validateSession() {
  return serverFetch<SigninResponse>("/api/v1/auth/validate", {
    method: "GET",
  });
}

/**
 * Get the authenticated user and plan limits.
 */
export async function getCurrentUser() {
  return serverFetch<CurrentUserResponse>("/api/v1/auth/me", {
    method: "GET",
  });
}
