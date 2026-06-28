"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  createBillingOrder,
  verifyBillingPayment,
} from "@/lib/api/billing-client";
import { CurrentUserResponse } from "@/lib/types";

type RazorpayPaymentResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayFailureResponse = {
  error?: {
    description?: string;
  };
};

type RazorpayInstance = {
  open: () => void;
  on: (event: "payment.failed", handler: (response: RazorpayFailureResponse) => void) => void;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  prefill?: {
    name?: string;
    email?: string;
  };
  theme: {
    color: string;
  };
  handler: (response: RazorpayPaymentResponse) => void;
  modal: {
    ondismiss: () => void;
  };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

let razorpayScriptPromise: Promise<void> | null = null;

function loadRazorpayScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Checkout is not available on the server"));
  }

  if (window.Razorpay) {
    return Promise.resolve();
  }

  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Could not load Razorpay Checkout"));
      document.body.appendChild(script);
    });
  }

  return razorpayScriptPromise;
}

export function UpgradeButton({
  currentUser,
  className,
  size,
  children = "Upgrade to PRO",
}: {
  currentUser?: CurrentUserResponse;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "creating" | "verifying">("idle");
  const isLoading = state !== "idle";
  const loadingLabel = state === "verifying" ? "Confirming payment..." : "Preparing checkout...";

  const prefill = useMemo(
    () => ({
      name: currentUser?.userName,
      email: currentUser?.email,
    }),
    [currentUser?.email, currentUser?.userName]
  );

  async function startUpgrade() {
    setState("creating");

    try {
      await loadRazorpayScript();
      const order = await createBillingOrder("PRO");

      if (!window.Razorpay) {
        throw new Error("Razorpay Checkout did not initialize");
      }

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.razorpayOrderId,
        name: "Ping",
        description: "PRO plan",
        prefill,
        theme: { color: "#0f172a" },
        handler: async (response) => {
          const verifyingToast = toast.loading("Confirming your payment...");
          setState("verifying");

          try {
            const result = await verifyBillingPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });

            toast.success(`You're on ${result.plan}`, {
              id: verifyingToast,
              description: "Your plan limits have been refreshed.",
            });
            router.refresh();
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Payment could not be verified", {
              id: verifyingToast,
              description: "Your plan was not changed.",
            });
          } finally {
            setState("idle");
          }
        },
        modal: {
          ondismiss: () => {
            toast.info("Checkout closed");
            setState("idle");
          },
        },
      });

      checkout.on("payment.failed", (response) => {
        toast.error(response.error?.description ?? "Payment failed");
        setState("idle");
      });

      checkout.open();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong, please try again");
      setState("idle");
    }
  }

  return (
    <Button onClick={startUpgrade} disabled={isLoading} className={className} size={size}>
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {isLoading ? loadingLabel : children}
    </Button>
  );
}
