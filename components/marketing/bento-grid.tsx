import { cn } from "@/lib/utils";
import { SpotlightCard } from "@/components/marketing/spotlight-card";

export function BentoGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 md:grid-cols-6", className)}>
      {children}
    </div>
  );
}

const spanClass: Record<2 | 3 | 4 | 6, string> = {
  2: "md:col-span-2",
  3: "md:col-span-3",
  4: "md:col-span-4",
  6: "md:col-span-6",
};

export function BentoCard({
  className,
  colSpan = 2,
  children,
}: {
  className?: string;
  colSpan?: 2 | 3 | 4 | 6;
  children: React.ReactNode;
}) {
  return (
    <SpotlightCard
      className={cn(
        "rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md",
        spanClass[colSpan],
        className
      )}
    >
      {children}
    </SpotlightCard>
  );
}
