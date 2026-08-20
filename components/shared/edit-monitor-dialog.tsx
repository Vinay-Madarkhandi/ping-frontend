"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Lock, Plus, X } from "lucide-react";

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

import { editMonitorAction } from "@/lib/actions/monitors";
import { formatMilliseconds } from "@/lib/plans";
import { Monitor, PlanContext } from "@/lib/types";
import { editMonitorSchema, EditMonitorInput } from "@/lib/validations";

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

interface EditMonitorDialogProps {
  monitor: Monitor;
  planContext: PlanContext;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditMonitorDialog({
  monitor,
  planContext,
  open,
  onOpenChange,
  onSuccess,
}: EditMonitorDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [headers, setHeaders] = useState<Array<{ key: string; value: string }>>([
    { key: "", value: "" },
  ]);

  const form = useForm<EditMonitorInput>({
    resolver: zodResolver(editMonitorSchema),
    defaultValues: {
      name: monitor.name,
      url: monitor.url,
      intervalMilliseconds: monitor.intervalMilliseconds,
      timeoutMilliseconds: monitor.timeoutMilliseconds,
      monitorMethod: monitor.method,
      followRedirects: true,
      active: monitor.active,
    },
  });

  // Reset form when monitor changes
  useEffect(() => {
    form.reset({
      name: monitor.name,
      url: monitor.url,
      intervalMilliseconds: monitor.intervalMilliseconds,
      timeoutMilliseconds: monitor.timeoutMilliseconds,
      monitorMethod: monitor.method,
      followRedirects: true,
      active: monitor.active,
    });
    setHeaders([{ key: "", value: "" }]);
  }, [monitor, form]);

  function validatePlanLimits(data: EditMonitorInput) {
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

  async function onSubmit(data: EditMonitorInput) {
    if (!validatePlanLimits(data)) return;

    setIsLoading(true);

    try {
      const customHeaders = Object.fromEntries(
        headers
          .map((header) => [header.key.trim(), header.value.trim()])
          .filter(([key, value]) => key && value)
      );

      const payload: EditMonitorInput = {
        ...data,
        keyword: data.keyword?.trim() || undefined,
        customHeaders: Object.keys(customHeaders).length > 0 ? customHeaders : undefined,
      };

      const result = await editMonitorAction(monitor.id, payload);

      if (result.success) {
        toast.success("Monitor updated", {
          description: `${data.name} has been updated successfully.`,
        });
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Monitor</DialogTitle>
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
                    <Input placeholder="My Website" disabled={isLoading} {...field} />
                  </FormControl>
                  <FormDescription>A friendly name to identify this monitor</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" disabled={isLoading} {...field} />
                  </FormControl>
                  <FormDescription>The URL to monitor</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="monitorMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>HTTP Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
            </div>

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

            <details className="rounded-lg border bg-muted/20 p-3">
              <summary className="cursor-pointer text-sm font-medium">Advanced options</summary>
              <div className="mt-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="expectedStatusCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected status code</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            inputMode="numeric"
                            min={100}
                            max={599}
                            placeholder="Any 2xx/3xx"
                            disabled={isLoading}
                            value={field.value ?? ""}
                            onChange={(event) => {
                              const value = event.target.value;
                              field.onChange(value ? Number(value) : undefined);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="keyword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Required keyword</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Optional"
                            disabled={isLoading}
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="followRedirects"
                  render={({ field }) => (
                    <FormItem className="flex items-start gap-3 rounded-md border bg-background p-3">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value ?? true}
                          disabled={isLoading}
                          onChange={(event) => field.onChange(event.target.checked)}
                          className="mt-1 h-4 w-4 rounded border-input"
                        />
                      </FormControl>
                      <div className="space-y-1">
                        <FormLabel>Follow redirects</FormLabel>
                        <FormDescription>
                          Keep enabled unless redirects should count as failures
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <div>
                    <FormLabel>Custom headers</FormLabel>
                    <FormDescription>Optional request headers sent with each check</FormDescription>
                  </div>
                  <div className="space-y-2">
                    {headers.map((header, index) => (
                      <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                        <Input
                          placeholder="Header name"
                          disabled={isLoading}
                          value={header.key}
                          onChange={(event) => {
                            const next = [...headers];
                            next[index] = { ...next[index], key: event.target.value };
                            setHeaders(next);
                          }}
                        />
                        <Input
                          placeholder="Header value"
                          disabled={isLoading}
                          value={header.value}
                          onChange={(event) => {
                            const next = [...headers];
                            next[index] = { ...next[index], value: event.target.value };
                            setHeaders(next);
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={isLoading || headers.length === 1}
                          onClick={() => setHeaders((current) => current.filter((_, i) => i !== index))}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove header</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    onClick={() => setHeaders((current) => [...current, { key: "", value: "" }])}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add header
                  </Button>
                </div>
              </div>
            </details>

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
