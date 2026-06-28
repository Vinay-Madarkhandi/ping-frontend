import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Server,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getMonitorsWithStatus } from "@/lib/api/monitors";
import { getCurrentUser } from "@/lib/api/auth";
import { getUsage } from "@/lib/api/usage";
import { Monitor, PlanContext } from "@/lib/types";
import { AutoRefresh } from "@/components/shared/auto-refresh";
import {
  getMonitorDisplayState,
  MonitorStateBadge,
} from "@/components/shared/monitor-state-badge";
import { NewMonitorCta } from "@/components/shared/new-monitor-cta";
import { QuotaBanner } from "@/components/shared/quota-banner";
import { UsageMeter } from "@/components/shared/usage-meter";
import { createPlanContext } from "@/lib/plans";
import { StatusDistributionChart } from "./status-distribution-chart";

function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  trend?: "up" | "down";
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 sm:p-6 sm:pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
        <div className="text-2xl font-bold">{value}</div>
        <p className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
          {trend === "up" && <ArrowUpRight className="h-3 w-3 text-green-500" />}
          {trend === "down" && <ArrowDownRight className="h-3 w-3 text-red-500" />}
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function MonitorCard({ monitor }: { monitor: Monitor }) {
  const uptimeColor = monitor.uptimePercentage >= 99
    ? "text-green-500"
    : monitor.uptimePercentage >= 95
    ? "text-yellow-500"
    : "text-red-500";

  const displayState = getMonitorDisplayState(monitor);

  return (
    <Link href={`/monitors/${monitor.id}`}>
      <Card className="cursor-pointer transition-colors hover:bg-muted/50">
        <CardContent className="p-4">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={`p-2 rounded-full ${
                  displayState === "DOWN"
                    ? "bg-red-500/10"
                    : displayState === "SUSPECT"
                    ? "bg-amber-500/10"
                    : monitor.active
                    ? "bg-green-500/10"
                    : "bg-gray-500/10"
                }`}
              >
                {monitor.active ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-500" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="truncate font-medium">{monitor.name}</h3>
                <p className="truncate text-sm text-muted-foreground sm:max-w-[200px]">
                  {monitor.url}
                </p>
              </div>
            </div>
            <div className="flex flex-row items-center justify-between gap-2 sm:flex-col sm:items-end">
              <MonitorStateBadge state={displayState} active={monitor.active || displayState === "PAUSED"} />
              <span className={`text-xs font-medium ${uptimeColor}`}>
                {monitor.uptimePercentage.toFixed(1)}% uptime
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function EmptyState({ planContext }: { planContext: PlanContext }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Server className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No monitors yet</h3>
        <p className="text-muted-foreground text-center mb-4 max-w-sm">
          Create your first monitor to start tracking the health of your servers and
          services.
        </p>
        <NewMonitorCta planContext={planContext} />
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const [monitorsResult, currentUserResult, usageResult] = await Promise.all([
    getMonitorsWithStatus(),
    getCurrentUser(),
    getUsage(),
  ]);
  const { data: monitors, error } = monitorsResult;

  const totalMonitors = monitors?.length ?? 0;
  const activeMonitors = monitors?.filter((m) => m.active).length ?? 0;
  const pausedMonitors = monitors?.filter((m) => getMonitorDisplayState(m) === "PAUSED").length ?? 0;
  const quotaBlockedMonitors = monitors?.filter((m) => getMonitorDisplayState(m) === "QUOTA_EXCEEDED").length ?? 0;
  const planContext = createPlanContext({
    currentUser: currentUserResult.data,
    usage: usageResult.data,
    monitorCount: totalMonitors,
  });

  // Calculate average uptime from all monitors
  const averageUptime = monitors && monitors.length > 0
    ? monitors.reduce((sum, m) => sum + m.uptimePercentage, 0) / monitors.length
    : 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <AutoRefresh intervalMs={30000} />
      <QuotaBanner planContext={planContext} />

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Overview of your monitoring infrastructure
          </p>
        </div>
        <NewMonitorCta planContext={planContext} className="w-full sm:w-auto" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        <StatsCard
          title="Total Monitors"
          value={totalMonitors}
          description="Configured monitors"
          icon={Server}
        />
        <StatsCard
          title="Active Monitors"
          value={activeMonitors}
          description="Currently monitoring"
          icon={Activity}
          trend="up"
        />
        <StatsCard
          title="Paused Monitors"
          value={pausedMonitors + quotaBlockedMonitors}
          description={quotaBlockedMonitors > 0 ? "Quota-blocked included" : "Excluded from uptime"}
          icon={Clock}
        />
        <StatsCard
          title="Avg Uptime"
          value={error ? "N/A" : `${averageUptime.toFixed(1)}%`}
          description={error ? "Connection issue" : averageUptime >= 99 ? "Excellent" : averageUptime >= 95 ? "Good" : "Needs attention"}
          icon={CheckCircle2}
          trend={error ? "down" : averageUptime >= 95 ? "up" : "down"}
        />
      </div>

      <UsageMeter planContext={planContext} />

      {/* Monitors Section */}
      <div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">Recent Monitors</h2>
          {totalMonitors > 0 && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/monitors">View All</Link>
            </Button>
          )}
        </div>

        {error ? (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive text-base sm:text-lg">Error Loading Monitors</CardTitle>
              <CardDescription className="text-sm">
                {error.status === 401 || error.status === 403 ? (
                  <>Authentication error: {error.message}. Try logging out and back in.</>
                ) : error.status === 405 ? (
                  <>The GET /api/v1/monitors endpoint is not implemented in the backend. Please add it to your MonitorController.</>
                ) : (
                  error.message
                )}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : totalMonitors === 0 ? (
          <EmptyState planContext={planContext} />
        ) : (
          <>
            <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                {monitors?.slice(0, 6).map((monitor) => (
                  <MonitorCard key={monitor.id} monitor={monitor} />
                ))}
              </div>
              <StatusDistributionChart monitors={monitors ?? []} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
