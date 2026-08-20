import { Link2, Timer, Siren } from "lucide-react";

const steps = [
  {
    icon: Link2,
    title: "Add a URL",
    description:
      "Point Ping at any HTTP endpoint — a website, API, or internal service. Set the method, headers, and what a healthy response looks like.",
  },
  {
    icon: Timer,
    title: "We check it on your schedule",
    description:
      "Fast and slow worker pools run checks on your interval, isolating high-timeout monitors so one slow endpoint never delays the rest.",
  },
  {
    icon: Siren,
    title: "Get alerted the instant it changes",
    description:
      "A debounced state machine confirms real outages before emailing your team, then tracks the incident until it recovers.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            From signup to your first alert in minutes
          </h2>
        </div>

        <div className="relative mt-14 grid grid-cols-1 gap-10 md:grid-cols-3">
          <div
            className="absolute top-6 right-0 left-0 hidden h-px bg-border md:block"
            aria-hidden="true"
          />
          {steps.map((step, index) => (
            <div key={step.title} className="relative flex flex-col items-center text-center md:items-start md:text-left">
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary bg-background text-primary">
                <step.icon className="h-5 w-5" />
              </div>
              <span className="mt-4 font-mono text-xs text-muted-foreground" data-metric>
                Step {index + 1}
              </span>
              <h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
