"use server";

import { revalidatePath } from "next/cache";
import {
  createMonitor,
  deleteMonitor,
  pauseMonitor,
  resumeMonitor,
  toggleMonitorStatus,
  editMonitor,
  checkMonitorNow,
  restoreMonitor,
} from "@/lib/api/monitors";
import { createMonitorSchema, editMonitorSchema, CreateMonitorInput, EditMonitorInput } from "@/lib/validations";
import { ActionResult, CreateMonitorResponse, Monitor } from "@/lib/types";

function revalidateMonitorViews(monitorId?: string) {
  revalidatePath("/monitors");
  revalidatePath("/dashboard");
  revalidatePath("/analytics");

  if (monitorId) {
    revalidatePath(`/monitors/${monitorId}`);
  }
}

/**
 * Server Action: Create a new monitor
 */
export async function createMonitorAction(
  formData: CreateMonitorInput
): Promise<ActionResult<CreateMonitorResponse>> {
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
      status: error.status,
    };
  }

  revalidateMonitorViews(data?.id);

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
      status: error.status,
    };
  }

  revalidateMonitorViews(monitorId);

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
): Promise<ActionResult> {
  if (!monitorId) {
    return {
      success: false,
      error: "Monitor ID is required",
    };
  }

  const { error } = await toggleMonitorStatus(monitorId, active);

  if (error) {
    return {
      success: false,
      error: error.message,
      status: error.status,
    };
  }

  revalidateMonitorViews(monitorId);

  return {
    success: true,
  };
}

/**
 * Server Action: Pause a monitor
 */
export async function pauseMonitorAction(
  monitorId: string
): Promise<ActionResult> {
  if (!monitorId) {
    return {
      success: false,
      error: "Monitor ID is required",
    };
  }

  const { error } = await pauseMonitor(monitorId);

  if (error) {
    return {
      success: false,
      error: error.message,
      status: error.status,
    };
  }

  revalidateMonitorViews(monitorId);

  return {
    success: true,
  };
}

/**
 * Server Action: Resume a paused monitor
 */
export async function resumeMonitorAction(
  monitorId: string
): Promise<ActionResult> {
  if (!monitorId) {
    return {
      success: false,
      error: "Monitor ID is required",
    };
  }

  const { error } = await resumeMonitor(monitorId);

  if (error) {
    return {
      success: false,
      error: error.message,
      status: error.status,
    };
  }

  revalidateMonitorViews(monitorId);

  return {
    success: true,
  };
}

/**
 * Server Action: Edit monitor configuration
 */
export async function editMonitorAction(
  monitorId: string,
  formData: EditMonitorInput
): Promise<ActionResult<Monitor>> {
  if (!monitorId) {
    return {
      success: false,
      error: "Monitor ID is required",
    };
  }

  // Server-side validation
  const validationResult = editMonitorSchema.safeParse(formData);

  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.issues[0]?.message || "Invalid input",
    };
  }

  const { data, error } = await editMonitor(monitorId, validationResult.data);

  if (error) {
    return {
      success: false,
      error: error.message,
      status: error.status,
    };
  }

  revalidateMonitorViews(monitorId);

  return {
    success: true,
    data,
  };
}

/**
 * Server Action: Run check immediately
 */
export async function checkNowAction(monitorId: string): Promise<ActionResult<{
  outcome: string;
  statusCode: number;
  responseTimeMs: number;
  errorMessage?: string;
  message: string;
}>> {
  if (!monitorId) {
    return {
      success: false,
      error: "Monitor ID is required",
    };
  }

  const { data, error } = await checkMonitorNow(monitorId);

  if (error) {
    return {
      success: false,
      error: error.message,
      status: error.status,
    };
  }

  // Revalidate to show the new log entry
  revalidateMonitorViews(monitorId);

  return {
    success: true,
    data,
  };
}

/**
 * Server Action: Restore an archived monitor
 */
export async function restoreMonitorAction(
  monitorId: string
): Promise<ActionResult<Monitor>> {
  if (!monitorId) {
    return {
      success: false,
      error: "Monitor ID is required",
    };
  }

  const { data, error } = await restoreMonitor(monitorId);

  if (error) {
    return {
      success: false,
      error: error.message,
      status: error.status,
    };
  }

  revalidateMonitorViews(monitorId);

  return {
    success: true,
    data,
  };
}
