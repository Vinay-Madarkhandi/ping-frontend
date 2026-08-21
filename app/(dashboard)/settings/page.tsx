import { Lock, UserRound } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BillingSettings } from "@/components/billing/billing-settings";
import { PasswordSettings } from "@/components/settings/password-settings";
import { DangerZoneSettings } from "@/components/settings/danger-zone-settings";
import { AlertChannelsSettings } from "@/components/settings/alert-channels-settings";
import { getCurrentUser } from "@/lib/api/auth";
import { getPlans } from "@/lib/api/plans";
import { getUsage } from "@/lib/api/usage";
import { getAlertChannels } from "@/lib/api/alert-channels";
import { createPlanContext } from "@/lib/plans";

export default async function SettingsPage() {
  const [currentUserResult, usageResult, plansResult, alertChannelsResult] = await Promise.all([
    getCurrentUser(),
    getUsage(),
    getPlans(),
    getAlertChannels(),
  ]);
  const planContext = createPlanContext({
    currentUser: currentUserResult.data,
    usage: usageResult.data,
    monitorCount: usageResult.data?.monitorCount ?? 0,
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Account and workspace settings for Ping.
        </p>
      </div>

      <BillingSettings
        currentUser={currentUserResult.data}
        planContext={planContext}
        catalog={plansResult.data}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <PasswordSettings />
        <DangerZoneSettings />
      </div>

      <AlertChannelsSettings channels={alertChannelsResult.data ?? []} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-md bg-muted">
              <UserRound className="h-5 w-5" />
            </div>
            <CardTitle className="text-base">Account</CardTitle>
            <CardDescription>
              Signed-in user details from the backend session.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">
              {currentUserResult.data?.email ?? "Account details unavailable"}
            </p>
            <p className="text-xs text-muted-foreground">
              {currentUserResult.data?.userName ?? "Connect GET /api/v1/auth/me for profile data."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-md bg-muted">
              <Lock className="h-5 w-5" />
            </div>
            <CardTitle className="text-base">Security</CardTitle>
            <CardDescription>
              Sessions use the HttpOnly JwtToken cookie from the backend.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Sign out from the account menu to clear the browser cookie.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
