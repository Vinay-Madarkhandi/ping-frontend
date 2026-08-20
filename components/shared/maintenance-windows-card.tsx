"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { CalendarClock, Loader2, Plus, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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

import {
  createMaintenanceWindowAction,
  cancelMaintenanceWindowAction,
} from "@/lib/actions/maintenance-windows";
import { maintenanceWindowSchema, MaintenanceWindowInput } from "@/lib/validations";
import { MaintenanceWindow } from "@/lib/types";
import { formatBackendDateTime } from "@/lib/datetime";

const DATETIME_LOCAL_FORMAT = "yyyy-MM-dd'T'HH:mm";

function defaultWindow(): MaintenanceWindowInput {
  const now = new Date();
  const start = new Date(now.getTime() + 60 * 60 * 1000);
  const end = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  return {
    title: "",
    startsAt: format(start, DATETIME_LOCAL_FORMAT),
    endsAt: format(end, DATETIME_LOCAL_FORMAT),
  };
}

function statusBadge(window: MaintenanceWindow) {
  if (window.active) {
    return <Badge className="bg-paused/15 text-paused hover:bg-paused/15">Active</Badge>;
  }
  if (window.completed) {
    return <Badge variant="secondary">Completed</Badge>;
  }
  return <Badge variant="outline">Upcoming</Badge>;
}

export function MaintenanceWindowsCard({
  monitorId,
  windows,
}: {
  monitorId: string;
  windows: MaintenanceWindow[];
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<MaintenanceWindow | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const form = useForm<MaintenanceWindowInput>({
    resolver: zodResolver(maintenanceWindowSchema),
    defaultValues: defaultWindow(),
  });

  async function onSubmit(data: MaintenanceWindowInput) {
    setIsLoading(true);
    try {
      const result = await createMaintenanceWindowAction(monitorId, data);
      if (result.success) {
        toast.success("Maintenance window scheduled");
        setFormOpen(false);
        form.reset(defaultWindow());
        router.refresh();
      } else {
        toast.error("Failed to schedule maintenance window", { description: result.error });
      }
    } catch {
      toast.error("Something went wrong", { description: "Please try again later." });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCancel() {
    if (!cancelTarget) return;
    setIsCancelling(true);
    try {
      const result = await cancelMaintenanceWindowAction(monitorId, cancelTarget.id);
      if (result.success) {
        toast.success(cancelTarget.active ? "Maintenance ended" : "Maintenance window cancelled");
        router.refresh();
      } else {
        toast.error("Failed to cancel", { description: result.error });
      }
    } catch {
      toast.error("Something went wrong", { description: "Please try again later." });
    } finally {
      setIsCancelling(false);
      setCancelTarget(null);
    }
  }

  const upcomingOrActive = windows.filter((w) => !w.completed);
  const past = windows.filter((w) => w.completed);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
          <div>
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-md bg-muted">
              <CalendarClock className="h-5 w-5" />
            </div>
            <CardTitle className="text-base">Maintenance Windows</CardTitle>
            <CardDescription>
              Automatically paused — no checks, no alerts, excluded from uptime — for the span you schedule.
            </CardDescription>
          </div>
          <Button size="sm" variant="outline" onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Schedule
          </Button>
        </CardHeader>
        <CardContent>
          {windows.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No maintenance windows scheduled.
            </p>
          ) : (
            <div className="space-y-2">
              {[...upcomingOrActive, ...past].map((window) => (
                <div
                  key={window.id}
                  className="flex items-center justify-between gap-2 rounded-md border px-3 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {statusBadge(window)}
                      <span className="truncate text-sm font-medium">
                        {window.title || "Maintenance"}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatBackendDateTime(window.startsAt, "MMM d, HH:mm")} &ndash;{" "}
                      {formatBackendDateTime(window.endsAt, "MMM d, HH:mm")}
                    </p>
                  </div>
                  {!window.completed ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCancelTarget(window)}
                      className="shrink-0 text-destructive hover:text-destructive"
                      title={window.active ? "End maintenance now" : "Cancel"}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Schedule maintenance</DialogTitle>
            <DialogDescription>
              This monitor is automatically paused for the scheduled span — no checks run, no
              alerts fire, and the time is excluded from uptime.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Database migration" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormDescription>Optional — helps you tell windows apart later.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="startsAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Starts</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" disabled={isLoading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endsAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ends</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" disabled={isLoading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Schedule
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormOpen(false)}
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!cancelTarget} onOpenChange={() => setCancelTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {cancelTarget?.active ? "End maintenance now?" : "Cancel maintenance window?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {cancelTarget?.active
                ? "Monitoring resumes immediately for “" + (cancelTarget?.title || "Maintenance") + "”."
                : "“" + (cancelTarget?.title || "Maintenance") + "” will be removed from the schedule."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={isCancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCancelling ? "Working..." : cancelTarget?.active ? "End now" : "Cancel window"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
