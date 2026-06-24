"use client";

import Link from "next/link";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { AlertCircle, Clock, Timer, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Incident, MonitorLog, PaginatedResponse, Uptime } from "@/lib/types";
import {
  formatBackendDateTime,
  formatDuration,
  parseBackendDate,
} from "@/lib/datetime";

const windows = [
  { label: "24h", value: "24h" },
  { label: "7d", value: "7d" },
  { label: "30d", value: "30d" },
] as const;

interface DetailInsightsProps {
  monitorId: string;
  uptime?: Uptime;
  logs?: PaginatedResponse<MonitorLog>;
  incidents?: PaginatedResponse<Incident>;
  selectedWindow: "30m" | "24h" | "7d" | "30d";
}

export function DetailInsights({
  monitorId,
  uptime,
  logs,
  incidents,
  selectedWindow,
}: DetailInsightsProps) {
  const upSeconds = Math.max((uptime?.monitoredSeconds ?? 0) - (uptime?.downSeconds ?? 0), 0);
  const breakdownData = [
    { name: "Up", value: upSeconds, fill: "#22c55e" },
    { name: "Down", value: uptime?.downSeconds ?? 0, fill: "#ef4444" },
    { name: "Paused", value: uptime?.pausedSeconds ?? 0, fill: "#94a3b8" },
    { name: "Gap", value: uptime?.gapSeconds ?? 0, fill: "#f59e0b" },
  ].filter((item) => item.value > 0);

  const responseTimeData = (logs?.content ?? [])
    .slice()
    .reverse()
    .map((log) => {
      const checkedAt = parseBackendDate(log.checkedAt);

      return {
        time: checkedAt?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) ?? "",
        responseTime: log.responseTimeInMilli,
        up: log.up,
        status: log.up ? "Up" : log.statusCode === 0 ? "No response" : "Down",
      };
    });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Uptime window</h2>
          <p className="text-sm text-muted-foreground">
            Authoritative uptime excludes paused time and data gaps.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {windows.map((window) => (
            <Button
              key={window.value}
              variant={selectedWindow === window.value ? "default" : "outline"}
              size="sm"
              asChild
            >
              <Link href={`/monitors/${monitorId}?window=${window.value}`}>{window.label}</Link>
            </Button>
          ))}
        </div>
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        <Card className="min-w-0">
          <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-2">
            <CardTitle className="text-base sm:text-lg">Uptime Breakdown</CardTitle>
            <CardDescription>
              Up, down, paused, and missing-data seconds for this window.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            {!uptime || breakdownData.length === 0 ? (
              <EmptyChart icon={Timer} label="No uptime data for this window" />
            ) : (
              <ChartContainer
                config={{
                  value: { label: "Seconds", color: "#22c55e" },
                }}
                className="mx-auto h-[210px] w-full max-w-[300px] sm:h-[260px]"
              >
                <PieChart>
                  <Pie
                    data={breakdownData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={2}
                  >
                    {breakdownData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const item = payload[0].payload as { name: string; value: number };
                      return (
                        <div className="rounded-lg border bg-background p-2 text-xs shadow-lg">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-muted-foreground">{formatDuration(item.value)}</p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ChartContainer>
            )}
            {uptime ? (
              <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-muted-foreground min-[380px]:grid-cols-2 sm:grid-cols-4">
                <Metric label="Monitored" value={formatDuration(uptime.monitoredSeconds)} />
                <Metric label="Down" value={formatDuration(uptime.downSeconds)} />
                <Metric label="Paused" value={formatDuration(uptime.pausedSeconds)} />
                <Metric label="Gap" value={formatDuration(uptime.gapSeconds)} />
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-2">
            <CardTitle className="text-base sm:text-lg">Response Time</CardTitle>
            <CardDescription>Last {logs?.content.length ?? 0} checks from the log page.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            {responseTimeData.length === 0 ? (
              <EmptyChart icon={Zap} label="No response-time data yet" />
            ) : (
              <ChartContainer
                config={{
                  responseTime: { label: "Response time", color: "#2563eb" },
                }}
                className="h-[220px] w-full sm:h-[260px]"
              >
                <LineChart data={responseTimeData} margin={{ left: -18, right: 8, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" minTickGap={18} />
                  <YAxis tick={{ fontSize: 10 }} width={42} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="responseTime"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={(props) => {
                      const payload = props.payload as { up: boolean };
                      return (
                        <circle
                          key={`response-time-dot-${props.cx}-${props.cy}`}
                          cx={props.cx}
                          cy={props.cy}
                          r={3}
                          fill={payload.up ? "#22c55e" : "#ef4444"}
                          stroke="none"
                        />
                      );
                    }}
                  />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="min-w-0">
        <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-2">
          <CardTitle className="text-base sm:text-lg">Recent Status Timeline</CardTitle>
          <CardDescription>Most recent checks, left to right from oldest to newest.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
          {logs?.content.length ? (
            <div
              className="grid gap-1 overflow-hidden"
              style={{ gridTemplateColumns: `repeat(${logs.content.length}, minmax(4px, 1fr))` }}
            >
              {logs.content.slice().reverse().map((log, index) => (
                <div
                  key={`${log.checkedAt}-${index}`}
                  title={`${log.up ? "Up" : log.statusCode === 0 ? "No response" : "Down"} at ${formatBackendDateTime(log.checkedAt)}`}
                  className={`h-6 rounded-sm sm:h-8 ${
                    log.up
                      ? "bg-green-500"
                      : log.statusCode === 0
                      ? "bg-slate-400"
                      : "bg-red-500"
                  }`}
                />
              ))}
            </div>
          ) : (
            <EmptyChart icon={Clock} label="No checks have run yet" compact />
          )}
        </CardContent>
      </Card>

      <Card className="min-w-0">
        <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-2">
          <CardTitle className="text-base sm:text-lg">Incidents</CardTitle>
          <CardDescription>
            Open and resolved outages detected after the failure threshold.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {!incidents?.content.length ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No incidents recorded for this monitor.
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Resolved</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incidents.content.map((incident) => (
                      <TableRow key={incident.id}>
                        <TableCell>
                          <Badge variant={incident.status === "OPEN" ? "destructive" : "secondary"}>
                            {incident.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatBackendDateTime(incident.startedAt)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {incident.resolvedAt ? formatBackendDateTime(incident.resolvedAt) : "Ongoing"}
                        </TableCell>
                        <TableCell>{formatDuration(incident.durationSeconds)}</TableCell>
                        <TableCell className="max-w-[280px] truncate text-sm text-muted-foreground">
                          {incident.failureReason ?? "No reason provided"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="divide-y md:hidden">
                {incidents.content.map((incident) => (
                  <div key={incident.id} className="space-y-2 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <Badge variant={incident.status === "OPEN" ? "destructive" : "secondary"}>
                        {incident.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDuration(incident.durationSeconds)}
                      </span>
                    </div>
                    <div className="grid gap-1 text-xs text-muted-foreground">
                      <div>
                        <span className="font-medium text-foreground">Started: </span>
                        {formatBackendDateTime(incident.startedAt)}
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Resolved: </span>
                        {incident.resolvedAt ? formatBackendDateTime(incident.resolvedAt) : "Ongoing"}
                      </div>
                      <div className="break-words">
                        <span className="font-medium text-foreground">Reason: </span>
                        {incident.failureReason ?? "No reason provided"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-muted/20 p-2">
      <div className="font-medium text-foreground">{value}</div>
      <div>{label}</div>
    </div>
  );
}

function EmptyChart({
  icon: Icon,
  label,
  compact = false,
}: {
  icon: typeof AlertCircle;
  label: string;
  compact?: boolean;
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center text-sm text-muted-foreground ${compact ? "h-16" : "h-[260px]"}`}>
      <Icon className="mb-2 h-8 w-8" />
      {label}
    </div>
  );
}
