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
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

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

import { Monitor } from "@/lib/types";
import { deleteMonitorAction, toggleMonitorAction } from "@/lib/actions/monitors";

interface MonitorsTableProps {
  monitors: Monitor[];
}

export function MonitorsTable({ monitors }: MonitorsTableProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

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

  const handleToggle = async (monitor: Monitor) => {
    setTogglingId(monitor.id);
    try {
      const result = await toggleMonitorAction(monitor.id, !monitor.active);
      if (result.success) {
        toast.success(monitor.active ? "Monitor paused" : "Monitor activated", {
          description: monitor.active
            ? "The monitor will stop checking."
            : "The monitor will start checking.",
        });
        router.refresh();
      } else {
        toast.error("Failed to update monitor", {
          description: result.error,
        });
      }
    } catch {
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
                  <TableHead>URL</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monitors.map((monitor) => (
                  <TableRow key={monitor.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {monitor.active ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-500" />
                        )}
                        <Badge variant={monitor.active ? "default" : "secondary"}>
                          {monitor.active ? "Active" : "Paused"}
                        </Badge>
                      </div>
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
                      <span className="text-muted-foreground truncate max-w-[300px] block">
                        {monitor.url}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground text-sm">
                        {monitor.createdAt
                          ? formatDistanceToNow(new Date(monitor.createdAt), {
                              addSuffix: true,
                            })
                          : monitor.nextCheckAt
                          ? `Next: ${new Date(monitor.nextCheckAt).toLocaleString()}`
                          : "N/A"}
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
                            onClick={() => handleToggle(monitor)}
                            disabled={togglingId === monitor.id}
                          >
                            {monitor.active ? (
                              <>
                                <Pause className="mr-2 h-4 w-4" />
                                Pause Monitor
                              </>
                            ) : (
                              <>
                                <Play className="mr-2 h-4 w-4" />
                                Activate Monitor
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
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y">
            {monitors.map((monitor) => (
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
                        onClick={() => handleToggle(monitor)}
                        disabled={togglingId === monitor.id}
                      >
                        {monitor.active ? (
                          <>
                            <Pause className="mr-2 h-4 w-4" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Activate
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
                  <div className="flex items-center gap-1.5">
                    {monitor.active ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-gray-500" />
                    )}
                    <Badge variant={monitor.active ? "default" : "secondary"} className="text-xs">
                      {monitor.active ? "Active" : "Paused"}
                    </Badge>
                  </div>
                  <span className="text-muted-foreground">
                    {monitor.uptimePercentage?.toFixed(1)}% uptime
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Monitor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this monitor? This action cannot be
              undone and all associated logs will be permanently removed.
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

