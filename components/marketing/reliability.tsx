import { Marquee } from "@/components/marketing/marquee";

const stack = [
  "PostgreSQL",
  "Spring Boot",
  "Prometheus",
  "Grafana",
  "Docker",
  "Flyway",
  "Loki",
  "Micrometer",
];

export function Reliability() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Built on infrastructure that doesn&apos;t cut corners
        </h2>
        <p className="mt-4 text-muted-foreground">
          No cron jobs held together with hope. Ping&apos;s scheduler, alerting, and metrics
          run on the same tools that back production systems everywhere.
        </p>
      </div>

      <div className="mt-12">
        <Marquee speed={28}>
          {stack.map((tool) => (
            <span
              key={tool}
              className="flex shrink-0 items-center rounded-full border bg-card px-5 py-2 font-mono text-sm text-muted-foreground"
              data-metric
            >
              {tool}
            </span>
          ))}
        </Marquee>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-5">
          <p className="font-mono text-2xl font-semibold text-primary" data-metric>
            10s
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Fastest check interval</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <p className="font-mono text-2xl font-semibold text-primary" data-metric>
            3
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Probe outcomes tracked: up, down, inconclusive
          </p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <p className="font-mono text-2xl font-semibold text-primary" data-metric>
            24/7
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Multi-instance scheduler with row-level locking
          </p>
        </div>
      </div>
    </section>
  );
}
