"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  logout,
  deleteAccount,
} from "@/lib/api/auth";
import { ActionResult } from "@/lib/types";

/**
 * Server Action: Sign up a new user
 */
export async function signupAction(formData: {
  username: string;
  email: string;
  password: string;
}): Promise<ActionResult> {
  try {
    const backendUrl = process.env.BACKEND_API_URL || "http://localhost:8080";
    const response = await fetch(`${backendUrl}/api/v1/auth/signup/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || "Signup failed",
        status: response.status,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

/**
 * Server Action: Change password
 */
export async function changePasswordAction(
  currentPassword: string,
  newPassword: string
): Promise<ActionResult> {
  const { error } = await changePassword(currentPassword, newPassword);

  if (error) {
    return {
      success: false,
      error: error.message,
      status: error.status,
    };
  }

  return {
    success: true,
  };
}

/**
 * Server Action: Request password reset
 */
export async function forgotPasswordAction(email: string): Promise<ActionResult> {
  const { error } = await forgotPassword(email);

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
  };
}

/**
 * Server Action: Reset password with token
 */
export async function resetPasswordAction(
  token: string,
  newPassword: string
): Promise<ActionResult> {
  const { error } = await resetPassword(token, newPassword);

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
  };
}

/**
 * Server Action: Verify email
 */
export async function verifyEmailAction(token: string): Promise<ActionResult> {
  const { error } = await verifyEmail(token);

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath("/");
  return {
    success: true,
  };
}

/**
 * Server Action: Resend verification email
 */
export async function resendVerificationAction(): Promise<ActionResult> {
  const { error } = await resendVerification();

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
  };
}

/**
 * Server Action: Logout
 */
export async function logoutAction(): Promise<void> {
  await logout();
  redirect("/signin");
}

/**
 * Server Action: Delete account
 */
export async function deleteAccountAction(): Promise<void> {
  await deleteAccount();
  redirect("/signup");
}

/**
 * Alias for logoutAction for backwards compatibility
 */
export const signoutAction = logoutAction;
