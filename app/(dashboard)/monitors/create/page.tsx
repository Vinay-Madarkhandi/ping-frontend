import { getCurrentUser } from "@/lib/api/auth";
import { getMonitors } from "@/lib/api/monitors";
import { getUsage } from "@/lib/api/usage";
import { createPlanContext } from "@/lib/plans";
import { CreateMonitorForm } from "./create-monitor-form";

export default async function CreateMonitorPage() {
  const [currentUserResult, usageResult, monitorsResult] = await Promise.all([
    getCurrentUser(),
    getUsage(),
    getMonitors(),
  ]);

  const planContext = createPlanContext({
    currentUser: currentUserResult.data,
    usage: usageResult.data,
    monitorCount: monitorsResult.data?.length ?? 0,
  });

  return <CreateMonitorForm planContext={planContext} />;
}
