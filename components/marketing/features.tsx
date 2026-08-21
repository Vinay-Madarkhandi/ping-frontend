import {
  Globe,
  KeyRound,
  Network,
  ShieldCheck,
  HeartPulse,
  Radio,
} from "lucide-react";

import { RadarIcon } from "@/components/marketing/radar-icon";

const monitorTypes = [
  {
    icon: Globe,
    title: "Website monitoring",
    description: "GET or POST checks on any HTTP(S) endpoint, as often as every 10 seconds.",
  },
  {
    icon: KeyRound,
    title: "Keyword monitoring",
    description: "Get alerted the moment expected text disappears from a response body.",
  },
  {
    icon: Network,
    title: "TCP port monitoring",
    description: "Raw socket checks for databases, SSH, message queues, and other non-HTTP services.",
  },
  {
    icon: HeartPulse,
    title: "Heartbeat monitoring",
    description: "Cron jobs and background workers ping Ping — silence itself is the alert.",
  },
  {
    icon: ShieldCheck,
    title: "SSL certificate monitoring",
    description: "Know a certificate is about to expire before your users see a browser warning.",
  },
  {
    icon: Radio,
    title: "Public status pages",
    description: "Share live uptime with your users — never the URLs or configuration behind it.",
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-start">
        <div>
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            Catch downtime
            <br />
            before your users do.
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            Set up a monitor in minutes, get an instant alert when something breaks, and see
            exactly what happened — from the first failed check to recovery.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {monitorTypes.map((type) => (
            <div
              key={type.title}
              className="group rounded-2xl border bg-card p-5 transition-colors hover:border-primary/40"
            >
              <RadarIcon icon={<type.icon className="h-4 w-4" />} />
              <h3 className="mt-4 text-sm font-semibold">{type.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{type.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
