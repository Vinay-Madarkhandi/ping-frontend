"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus, Radio, Send, Trash2, Webhook } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  createAlertChannelAction,
  deleteAlertChannelAction,
  testAlertChannelAction,
} from "@/lib/actions/alert-channels";
import { alertChannelSchema, AlertChannelInput } from "@/lib/validations";
import { AlertChannel } from "@/lib/types";

const typeLabel: Record<AlertChannel["type"], string> = {
  WEBHOOK: "Webhook",
  SLACK: "Slack",
  DISCORD: "Discord",
};

export function AlertChannelsSettings({ channels }: { channels: AlertChannel[] }) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AlertChannel | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AlertChannelInput>({
    resolver: zodResolver(alertChannelSchema),
    defaultValues: { type: "WEBHOOK", name: "", targetUrl: "" },
  });

  async function onSubmit(data: AlertChannelInput) {
    setIsLoading(true);
    try {
      const result = await createAlertChannelAction(data);
      if (result.success) {
        toast.success("Alert channel added");
        setFormOpen(false);
        form.reset({ type: "WEBHOOK", name: "", targetUrl: "" });
        router.refresh();
      } else {
        toast.error("Failed to add alert channel", { description: result.error });
      }
    } catch {
      toast.error("Something went wrong", { description: "Please try again later." });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleTest(channel: AlertChannel) {
    setTestingId(channel.id);
    try {
      const result = await testAlertChannelAction(channel.id);
      if (result.success && result.data) {
        if (result.data.success) {
          toast.success("Test alert sent", { description: result.data.message });
        } else {
          toast.error("Test alert failed", { description: result.data.message });
        }
      } else {
        toast.error("Failed to send test alert", { description: result.error });
      }
    } catch {
      toast.error("Something went wrong", { description: "Please try again later." });
    } finally {
      setTestingId(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const result = await deleteAlertChannelAction(deleteTarget.id);
      if (result.success) {
        toast.success("Alert channel removed");
        router.refresh();
      } else {
        toast.error("Failed to remove alert channel", { description: result.error });
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
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
          <div>
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-md bg-muted">
              <Webhook className="h-5 w-5" />
            </div>
            <CardTitle className="text-base">Alert Channels</CardTitle>
            <CardDescription>
              Webhook, Slack, or Discord destinations. Attach them to a monitor from its edit dialog.
            </CardDescription>
          </div>
          <Button size="sm" variant="outline" onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
        </CardHeader>
        <CardContent>
          {channels.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No alert channels yet. Email alerts still work without one.
            </p>
          ) : (
            <div className="space-y-2">
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  className="flex items-center justify-between gap-2 rounded-md border px-3 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="gap-1 text-xs">
                        <Radio className="h-3 w-3" />
                        {typeLabel[channel.type]}
                      </Badge>
                      <span className="truncate text-sm font-medium">{channel.name}</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {channel.targetUrl}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={testingId === channel.id}
                      onClick={() => handleTest(channel)}
                      title="Send test alert"
                    >
                      {testingId === channel.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTarget(channel)}
                      className="text-destructive hover:text-destructive"
                      title="Remove channel"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>New alert channel</DialogTitle>
            <DialogDescription>
              Paste a Slack incoming webhook, Discord webhook, or any URL that accepts a POST.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="WEBHOOK">Generic webhook</SelectItem>
                        <SelectItem value="SLACK">Slack</SelectItem>
                        <SelectItem value="DISCORD">Discord</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="#alerts" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormDescription>A label to recognize this channel by.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://hooks.slack.com/services/..."
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add channel
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

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove alert channel</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleteTarget?.name}&rdquo; will stop receiving alerts from any monitor
              using it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
