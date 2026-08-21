import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AuroraBackground } from "@/components/marketing/aurora-background";
import { HeroPreview } from "@/components/marketing/hero-preview";

const checks = [
  "10s fastest checks",
  "HTTP, TCP & heartbeat monitors",
  "Real-time alerts",
  "Public status pages",
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <AuroraBackground />
      <div className="mx-auto max-w-4xl px-4 pt-20 pb-4 text-center sm:px-6 sm:pt-28">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-up opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-up" />
          </span>
          Real-time HTTP, TCP &amp; heartbeat monitoring
        </div>

        <h1 className="text-balance text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
          Know the moment
          <br />
          something <span className="text-primary">breaks</span>.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Ping watches your servers, APIs, and background jobs — and alerts you the instant
          something goes down, before your customers notice.
        </p>

        <div className="mx-auto mt-4 flex max-w-xl flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          {checks.map((check) => (
            <span key={check} className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-primary" />
              {check}
            </span>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" asChild className="gap-2">
            <Link href="/signup">
              Start monitoring free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="#features">See how it works</a>
          </Button>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          No credit card required · Checks as often as every 10 seconds
        </p>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-20 pt-14 sm:px-6 sm:pb-28">
        <div className="flex justify-center">
          <HeroPreview />
        </div>
      </div>
    </section>
  );
}
