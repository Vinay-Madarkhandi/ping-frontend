"use client";

import { Cell, Pie, PieChart } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Monitor } from "@/lib/types";
import { getMonitorDisplayState } from "@/components/shared/monitor-state-badge";

const colors = {
  UP: "#22c55e",
  SUSPECT: "#f59e0b",
  DOWN: "#ef4444",
  PAUSED: "#94a3b8",
  QUOTA_EXCEEDED: "#dc2626",
  UNKNOWN: "#64748b",
  INACTIVE: "#475569",
};

export function StatusDistributionChart({ monitors }: { monitors: Monitor[] }) {
  const counts = monitors.reduce<Record<string, number>>((acc, monitor) => {
    const state = getMonitorDisplayState(monitor);
    acc[state] = (acc[state] ?? 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(counts).map(([name, value]) => ({
    name,
    value,
    fill: colors[name as keyof typeof colors],
  }));

  return (
    <Card className="min-w-0">
      <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-2">
        <CardTitle className="text-base sm:text-lg">Status Distribution</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Current monitor states.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
        <ChartContainer
          config={{
            value: { label: "Monitors", color: "#22c55e" },
          }}
          className="mx-auto h-[210px] w-full max-w-[280px] sm:h-[260px]"
        >
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={45}
              outerRadius={75}
              paddingAngle={2}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Pie>
            <ChartTooltip />
          </PieChart>
        </ChartContainer>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {data.map((entry) => (
            <div key={entry.name} className="flex items-center gap-1.5 rounded-md border px-2 py-1">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.fill }} />
              <span>{entry.name}</span>
              <span className="text-muted-foreground">{entry.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
