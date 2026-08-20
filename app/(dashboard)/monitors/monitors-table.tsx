"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  ExternalLink,
  HeartPulse,
  Trash2,
  Eye,
  Pause,
  Play,
  Search,
  X,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { SslExpiryBadge } from "@/components/shared/ssl-expiry-badge";

interface MonitorsTableProps {
  monitors: Monitor[];
}

const statusFilters: { value: string; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "UP", label: "Up" },
  { value: "SUSPECT", label: "Suspect" },
  { value: "DOWN", label: "Down" },
  { value: "PAUSED", label: "Paused" },
  { value: "QUOTA_EXCEEDED", label: "Quota reached" },
];

export function MonitorsTable({ monitors }: MonitorsTableProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [optimisticStates, setOptimisticStates] = useState<Record<string, MonitorDisplayState>>({});

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [isBulkActing, setIsBulkActing] = useState(false);

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
    if (uptime >= 99) return "text-up";
    if (uptime >= 95) return "text-suspect";
    return "text-down";
  };

  const getEffectiveState = (monitor: Monitor) =>
    optimisticStates[monitor.id] ?? getMonitorDisplayState(monitor);

  const isPaused = (monitor: Monitor) => getEffectiveState(monitor) === "PAUSED" || !monitor.active;
  const isQuotaBlocked = (monitor: Monitor) => getEffectiveState(monitor) === "QUOTA_EXCEEDED";

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    monitors.forEach((monitor) => monitor.tags?.forEach((tag) => tags.add(tag)));
    return Array.from(tags).sort();
  }, [monitors]);

  const filteredMonitors = useMemo(() => {
    const query = search.trim().toLowerCase();
    return monitors.filter((monitor) => {
      if (query && !monitor.name.toLowerCase().includes(query) && !(monitor.url ?? "").toLowerCase().includes(query)) {
        return false;
      }
      if (statusFilter !== "all" && getEffectiveState(monitor) !== statusFilter) {
        return false;
      }
      if (tagFilter !== "all" && !monitor.tags?.includes(tagFilter)) {
        return false;
      }
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monitors, search, statusFilter, tagFilter, optimisticStates]);

  const hasFilters = search.trim() !== "" || statusFilter !== "all" || tagFilter !== "all";

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setTagFilter("all");
  }

  function toggleSelected(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const allFilteredSelected =
    filteredMonitors.length > 0 && filteredMonitors.every((m) => selectedIds.has(m.id));

  function toggleSelectAll() {
    setSelectedIds((current) => {
      if (allFilteredSelected) {
        const next = new Set(current);
        filteredMonitors.forEach((m) => next.delete(m.id));
        return next;
      }
      const next = new Set(current);
      filteredMonitors.forEach((m) => next.add(m.id));
      return next;
    });
  }

  const selectedMonitors = monitors.filter((m) => selectedIds.has(m.id));

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

  const handlePauseResume = async (monitor: Monitor) => {
    if (isQuotaBlocked(monitor)) {
      toast.error("Monthly check limit reached", {
        description: "Monitoring resumes when the month resets, or after an upgrade.",
      });
      return;
    }

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

  async function handleBulkPauseResume(action: "pause" | "resume") {
    const targets = selectedMonitors.filter((m) =>
      action === "pause" ? !isPaused(m) : isPaused(m)
    );
    if (targets.length === 0) return;

    setIsBulkActing(true);
    try {
      const results = await Promise.all(
        targets.map((m) => (action === "pause" ? pauseMonitorAction(m.id) : resumeMonitorAction(m.id)))
      );
      const failed = results.filter((r) => !r.success).length;
      if (failed > 0) {
        toast.error(`${failed} of ${targets.length} monitors failed to update`);
      } else {
        toast.success(
          action === "pause" ? `Paused ${targets.length} monitors` : `Resumed ${targets.length} monitors`
        );
      }
      router.refresh();
    } catch {
      toast.error("Something went wrong", { description: "Please try again later." });
    } finally {
      setIsBulkActing(false);
    }
  }

  async function handleBulkDelete() {
    setIsBulkActing(true);
    try {
      const results = await Promise.all(selectedMonitors.map((m) => deleteMonitorAction(m.id)));
      const failed = results.filter((r) => !r.success).length;
      if (failed > 0) {
        toast.error(`${failed} of ${selectedMonitors.length} monitors failed to delete`);
      } else {
        toast.success(`Deleted ${selectedMonitors.length} monitors`);
      }
      setSelectedIds(new Set());
      router.refresh();
    } catch {
      toast.error("Something went wrong", { description: "Please try again later." });
    } finally {
      setIsBulkActing(false);
      setBulkDeleteOpen(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="gap-3 pb-3">
          <CardTitle className="text-lg sm:text-xl">
            All Monitors ({filteredMonitors.length}
            {filteredMonitors.length !== monitors.length ? ` of ${monitors.length}` : ""})
          </CardTitle>

          {selectedIds.size > 0 ? (
            <div className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/40 px-3 py-2">
              <span className="text-sm font-medium">{selectedIds.size} selected</span>
              <div className="ml-auto flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isBulkActing}
                  onClick={() => handleBulkPauseResume("pause")}
                >
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isBulkActing}
                  onClick={() => handleBulkPauseResume("resume")}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Resume
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isBulkActing}
                  onClick={() => setBulkDeleteOpen(true)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isBulkActing}
                  onClick={() => setSelectedIds(new Set())}
                >
                  Clear
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name or URL"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusFilters.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableTags.length > 0 ? (
                <Select value={tagFilter} onValueChange={setTagFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All tags</SelectItem>
                    {availableTags.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}
              {hasFilters ? (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="mr-1 h-4 w-4" />
                  Clear
                </Button>
              ) : null}
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {filteredMonitors.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No monitors match your filters.
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]">
                        <input
                          type="checkbox"
                          checked={allFilteredSelected}
                          onChange={toggleSelectAll}
                          className="h-4 w-4 rounded border-input"
                          aria-label="Select all monitors"
                        />
                      </TableHead>
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
                    {filteredMonitors.map((monitor) => {
                      const displayState = getEffectiveState(monitor);
                      const paused = isPaused(monitor);
                      const quotaBlocked = isQuotaBlocked(monitor);

                      return (
                      <TableRow key={monitor.id} data-state={selectedIds.has(monitor.id) ? "selected" : undefined}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(monitor.id)}
                            onChange={() => toggleSelected(monitor.id)}
                            className="h-4 w-4 rounded border-input"
                            aria-label={`Select ${monitor.name}`}
                          />
                        </TableCell>
                        <TableCell>
                          <MonitorStateBadge state={displayState} active={monitor.active || displayState === "PAUSED" || displayState === "QUOTA_EXCEEDED"} />
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/monitors/${monitor.id}`}
                            className="font-medium hover:underline"
                          >
                            {monitor.name}
                          </Link>
                          {(monitor.tags && monitor.tags.length > 0) || monitor.sslCertExpiresAt ? (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {monitor.tags?.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-[10px] font-normal">
                                  {tag}
                                </Badge>
                              ))}
                              <SslExpiryBadge sslCertExpiresAt={monitor.sslCertExpiresAt} />
                            </div>
                          ) : null}
                        </TableCell>
                        <TableCell>
                          {monitor.kind === "HEARTBEAT" ? (
                            <Badge variant="outline" className="gap-1">
                              <HeartPulse className="h-3 w-3" />
                              Heartbeat
                            </Badge>
                          ) : (
                            <Badge variant="outline">{monitor.method || "GET"}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground truncate max-w-[300px] block">
                            {monitor.kind === "HEARTBEAT" ? "Waiting for pings" : monitor.url}
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
                              {monitor.url ? (
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
                              ) : null}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handlePauseResume(monitor)}
                                disabled={togglingId === monitor.id || quotaBlocked}
                              >
                                {quotaBlocked ? (
                                  <>
                                    <Pause className="mr-2 h-4 w-4" />
                                    Monthly quota reached
                                  </>
                                ) : !paused ? (
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
                {filteredMonitors.map((monitor) => {
                  const displayState = getEffectiveState(monitor);
                  const paused = isPaused(monitor);
                  const quotaBlocked = isQuotaBlocked(monitor);

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
                          {monitor.kind === "HEARTBEAT" ? "Waiting for pings" : monitor.url}
                        </p>
                        {(monitor.tags && monitor.tags.length > 0) || monitor.sslCertExpiresAt ? (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {monitor.tags?.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-[10px] font-normal">
                                {tag}
                              </Badge>
                            ))}
                            <SslExpiryBadge sslCertExpiresAt={monitor.sslCertExpiresAt} />
                          </div>
                        ) : null}
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
                          {monitor.url ? (
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
                          ) : null}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handlePauseResume(monitor)}
                            disabled={togglingId === monitor.id || quotaBlocked}
                          >
                            {quotaBlocked ? (
                              <>
                                <Pause className="mr-2 h-4 w-4" />
                                Monthly quota reached
                              </>
                            ) : !paused ? (
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
                      <MonitorStateBadge state={displayState} active={monitor.active || displayState === "PAUSED" || displayState === "QUOTA_EXCEEDED"} className="text-xs" />
                      <Badge variant="outline" className="gap-1 text-xs">
                        {monitor.kind === "HEARTBEAT" ? (
                          <>
                            <HeartPulse className="h-3 w-3" />
                            Heartbeat
                          </>
                        ) : (
                          monitor.method || "GET"
                        )}
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
            </>
          )}
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

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} monitors</AlertDialogTitle>
            <AlertDialogDescription>
              These monitors will be archived and removed from the active list, while
              their history remains on the server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkActing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isBulkActing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isBulkActing ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
