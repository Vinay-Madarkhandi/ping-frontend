import { AlertTriangle, Gauge } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PlanContext } from "@/lib/types";
import {
  formatNumber,
  getNextMonthlyResetDate,
} from "@/lib/plans";
import { cn } from "@/lib/utils";

export function UsageMeter({ planContext }: { planContext: PlanContext }) {
  const usage = planContext.usage;

  if (!usage) return null;

  const quota = planContext.plan.monthlyCheckQuota;
  const percent = quota > 0 ? Math.min((usage.checksThisMonth / quota) * 100, 100) : 0;
  const resetDate = getNextMonthlyResetDate();
  const resetLabel = resetDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const tone = percent >= 95 ? "red" : percent >= 75 ? "amber" : "green";

  return (
    <Card className={cn(usage.overQuota && "border-destructive")}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 p-4 pb-2 sm:p-6 sm:pb-2">
        <div>
          <CardTitle className="text-base sm:text-lg">Monthly Usage</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Resets on {resetLabel}
          </CardDescription>
        </div>
        {usage.overQuota ? (
          <AlertTriangle className="h-5 w-5 text-destructive" />
        ) : (
          <Gauge className="h-5 w-5 text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0 sm:p-6 sm:pt-0">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-2xl font-bold">
              {Math.round(percent)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(usage.checksThisMonth)} / {formatNumber(quota)} checks
            </p>
          </div>
          <p className="text-right text-xs text-muted-foreground">
            {formatNumber(usage.alertsToday)} alerts today
          </p>
        </div>
        <Progress
          value={percent}
          indicatorClassName={cn(
            tone === "green" && "bg-green-500",
            tone === "amber" && "bg-amber-500",
            tone === "red" && "bg-red-500"
          )}
        />
      </CardContent>
    </Card>
  );
}
