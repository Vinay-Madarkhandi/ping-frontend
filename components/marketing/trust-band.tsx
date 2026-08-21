const stats = [
  { value: "10s", label: "Fastest check interval" },
  { value: "3", label: "Monitor types — HTTP, TCP, heartbeat" },
  { value: "24/7", label: "Multi-instance scheduler, always on" },
  { value: "<1min", label: "Time from failure to alert" },
];

export function TrustBand() {
  return (
    <section className="border-y bg-card/40">
      <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-y divide-border px-4 sm:grid-cols-4 sm:divide-y-0 sm:px-6">
        {stats.map((stat) => (
          <div key={stat.label} className="px-4 py-6 text-center sm:py-8">
            <p className="font-mono text-2xl font-bold text-primary sm:text-3xl" data-metric>
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
