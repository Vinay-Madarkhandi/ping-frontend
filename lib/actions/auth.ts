"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signupUser, signinUser } from "@/lib/api/auth";
import { signupSchema, signinSchema, SignupInput, SigninInput } from "@/lib/validations";
import { ActionResult, SignupResponse } from "@/lib/types";

/**
 * Server Action: Register a new user
 */
export async function signupAction(
  formData: SignupInput
): Promise<ActionResult<SignupResponse>> {
  // Server-side validation
  const validationResult = signupSchema.safeParse(formData);

  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.issues[0]?.message || "Invalid input",
    };
  }

  const { data, error } = await signupUser(validationResult.data);

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    data,
  };
}

/**
 * Server Action: Sign in user
 */
export async function signinAction(
  formData: SigninInput
): Promise<ActionResult> {
  // Server-side validation
  const validationResult = signinSchema.safeParse(formData);

  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.issues[0]?.message || "Invalid input",
    };
  }

  const { data, error, setCookies } = await signinUser(validationResult.data);

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  if (!data?.success) {
    return {
      success: false,
      error: "Invalid credentials",
    };
  }

  // Set cookies from backend response
  const cookieStore = await cookies();

  if (setCookies && setCookies.length > 0) {
    for (const setCookie of setCookies) {
      // Parse the Set-Cookie header
      const [cookiePart, ...optionsParts] = setCookie.split(";");
      const [name, ...valueParts] = cookiePart.split("=");
      const value = valueParts.join("="); // Handle values that contain '='

      if (name && value) {
        const options: {
          httpOnly?: boolean;
          secure?: boolean;
          sameSite?: "strict" | "lax" | "none";
          path?: string;
          maxAge?: number;
        } = {
          path: "/", // Default path
          httpOnly: true, // Always set httpOnly for security
          sameSite: "lax", // Default sameSite
        };

        for (const option of optionsParts) {
          const [key, val] = option.trim().split("=");
          const keyLower = key.toLowerCase();
          if (keyLower === "httponly") options.httpOnly = true;
          if (keyLower === "secure") options.secure = true;
          if (keyLower === "samesite") {
            options.sameSite = val?.toLowerCase() as "strict" | "lax" | "none";
          }
          if (keyLower === "path") options.path = val;
          if (keyLower === "max-age") options.maxAge = parseInt(val || "0", 10);
        }

        try {
          cookieStore.set(name.trim(), value.trim(), options);
        } catch (err) {
          console.error(`Failed to set cookie ${name.trim()}:`, err);
        }
      }
    }
  }

  return {
    success: true,
  };
}

/**
 * Server Action: Sign out user
 */
export async function signoutAction(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete("JwtToken");

  redirect("/signin");
}
