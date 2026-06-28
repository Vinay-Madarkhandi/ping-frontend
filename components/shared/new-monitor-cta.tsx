import Link from "next/link";
import { Lock, PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PlanContext } from "@/lib/types";
import { formatNumber, isMonitorLimitReached } from "@/lib/plans";

export function NewMonitorCta({
  planContext,
  size,
  className,
}: {
  planContext: PlanContext;
  size?: "default" | "sm";
  className?: string;
}) {
  const limitReached = isMonitorLimitReached(planContext);

  if (!limitReached) {
    return (
      <Button asChild size={size} className={className}>
        <Link href="/monitors/create">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Monitor
        </Link>
      </Button>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button asChild size={size} className={className}>
          <Link href="/settings#billing">
            <Lock className="mr-2 h-4 w-4" />
            Upgrade to add more
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {planContext.plan.name} includes {formatNumber(planContext.plan.maxMonitors)} monitors.
      </TooltipContent>
    </Tooltip>
  );
}
