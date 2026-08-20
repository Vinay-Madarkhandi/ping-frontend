import "server-only";

import { serverFetch } from "./server-client";
import { PlanLimits } from "@/lib/types";

/**
 * The plan catalog, sorted cheapest-first by the backend. Sourced from the same `plan` table the
 * backend enforces limits from, so pricing/comparison UI can never drift from what is enforced.
 */
export async function getPlans() {
  return serverFetch<PlanLimits[]>("/api/v1/plans", {
    method: "GET",
  });
}
