"use client";

import { useState } from "react";
import { Check, Copy, HeartPulse } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface HeartbeatUrlDisplayProps {
  url: string;
  className?: string;
}

/** Shows the ping URL an external job hits to report a heartbeat monitor alive, with a copy button. */
export function HeartbeatUrlDisplay({ url, className }: HeartbeatUrlDisplayProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Ping URL copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy to clipboard", {
        description: "Select and copy the URL manually.",
      });
    }
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-1.5 text-sm font-medium">
        <HeartPulse className="h-4 w-4 text-primary" />
        Heartbeat ping URL
      </div>
      <div className="mt-1.5 flex items-center gap-2 rounded-md border bg-muted/40 p-2">
        <code className="min-w-0 flex-1 truncate text-xs sm:text-sm">{url}</code>
        <Button type="button" variant="outline" size="sm" onClick={handleCopy} className="shrink-0">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          <span className="ml-1.5">{copied ? "Copied" : "Copy"}</span>
        </Button>
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">
        Have your job call this URL (GET or POST) each time it runs successfully. No pings within
        the expected interval and this monitor goes DOWN.
      </p>
    </div>
  );
}
