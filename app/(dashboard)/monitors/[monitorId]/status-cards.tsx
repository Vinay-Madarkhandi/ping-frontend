import {
  Clock,
  TrendingUp,
  Activity,
  AlertTriangle,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonitorStatus, Uptime } from "@/lib/types";
import { formatBackendRelativeTime } from "@/lib/datetime";
import { MonitorStateBadge } from "@/components/shared/monitor-state-badge";

interface StatusCardsProps {
  status: MonitorStatus;
  uptime?: Uptime;
}

export function StatusCards({ status, uptime }: StatusCardsProps) {
  const authoritativeUptime = uptime?.uptimePercentage;
  const uptimeColor =
    authoritativeUptime == null
      ? "text-muted-foreground"
      : authoritativeUptime >= 99
      ? "text-up"
      : authoritativeUptime >= 95
      ? "text-suspect"
      : "text-down";

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
      {/* Current Status */}
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-6 pb-1 sm:pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Current Status</CardTitle>
          <MonitorStateBadge state={status.displayState} className="text-xs" />
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="text-lg font-semibold capitalize sm:text-2xl">
            {status.displayState.toLowerCase()}
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Last checked {formatBackendRelativeTime(status.lastCheckedAt)}
          </p>
        </CardContent>
      </Card>

      {/* Uptime Percentage */}
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-6 pb-1 sm:pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Uptime</CardTitle>
          <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className={`font-mono text-lg font-semibold tabular-nums sm:text-2xl ${uptimeColor}`} data-metric>
            {authoritativeUptime == null ? "No data" : `${authoritativeUptime.toFixed(2)}%`}
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Duration-based uptime
          </p>
        </CardContent>
      </Card>

      {/* Total Checks */}
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-6 pb-1 sm:pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Health Checks</CardTitle>
          <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="font-mono text-lg font-semibold tabular-nums sm:text-2xl" data-metric>
            <span className="text-up">{status.totalUp}</span>
            <span className="text-muted-foreground mx-0.5 sm:mx-1">/</span>
            <span className="text-down">{status.totalDown}</span>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Up / Down checks
          </p>
        </CardContent>
      </Card>

      {/* Last Downtime */}
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-6 pb-1 sm:pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Last Downtime</CardTitle>
          {status.lastDowntimeAt ? (
            <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-suspect" />
          ) : (
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          )}
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="text-lg font-semibold sm:text-2xl">
            {status.lastDowntimeAt
              ? formatBackendRelativeTime(status.lastDowntimeAt)
              : "Never"}
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            {status.lastDowntimeAt
              ? "Last recorded downtime"
              : "No downtime recorded"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
