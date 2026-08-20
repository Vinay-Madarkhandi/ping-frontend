"use client";

import { format } from "date-fns";
import { CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginatedResponse, AlertDelivery } from "@/lib/types";

interface AlertHistoryTableProps {
  alerts: PaginatedResponse<AlertDelivery>;
}

function StatusBadge({ status }: { status: AlertDelivery["status"] }) {
  switch (status) {
    case "SENT":
      return (
        <Badge variant="default" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Sent
        </Badge>
      );
    case "FAILED":
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Failed
        </Badge>
      );
    case "PENDING":
      return (
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
  }
}

function AlertTypeBadge({ alertType }: { alertType: AlertDelivery["alertType"] }) {
  if (alertType === "DOWN") {
    return (
      <Badge variant="outline" className="gap-1 border-destructive text-destructive">
        <AlertTriangle className="h-3 w-3" />
        Down
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1 border-green-600 text-green-600">
      <CheckCircle2 className="h-3 w-3" />
      Recovery
    </Badge>
  );
}

export function AlertHistoryTable({ alerts }: AlertHistoryTableProps) {
  const { content, number, totalPages } = alerts;

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Monitor</TableHead>
              <TableHead className="hidden md:table-cell">Type</TableHead>
              <TableHead className="hidden sm:table-cell">Recipient</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Sent</TableHead>
              <TableHead className="hidden xl:table-cell">Attempts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {content.map((alert) => (
              <TableRow key={alert.id}>
                <TableCell>
                  <div>
                    <Link
                      href={`/monitors/${alert.monitorId}`}
                      className="font-medium hover:underline"
                    >
                      {alert.monitorName}
                    </Link>
                    <div className="text-xs text-muted-foreground md:hidden mt-1">
                      <AlertTypeBadge alertType={alert.alertType} />
                    </div>
                    {alert.lastError && (
                      <div className="text-xs text-destructive mt-1">
                        {alert.lastError}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <AlertTypeBadge alertType={alert.alertType} />
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <div className="max-w-xs truncate text-sm">{alert.recipient}</div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={alert.status} />
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="text-sm text-muted-foreground">
                    {alert.sentAt
                      ? format(new Date(alert.sentAt), "MMM d, yyyy HH:mm")
                      : format(new Date(alert.createdAt), "MMM d, yyyy HH:mm")}
                  </div>
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <div className="text-sm text-muted-foreground">
                    {alert.attempts} {alert.attempts === 1 ? "attempt" : "attempts"}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {number + 1} of {totalPages}
          </div>
          <div className="flex gap-2">
            {number > 0 && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/alerts?page=${number - 1}`}>Previous</Link>
              </Button>
            )}
            {number < totalPages - 1 && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/alerts?page=${number + 1}`}>Next</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
