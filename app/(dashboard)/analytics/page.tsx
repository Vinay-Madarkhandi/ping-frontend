import { BarChart3 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getMonitorsWithStatus } from "@/lib/api/monitors";
import { AnalyticsCharts } from "./analytics-charts";
import { AutoRefresh } from "@/components/shared/auto-refresh";

export default async function AnalyticsPage() {
  const { data: monitors, error } = await getMonitorsWithStatus();

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Monitor performance and uptime statistics
          </p>
        </div>
        <Card className="border-destructive">
          <CardContent className="py-6 sm:py-8 text-center">
            <p className="text-destructive font-medium">Error loading analytics</p>
            <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!monitors || monitors.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Monitor performance and uptime statistics
          </p>
        </div>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 sm:py-16 px-4">
            <BarChart3 className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">No data available</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Create monitors to start collecting analytics data. Charts and
              statistics will appear here once you have monitoring data.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <AutoRefresh intervalMs={60000} />

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Monitor performance and uptime statistics
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <Card>
          <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-2">
            <CardDescription className="text-xs sm:text-sm">Total Monitors</CardDescription>
            <CardTitle className="text-2xl sm:text-4xl">{monitors.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-2">
            <CardDescription className="text-xs sm:text-sm">Active Monitors</CardDescription>
            <CardTitle className="text-2xl sm:text-4xl text-green-500">
              {monitors.filter((m) => m.active).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-2">
            <CardDescription className="text-xs sm:text-sm">Paused Monitors</CardDescription>
            <CardTitle className="text-2xl sm:text-4xl text-muted-foreground">
              {monitors.filter((m) => !m.active).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Charts */}
      <AnalyticsCharts monitors={monitors} />
    </div>
  );
}
