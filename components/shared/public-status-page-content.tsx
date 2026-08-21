import Link from "next/link";
import { CheckCircle2, AlertTriangle, AlertCircle, XCircle } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { StatusDot } from "@/components/shared/status-dot";
import { Card, CardContent } from "@/components/ui/card";
import { OverallStatus, PublicMonitorState, PublicStatusPage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatBackendRelativeTime } from "@/lib/datetime";

const overallCopy: Record<
  OverallStatus,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  OPERATIONAL: {
    label: "All systems operational",
    className: "border-up/30 bg-up/10 text-up",
    icon: CheckCircle2,
  },
  DEGRADED: {
    label: "Degraded performance",
    className: "border-suspect/40 bg-suspect/10 text-suspect",
    icon: AlertTriangle,
  },
  PARTIAL_OUTAGE: {
    label: "Partial outage",
    className: "border-down/30 bg-down/10 text-down",
    icon: AlertCircle,
  },
  MAJOR_OUTAGE: {
    label: "Major outage",
    className: "border-down/30 bg-down/10 text-down",
    icon: XCircle,
  },
};

const stateLabel: Record<PublicMonitorState, string> = {
  UP: "Operational",
  SUSPECT: "Degraded",
  DOWN: "Down",
  PAUSED: "Paused",
  UNKNOWN: "Unknown",
};

function formatUptime(value: number | null) {
  if (value === null || Number.isNaN(value)) return "—";
  return `${value.toFixed(2)}%`;
}

/** Shared body for the public status page — used both for the direct (unprotected) render and after unlocking a password-protected one. */
export function PublicStatusPageContent({ page }: { page: PublicStatusPage }) {
  const overall = overallCopy[page.overallStatus];
  const OverallIcon = overall.icon;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-5 sm:px-6">
          {page.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- arbitrary owner-supplied host, next/image would need it allowlisted
            <img src={page.logoUrl} alt={page.title} className="h-8 max-w-[200px] object-contain" />
          ) : (
            <Logo iconClassName="h-8 w-8" />
          )}
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8 space-y-2">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{page.title}</h1>
          {page.description ? (
            <p className="text-muted-foreground">{page.description}</p>
          ) : null}
        </div>

        <div
          className={cn(
            "mb-6 flex items-center gap-3 rounded-lg border px-4 py-3.5",
            overall.className
          )}
        >
          <OverallIcon className="h-5 w-5 shrink-0" />
          <span className="font-medium">{overall.label}</span>
        </div>

        <Card>
          <CardContent className="divide-y p-0">
            {page.monitors.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">
                No services are listed on this page yet.
              </p>
            ) : (
              page.monitors.map((monitor) => (
                <div
                  key={monitor.name}
                  className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-6"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <StatusDot state={monitor.state} />
                    <span className="truncate font-medium">{monitor.name}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      {formatUptime(monitor.uptimePercentage90d)} · 90d
                    </span>
                    <span className="w-20 text-right font-medium">
                      {stateLabel[monitor.state]}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Last updated {formatBackendRelativeTime(page.updatedAt)}
        </p>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Powered by{" "}
          <Link href="/" className="font-medium text-foreground hover:underline">
            Ping
          </Link>
        </p>
      </main>
    </div>
  );
}
