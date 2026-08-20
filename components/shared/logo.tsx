import { cn } from "@/lib/utils";

export function SonarMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="9" className="fill-primary" />
      <circle
        cx="16"
        cy="16"
        r="12"
        className="stroke-primary-foreground"
        strokeOpacity="0.25"
        strokeWidth="1.6"
      />
      <circle
        cx="16"
        cy="16"
        r="8"
        className="stroke-primary-foreground"
        strokeOpacity="0.5"
        strokeWidth="1.8"
      />
      <circle
        cx="16"
        cy="16"
        r="4.2"
        className="stroke-primary-foreground"
        strokeOpacity="0.9"
        strokeWidth="2"
      />
      <circle cx="16" cy="16" r="2" className="fill-primary-foreground" />
    </svg>
  );
}

export function Logo({
  className,
  iconClassName,
  wordmarkClassName,
  showWordmark = true,
  tagline,
}: {
  className?: string;
  iconClassName?: string;
  wordmarkClassName?: string;
  showWordmark?: boolean;
  tagline?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <SonarMark className={cn("h-8 w-8", iconClassName)} />
      {showWordmark ? (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display text-lg font-extrabold tracking-tight",
              wordmarkClassName
            )}
          >
            Ping
          </span>
          {tagline ? (
            <span className="text-xs text-muted-foreground">{tagline}</span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}

/** Decorative animated sonar rings for hero / brand panels. */
export function SonarPulse({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "pointer-events-none relative flex h-28 w-28 items-center justify-center",
        className
      )}
      aria-hidden="true"
    >
      <span className="absolute inline-flex h-full w-full animate-sonar rounded-full border border-primary/50" />
      <span className="absolute inline-flex h-full w-full animate-sonar rounded-full border border-primary/50 [animation-delay:0.8s]" />
      <span className="absolute inline-flex h-full w-full animate-sonar rounded-full border border-primary/50 [animation-delay:1.6s]" />
      <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-primary shadow-lg glow-primary">
        <SonarMark className="h-6 w-6 [&_rect]:fill-none" />
      </span>
    </span>
  );
}
