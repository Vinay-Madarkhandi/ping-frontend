import "server-only";

import { serverFetch } from "./server-client";
import {
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

