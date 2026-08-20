"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Globe, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

import { Monitor, StatusPage } from "@/lib/types";
import { deleteStatusPageAction } from "@/lib/actions/status-pages";
import { StatusPageFormDialog } from "@/components/shared/status-page-form-dialog";

interface StatusPagesClientProps {
  statusPages: StatusPage[];
  monitors: Monitor[];
}

export function StatusPagesClient({ statusPages, monitors }: StatusPagesClientProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<StatusPage | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<StatusPage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function openCreate() {
    setEditing(undefined);
    setFormOpen(true);
  }

  function openEdit(page: StatusPage) {
    setEditing(page);
    setFormOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const result = await deleteStatusPageAction(deleteTarget.id);
      if (result.success) {
        toast.success("Status page deleted");
        router.refresh();
      } else {
        toast.error("Failed to delete status page", { description: result.error });
      }
    } catch {
      toast.error("Something went wrong", { description: "Please try again later." });
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Status Pages</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Share the live status of your monitors on a public page.
          </p>
        </div>
        <Button onClick={openCreate} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          New Status Page
        </Button>
      </div>

      {statusPages.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 sm:py-16 px-4">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 sm:h-20 sm:w-20">
              <Globe className="h-7 w-7 text-primary sm:h-9 sm:w-9" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 text-center">No status pages yet</h3>
            <p className="text-sm sm:text-base text-muted-foreground text-center mb-6 max-w-md">
              Create a public status page to keep your users informed without
              giving away your monitor URLs or configuration.
            </p>
            <Button onClick={openCreate} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              New Status Page
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statusPages.map((page) => (
            <Card key={page.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-2 pb-3">
                <div className="min-w-0 flex-1">
                  <CardTitle className="truncate text-lg">{page.title}</CardTitle>
                  <Link
                    href={`/status/${page.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 flex items-center gap-1 text-sm text-muted-foreground hover:text-primary hover:underline"
                  >
                    /status/{page.slug}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(page)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDeleteTarget(page)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="space-y-3">
                {page.description ? (
                  <p className="line-clamp-2 text-sm text-muted-foreground">{page.description}</p>
                ) : null}
                <div className="flex flex-wrap gap-1.5">
                  {page.monitors.length === 0 ? (
                    <span className="text-xs text-muted-foreground">No monitors added</span>
                  ) : (
                    page.monitors.slice(0, 4).map((monitor) => (
                      <Badge key={monitor.id} variant="outline" className="text-xs">
                        {monitor.name}
                      </Badge>
                    ))
                  )}
                  {page.monitors.length > 4 ? (
                    <Badge variant="outline" className="text-xs">
                      +{page.monitors.length - 4} more
                    </Badge>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <StatusPageFormDialog
        monitors={monitors}
        statusPage={editing}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={() => router.refresh()}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete status page</AlertDialogTitle>
            <AlertDialogDescription>
              This removes &ldquo;{deleteTarget?.title}&rdquo; and its public URL. This
              can&apos;t be undone.
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
