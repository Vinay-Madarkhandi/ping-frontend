"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  ExternalLink,
  Trash2,
  Eye,
  Pause,
  Play,
} from "lucide-react";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Monitor, MonitorDisplayState } from "@/lib/types";
import {
  deleteMonitorAction,
  pauseMonitorAction,
  resumeMonitorAction,
} from "@/lib/actions/monitors";
import { formatBackendRelativeTime } from "@/lib/datetime";
import {
  getMonitorDisplayState,
  MonitorStateBadge,
} from "@/components/shared/monitor-state-badge";

interface MonitorsTableProps {
  monitors: Monitor[];
}

export function MonitorsTable({ monitors }: MonitorsTableProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [optimisticStates, setOptimisticStates] = useState<Record<string, MonitorDisplayState>>({});

  const formatNextCheck = (nextCheckAt?: string) => {
    if (!nextCheckAt) return "N/A";

    return formatBackendRelativeTime(nextCheckAt);
  };

  const formatUptime = (uptime?: number) => {
    if (typeof uptime !== "number") return "N/A";
    return `${uptime.toFixed(1)}%`;
  };

  const getUptimeColor = (uptime?: number) => {
    if (typeof uptime !== "number") return "text-muted-foreground";
    if (uptime >= 99) return "text-green-500";
    if (uptime >= 95) return "text-yellow-500";
    return "text-red-500";
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const result = await deleteMonitorAction(deleteId);
      if (result.success) {
        toast.success("Monitor deleted", {
          description: "The monitor has been deleted successfully.",
        });
        router.refresh();
      } else {
        toast.error("Failed to delete monitor", {
          description: result.error,
        });
      }
    } catch {
      toast.error("Something went wrong", {
        description: "Please try again later.",
      });
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const getEffectiveState = (monitor: Monitor) =>
    optimisticStates[monitor.id] ?? getMonitorDisplayState(monitor);

  const isPaused = (monitor: Monitor) => getEffectiveState(monitor) === "PAUSED" || !monitor.active;

  const handlePauseResume = async (monitor: Monitor) => {
    const paused = isPaused(monitor);
    setTogglingId(monitor.id);
    setOptimisticStates((current) => ({
      ...current,
      [monitor.id]: paused ? "UNKNOWN" : "PAUSED",
    }));

    try {
      const result = paused
        ? await resumeMonitorAction(monitor.id)
        : await pauseMonitorAction(monitor.id);

      if (result.success) {
        toast.success(paused ? "Monitor resumed" : "Monitor paused", {
          description: paused
            ? "Checks will start running again."
            : "Checks are paused and excluded from uptime.",
        });
        router.refresh();
      } else {
        setOptimisticStates((current) => {
          const next = { ...current };
          delete next[monitor.id];
          return next;
        });
        toast.error("Failed to update monitor", {
          description: result.error,
        });
      }
    } catch {
      setOptimisticStates((current) => {
        const next = { ...current };
        delete next[monitor.id];
        return next;
      });
      toast.error("Something went wrong", {
        description: "Please try again later.",
      });
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg sm:text-xl">All Monitors ({monitors.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Next Check</TableHead>
                  <TableHead>Uptime</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monitors.map((monitor) => {
                  const displayState = getEffectiveState(monitor);
                  const paused = isPaused(monitor);

                  return (
                  <TableRow key={monitor.id}>
                    <TableCell>
                      <MonitorStateBadge state={displayState} active={monitor.active || displayState === "PAUSED"} />
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/monitors/${monitor.id}`}
                        className="font-medium hover:underline"
                      >
                        {monitor.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{monitor.method || "GET"}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground truncate max-w-[300px] block">
                        {monitor.url}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground text-sm">
                        {formatNextCheck(monitor.nextCheckAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm font-medium ${getUptimeColor(monitor.uptimePercentage)}`}>
                        {formatUptime(monitor.uptimePercentage)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/monitors/${monitor.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a
                              href={monitor.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Open URL
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handlePauseResume(monitor)}
                            disabled={togglingId === monitor.id}
                          >
                            {!paused ? (
                              <>
                                <Pause className="mr-2 h-4 w-4" />
                                Pause Monitor
                              </>
                            ) : (
                              <>
                                <Play className="mr-2 h-4 w-4" />
                                Resume Monitor
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteId(monitor.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y">
            {monitors.map((monitor) => {
              const displayState = getEffectiveState(monitor);
              const paused = isPaused(monitor);

              return (
              <div key={monitor.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/monitors/${monitor.id}`}
                      className="font-medium hover:underline block truncate"
                    >
                      {monitor.name}
                    </Link>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {monitor.url}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/monitors/${monitor.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a
                          href={monitor.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open URL
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handlePauseResume(monitor)}
                        disabled={togglingId === monitor.id}
                      >
                        {!paused ? (
                          <>
                            <Pause className="mr-2 h-4 w-4" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Resume
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteId(monitor.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MonitorStateBadge state={displayState} active={monitor.active || displayState === "PAUSED"} className="text-xs" />
                  <Badge variant="outline" className="text-xs">
                    {monitor.method || "GET"}
                  </Badge>
                  <span className={getUptimeColor(monitor.uptimePercentage)}>
                    {formatUptime(monitor.uptimePercentage)} uptime
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Next check {formatNextCheck(monitor.nextCheckAt)}
                </p>
              </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Monitor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive this monitor? It will be removed
              from the active list, while retained history remains on the server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
