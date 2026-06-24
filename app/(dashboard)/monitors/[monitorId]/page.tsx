import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  getMonitorById,
  getMonitorStatus,
  getMonitorLogs,
  getMonitorIncidents,
  getMonitorUptime,
} from "@/lib/api/monitors";
import { StatusCards } from "./status-cards";
import { LogsTable } from "./logs-table";
import { DetailInsights } from "./detail-insights";
import { MonitorActions } from "./monitor-actions";
import { AutoRefresh } from "@/components/shared/auto-refresh";
import { MonitorStateBadge } from "@/components/shared/monitor-state-badge";

interface MonitorDetailPageProps {
  params: Promise<{
    monitorId: string;
  }>;
  searchParams: Promise<{
    page?: string;
    window?: string;
  }>;
}

const uptimeWindows = ["30m", "24h", "7d", "30d"] as const;

function normalizeWindow(value?: string): (typeof uptimeWindows)[number] {
  return uptimeWindows.includes(value as (typeof uptimeWindows)[number])
    ? value as (typeof uptimeWindows)[number]
    : "24h";
}

export default async function MonitorDetailPage({
  params,
  searchParams,
}: MonitorDetailPageProps) {
  const { monitorId } = await params;
  const { page, window } = await searchParams;
  const currentPage = parseInt(page || "0", 10);
  const selectedWindow = normalizeWindow(window);

  // First, get the monitor data
  const monitorResult = await getMonitorById(monitorId);

  if (monitorResult.error?.status === 404 || !monitorResult.data) {
    notFound();
  }

  const monitor = monitorResult.data;

  // Then fetch detail data in parallel.
  const [statusResult, logsResult, uptimeResult, incidentsResult] = await Promise.all([
    getMonitorStatus(monitorId),
    getMonitorLogs(monitorId, currentPage, 20),
    getMonitorUptime(monitorId, selectedWindow),
    getMonitorIncidents(monitorId, 0, 10),
  ]);

  const status = statusResult.data;
  const logs = logsResult.data;
  const uptime = uptimeResult.data;
  const incidents = incidentsResult.data;

  return (
    <div className="space-y-4 sm:space-y-6">
      <AutoRefresh intervalMs={15000} />

      {/* Page Header */}
      <div className="flex items-start gap-2 sm:gap-4">
        <Button variant="ghost" size="icon" asChild className="shrink-0 mt-1">
          <Link href="/monitors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight truncate">
                  {monitor.name}
                </h1>
                {status ? (
                  <MonitorStateBadge state={status.displayState} className="shrink-0" />
                ) : (
                  <MonitorStateBadge state={monitor.active ? "UNKNOWN" : "INACTIVE"} className="shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm sm:text-base text-muted-foreground truncate">{monitor.url}</p>
                <a
                  href={monitor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground shrink-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
            <MonitorActions monitorId={monitorId} status={status} />
          </div>
        </div>
      </div>

      {/* Status Cards */}
      {status ? (
        <StatusCards status={status} uptime={uptime} />
      ) : statusResult.error ? (
        <div className="p-3 sm:p-4 rounded-lg border border-destructive bg-destructive/10 text-destructive text-sm">
          Failed to load status: {statusResult.error.message}
        </div>
      ) : null}

      {uptimeResult.error ? (
        <div className="p-3 sm:p-4 rounded-lg border border-destructive bg-destructive/10 text-destructive text-sm">
          Failed to load uptime: {uptimeResult.error.message}
        </div>
      ) : null}

      {incidentsResult.error ? (
        <div className="p-3 sm:p-4 rounded-lg border border-destructive bg-destructive/10 text-destructive text-sm">
          Failed to load incidents: {incidentsResult.error.message}
        </div>
      ) : null}

      <DetailInsights
        monitorId={monitorId}
        uptime={uptime}
        logs={logs}
        incidents={incidents}
        selectedWindow={selectedWindow}
      />

      {/* Logs Table */}
      {logs ? (
        <LogsTable logs={logs} monitorId={monitorId} />
      ) : logsResult.error ? (
        <div className="p-3 sm:p-4 rounded-lg border border-destructive bg-destructive/10 text-destructive text-sm">
          Failed to load logs: {logsResult.error.message}
        </div>
      ) : null}
    </div>
  );
}
