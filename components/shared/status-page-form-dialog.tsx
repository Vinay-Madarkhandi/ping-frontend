"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
  createStatusPageAction,
  updateStatusPageAction,
} from "@/lib/actions/status-pages";
import { statusPageSchema, StatusPageInput } from "@/lib/validations";
import { Monitor, StatusPage } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StatusPageFormDialogProps {
  monitors: Monitor[];
  statusPage?: StatusPage;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function StatusPageFormDialog({
  monitors,
  statusPage,
  open,
  onOpenChange,
  onSuccess,
}: StatusPageFormDialogProps) {
  const isEditing = !!statusPage;
  const [isLoading, setIsLoading] = useState(false);
  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const defaultValues: StatusPageInput = {
    title: statusPage?.title ?? "",
    description: statusPage?.description ?? "",
    slug: statusPage?.slug ?? "",
    monitorIds: statusPage?.monitors.map((m) => m.id) ?? [],
    logoUrl: statusPage?.logoUrl ?? "",
    password: undefined, // never pre-filled — leaving it blank keeps the existing password unchanged
  };

  const form = useForm<StatusPageInput>({
    resolver: zodResolver(statusPageSchema),
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
    setSlugTouched(isEditing);
    setPasswordTouched(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusPage, open]);

  async function onSubmit(data: StatusPageInput) {
    setIsLoading(true);
    try {
      // Only send a password when the user actually touched that field — otherwise omitting it
      // (undefined) leaves an existing password untouched instead of accidentally clearing it.
      const payload: StatusPageInput = {
        ...data,
        password: passwordTouched ? data.password : undefined,
      };
      const result = isEditing
        ? await updateStatusPageAction(statusPage!.id, payload)
        : await createStatusPageAction(payload);

      if (result.success) {
        toast.success(isEditing ? "Status page updated" : "Status page created", {
          description: isEditing
            ? "Your changes are live."
            : `Your status page is live at /status/${data.slug}.`,
        });
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(isEditing ? "Failed to update status page" : "Failed to create status page", {
          description: result.error || "Please try again.",
        });
      }
    } catch {
      toast.error("Something went wrong", { description: "Please try again later." });
    } finally {
      setIsLoading(false);
    }
  }

  const selectedIds = form.watch("monitorIds") ?? [];

  function toggleMonitor(id: string) {
    const current = form.getValues("monitorIds") ?? [];
    form.setValue(
      "monitorIds",
      current.includes(id) ? current.filter((m) => m !== id) : [...current, id],
      { shouldValidate: true }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit status page" : "New status page"}</DialogTitle>
          <DialogDescription>
            A public, unauthenticated page showing the live state and uptime of the monitors you pick.
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
                    <Input
                      placeholder="Acme Status"
                      disabled={isLoading}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        if (!slugTouched) {
                          form.setValue("slug", slugify(e.target.value), { shouldValidate: true });
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-1.5 font-mono text-sm">
                      <span className="text-muted-foreground">/status/</span>
                      <Input
                        placeholder="acme"
                        disabled={isLoading}
                        className="font-mono"
                        {...field}
                        onChange={(e) => {
                          setSlugTouched(true);
                          field.onChange(slugify(e.target.value));
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>Lowercase letters, numbers, and hyphens only.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional summary shown under the title" disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/logo.png"
                      disabled={isLoading}
                      value={field.value ?? ""}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormDescription>Optional — shown in place of the Ping logo at the top of the page.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={
                        isEditing && statusPage?.passwordProtected
                          ? "Leave blank to keep the current password"
                          : "Leave blank for no password"
                      }
                      disabled={isLoading}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        setPasswordTouched(true);
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    {isEditing && statusPage?.passwordProtected
                      ? "This page is password protected. Enter a new password to change it, or clear it and save to remove protection."
                      : "Optional — require visitors to enter a password before viewing this page."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="monitorIds"
              render={() => (
                <FormItem>
                  <FormLabel>Monitors</FormLabel>
                  <FormDescription>Only the name and current state are shown publicly — never the URL.</FormDescription>
                  <div className="max-h-56 space-y-1 overflow-y-auto rounded-md border p-2">
                    {monitors.length === 0 ? (
                      <p className="p-2 text-sm text-muted-foreground">No monitors yet.</p>
                    ) : (
                      monitors.map((monitor) => {
                        const checked = selectedIds.includes(monitor.id);
                        return (
                          <label
                            key={monitor.id}
                            className={cn(
                              "flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-muted/60",
                              checked && "bg-accent"
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={isLoading}
                              onChange={() => toggleMonitor(monitor.id)}
                              className="h-4 w-4 rounded border-input"
                            />
                            <span className="min-w-0 flex-1 truncate">{monitor.name}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Save changes" : "Create status page"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
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
  );
}
