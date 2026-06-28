import { Bell, Lock, UserRound } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BillingSettings } from "@/components/billing/billing-settings";
import { getCurrentUser } from "@/lib/api/auth";
import { getUsage } from "@/lib/api/usage";
import { createPlanContext } from "@/lib/plans";

export default async function SettingsPage() {
  const [currentUserResult, usageResult] = await Promise.all([
    getCurrentUser(),
    getUsage(),
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

      <BillingSettings currentUser={currentUserResult.data} planContext={planContext} />

      <div className="grid gap-4 lg:grid-cols-3">
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
              <Bell className="h-5 w-5" />
            </div>
            <CardTitle className="text-base">Notifications</CardTitle>
            <CardDescription>
              Alert routing and preferences will appear here when supported.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">Not configured</Badge>
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
