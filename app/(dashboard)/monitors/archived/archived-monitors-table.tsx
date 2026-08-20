"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Monitor } from "@/lib/types";
import { restoreMonitorAction } from "@/lib/actions/monitors";

interface ArchivedMonitorsTableProps {
  monitors: Monitor[];
}

export function ArchivedMonitorsTable({ monitors }: ArchivedMonitorsTableProps) {
  const router = useRouter();
  const [restoringId, setRestoringId] = useState<string | null>(null);

  async function handleRestore(monitorId: string, name: string) {
    setRestoringId(monitorId);

    try {
      const result = await restoreMonitorAction(monitorId);

      if (result.success) {
        toast.success("Monitor restored", {
          description: `${name} has been restored and will resume monitoring.`,
        });
        router.refresh();
      } else if (result.status === 403) {
        toast.error("Plan limit reached", {
          description: result.error || "Upgrade to add more monitors.",
        });
      } else {
        toast.error("Failed to restore monitor", {
          description: result.error || "Please try again.",
        });
      }
    } catch {
      toast.error("Something went wrong", {
        description: "Please try again later.",
      });
    } finally {
      setRestoringId(null);
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden sm:table-cell">URL</TableHead>
            <TableHead className="hidden md:table-cell">Archived</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {monitors.map((monitor) => (
            <TableRow key={monitor.id}>
              <TableCell className="font-medium">
                <div>
                  <div>{monitor.name}</div>
                  <div className="text-xs text-muted-foreground sm:hidden">
                    {monitor.url}
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <div className="max-w-xs truncate text-sm">{monitor.url}</div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="text-sm text-muted-foreground">
                  {monitor.createdAt
                    ? format(new Date(monitor.createdAt), "MMM d, yyyy")
                    : "—"}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRestore(monitor.id, monitor.name)}
                  disabled={restoringId === monitor.id}
                >
                  {restoringId === monitor.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Restoring...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Restore
                    </>
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
