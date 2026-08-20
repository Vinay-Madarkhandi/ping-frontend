import Link from "next/link";
import { ShieldAlert } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Monitor } from "@/lib/types";
import { parseBackendDate } from "@/lib/datetime";

const WARNING_WINDOW_DAYS = 30;

function daysRemaining(sslCertExpiresAt: string): number | null {
  const date = parseBackendDate(sslCertExpiresAt);
  if (!date) return null;
  return Math.ceil((date.getTime() - Date.now()) / 86_400_000);
}

/** Summarizes monitors whose TLS certificate is expiring soon or already expired. */
export function SslExpiryBanner({ monitors }: { monitors: Monitor[] }) {
  const expiring = monitors.filter((monitor) => {
    if (!monitor.sslCertExpiresAt) return false;
    const days = daysRemaining(monitor.sslCertExpiresAt);
    return days != null && days <= WARNING_WINDOW_DAYS;
  });

  if (expiring.length === 0) return null;

  const expiredCount = expiring.filter((monitor) => {
    const days = monitor.sslCertExpiresAt ? daysRemaining(monitor.sslCertExpiresAt) : null;
    return days != null && days < 0;
  }).length;

  return (
    <Alert className="border-suspect/40 bg-suspect/10">
      <ShieldAlert className="h-4 w-4 text-suspect" />
      <AlertTitle>
        {expiring.length === 1
          ? "1 SSL certificate needs attention"
          : `${expiring.length} SSL certificates need attention`}
      </AlertTitle>
      <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span>
          {expiredCount > 0
            ? `${expiredCount} already expired. Renew before it causes an outage.`
            : "Expiring within 30 days. Renew before it causes an outage."}
        </span>
        <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
          <Link href="/monitors">View monitors</Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
}
