"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pause, Play, Edit, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { AlertChannel, Monitor, MonitorStatus, PlanContext } from "@/lib/types";
import {
  pauseMonitorAction,
  resumeMonitorAction,
  checkNowAction,
} from "@/lib/actions/monitors";
import { EditMonitorDialog } from "@/components/shared/edit-monitor-dialog";

interface MonitorActionsProps {
  monitor: Monitor;
  status?: MonitorStatus;
  planContext: PlanContext;
  alertChannels: AlertChannel[];
  selectedChannelIds: string[];
}

export function MonitorActions({
  monitor,
  status,
  planContext,
  alertChannels,
  selectedChannelIds,
}: MonitorActionsProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [isCheckingNow, setIsCheckingNow] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [optimisticPaused, setOptimisticPaused] = useState<boolean | null>(null);
  
  const isQuotaBlocked = status?.quotaBlocked || status?.displayState === "QUOTA_EXCEEDED";
  const isPaused = optimisticPaused ?? status?.displayState === "PAUSED";

  async function handlePauseResume() {
    if (isQuotaBlocked) {
      toast.error("Monthly check limit reached", {
        description: "Monitoring resumes when the month resets, or after an upgrade.",
      });
      return;
    }

    setIsPending(true);
    setOptimisticPaused(!isPaused);

    try {
      const result = isPaused
        ? await resumeMonitorAction(monitor.id)
        : await pauseMonitorAction(monitor.id);

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

  async function handleCheckNow() {
    setIsCheckingNow(true);

    try {
      const result = await checkNowAction(monitor.id);

      if (result.success && result.data) {
        const { outcome, statusCode, responseTimeMs, message } = result.data;
        
        if (outcome === "UP") {
          toast.success("Check complete", {
            description: `${message} (${statusCode}, ${responseTimeMs}ms)`,
          });
        } else if (outcome === "DOWN") {
          toast.error("Check complete", {
            description: `${message} (${statusCode}, ${responseTimeMs}ms)`,
          });
        } else {
          toast.info("Check complete", {
            description: message,
          });
        }
        
        router.refresh();
      } else {
        toast.error("Check failed", {
          description: result.error || "Please try again.",
        });
      }
    } catch {
      toast.error("Something went wrong", {
        description: "Please try again later.",
      });
    } finally {
      setIsCheckingNow(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setEditDialogOpen(true)}
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleCheckNow}
          disabled={isCheckingNow || isQuotaBlocked}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isCheckingNow ? "animate-spin" : ""}`} />
          {isCheckingNow ? "Checking..." : "Check Now"}
        </Button>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={handlePauseResume} 
          disabled={isPending || isQuotaBlocked}
        >
          {isQuotaBlocked ? (
            <>
              <Pause className="mr-2 h-4 w-4" />
              Quota reached
            </>
          ) : isPaused ? (
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
      </div>

      <EditMonitorDialog
        monitor={monitor}
        planContext={planContext}
        alertChannels={alertChannels}
        selectedChannelIds={selectedChannelIds}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={() => router.refresh()}
      />
    </>
  );
}
