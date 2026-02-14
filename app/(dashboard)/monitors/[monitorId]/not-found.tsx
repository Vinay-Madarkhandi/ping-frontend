import Link from "next/link";
import { Server } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MonitorNotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-muted">
              <Server className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <CardTitle>Monitor not found</CardTitle>
          <CardDescription>
            The monitor you&apos;re looking for doesn&apos;t exist or has been deleted.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button asChild>
            <Link href="/monitors">View all monitors</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

