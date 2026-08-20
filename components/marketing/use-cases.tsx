import { Globe, Server, Webhook } from "lucide-react";

import { StackedCards } from "@/components/ui/stacked-cards";

const useCases = [
  {
    icon: <Globe className="h-5 w-5" />,
    title: "Website uptime",
    description: "Know the second your marketing site or storefront goes down.",
  },
  {
    icon: <Server className="h-5 w-5" />,
    title: "API health",
    description: "Catch a failing endpoint before it shows up in your error tracker.",
  },
  {
    icon: <Webhook className="h-5 w-5" />,
    title: "Internal services",
    description: "Watch the queues, webhooks, and admin tools your team depends on.",
  },
];

export function UseCases() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Built for every endpoint you depend on
        </h2>
        <p className="mt-3 text-muted-foreground">
          Tap a card to see what teams monitor with Ping.
        </p>
      </div>

      <div className="mt-4">
        <StackedCards cards={useCases} />
      </div>
    </section>
  );
}
