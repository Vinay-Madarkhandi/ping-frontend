"use server";

import { revalidatePath } from "next/cache";
import {
  createStatusPage,
  updateStatusPage,
  deleteStatusPage,
  unlockPublicStatusPage,
} from "@/lib/api/status-pages";
import {
  statusPageSchema,
  statusPageUnlockSchema,
  StatusPageInput,
  StatusPageUnlockInput,
} from "@/lib/validations";
import { ActionResult, PublicStatusPage, StatusPage } from "@/lib/types";

function revalidateStatusPageViews() {
  revalidatePath("/status-pages");
}

export async function createStatusPageAction(
  formData: StatusPageInput
): Promise<ActionResult<StatusPage>> {
  const validationResult = statusPageSchema.safeParse(formData);

  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.issues[0]?.message || "Invalid input",
    };
  }

  const { data, error } = await createStatusPage(validationResult.data);

  if (error) {
    return {
      success: false,
      error: error.message,
      status: error.status,
    };
  }

  revalidateStatusPageViews();

  return {
    success: true,
    data,
  };
}

export async function updateStatusPageAction(
  pageId: string,
  formData: StatusPageInput
): Promise<ActionResult<StatusPage>> {
  const validationResult = statusPageSchema.safeParse(formData);

  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.issues[0]?.message || "Invalid input",
    };
  }

  const { data, error } = await updateStatusPage(pageId, validationResult.data);

  if (error) {
    return {
      success: false,
      error: error.message,
      status: error.status,
    };
  }

  revalidateStatusPageViews();

  return {
    success: true,
    data,
  };
}

/**
 * Server Action: verify a password-protected status page's password. Called from the public
 * (unauthenticated) page's client-side password gate.
 */
export async function unlockStatusPageAction(
  slug: string,
  formData: StatusPageUnlockInput
): Promise<ActionResult<PublicStatusPage>> {
  const validationResult = statusPageUnlockSchema.safeParse(formData);

  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.issues[0]?.message || "Invalid input",
    };
  }

  const { data, error } = await unlockPublicStatusPage(slug, validationResult.data.password);

  if (error) {
    return {
      success: false,
      error: error.status === 401 ? "Incorrect password" : error.message,
      status: error.status,
    };
  }

  return {
    success: true,
    data,
  };
}

export async function deleteStatusPageAction(pageId: string): Promise<ActionResult> {
  const { error } = await deleteStatusPage(pageId);

  if (error) {
    return {
      success: false,
      error: error.message,
      status: error.status,
    };
  }

  revalidateStatusPageViews();

  return {
    success: true,
  };
}
