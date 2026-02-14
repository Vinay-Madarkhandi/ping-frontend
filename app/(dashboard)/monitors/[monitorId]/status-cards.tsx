import {
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonitorStatus } from "@/lib/types";

interface StatusCardsProps {
  status: MonitorStatus;
}

export function StatusCards({ status }: StatusCardsProps) {
  const uptimeColor =
    status.uptimePercentage >= 99
      ? "text-green-500"
      : status.uptimePercentage >= 95
      ? "text-yellow-500"
      : "text-red-500";

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
      {/* Current Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-6 pb-1 sm:pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Current Status</CardTitle>
          {status.up ? (
            <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
          ) : (
            <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />
          )}
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className={`text-lg sm:text-2xl font-bold ${status.up ? "text-green-500" : "text-red-500"}`}>
            {status.up ? "Operational" : "Down"}
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Last checked{" "}
            {status.lastCheckedAt
              ? formatDistanceToNow(new Date(status.lastCheckedAt), { addSuffix: true })
              : "never"}
          </p>
        </CardContent>
      </Card>

      {/* Uptime Percentage */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-6 pb-1 sm:pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Uptime</CardTitle>
          <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className={`text-lg sm:text-2xl font-bold ${uptimeColor}`}>
            {status.uptimePercentage.toFixed(2)}%
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Based on {status.totalChecks} checks
          </p>
        </CardContent>
      </Card>

      {/* Total Checks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-6 pb-1 sm:pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Health Checks</CardTitle>
          <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="text-lg sm:text-2xl font-bold">
            <span className="text-green-500">{status.totalUp}</span>
            <span className="text-muted-foreground mx-0.5 sm:mx-1">/</span>
            <span className="text-red-500">{status.totalDown}</span>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Up / Down checks
          </p>
        </CardContent>
      </Card>

      {/* Last Downtime */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-6 pb-1 sm:pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Last Downtime</CardTitle>
          {status.lastDowntimeAt ? (
            <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-500" />
          ) : (
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          )}
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="text-lg sm:text-2xl font-bold">
            {status.lastDowntimeAt
              ? formatDistanceToNow(new Date(status.lastDowntimeAt), { addSuffix: true })
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

