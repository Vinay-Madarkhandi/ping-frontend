import { cn } from "@/lib/utils";

/** Concentric-ring icon backdrop, used by the monitor-type grid. */
export function RadarIcon({
  icon,
  active = false,
  className,
}: {
  icon: React.ReactNode;
  active?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative flex h-14 w-14 items-center justify-center", className)}>
      <span
        className={cn(
          "absolute inset-0 rounded-full border transition-colors duration-500",
          active ? "border-primary/40" : "border-border"
        )}
      />
      <span
        className={cn(
          "absolute inset-[10px] rounded-full border transition-colors duration-500",
          active ? "border-primary/30" : "border-border/70"
        )}
      />
      <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </span>
    </div>
  );
}
