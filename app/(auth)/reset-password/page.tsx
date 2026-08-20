"use client";

import { Suspense, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { resetPasswordAction } from "@/lib/actions/auth";
import { resetPasswordSchema, ResetPasswordInput } from "@/lib/validations";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      toast.error("Invalid reset link", {
        description: "The password reset link is missing or invalid.",
      });
      router.push("/forgot-password");
    } else {
      setToken(tokenParam);
    }
  }, [searchParams, router]);

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
    },
  });

  async function onSubmit(data: ResetPasswordInput) {
    if (!token) {
      toast.error("Invalid reset link");
      return;
    }

    setIsLoading(true);

    try {
      const result = await resetPasswordAction(token, data.newPassword);

      if (result.success) {
        setResetComplete(true);
        toast.success("Password reset successful", {
          description: "You can now sign in with your new password.",
        });
      } else {
        toast.error("Failed to reset password", {
          description: result.error || "The reset link may have expired. Please try again.",
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

  if (resetComplete) {
    return (
      <Card className="w-full border-none bg-transparent shadow-none sm:border sm:bg-card sm:shadow-sm">
        <CardHeader className="items-center p-0 pb-6 text-center sm:p-6">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-up/10">
            <CheckCircle2 className="h-6 w-6 text-up" />
          </div>
          <CardTitle>Password reset complete</CardTitle>
          <CardDescription>
            Your password has been successfully reset. You can now sign in with your new password.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <Button asChild className="w-full">
            <Link href="/signin">Continue to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!token) {
    return (
      <Card className="w-full border-none bg-transparent shadow-none sm:border sm:bg-card sm:shadow-sm">
        <CardHeader className="items-center p-0 text-center sm:p-6">
          <Loader2 className="mb-2 h-6 w-6 animate-spin text-primary" />
          <CardTitle>Loading…</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full border-none bg-transparent shadow-none sm:border sm:bg-card sm:shadow-sm">
      <CardHeader className="p-0 pb-6 sm:p-6">
        <CardTitle className="text-2xl sm:text-3xl">Reset your password</CardTitle>
        <CardDescription>
          Enter your new password below. Make sure it&apos;s at least 6 characters long.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 sm:p-6 sm:pt-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your new password"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reset password
              </Button>

              <Button asChild className="w-full" variant="outline">
                <Link href="/signin">Cancel</Link>
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function ResetPasswordSkeleton() {
  return (
    <Card className="w-full border-none bg-transparent shadow-none sm:border sm:bg-card sm:shadow-sm">
      <CardHeader className="space-y-2 p-0 pb-6 sm:p-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-72" />
      </CardHeader>
      <CardContent className="space-y-4 p-0 sm:p-6 sm:pt-0">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordSkeleton />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
