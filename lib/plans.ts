import { CurrentUserResponse, PlanContext, PlanLimits, UsageResponse } from "@/lib/types";

// TODO: Remove this fallback when GET /api/v1/auth/me is available in all environments.
export const FALLBACK_FREE_PLAN: PlanLimits = {
  name: "FREE",
  maxMonitors: 5,
  minIntervalMs: 300000,
  maxTimeoutMs: 5000,
  monthlyCheckQuota: 50000,
  retentionDays: 7,
  alertCooldownSeconds: 3600,
  maxAlertsPerDay: 50,
};

export function createPlanContext({
  currentUser,
  usage,
  monitorCount,
}: {
  currentUser?: CurrentUserResponse;
  usage?: UsageResponse;
  monitorCount: number;
}): PlanContext {
  return {
    plan: currentUser?.plan ?? FALLBACK_FREE_PLAN,
    usage,
    monitorCount: usage?.monitorCount ?? monitorCount,
    usingFallbackPlan: !currentUser?.plan,
  };
}

export function isMonitorLimitReached(planContext: PlanContext) {
  return planContext.monitorCount >= planContext.plan.maxMonitors;
}

export function getNextMonthlyResetDate(now = new Date()) {
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatMoney(amountInMinorUnits: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amountInMinorUnits / 100);
}

export function formatPlanDate(value: string | null | undefined) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function isProPlan(planName: string | undefined, subscriptionStatus?: string) {
  return planName === "PRO" && subscriptionStatus !== "EXPIRED";
}

export function formatMilliseconds(value: number) {
  if (value < 1000) return `${value} ms`;

  const seconds = value / 1000;
  if (seconds < 60) return `${formatCompactNumber(seconds)}s`;

  const minutes = seconds / 60;
  if (minutes < 60) return `${formatCompactNumber(minutes)} min`;

  const hours = minutes / 60;
  return `${formatCompactNumber(hours)} hr`;
}

export function formatSeconds(value: number) {
  return formatMilliseconds(value * 1000);
}

function formatCompactNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
