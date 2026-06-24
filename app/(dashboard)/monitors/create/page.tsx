"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

import { createMonitorSchema, CreateMonitorInput } from "@/lib/validations";
import { createMonitorAction } from "@/lib/actions/monitors";

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

export default function CreateMonitorPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [headers, setHeaders] = useState([{ key: "", value: "" }]);

  const form = useForm<CreateMonitorInput>({
    resolver: zodResolver(createMonitorSchema),
    defaultValues: {
      name: "",
      url: "",
      intervalMilliseconds: 30000,
      timeoutMilliseconds: 10000,
      monitorMethod: "GET",
      followRedirects: true,
    },
  });

  async function onSubmit(data: CreateMonitorInput) {
    setIsLoading(true);

    try {
      const customHeaders = Object.fromEntries(
        headers
          .map((header) => [header.key.trim(), header.value.trim()])
          .filter(([key, value]) => key && value)
      );
      const payload: CreateMonitorInput = {
        ...data,
        keyword: data.keyword?.trim() || undefined,
        customHeaders: Object.keys(customHeaders).length > 0 ? customHeaders : undefined,
      };
      const result = await createMonitorAction(payload);

      if (result.success) {
        toast.success("Monitor created!", {
          description: `${data.name} is now being monitored.`,
        });
        router.push(`/monitors/${result.data?.id}`);
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
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex items-start gap-2 sm:gap-4">
        <Button variant="ghost" size="icon" asChild className="shrink-0 mt-1">
          <Link href="/monitors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Create Monitor</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Set up a new monitor to track the health of your server or service
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="max-w-2xl">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Monitor Configuration</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Configure the settings for your new monitor. All fields are required.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="My Website"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A friendly name to identify this monitor
                    </FormDescription>
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
                      <Input
                        placeholder="https://example.com"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The URL to monitor (must start with http:// or https://)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="monitorMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HTTP Method</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
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
                      <FormDescription>
                        HTTP method used for health checks
                      </FormDescription>
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
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={String(field.value)}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select interval" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {intervalOptions.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={String(option.value)}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How often to check the endpoint
                      </FormDescription>
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
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={String(field.value)}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="sm:w-1/2">
                          <SelectValue placeholder="Select timeout" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeoutOptions.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={String(option.value)}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Maximum time to wait for a response before marking as down
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <details className="rounded-lg border bg-muted/20 p-4">
                <summary className="cursor-pointer text-sm font-medium">
                  Advanced checks
                </summary>
                <div className="mt-4 space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
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
                          <FormDescription>
                            Leave blank to accept any 2xx or 3xx response.
                          </FormDescription>
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
                              placeholder="Healthy"
                              disabled={isLoading}
                              value={field.value ?? ""}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                            />
                          </FormControl>
                          <FormDescription>
                            Response body must contain this text when provided.
                          </FormDescription>
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
                            Keep enabled unless redirects should count as failures.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="space-y-3">
                    <div>
                      <FormLabel>Custom headers</FormLabel>
                      <FormDescription>
                        Optional request headers sent with each check.
                      </FormDescription>
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

              <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:gap-4">
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Monitor
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
