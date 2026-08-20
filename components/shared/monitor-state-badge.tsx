import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  CircleHelp,
  PauseCircle,
  PowerOff,
  ShieldAlert,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Monitor, MonitorDisplayState } from "@/lib/types";
import { StatusDot } from "@/components/shared/status-dot";

const stateStyles: Record<MonitorDisplayState, string> = {
  UP: "border-up/30 bg-up/10 text-up-foreground dark:text-up",
  SUSPECT: "border-suspect/40 bg-suspect/10 text-suspect-foreground dark:text-suspect",
  DOWN: "border-down/30 bg-down/10 text-down dark:text-down",
  PAUSED: "border-paused/30 bg-paused/10 text-paused-foreground dark:text-paused",
  QUOTA_EXCEEDED: "border-down/30 bg-down/10 text-down dark:text-down",
  UNKNOWN: "border-paused/30 bg-paused/10 text-paused-foreground dark:text-paused",
};

const stateIcons = {
  UP: CheckCircle2,
  SUSPECT: AlertTriangle,
  DOWN: AlertCircle,
  PAUSED: PauseCircle,
  QUOTA_EXCEEDED: ShieldAlert,
  UNKNOWN: CircleHelp,
};

/**
 * Resolves what to show for a monitor. Precedence mirrors the backend's own derivation, with the
 * client-only INACTIVE state layered on: a toggled-off monitor still reports a health state from the
 * server, but the user cares that it is switched off.
 */
export function getMonitorDisplayState(monitor: Monitor): MonitorDisplayState | "INACTIVE" {
  if (monitor.quotaBlocked) return "QUOTA_EXCEEDED";
  if (monitor.paused) return "PAUSED";
  if (!monitor.active) return "INACTIVE";
  return monitor.displayState;
}

export function MonitorStateBadge({
  state,
  active = true,
  showDot = true,
  className,
}: {
  state: MonitorDisplayState | "INACTIVE";
  active?: boolean;
  showDot?: boolean;
  className?: string;
}) {
  if (state === "INACTIVE" || !active) {
    return (
      <Badge
        variant="outline"
        className={cn("gap-1.5 border-paused/30 bg-paused/10 text-paused-foreground dark:text-paused", className)}
      >
        <PowerOff className="h-3 w-3" />
        Inactive
      </Badge>
    );
  }

  const Icon = stateIcons[state];

  return (
    <Badge variant="outline" className={cn("gap-1.5", stateStyles[state], className)}>
      {showDot ? <StatusDot state={state} className="mr-0.5" /> : <Icon className="h-3 w-3" />}
      {state === "QUOTA_EXCEEDED" ? "Quota reached" : state.charAt(0) + state.slice(1).toLowerCase()}
    </Badge>
  );
}
