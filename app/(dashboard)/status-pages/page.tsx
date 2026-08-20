import { Card, CardContent } from "@/components/ui/card";
import { getStatusPages } from "@/lib/api/status-pages";
import { getMonitors } from "@/lib/api/monitors";
import { StatusPagesClient } from "./status-pages-client";

export default async function StatusPagesPage() {
  const [statusPagesResult, monitorsResult] = await Promise.all([
    getStatusPages(),
    getMonitors(),
  ]);

  const { data: statusPages, error } = statusPagesResult;

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="py-8 text-center">
          <p className="text-destructive font-medium">Error loading status pages</p>
          <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <StatusPagesClient
        statusPages={statusPages ?? []}
        monitors={monitorsResult.data ?? []}
      />
    </div>
  );
}
