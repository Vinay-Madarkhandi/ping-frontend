import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AuroraBackground } from "@/components/marketing/aurora-background";
import { HeroPreview } from "@/components/marketing/hero-preview";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <AuroraBackground />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2 lg:py-32">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-up opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-up" />
            </span>
            Real-time HTTP monitoring
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            Know the moment
            <br />
            something <span className="text-primary">breaks</span>.
          </h1>

          <p className="mt-6 max-w-lg text-lg text-muted-foreground sm:text-xl">
            Ping runs real-time HTTP checks on your servers and APIs, tracks duration-based
            uptime, and alerts you the instant something goes down — before your customers
            notice.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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

          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t pt-6">
            <div>
              <dt className="sr-only">Fastest check interval</dt>
              <dd className="font-mono text-2xl font-bold tracking-tight" data-metric>
                10s
              </dd>
              <p className="mt-0.5 text-xs text-muted-foreground">Fastest interval</p>
            </div>
            <div>
              <dt className="sr-only">Probe outcomes tracked</dt>
              <dd className="font-mono text-2xl font-bold tracking-tight" data-metric>
                24/7
              </dd>
              <p className="mt-0.5 text-xs text-muted-foreground">Multi-instance scheduler</p>
            </div>
            <div>
              <dt className="sr-only">Setup time</dt>
              <dd className="font-mono text-2xl font-bold tracking-tight" data-metric>
                &lt;1min
              </dd>
              <p className="mt-0.5 text-xs text-muted-foreground">To first monitor</p>
            </div>
          </dl>
        </div>

        <div className="flex justify-center lg:justify-end">
          <HeroPreview />
        </div>
      </div>
    </section>
  );
}
