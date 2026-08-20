import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAllAlerts } from "@/lib/api/monitors";
import { AlertHistoryTable } from "./alert-history-table";

interface AlertsPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function AlertsPage({ searchParams }: AlertsPageProps) {
  const { page } = await searchParams;
  const currentPage = parseInt(page || "0", 10);
  
  const { data: alerts, error } = await getAllAlerts(currentPage, 20);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-start gap-2 sm:gap-4">
        <Button variant="ghost" size="icon" asChild className="shrink-0 mt-1">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
            Alert History
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            View delivery status of all alerts sent across your monitors
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          <p className="font-medium">Failed to load alert history</p>
          <p className="text-sm">{error.message}</p>
        </div>
      ) : !alerts || alerts.content.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">No alerts sent yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Alert delivery history will appear here when monitors go down or recover
          </p>
        </div>
      ) : (
        <AlertHistoryTable alerts={alerts} />
      )}
    </div>
  );
}
