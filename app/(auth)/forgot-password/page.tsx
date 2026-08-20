"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, Loader2, Mail } from "lucide-react";

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
import { forgotPasswordAction } from "@/lib/actions/auth";
import { forgotPasswordSchema, ForgotPasswordInput } from "@/lib/validations";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: ForgotPasswordInput) {
    setIsLoading(true);

    try {
      const result = await forgotPasswordAction(data.email);

      if (result.success) {
        setEmailSent(true);
        toast.success("Reset link sent", {
          description: "Check your email for the password reset link.",
        });
      } else {
        toast.error("Failed to send reset link", {
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

  if (emailSent) {
    return (
      <Card className="w-full border-none bg-transparent shadow-none sm:border sm:bg-card sm:shadow-sm">
        <CardHeader className="items-center p-0 pb-6 text-center sm:p-6">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-up/10">
            <Mail className="h-6 w-6 text-up" />
          </div>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We&apos;ve sent a password reset link to <strong>{form.getValues("email")}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-0 sm:p-6 sm:pt-0">
          <p className="text-center text-sm text-muted-foreground">
            The link expires in 1 hour. If you don&apos;t see the email, check your spam folder.
          </p>
          <Button asChild className="w-full" variant="outline">
            <Link href="/signin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to sign in
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-none bg-transparent shadow-none sm:border sm:bg-card sm:shadow-sm">
      <CardHeader className="p-0 pb-6 sm:p-6">
        <CardTitle className="text-2xl sm:text-3xl">Forgot password?</CardTitle>
        <CardDescription>
          Enter your email address and we&apos;ll send you a link to reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 sm:p-6 sm:pt-0">
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
                      placeholder="you@example.com"
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
                Send reset link
              </Button>

              <Button asChild className="w-full" variant="outline">
                <Link href="/signin">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to sign in
                </Link>
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
