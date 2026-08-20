"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { verifyEmailAction } from "@/lib/actions/auth";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setErrorMessage("Verification link is missing or invalid.");
      return;
    }

    async function verify() {
      try {
        const result = await verifyEmailAction(token!);

        if (result.success) {
          setStatus("success");
          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        } else {
          setStatus("error");
          setErrorMessage(result.error || "The verification link may have expired.");
        }
      } catch {
        setStatus("error");
        setErrorMessage("Something went wrong. Please try again later.");
      }
    }

    verify();
  }, [searchParams, router]);

  if (status === "verifying") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <CardTitle>Verifying your email...</CardTitle>
            <CardDescription>Please wait while we verify your email address.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Email Verified!</CardTitle>
            <CardDescription>
              Your email has been successfully verified. You'll now receive monitor alerts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-center text-muted-foreground mb-4">
              Redirecting to dashboard...
            </p>
            <Button asChild className="w-full">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle>Verification Failed</CardTitle>
          <CardDescription>{errorMessage}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-center text-muted-foreground">
            The verification link may have expired or already been used.
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/signin">Sign In</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
