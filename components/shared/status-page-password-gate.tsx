"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";

import { unlockStatusPageAction } from "@/lib/actions/status-pages";
import { statusPageUnlockSchema, StatusPageUnlockInput } from "@/lib/validations";
import { PublicStatusPage } from "@/lib/types";
import { PublicStatusPageContent } from "@/components/shared/public-status-page-content";

/** Client-side password gate for a protected status page — unlocks in place once the password checks out. */
export function StatusPagePasswordGate({ slug }: { slug: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState<PublicStatusPage | null>(null);

  const form = useForm<StatusPageUnlockInput>({
    resolver: zodResolver(statusPageUnlockSchema),
    defaultValues: { password: "" },
  });

  async function onSubmit(data: StatusPageUnlockInput) {
    setIsLoading(true);
    try {
      const result = await unlockStatusPageAction(slug, data);
      if (result.success && result.data) {
        setPage(result.data);
      } else {
        form.setError("password", { message: result.error || "Incorrect password" });
      }
    } catch {
      form.setError("password", { message: "Something went wrong. Please try again." });
    } finally {
      setIsLoading(false);
    }
  }

  if (page) {
    return <PublicStatusPageContent page={page} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-5 sm:px-6">
          <Logo iconClassName="h-8 w-8" />
          <ThemeToggle />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-md bg-muted">
              <Lock className="h-5 w-5" />
            </div>
            <CardTitle className="text-base">Password required</CardTitle>
            <CardDescription>This status page is password protected.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" autoFocus disabled={isLoading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Unlock
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
