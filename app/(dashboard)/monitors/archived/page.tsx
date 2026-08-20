import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMonitors } from "@/lib/api/monitors";
import { ArchivedMonitorsTable } from "./archived-monitors-table";

export default async function ArchivedMonitorsPage() {
  const { data: monitors, error } = await getMonitors(true);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-start gap-2 sm:gap-4">
        <Button variant="ghost" size="icon" asChild className="shrink-0 mt-1">
          <Link href="/monitors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
            Archived Monitors
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            View and restore previously archived monitors
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          <p className="font-medium">Failed to load archived monitors</p>
          <p className="text-sm">{error.message}</p>
        </div>
      ) : !monitors || monitors.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">No archived monitors</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Archived monitors will appear here
          </p>
        </div>
      ) : (
        <ArchivedMonitorsTable monitors={monitors} />
      )}
    </div>
  );
}
