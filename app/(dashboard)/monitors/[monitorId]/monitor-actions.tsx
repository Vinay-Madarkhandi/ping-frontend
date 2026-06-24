"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pause, Play } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { MonitorStatus } from "@/lib/types";
import {
  pauseMonitorAction,
  resumeMonitorAction,
} from "@/lib/actions/monitors";

interface MonitorActionsProps {
  monitorId: string;
  status?: MonitorStatus;
}

export function MonitorActions({ monitorId, status }: MonitorActionsProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [optimisticPaused, setOptimisticPaused] = useState<boolean | null>(null);
  const isPaused = optimisticPaused ?? status?.displayState === "PAUSED";

  async function handleClick() {
    setIsPending(true);
    setOptimisticPaused(!isPaused);

    try {
      const result = isPaused
        ? await resumeMonitorAction(monitorId)
        : await pauseMonitorAction(monitorId);

      if (result.success) {
        toast.success(isPaused ? "Monitor resumed" : "Monitor paused");
        router.refresh();
      } else {
        setOptimisticPaused(null);
        toast.error("Failed to update monitor", {
          description: result.error,
        });
      }
    } catch {
      setOptimisticPaused(null);
      toast.error("Something went wrong", {
        description: "Please try again later.",
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={isPending}>
      {isPaused ? (
        <>
          <Play className="mr-2 h-4 w-4" />
          Resume
        </>
      ) : (
        <>
          <Pause className="mr-2 h-4 w-4" />
          Pause
        </>
      )}
    </Button>
  );
}
