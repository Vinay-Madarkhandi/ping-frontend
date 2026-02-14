import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function MonitorDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-[200px]" />
              <Skeleton className="h-5 w-[60px]" />
            </div>
            <Skeleton className="h-4 w-[300px]" />
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[100px] mb-2" />
              <Skeleton className="h-3 w-[150px]" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[100px]" />
          <Skeleton className="h-4 w-[200px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Table Header */}
            <div className="flex gap-4 pb-4 border-b">
              <Skeleton className="h-4 w-[60px]" />
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-4 w-[80px]" />
            </div>
            {/* Table Rows */}
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-5 w-[40px]" />
                </div>
                <Skeleton className="h-5 w-[50px]" />
                <Skeleton className="h-4 w-[60px]" />
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-4 w-[30px]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

