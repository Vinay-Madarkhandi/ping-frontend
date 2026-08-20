import { cn } from "@/lib/utils";

function MarqueeTrack({
  children,
  reverse,
  speed,
}: {
  children: React.ReactNode;
  reverse: boolean;
  speed: number;
}) {
  return (
    <div
      aria-hidden={false}
      className={cn(
        "flex shrink-0 items-center gap-10 group-hover:[animation-play-state:paused]",
        reverse ? "animate-marquee-reverse" : "animate-marquee"
      )}
      style={{ animationDuration: `${speed}s` }}
    >
      {children}
    </div>
  );
}

export function Marquee({
  children,
  className,
  reverse = false,
  speed = 32,
}: {
  children: React.ReactNode;
  className?: string;
  reverse?: boolean;
  speed?: number;
}) {
  return (
    <div
      className={cn(
        "group relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]",
        className
      )}
    >
      <MarqueeTrack reverse={reverse} speed={speed}>
        {children}
      </MarqueeTrack>
      <MarqueeTrack reverse={reverse} speed={speed}>
        {children}
      </MarqueeTrack>
    </div>
  );
}
