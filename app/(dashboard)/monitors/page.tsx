import Link from "next/link";
import { PlusCircle, Server } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getMonitorsWithStatus } from "@/lib/api/monitors";
import { MonitorsTable } from "./monitors-table";
import { AutoRefresh } from "@/components/shared/auto-refresh";

function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-8 sm:py-16 px-4">
        <Server className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg sm:text-xl font-semibold mb-2 text-center">No monitors configured</h3>
        <p className="text-sm sm:text-base text-muted-foreground text-center mb-6 max-w-md">
          Start monitoring your servers and services by creating your first monitor.
          You&apos;ll be able to track uptime, response times, and get alerted when
          things go wrong.
        </p>
        <Button asChild size="default" className="w-full sm:w-auto">
          <Link href="/monitors/create">
            <PlusCircle className="mr-2 h-5 w-5" />
            Create Your First Monitor
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default async function MonitorsPage() {
  const { data: monitors, error } = await getMonitorsWithStatus();

  return (
    <div className="space-y-4 sm:space-y-6">
      <AutoRefresh intervalMs={30000} />

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Monitors</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage and view all your configured monitors
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/monitors/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Monitor
          </Link>
        </Button>
      </div>

      {/* Content */}
      {error ? (
        <Card className="border-destructive">
          <CardContent className="py-8 text-center">
            <p className="text-destructive font-medium">Error loading monitors</p>
            <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
          </CardContent>
        </Card>
      ) : !monitors || monitors.length === 0 ? (
        <EmptyState />
      ) : (
        <MonitorsTable monitors={monitors} />
      )}
    </div>
  );
}
