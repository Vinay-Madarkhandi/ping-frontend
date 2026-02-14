"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Activity } from "lucide-react";

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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";

import { signinSchema, SigninInput } from "@/lib/validations";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SigninInput>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: SigninInput) {
    setIsLoading(true);

    try {
      // Use the API route to properly handle HttpOnly cookies
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include", // Important for cookies
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Welcome back!", {
          description: "You have been signed in successfully.",
        });
        // Use window.location for a full page reload to ensure cookies are recognized
        window.location.href = callbackUrl;
      } else {
        toast.error("Sign in failed", {
          description: result.message || "Invalid email or password.",
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Something went wrong", {
        description: "Please try again later.",
      });
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1 text-center p-4 sm:p-6">
        <div className="flex justify-center mb-2">
          <div className="flex items-center gap-2 text-primary">
            <Activity className="h-6 w-6 sm:h-8 sm:w-8" />
            <span className="text-xl sm:text-2xl font-bold">Ping</span>
          </div>
        </div>
        <CardTitle className="text-xl sm:text-2xl">Welcome back</CardTitle>
        <CardDescription className="text-sm">
          Enter your credentials to sign in to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      autoComplete="email"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
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
                      placeholder="••••••••"
                      autoComplete="current-password"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign in
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-primary underline-offset-4 hover:underline"
          >
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function LoginFormSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-2">
          <div className="flex items-center gap-2 text-primary">
            <Activity className="h-8 w-8" />
            <span className="text-2xl font-bold">Ping</span>
          </div>
        </div>
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}

