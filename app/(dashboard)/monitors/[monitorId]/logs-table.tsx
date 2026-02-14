"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { CheckCircle2, XCircle, Clock, Zap } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MonitorLog, PaginatedResponse } from "@/lib/types";

interface LogsTableProps {
  logs: PaginatedResponse<MonitorLog>;
  monitorId: string;
}

export function LogsTable({ logs, monitorId }: LogsTableProps) {
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "0", 10);

  const getResponseTimeColor = (ms: number) => {
    if (ms < 200) return "text-green-500";
    if (ms < 500) return "text-yellow-500";
    if (ms < 1000) return "text-orange-500";
    return "text-red-500";
  };

  const getStatusCodeColor = (code: number) => {
    if (code >= 200 && code < 300) return "bg-green-500/10 text-green-500";
    if (code >= 300 && code < 400) return "bg-blue-500/10 text-blue-500";
    if (code >= 400 && code < 500) return "bg-yellow-500/10 text-yellow-500";
    return "bg-red-500/10 text-red-500";
  };

  return (
    <Card>
      <CardHeader className="pb-2 sm:pb-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base sm:text-lg">Check Logs</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Showing {logs.content.length} of {logs.totalElements} total checks
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 sm:p-6 sm:pt-0">
        {logs.content.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center px-4">
            <Clock className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-4" />
            <h3 className="text-base sm:text-lg font-semibold mb-2">No logs yet</h3>
            <p className="text-sm text-muted-foreground">
              Logs will appear here once the monitor starts checking.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Response Code</TableHead>
                    <TableHead>Response Time</TableHead>
                    <TableHead>Checked At</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                {logs.content.map((log, index) => (
                  <TableRow key={`${log.checkedAt}-${index}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {log.up ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <Badge variant={log.up ? "default" : "destructive"}>
                          {log.up ? "Up" : "Down"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusCodeColor(log.statusCode)}
                      >
                        {log.statusCode}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Zap className={`h-3 w-3 ${getResponseTimeColor(log.responseTimeInMilli)}`} />
                        <span className={getResponseTimeColor(log.responseTimeInMilli)}>
                          {log.responseTimeInMilli}ms
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground text-sm">
                        {format(new Date(log.checkedAt), "MMM d, yyyy HH:mm:ss")}
                      </span>
                    </TableCell>
                    <TableCell>
                      {log.errorMessage ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-destructive text-sm truncate max-w-[200px] block cursor-help">
                              {log.errorMessage}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="max-w-sm">
                            <p>{log.errorMessage}</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y">
              {logs.content.map((log, index) => (
                <div key={`mobile-${log.checkedAt}-${index}`} className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {log.up ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <Badge variant={log.up ? "default" : "destructive"} className="text-xs">
                        {log.up ? "Up" : "Down"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getStatusCodeColor(log.statusCode)}`}
                      >
                        {log.statusCode}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className={`h-3 w-3 ${getResponseTimeColor(log.responseTimeInMilli)}`} />
                      <span className={`text-xs ${getResponseTimeColor(log.responseTimeInMilli)}`}>
                        {log.responseTimeInMilli}ms
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{format(new Date(log.checkedAt), "MMM d, HH:mm:ss")}</span>
                    {log.errorMessage && (
                      <span className="text-destructive truncate max-w-[150px]">
                        {log.errorMessage}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {logs.totalPages > 1 && (
              <div className="flex items-center justify-between p-3 sm:p-0 sm:mt-4 sm:pt-4 border-t">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Page {logs.number + 1} of {logs.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={logs.first}
                    asChild={!logs.first}
                    className="text-xs sm:text-sm h-8"
                  >
                    {logs.first ? (
                      <span>Prev</span>
                    ) : (
                      <Link href={`/monitors/${monitorId}?page=${currentPage - 1}`}>
                        Prev
                      </Link>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={logs.last}
                    asChild={!logs.last}
                    className="text-xs sm:text-sm h-8"
                  >
                    {logs.last ? (
                      <span>Next</span>
                    ) : (
                      <Link href={`/monitors/${monitorId}?page=${currentPage + 1}`}>
                        Next
                      </Link>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

