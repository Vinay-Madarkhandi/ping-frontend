import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SonarPulse } from "@/components/shared/logo";

export function CtaSection() {
  return (
    <section className="relative overflow-hidden border-y bg-sidebar">
      <div className="bg-grid-fade absolute inset-0" />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6 sm:py-28">
        <SonarPulse className="h-20 w-20" />
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Stop finding out about outages from your customers.
        </h2>
        <p className="max-w-lg text-muted-foreground">
          Set up your first monitor in under a minute. No credit card required.
        </p>
        <Button size="lg" asChild className="gap-2">
          <Link href="/signup">
            Start monitoring free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
