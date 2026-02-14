"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MonitorDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Monitor detail error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-destructive/10">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <CardTitle>Failed to load monitor</CardTitle>
          <CardDescription>
            We couldn&apos;t load this monitor&apos;s details. The monitor may not exist or there was a connection issue.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/monitors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Monitors
            </Link>
          </Button>
          <Button onClick={reset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

