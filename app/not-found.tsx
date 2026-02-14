import Link from "next/link";
import { FileQuestion } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4 text-center">
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-muted">
        <FileQuestion className="h-10 w-10 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Page not found</h1>
        <p className="text-muted-foreground max-w-md">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have
          been moved or doesn&apos;t exist.
        </p>
      </div>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  );
}

