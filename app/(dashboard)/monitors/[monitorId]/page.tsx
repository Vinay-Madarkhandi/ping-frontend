import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getMonitorById, getMonitorStatus, getMonitorLogs } from "@/lib/api/monitors";
import { StatusCards } from "./status-cards";
import { LogsTable } from "./logs-table";

interface MonitorDetailPageProps {
  params: Promise<{
    monitorId: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function MonitorDetailPage({
  params,
  searchParams,
}: MonitorDetailPageProps) {
  const { monitorId } = await params;
  const { page } = await searchParams;
  const currentPage = parseInt(page || "0", 10);

  // First, get the monitor data
  const monitorResult = await getMonitorById(monitorId);

  if (monitorResult.error?.status === 404 || !monitorResult.data) {
    notFound();
  }

  const monitor = monitorResult.data;

  // Then fetch status and logs in parallel
  const [statusResult, logsResult] = await Promise.all([
    getMonitorStatus(monitorId),
    getMonitorLogs(monitorId, currentPage, 20),
  ]);

  const status = statusResult.data;
  const logs = logsResult.data;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex items-start gap-2 sm:gap-4">
        <Button variant="ghost" size="icon" asChild className="shrink-0 mt-1">
          <Link href="/monitors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight truncate">
              {monitor.name}
            </h1>
            <Badge variant={monitor.active ? "default" : "secondary"} className="shrink-0">
              {monitor.active ? "Active" : "Paused"}
            </Badge>
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
      </div>

      {/* Status Cards */}
      {status ? (
        <StatusCards status={status} />
      ) : statusResult.error ? (
        <div className="p-3 sm:p-4 rounded-lg border border-destructive bg-destructive/10 text-destructive text-sm">
          Failed to load status: {statusResult.error.message}
        </div>
      ) : null}

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

