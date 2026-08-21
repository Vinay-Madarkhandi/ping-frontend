"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Lock } from "lucide-react";

import { StatusDot } from "@/components/shared/status-dot";
import { cn } from "@/lib/utils";

const previewMonitors = [
  { name: "api.yourapp.com", state: "UP" as const, latency: "142ms" },
  { name: "checkout-service", state: "UP" as const, latency: "98ms" },
  { name: "webhooks-ingest", state: "SUSPECT" as const, latency: "612ms" },
  { name: "status.yourapp.com", state: "UP" as const, latency: "67ms" },
];

const stateLabel: Record<string, string> = {
  UP: "Operational",
  SUSPECT: "Degraded",
  DOWN: "Down",
};

const stateText: Record<string, string> = {
  UP: "text-up",
  SUSPECT: "text-suspect",
  DOWN: "text-down",
};

/** Sparkline built from a fixed point set so the SVG path is deterministic (no hydration mismatch). */
const sparklinePoints = [42, 38, 45, 30, 52, 48, 60, 55, 68, 62, 74, 70, 82];

function Sparkline() {
  const max = Math.max(...sparklinePoints);
  const min = Math.min(...sparklinePoints);
  const w = 100;
  const h = 32;
  const step = w / (sparklinePoints.length - 1);

  const coords = sparklinePoints.map((v, i) => {
    const x = i * step;
    const y = h - ((v - min) / (max - min)) * h;
    return [x, y] as const;
  });

  const line = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-8 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkline-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sparkline-fill)" />
      <path d={line} fill="none" stroke="var(--color-primary)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HeroPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
      className="glow-primary relative w-full max-w-lg overflow-hidden rounded-2xl border bg-card/95 shadow-2xl backdrop-blur"
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-down/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-suspect/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-up/60" />
        </div>
        <div className="ml-2 flex flex-1 items-center gap-1.5 rounded-md bg-background/80 px-2.5 py-1 text-[11px] text-muted-foreground">
          <Lock className="h-2.5 w-2.5" />
          <span className="font-mono">app.pingmeheart.online/dashboard</span>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusDot state="UP" />
            <span className="text-sm font-medium">All systems live</span>
          </div>
          <span className="font-mono text-xs text-muted-foreground" data-metric>
            4 monitors
          </span>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-2">
          <div className="rounded-lg border bg-background/60 px-3 py-2">
            <p className="font-mono text-lg font-semibold text-up" data-metric>
              99.98%
            </p>
            <p className="text-[10px] text-muted-foreground">30d uptime</p>
          </div>
          <div className="rounded-lg border bg-background/60 px-3 py-2">
            <p className="font-mono text-lg font-semibold" data-metric>
              89ms
            </p>
            <p className="text-[10px] text-muted-foreground">avg response</p>
          </div>
          <div className="col-span-1 rounded-lg border bg-background/60 px-3 py-2">
            <Sparkline />
          </div>
        </div>

        <div className="space-y-2">
          {previewMonitors.map((monitor, index) => (
            <motion.div
              key={monitor.name}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.35 + index * 0.1 }}
              className="flex items-center justify-between rounded-lg border bg-background/60 px-3 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <StatusDot state={monitor.state} />
                <span className="truncate font-mono text-xs text-foreground sm:text-sm" data-metric>
                  {monitor.name}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-3 text-xs">
                <span className={cn("font-medium", stateText[monitor.state])}>
                  {stateLabel[monitor.state]}
                </span>
                <span className="hidden font-mono text-muted-foreground sm:inline" data-metric>
                  {monitor.latency}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between rounded-lg bg-primary/10 px-3 py-2.5">
          <span className="text-xs font-medium text-primary">Alert sent to on-call in 4.2s</span>
          <ArrowUpRight className="h-3.5 w-3.5 text-primary" />
        </div>
      </div>
    </motion.div>
  );
}
