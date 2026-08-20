"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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

import { editTcpMonitorAction } from "@/lib/actions/monitors";
import { setMonitorAlertChannelsAction } from "@/lib/actions/alert-channels";
import { formatMilliseconds } from "@/lib/plans";
import { AlertChannel, Monitor, PlanContext } from "@/lib/types";
import { editTcpMonitorSchema, EditTcpMonitorInput } from "@/lib/validations";
import { TagsInput } from "@/components/shared/tags-input";
import { cn } from "@/lib/utils";

const intervalOptions = [
  { value: 10000, label: "10 seconds" },
  { value: 30000, label: "30 seconds" },
  { value: 60000, label: "1 minute" },
  { value: 300000, label: "5 minutes" },
  { value: 600000, label: "10 minutes" },
  { value: 1800000, label: "30 minutes" },
  { value: 3600000, label: "1 hour" },
];

const timeoutOptions = [
  { value: 5000, label: "5 seconds" },
  { value: 10000, label: "10 seconds" },
  { value: 15000, label: "15 seconds" },
  { value: 30000, label: "30 seconds" },
  { value: 60000, label: "60 seconds" },
];

interface EditTcpMonitorDialogProps {
  monitor: Monitor;
  planContext: PlanContext;
  alertChannels?: AlertChannel[];
  selectedChannelIds?: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditTcpMonitorDialog({
  monitor,
  planContext,
  alertChannels = [],
  selectedChannelIds = [],
  open,
  onOpenChange,
  onSuccess,
}: EditTcpMonitorDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [channelIds, setChannelIds] = useState<string[]>(selectedChannelIds);

  const form = useForm<EditTcpMonitorInput>({
    resolver: zodResolver(editTcpMonitorSchema),
    defaultValues: {
      name: monitor.name,
      url: monitor.url ?? "",
      port: monitor.port ?? 443,
      intervalMilliseconds: monitor.intervalMilliseconds,
      timeoutMilliseconds: monitor.timeoutMilliseconds,
      active: monitor.active,
      tags: monitor.tags ?? [],
    },
  });

  useEffect(() => {
    form.reset({
      name: monitor.name,
      url: monitor.url ?? "",
      port: monitor.port ?? 443,
      intervalMilliseconds: monitor.intervalMilliseconds,
      timeoutMilliseconds: monitor.timeoutMilliseconds,
      active: monitor.active,
      tags: monitor.tags ?? [],
    });
    setChannelIds(selectedChannelIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monitor, form]);

  function validatePlanLimits(data: EditTcpMonitorInput) {
    let valid = true;

    if (data.intervalMilliseconds < planContext.plan.minIntervalMs) {
      form.setError("intervalMilliseconds", {
        message: `${formatMilliseconds(data.intervalMilliseconds)} checks are a Pro feature. ${planContext.plan.name} checks as often as every ${formatMilliseconds(planContext.plan.minIntervalMs)}.`,
      });
      valid = false;
    }

    if (data.timeoutMilliseconds > planContext.plan.maxTimeoutMs) {
      form.setError("timeoutMilliseconds", {
        message: `Max timeout on ${planContext.plan.name} is ${formatMilliseconds(planContext.plan.maxTimeoutMs)}.`,
      });
      valid = false;
    }

    return valid;
  }

  async function onSubmit(data: EditTcpMonitorInput) {
    if (!validatePlanLimits(data)) return;

    setIsLoading(true);

    try {
      const result = await editTcpMonitorAction(monitor.id, data);

      if (result.success) {
        const channelsResult = await setMonitorAlertChannelsAction(monitor.id, channelIds);
        if (!channelsResult.success) {
          toast.error("Monitor saved, but alert channels failed to update", {
            description: channelsResult.error,
          });
        } else {
          toast.success("Monitor updated", {
            description: `${data.name} has been updated successfully.`,
          });
        }
        onOpenChange(false);
        onSuccess?.();
      } else if (result.status === 403) {
        toast.error("Plan limit reached", {
          description: result.error || "Upgrade to unlock higher limits.",
        });
      } else {
        toast.error("Failed to update monitor", {
          description: result.error || "Please try again.",
        });
      }
    } catch {
      toast.error("Something went wrong", {
        description: "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function toggleChannel(id: string) {
    setChannelIds((current) =>
      current.includes(id) ? current.filter((c) => c !== id) : [...current, id]
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit TCP Monitor</DialogTitle>
          <DialogDescription>
            Update the configuration for {monitor.name}. Changes take effect on the next check.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Production database" disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Host</FormLabel>
                    <FormControl>
                      <Input placeholder="db.example.com" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormDescription>A bare hostname or IP — no http:// prefix.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="port"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Port</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={65535}
                        disabled={isLoading}
                        value={field.value ?? ""}
                        onChange={(event) => field.onChange(event.target.value ? Number(event.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <TagsInput
                      value={field.value ?? []}
                      onChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {alertChannels.length > 0 ? (
              <div className="space-y-2">
                <FormLabel>Alert channels</FormLabel>
                <FormDescription>
                  Sent alongside email on DOWN/RECOVERY. Manage channels in Settings.
                </FormDescription>
                <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border p-2">
                  {alertChannels.map((channel) => {
                    const checked = channelIds.includes(channel.id);
                    return (
                      <label
                        key={channel.id}
                        className={cn(
                          "flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-muted/60",
                          checked && "bg-accent"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={isLoading}
                          onChange={() => toggleChannel(channel.id)}
                          className="h-4 w-4 rounded border-input"
                        />
                        <span className="min-w-0 flex-1 truncate">{channel.name}</span>
                        <Badge variant="outline" className="shrink-0 text-[10px]">
                          {channel.type}
                        </Badge>
                      </label>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="intervalMilliseconds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check Interval</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value, 10))}
                      value={String(field.value)}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select interval" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {intervalOptions.map((option) => {
                          const locked = option.value < planContext.plan.minIntervalMs;
                          return (
                            <SelectItem key={option.value} value={String(option.value)} disabled={locked}>
                              <span className="flex w-full items-center gap-2">
                                <span>{option.label}</span>
                                {locked ? (
                                  <Badge variant="outline" className="gap-1 text-[10px]">
                                    <Lock className="h-3 w-3" />
                                    Pro
                                  </Badge>
                                ) : null}
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeoutMilliseconds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timeout</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value, 10))}
                      value={String(field.value)}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timeout" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeoutOptions.map((option) => {
                          const locked = option.value > planContext.plan.maxTimeoutMs;
                          return (
                            <SelectItem key={option.value} value={String(option.value)} disabled={locked}>
                              <span className="flex w-full items-center gap-2">
                                <span>{option.label}</span>
                                {locked ? (
                                  <Badge variant="outline" className="gap-1 text-[10px]">
                                    <Lock className="h-3 w-3" />
                                    Pro
                                  </Badge>
                                ) : null}
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
