"use server";

import { revalidatePath } from "next/cache";
import { createMaintenanceWindow, cancelMaintenanceWindow } from "@/lib/api/maintenance-windows";
import { maintenanceWindowSchema, MaintenanceWindowInput } from "@/lib/validations";
import { ActionResult, MaintenanceWindow } from "@/lib/types";

export async function createMaintenanceWindowAction(
  monitorId: string,
  formData: MaintenanceWindowInput
): Promise<ActionResult<MaintenanceWindow>> {
  const validationResult = maintenanceWindowSchema.safeParse(formData);

  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.issues[0]?.message || "Invalid input",
    };
  }

  const { title, startsAt, endsAt } = validationResult.data;
  const { data, error } = await createMaintenanceWindow(monitorId, {
    title: title?.trim() || undefined,
    startsAt: new Date(startsAt).toISOString(),
    endsAt: new Date(endsAt).toISOString(),
  });

  if (error) {
    return { success: false, error: error.message, status: error.status };
  }

  revalidatePath(`/monitors/${monitorId}`);

  return { success: true, data };
}

export async function cancelMaintenanceWindowAction(
  monitorId: string,
  windowId: string
): Promise<ActionResult> {
  const { error } = await cancelMaintenanceWindow(monitorId, windowId);

  if (error) {
    return { success: false, error: error.message, status: error.status };
  }

  revalidatePath(`/monitors/${monitorId}`);

  return { success: true };
}
