import { BellRing, Globe, Tags } from "lucide-react";

import DisplayCards from "@/components/ui/display-cards";

const highlights = [
  {
    icon: <Tags className="size-4 text-primary" />,
    title: "Monitor tags",
    description: "Filter monitors by team",
    date: "New",
    iconClassName: "bg-primary/15",
    titleClassName: "text-foreground",
    className:
      "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
  },
  {
    icon: <BellRing className="size-4 text-primary" />,
    title: "CSV exports",
    description: "Export logs & incidents",
    date: "New",
    iconClassName: "bg-primary/15",
    titleClassName: "text-foreground",
    className:
      "[grid-area:stack] translate-x-6 translate-y-10 hover:-translate-y-1 sm:translate-x-12 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
  },
  {
    icon: <Globe className="size-4 text-primary" />,
    title: "Public status pages",
    description: "Public uptime, no URLs",
    date: "New",
    iconClassName: "bg-primary/15",
    titleClassName: "text-foreground",
    className: "[grid-area:stack] translate-x-12 translate-y-20 hover:translate-y-10 sm:translate-x-24",
  },
];

export function HighlightCards() {
  return (
    <section className="overflow-x-hidden py-16 sm:py-20">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Recently shipped
        </h2>
        <p className="mt-3 text-muted-foreground">
          Ping keeps getting better for the teams already using it.
        </p>
      </div>

      <div className="mt-4 flex min-h-[220px] w-full items-center justify-center px-4 py-10 sm:min-h-[320px] sm:py-12">
        <div className="w-full max-w-3xl">
          <DisplayCards cards={highlights} />
        </div>
      </div>
    </section>
  );
}
