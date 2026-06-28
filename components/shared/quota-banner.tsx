import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PlanContext } from "@/lib/types";
import { getNextMonthlyResetDate } from "@/lib/plans";

export function QuotaBanner({ planContext }: { planContext: PlanContext }) {
  if (!planContext.usage?.overQuota) return null;

  const resetLabel = getNextMonthlyResetDate().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <Alert className="border-destructive bg-destructive/10">
      <AlertTriangle className="h-4 w-4 text-destructive" />
      <AlertTitle>Monthly check limit reached.</AlertTitle>
      <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Monitoring resumes on {resetLabel}, or upgrade to continue now.
        </span>
        <Button asChild size="sm" className="w-full sm:w-auto">
          <Link href="/settings#billing">Upgrade</Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
}
