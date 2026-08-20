"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { StatusDot } from "@/components/shared/status-dot";
import { cn } from "@/lib/utils";

const previewMonitors = [
  { name: "api.yourapp.com", state: "UP" as const, latency: "142ms", uptime: "99.98%" },
  { name: "checkout-service", state: "UP" as const, latency: "98ms", uptime: "99.95%" },
  { name: "webhooks-ingest", state: "SUSPECT" as const, latency: "612ms", uptime: "98.41%" },
  { name: "status.yourapp.com", state: "UP" as const, latency: "67ms", uptime: "100%" },
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

export function HeroPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
      className="glow-primary relative w-full max-w-md rounded-2xl border bg-card/95 p-4 shadow-2xl backdrop-blur sm:p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusDot state="UP" />
          <span className="text-sm font-medium">All systems live</span>
        </div>
        <span className="font-mono text-xs text-muted-foreground" data-metric>
          4 monitors
        </span>
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
    </motion.div>
  );
}
