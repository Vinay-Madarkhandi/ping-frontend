import { cn } from "@/lib/utils";

export type StatusDotState =
  | "UP"
  | "SUSPECT"
  | "DOWN"
  | "PAUSED"
  | "QUOTA_EXCEEDED"
  | "UNKNOWN"
  | "INACTIVE";

const dotColor: Record<StatusDotState, string> = {
  UP: "bg-up",
  SUSPECT: "bg-suspect",
  DOWN: "bg-down",
  QUOTA_EXCEEDED: "bg-down",
  PAUSED: "bg-paused",
  UNKNOWN: "bg-paused",
  INACTIVE: "bg-paused",
};

/** Small live indicator dot; pulses with a sonar ring for a healthy monitor. */
export function StatusDot({
  state,
  pulse,
  className,
}: {
  state: StatusDotState;
  pulse?: boolean;
  className?: string;
}) {
  const shouldPulse = pulse ?? state === "UP";

  return (
    <span className={cn("relative inline-flex h-2.5 w-2.5", className)}>
      {shouldPulse ? (
        <span
          className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-60",
            dotColor[state]
          )}
        />
      ) : null}
      <span
        className={cn(
          "relative inline-flex h-2.5 w-2.5 rounded-full",
          dotColor[state]
        )}
      />
    </span>
  );
}
