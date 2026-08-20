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
import {
  createMonitorSchema,
  editMonitorSchema,
  createHeartbeatMonitorSchema,
  editHeartbeatMonitorSchema,
  createTcpMonitorSchema,
  editTcpMonitorSchema,
  CreateMonitorInput,
  EditMonitorInput,
  CreateHeartbeatMonitorInput,
  EditHeartbeatMonitorInput,
  CreateTcpMonitorInput,
  EditTcpMonitorInput,
} from "@/lib/validations";
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
 * Server Action: Create a new heartbeat (cron/job) monitor. Kept as its own action, rather than
 * folded into createMonitorAction, so the HTTP monitor flow's validation never has to account for
 * a URL-less shape.
 */
export async function createHeartbeatMonitorAction(
  formData: CreateHeartbeatMonitorInput
): Promise<ActionResult<CreateMonitorResponse>> {
  const validationResult = createHeartbeatMonitorSchema.safeParse(formData);

  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.issues[0]?.message || "Invalid input",
    };
  }

  const { data, error } = await createMonitor({ ...validationResult.data, kind: "HEARTBEAT" });

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
 * Server Action: Create a new TCP (raw port reachability) monitor. Kept as its own action, like
 * the heartbeat one, so validation never has to account for a shape that isn't its own.
 */
export async function createTcpMonitorAction(
  formData: CreateTcpMonitorInput
): Promise<ActionResult<CreateMonitorResponse>> {
  const validationResult = createTcpMonitorSchema.safeParse(formData);

  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.issues[0]?.message || "Invalid input",
    };
  }

  const { data, error } = await createMonitor({ ...validationResult.data, kind: "TCP" });

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
 * Server Action: Edit a heartbeat monitor's configuration (name, interval, grace period, tags,
 * active). No URL/method/etc — those don't apply to a monitor that has no URL to probe.
 */
export async function editHeartbeatMonitorAction(
  monitorId: string,
  formData: EditHeartbeatMonitorInput
): Promise<ActionResult<Monitor>> {
  if (!monitorId) {
    return {
      success: false,
      error: "Monitor ID is required",
    };
  }

  const validationResult = editHeartbeatMonitorSchema.safeParse(formData);

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
 * Server Action: Edit a TCP monitor's configuration (name, host, port, interval, tags, active).
 */
export async function editTcpMonitorAction(
  monitorId: string,
  formData: EditTcpMonitorInput
): Promise<ActionResult<Monitor>> {
  if (!monitorId) {
    return {
      success: false,
      error: "Monitor ID is required",
    };
  }

  const validationResult = editTcpMonitorSchema.safeParse(formData);

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
