"use server";

import { revalidatePath } from "next/cache";
import { createMonitor, deleteMonitor, toggleMonitorStatus } from "@/lib/api/monitors";
import { createMonitorSchema, CreateMonitorInput } from "@/lib/validations";
import { ActionResult, Monitor } from "@/lib/types";

/**
 * Server Action: Create a new monitor
 */
export async function createMonitorAction(
  formData: CreateMonitorInput
): Promise<ActionResult<Monitor>> {
  // Server-side validation
  const validationResult = createMonitorSchema.safeParse(formData);

  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.issues[0]?.message || "Invalid input",
    };
  }

  const { data, error } = await createMonitor(validationResult.data);

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  // Revalidate monitors list
  revalidatePath("/monitors");
  revalidatePath("/dashboard");

  return {
    success: true,
    data,
  };
}

/**
 * Server Action: Delete a monitor
 */
export async function deleteMonitorAction(
  monitorId: string
): Promise<ActionResult> {
  if (!monitorId) {
    return {
      success: false,
      error: "Monitor ID is required",
    };
  }

  const { error } = await deleteMonitor(monitorId);

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  // Revalidate monitors list
  revalidatePath("/monitors");
  revalidatePath("/dashboard");

  return {
    success: true,
  };
}

/**
 * Server Action: Toggle monitor active status
 */
export async function toggleMonitorAction(
  monitorId: string,
  active: boolean
): Promise<ActionResult<Monitor>> {
  if (!monitorId) {
    return {
      success: false,
      error: "Monitor ID is required",
    };
  }

  const { data, error } = await toggleMonitorStatus(monitorId, active);

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  // Revalidate monitors list
  revalidatePath("/monitors");
  revalidatePath(`/monitors/${monitorId}`);
  revalidatePath("/dashboard");

  return {
    success: true,
    data,
  };
}

