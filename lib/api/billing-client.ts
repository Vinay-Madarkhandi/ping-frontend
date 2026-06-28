import {
  BillingOrderResponse,
  BillingVerifyRequest,
  BillingVerifyResponse,
} from "@/lib/types";

export class BillingRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "BillingRequestError";
    this.status = status;
  }
}

async function readErrorMessage(response: Response, fallback: string) {
  try {
    const data = await response.json();
    return data.message || fallback;
  } catch {
    return fallback;
  }
}

export async function createBillingOrder(targetPlan: "PRO") {
  // Hits the Next route handler (server-side), which forwards the JwtToken cookie to the backend.
  const response = await fetch("/api/billing/orders", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ target_plan: targetPlan }),
  });

  if (!response.ok) {
    throw new BillingRequestError(
      await readErrorMessage(response, "Could not start upgrade"),
      response.status
    );
  }

  return response.json() as Promise<BillingOrderResponse>;
}

export async function verifyBillingPayment(payload: BillingVerifyRequest) {
  // Hits the Next route handler (server-side), which forwards the JwtToken cookie to the backend.
  const response = await fetch("/api/billing/verify", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new BillingRequestError(
      await readErrorMessage(response, "Payment could not be verified"),
      response.status
    );
  }

  return response.json() as Promise<BillingVerifyResponse>;
}
