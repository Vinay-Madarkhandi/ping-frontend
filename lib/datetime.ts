import { format, formatDistanceToNow } from "date-fns";

const HAS_TIMEZONE = /[zZ]|[+-]\d\d:?\d\d$/;

export function parseBackendDate(value: string | null | undefined): Date | null {
  if (!value) return null;

  const date = new Date(HAS_TIMEZONE.test(value) ? value : `${value}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatBackendDateTime(
  value: string | null | undefined,
  pattern = "MMM d, yyyy HH:mm:ss"
) {
  const date = parseBackendDate(value);
  return date ? format(date, pattern) : "Never";
}

export function formatBackendRelativeTime(value: string | null | undefined) {
  const date = parseBackendDate(value);
  return date ? formatDistanceToNow(date, { addSuffix: true }) : "never";
}

export function formatDuration(seconds: number | null | undefined) {
  if (seconds == null) return "Ongoing";

  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours < 24) return `${hours}h ${remainingMinutes}m`;

  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}
