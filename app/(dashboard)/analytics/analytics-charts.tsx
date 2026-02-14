"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
  Legend,
  Tooltip,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Monitor } from "@/lib/types";

interface AnalyticsChartsProps {
  monitors: Monitor[];
}

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export function AnalyticsCharts({ monitors }: AnalyticsChartsProps) {
  // Prepare data for status pie chart
  const statusData = [
    { name: "Active", value: monitors.filter((m) => m.active).length, fill: "#22c55e" },
    { name: "Paused", value: monitors.filter((m) => !m.active).length, fill: "#94a3b8" },
  ].filter((item) => item.value > 0);

  // Prepare data for monitors by creation date (last 7 days)
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const monitorsByDate = monitors.reduce((acc, monitor) => {
    // Use createdAt if available, otherwise skip for this chart
    if (!monitor.createdAt) return acc;
    const createdDate = new Date(monitor.createdAt);
    if (createdDate >= sevenDaysAgo) {
      const dateKey = createdDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      acc[dateKey] = (acc[dateKey] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const barChartData = Object.entries(monitorsByDate)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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
    <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
      {/* Status Distribution */}
      <Card>
        <CardHeader className="pb-2 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">Monitor Status Distribution</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Active vs paused monitors</CardDescription>
        </CardHeader>
        <CardContent className="p-2 sm:p-6 pt-0">
          <ChartContainer
            config={{
              active: { label: "Active", color: "#22c55e" },
              paused: { label: "Paused", color: "#94a3b8" },
            }}
            className="h-[250px] sm:h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Monitors Created Over Time */}
      <Card>
        <CardHeader className="pb-2 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">Monitors Created</CardTitle>
          <CardDescription className="text-xs sm:text-sm">New monitors in the last 7 days</CardDescription>
        </CardHeader>
        <CardContent className="p-2 sm:p-6 pt-0">
          {barChartData.length === 0 ? (
            <div className="h-[250px] sm:h-[300px] flex items-center justify-center text-muted-foreground text-sm">
              No monitors created in the last 7 days
            </div>
          ) : (
            <ChartContainer
              config={{
                count: { label: "Monitors", color: "#3b82f6" },
              }}
              className="h-[250px] sm:h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={30} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* All Monitors Overview - Uptime Percentage */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">Monitors Uptime Overview</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Uptime percentage for each monitor (showing up to 10)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-2 sm:p-6 pt-0">
          <ChartContainer
            config={{
              uptime: { label: "Uptime", color: "#22c55e" },
              downtime: { label: "Downtime", color: "#ef4444" },
            }}
            className="h-[250px] sm:h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monitorsBarData} layout="vertical" margin={{ left: -20 }}>
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={80}
                  tick={{ fontSize: 11 }}
                />
                <ChartTooltip
                  content={({ payload }) => {
                    if (payload && payload.length > 0) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background border rounded-lg p-2 sm:p-3 shadow-lg text-xs sm:text-sm">
                          <p className="font-medium">{data.fullName}</p>
                          <div className="mt-1 sm:mt-2 space-y-0.5 sm:space-y-1">
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
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

