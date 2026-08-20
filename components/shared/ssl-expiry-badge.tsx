import { ShieldAlert, ShieldX } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { parseBackendDate } from "@/lib/datetime";

const WARNING_WINDOW_DAYS = 30;

function daysRemaining(sslCertExpiresAt: string): number | null {
  const date = parseBackendDate(sslCertExpiresAt);
  if (!date) return null;
  return Math.ceil((date.getTime() - Date.now()) / 86_400_000);
}

/** Renders nothing for a healthy certificate — only surfaces certs that need attention. */
export function SslExpiryBadge({ sslCertExpiresAt }: { sslCertExpiresAt: string | null }) {
  if (!sslCertExpiresAt) return null;

  const days = daysRemaining(sslCertExpiresAt);
  if (days == null || days > WARNING_WINDOW_DAYS) return null;

  const expired = days < 0;

  return (
    <Badge
      variant="outline"
      className={
        expired
          ? "gap-1 border-down/30 bg-down/10 text-down text-[10px] font-normal"
          : "gap-1 border-suspect/40 bg-suspect/10 text-suspect-foreground dark:text-suspect text-[10px] font-normal"
      }
    >
      {expired ? <ShieldX className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
      {expired ? "SSL expired" : `SSL ${days}d`}
    </Badge>
  );
}
