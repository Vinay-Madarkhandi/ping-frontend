"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

import { createHeartbeatMonitorAction } from "@/lib/actions/monitors";
import { formatMilliseconds, formatNumber, isMonitorLimitReached } from "@/lib/plans";
import { PlanContext } from "@/lib/types";
import { createHeartbeatMonitorSchema, CreateHeartbeatMonitorInput } from "@/lib/validations";
import { TagsInput } from "@/components/shared/tags-input";

const intervalOptions = [
  { value: 60000, label: "1 minute" },
  { value: 300000, label: "5 minutes" },
  { value: 600000, label: "10 minutes" },
  { value: 1800000, label: "30 minutes" },
  { value: 3600000, label: "1 hour" },
  { value: 21600000, label: "6 hours" },
  { value: 86400000, label: "24 hours" },
];

const graceOptions = [
  { value: 0, label: "None" },
  { value: 60000, label: "1 minute" },
  { value: 300000, label: "5 minutes" },
  { value: 600000, label: "10 minutes" },
  { value: 1800000, label: "30 minutes" },
];

function getDefaultInterval(minIntervalMs: number) {
  return intervalOptions.find((option) => option.value >= minIntervalMs)?.value ?? minIntervalMs;
}

export function CreateHeartbeatMonitorForm({ planContext }: { planContext: PlanContext }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const limitReached = isMonitorLimitReached(planContext);

  const defaultValues = useMemo<CreateHeartbeatMonitorInput>(
    () => ({
      name: "",
      intervalMilliseconds: getDefaultInterval(planContext.plan.minIntervalMs),
      timeoutMilliseconds: planContext.plan.maxTimeoutMs,
      gracePeriodMilliseconds: 0,
      tags: [],
    }),
    [planContext.plan.maxTimeoutMs, planContext.plan.minIntervalMs]
  );

  const form = useForm<CreateHeartbeatMonitorInput>({
    resolver: zodResolver(createHeartbeatMonitorSchema),
    defaultValues,
  });

  function validatePlanLimits(data: CreateHeartbeatMonitorInput) {
    let valid = true;

    if (limitReached) {
      form.setError("root", {
        message: `${planContext.plan.name} includes ${formatNumber(planContext.plan.maxMonitors)} monitors. Upgrade to add more.`,
      });
      valid = false;
    }

    if (data.intervalMilliseconds < planContext.plan.minIntervalMs) {
      form.setError("intervalMilliseconds", {
        message: `Expected intervals under ${formatMilliseconds(planContext.plan.minIntervalMs)} are a Pro feature.`,
      });
      valid = false;
    }

    return valid;
  }

  async function onSubmit(data: CreateHeartbeatMonitorInput) {
    if (!validatePlanLimits(data)) return;

    setIsLoading(true);

    try {
      const result = await createHeartbeatMonitorAction(data);

      if (result.success) {
        toast.success("Heartbeat monitor created", {
          description: `${data.name} is waiting for its first ping.`,
        });
        router.push(`/monitors/${result.data?.id}`);
      } else if (result.status === 403) {
        toast.error("Plan limit reached", {
          description: result.error || "Upgrade to unlock higher limits.",
        });
      } else {
        toast.error("Failed to create monitor", {
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
        {form.formState.errors.root?.message ? (
          <p className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
            {form.formState.errors.root.message}
          </p>
        ) : null}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Nightly database backup" disabled={isLoading || limitReached} {...field} />
              </FormControl>
              <FormDescription>A friendly name for the job this monitor watches.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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
                  disabled={isLoading || limitReached}
                />
              </FormControl>
              <FormDescription>Optional labels for grouping and filtering monitors.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="intervalMilliseconds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expected every</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value, 10))}
                  defaultValue={String(field.value)}
                  disabled={isLoading || limitReached}
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
                                Limit
                              </Badge>
                            ) : null}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormDescription>How often the job is expected to ping this URL.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gracePeriodMilliseconds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grace period</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value, 10))}
                  defaultValue={String(field.value ?? 0)}
                  disabled={isLoading || limitReached}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grace period" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {graceOptions.map((option) => (
                      <SelectItem key={option.value} value={String(option.value)}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Extra time allowed past the interval before it&apos;s marked DOWN.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:gap-4">
          <Button type="submit" disabled={isLoading || limitReached} className="w-full sm:w-auto">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Monitor
          </Button>
        </div>
      </form>
    </Form>
  );
}
