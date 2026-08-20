"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AlertCircle, Loader2, Mail } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { resendVerificationAction } from "@/lib/actions/auth";

interface EmailVerificationBannerProps {
  email: string;
}

export function EmailVerificationBanner({ email }: EmailVerificationBannerProps) {
  const [isResending, setIsResending] = useState(false);

  async function handleResend() {
    setIsResending(true);

    try {
      const result = await resendVerificationAction();

      if (result.success) {
        toast.success("Verification email sent", {
          description: `Check your inbox at ${email}`,
        });
      } else {
        toast.error("Failed to send email", {
          description: result.error || "Please try again.",
        });
      }
    } catch {
      toast.error("Something went wrong", {
        description: "Please try again later.",
      });
    } finally {
      setIsResending(false);
    }
  }

  return (
    <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
      <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
      <AlertTitle className="text-yellow-800 dark:text-yellow-400">
        Email Verification Required
      </AlertTitle>
      <AlertDescription className="text-yellow-700 dark:text-yellow-300 space-y-2">
        <p>
          We sent a verification email to <strong>{email}</strong>. Please verify your email
          to receive monitor alerts.
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResend}
            disabled={isResending}
            className="h-8"
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-3 w-3" />
                Resend Email
              </>
            )}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
