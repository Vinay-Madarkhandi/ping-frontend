import {
  Zap,
  BellRing,
  TrendingUp,
  ShieldCheck,
  Activity,
  Server,
} from "lucide-react";

import { BentoGrid, BentoCard } from "@/components/marketing/bento-grid";
import { SonarPulse } from "@/components/shared/logo";

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Everything you need to trust your uptime
        </h2>
        <p className="mt-4 text-muted-foreground">
          Built on a scheduler that survives restarts, deploys, and multiple instances —
          not a cron job that quietly stops working.
        </p>
      </div>

      <BentoGrid className="mt-12">
        <BentoCard colSpan={4} className="flex flex-col justify-between">
          <div>
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Real-time HTTP checks</h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              GET or POST checks with custom headers, expected status codes, keyword
              matching, and redirect handling — on a schedule as tight as 10 seconds.
            </p>
          </div>
          <div className="mt-6 flex items-center justify-end">
            <SonarPulse className="h-24 w-24 opacity-80 sm:h-28 sm:w-28" />
          </div>
        </BentoCard>

        <BentoCard colSpan={2}>
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <BellRing className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Alerts that don&apos;t cry wolf</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            A debounced UP / SUSPECT / DOWN state machine filters out single blips before
            emailing your team — with durable retries on the outbox.
          </p>
        </BentoCard>

        <BentoCard colSpan={2}>
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Duration-based uptime</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Uptime percentages exclude paused time and data gaps, so the number you report
            to stakeholders actually means something.
          </p>
        </BentoCard>

        <BentoCard colSpan={2}>
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Incident tracking</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            One open incident per monitor, from first failure to recovery, with full check
            logs alongside it.
          </p>
        </BentoCard>

        <BentoCard colSpan={3}>
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">SSRF-protected by default</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Every monitor URL is validated at creation and again at DNS resolution/connect
            time, so internal infrastructure stays off-limits.
          </p>
        </BentoCard>

        <BentoCard colSpan={3}>
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Server className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Built to scale horizontally</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            A PostgreSQL row-locked scheduler lets multiple app instances claim disjoint
            work without stepping on each other.
          </p>
        </BentoCard>
      </BentoGrid>
    </section>
  );
}
