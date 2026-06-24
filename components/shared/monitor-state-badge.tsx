import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  CircleHelp,
  PauseCircle,
  PowerOff,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Monitor, MonitorDisplayState } from "@/lib/types";

const stateStyles: Record<MonitorDisplayState, string> = {
  UP: "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400",
  SUSPECT: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  DOWN: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400",
  PAUSED: "border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300",
  UNKNOWN: "border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300",
};

const stateIcons = {
  UP: CheckCircle2,
  SUSPECT: AlertTriangle,
  DOWN: AlertCircle,
  PAUSED: PauseCircle,
  UNKNOWN: CircleHelp,
};

export function getMonitorDisplayState(monitor: Monitor): MonitorDisplayState | "INACTIVE" {
  if (monitor.displayState) return monitor.displayState;
  if (monitor.paused) return "PAUSED";
  return monitor.active ? "UNKNOWN" : "INACTIVE";
}

export function MonitorStateBadge({
  state,
  active = true,
  className,
}: {
  state: MonitorDisplayState | "INACTIVE";
  active?: boolean;
  className?: string;
}) {
  if (state === "INACTIVE" || !active) {
    return (
      <Badge
        variant="outline"
        className={cn("gap-1.5 border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300", className)}
      >
        <PowerOff className="h-3 w-3" />
        Inactive
      </Badge>
    );
  }

  const Icon = stateIcons[state];

  return (
    <Badge variant="outline" className={cn("gap-1.5", stateStyles[state], className)}>
      <Icon className="h-3 w-3" />
      {state}
    </Badge>
  );
}
