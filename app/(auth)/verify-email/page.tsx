"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { verifyEmailAction } from "@/lib/actions/auth";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- no token to verify, so there's no async work to defer this into.
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
      <Card className="w-full border-none bg-transparent shadow-none sm:border sm:bg-card sm:shadow-sm">
        <CardHeader className="items-center p-0 text-center sm:p-6">
          <Loader2 className="mb-2 h-8 w-8 animate-spin text-primary" />
          <CardTitle>Verifying your email…</CardTitle>
          <CardDescription>Please wait while we verify your email address.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (status === "success") {
    return (
      <Card className="w-full border-none bg-transparent shadow-none sm:border sm:bg-card sm:shadow-sm">
        <CardHeader className="items-center p-0 pb-6 text-center sm:p-6">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-up/10">
            <CheckCircle2 className="h-6 w-6 text-up" />
          </div>
          <CardTitle>Email verified</CardTitle>
          <CardDescription>
            Your email has been successfully verified. You&apos;ll now receive monitor alerts.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <p className="mb-4 text-center text-sm text-muted-foreground">
            Redirecting to dashboard…
          </p>
          <Button asChild className="w-full">
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-none bg-transparent shadow-none sm:border sm:bg-card sm:shadow-sm">
      <CardHeader className="items-center p-0 pb-6 text-center sm:p-6">
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-down/10">
          <XCircle className="h-6 w-6 text-down" />
        </div>
        <CardTitle>Verification failed</CardTitle>
        <CardDescription>{errorMessage}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 p-0 sm:p-6 sm:pt-0">
        <p className="text-center text-sm text-muted-foreground">
          The verification link may have expired or already been used.
        </p>
        <div className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/signin">Sign in</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <Card className="w-full border-none bg-transparent shadow-none sm:border sm:bg-card sm:shadow-sm">
          <CardHeader className="items-center p-0 text-center sm:p-6">
            <Loader2 className="mb-2 h-8 w-8 animate-spin text-primary" />
            <CardTitle>Loading…</CardTitle>
          </CardHeader>
        </Card>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
