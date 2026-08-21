"use server";

import { revalidatePath } from "next/cache";
import {
  createAlertChannel,
  deleteAlertChannel,
  testAlertChannel,
  setMonitorAlertChannels,
} from "@/lib/api/alert-channels";
import { alertChannelSchema, AlertChannelInput } from "@/lib/validations";
import { ActionResult, AlertChannel, AlertChannelTestResult } from "@/lib/types";

export async function createAlertChannelAction(
  formData: AlertChannelInput
): Promise<ActionResult<AlertChannel>> {
  const validationResult = alertChannelSchema.safeParse(formData);

  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.issues[0]?.message || "Invalid input",
    };
  }

  const { data, error } = await createAlertChannel(validationResult.data);

  if (error) {
    return { success: false, error: error.message, status: error.status };
  }

  revalidatePath("/settings");

  return { success: true, data };
}

export async function deleteAlertChannelAction(channelId: string): Promise<ActionResult> {
  const { error } = await deleteAlertChannel(channelId);

  if (error) {
    return { success: false, error: error.message, status: error.status };
  }

  revalidatePath("/settings");

  return { success: true };
}

export async function testAlertChannelAction(
  channelId: string
): Promise<ActionResult<AlertChannelTestResult>> {
  const { data, error } = await testAlertChannel(channelId);

  if (error) {
    return { success: false, error: error.message, status: error.status };
  }

  return { success: true, data };
}

export async function setMonitorAlertChannelsAction(
  monitorId: string,
  channelIds: string[]
): Promise<ActionResult> {
  const { error } = await setMonitorAlertChannels(monitorId, channelIds);

  if (error) {
    return { success: false, error: error.message, status: error.status };
  }

  revalidatePath(`/monitors/${monitorId}`);

  return { success: true };
}
