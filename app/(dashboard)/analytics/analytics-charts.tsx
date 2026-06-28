"use client";

import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Monitor } from "@/lib/types";
import { parseBackendDate } from "@/lib/datetime";
import { getMonitorDisplayState } from "@/components/shared/monitor-state-badge";

interface AnalyticsChartsProps {
  monitors: Monitor[];
}

export function AnalyticsCharts({ monitors }: AnalyticsChartsProps) {
  // Prepare data for status pie chart
  const statusCounts = monitors.reduce<Record<string, number>>((acc, monitor) => {
    const state = getMonitorDisplayState(monitor);
    acc[state] = (acc[state] ?? 0) + 1;
    return acc;
  }, {});
  const statusColors: Record<string, string> = {
    UP: "#22c55e",
    SUSPECT: "#f59e0b",
    DOWN: "#ef4444",
    PAUSED: "#94a3b8",
    QUOTA_EXCEEDED: "#dc2626",
    UNKNOWN: "#64748b",
    INACTIVE: "#475569",
  };
  const statusData = Object.entries(statusCounts)
    .map(([name, value]) => ({ name, value, fill: statusColors[name] }))
    .filter((item) => item.value > 0);

  // Prepare data for monitors by creation date (last 7 days)
  const now = new Date();
  const lastSevenDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (6 - index));
    return {
      key: date.toISOString().slice(0, 10),
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count: 0,
    };
  });

  const monitorsByDate = monitors.reduce((acc, monitor) => {
    const createdDate = parseBackendDate(monitor.createdAt);
    if (createdDate) {
      const key = createdDate.toISOString().slice(0, 10);
      if (key in acc) {
        acc[key] += 1;
      }
    }
    return acc;
  }, Object.fromEntries(lastSevenDays.map((day) => [day.key, 0])) as Record<string, number>);

  const hasCreatedAt = monitors.some((monitor) => monitor.createdAt);
  const barChartData = lastSevenDays.map((day) => ({
    date: day.date,
    count: monitorsByDate[day.key] ?? 0,
  }));

  // Monitor uptime percentage bar chart data
  const monitorsBarData = monitors.slice(0, 10).map((monitor) => {
    const uptime = monitor.uptimePercentage || 0;
    // Color based on uptime: green (>=99%), yellow (>=95%), orange (>=90%), red (<90%)
    let color = "#22c55e"; // green
    if (uptime < 90) color = "#ef4444"; // red
    else if (uptime < 95) color = "#f59e0b"; // orange/amber
    else if (uptime < 99) color = "#eab308"; // yellow

    return {
      name: monitor.name.length > 12 ? monitor.name.slice(0, 12) + "..." : monitor.name,
      fullName: monitor.name,
      uptime: uptime,
      downtime: 100 - uptime,
      color: color,
      active: monitor.active,
    };
  });

  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
      {/* Status Distribution */}
      <Card className="min-w-0">
        <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-2">
          <CardTitle className="text-base sm:text-lg">Monitor Status Distribution</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Current state distribution</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
          <ChartContainer
            config={{
              active: { label: "Active", color: "#22c55e" },
              paused: { label: "Paused", color: "#94a3b8" },
            }}
            className="mx-auto h-[210px] w-full max-w-[300px] sm:h-[280px]"
          >
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={2}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip />
            </PieChart>
          </ChartContainer>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {statusData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5 rounded-md border px-2 py-1">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.fill }} />
                <span>{entry.name}</span>
                <span className="text-muted-foreground">{entry.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monitors Created Over Time */}
      <Card className="min-w-0">
        <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-2">
          <CardTitle className="text-base sm:text-lg">Monitors Created</CardTitle>
          <CardDescription className="text-xs sm:text-sm">New monitors in the last 7 days</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
          {!hasCreatedAt ? (
            <div className="flex h-[220px] items-center justify-center text-center text-sm text-muted-foreground sm:h-[280px]">
              Creation dates are not available from the list endpoint yet.
            </div>
          ) : (
            <ChartContainer
              config={{
                count: { label: "Monitors", color: "#3b82f6" },
              }}
              className="h-[220px] w-full sm:h-[280px]"
            >
              <BarChart data={barChartData} margin={{ left: -16, right: 4 }}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" minTickGap={6} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={30} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* All Monitors Overview - Uptime Percentage */}
      <Card className="min-w-0 lg:col-span-2">
        <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-2">
          <CardTitle className="text-base sm:text-lg">Monitors Uptime Overview</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Uptime percentage for each monitor (showing up to 10)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
          <div className="space-y-3 sm:hidden">
            {monitorsBarData.map((monitor) => (
              <div key={monitor.fullName} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="min-w-0 truncate font-medium">{monitor.fullName}</span>
                  <span className="shrink-0 text-muted-foreground">{monitor.uptime.toFixed(1)}%</span>
                </div>
                <div className="h-2 rounded-full bg-red-500/20">
                  <div
                    className="h-2 rounded-full bg-green-500"
                    style={{ width: `${Math.min(Math.max(monitor.uptime, 0), 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <ChartContainer
            config={{
              uptime: { label: "Uptime", color: "#22c55e" },
              downtime: { label: "Downtime", color: "#ef4444" },
            }}
            className="hidden h-[300px] w-full sm:block"
          >
            <BarChart data={monitorsBarData} layout="vertical" margin={{ left: -8, right: 12 }}>
              <XAxis
                type="number"
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                dataKey="name"
                type="category"
                width={92}
                tick={{ fontSize: 11 }}
              />
              <ChartTooltip
                content={({ payload }) => {
                  if (payload && payload.length > 0) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-2 text-xs shadow-lg sm:p-3 sm:text-sm">
                        <p className="font-medium">{data.fullName}</p>
                        <div className="mt-1 space-y-0.5 sm:mt-2 sm:space-y-1">
                          <p className="text-green-500">
                            Uptime: {data.uptime.toFixed(2)}%
                          </p>
                          <p className="text-red-500">
                            Downtime: {data.downtime.toFixed(2)}%
                          </p>
                          <p className="text-muted-foreground">
                            Status: {data.active ? "Active" : "Paused"}
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="uptime" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} name="Uptime" />
              <Bar dataKey="downtime" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} name="Downtime" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
