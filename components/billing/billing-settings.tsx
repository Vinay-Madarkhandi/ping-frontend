import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  Crown,
  Gauge,
  Lock,
  Rocket,
} from "lucide-react";

import { UpgradeButton } from "@/components/billing/upgrade-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UsageMeter } from "@/components/shared/usage-meter";
import { CurrentUserResponse, PlanContext } from "@/lib/types";
import {
  formatMilliseconds,
  formatMoney,
  formatNumber,
  formatPlanDate,
  formatSeconds,
  isProPlan,
} from "@/lib/plans";

function LimitItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

function PlanStatusBadge({ currentUser }: { currentUser?: CurrentUserResponse }) {
  const status = currentUser?.subscriptionStatus ?? currentUser?.plan.name ?? "FREE";
  const active = isProPlan(currentUser?.plan.name, currentUser?.subscriptionStatus);

  return (
    <Badge variant={active ? "default" : "secondary"} className="w-fit">
      {status}
    </Badge>
  );
}

export function BillingSettings({
  currentUser,
  planContext,
}: {
  currentUser?: CurrentUserResponse;
  planContext: PlanContext;
}) {
  const plan = planContext.plan;
  const activePro = isProPlan(plan.name, currentUser?.subscriptionStatus);
  const renewalDate = formatPlanDate(currentUser?.subscriptionEndAt);
  const planPrice = typeof plan.priceAmount === "number"
    ? formatMoney(plan.priceAmount, plan.currency)
    : null;

  return (
    <div id="billing" className="scroll-mt-6 space-y-4 sm:space-y-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="h-5 w-5" />
                  Current Plan
                </CardTitle>
                <CardDescription>
                  Limits are enforced by the backend for monitor creation, checks, retention, and alerts.
                </CardDescription>
              </div>
              <PlanStatusBadge currentUser={currentUser} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{plan.name}</p>
                  {activePro ? <Crown className="h-5 w-5 text-amber-500" /> : null}
                </div>
                <p className="text-sm text-muted-foreground">
                  {activePro && renewalDate
                    ? `Renews on ${renewalDate}`
                    : activePro
                    ? "Active subscription"
                    : "Free workspace plan"}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-sm text-muted-foreground">Plan price</p>
                <p className="text-lg font-semibold">
                  {planPrice ?? (plan.name === "FREE" ? formatMoney(0, plan.currency ?? "INR") : "Managed by billing")}
                </p>
                {plan.durationDays ? (
                  <p className="text-xs text-muted-foreground">Every {formatNumber(plan.durationDays)} days</p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <LimitItem label="Monitors" value={formatNumber(plan.maxMonitors)} />
              <LimitItem label="Check interval" value={`Every ${formatMilliseconds(plan.minIntervalMs)} or slower`} />
              <LimitItem label="Timeout" value={`Up to ${formatMilliseconds(plan.maxTimeoutMs)}`} />
              <LimitItem label="Monthly checks" value={formatNumber(plan.monthlyCheckQuota)} />
              <LimitItem label="Log retention" value={`${formatNumber(plan.retentionDays)} days`} />
              <LimitItem
                label="Alerts"
                value={`${formatNumber(plan.maxAlertsPerDay)} / day, ${formatSeconds(plan.alertCooldownSeconds)} cooldown`}
              />
            </div>
          </CardContent>
        </Card>

        <Card className={activePro ? "border-green-500/30" : "border-primary/30"}>
          <CardHeader>
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              {activePro ? <CheckCircle2 className="h-5 w-5" /> : <Rocket className="h-5 w-5" />}
            </div>
            <CardTitle className="text-base">
              {activePro ? "PRO is active" : "Upgrade to PRO"}
            </CardTitle>
            <CardDescription>
              {activePro
                ? "Your higher limits are active across the app."
                : "Checkout uses a backend-created Razorpay order. The amount and key come from the server."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activePro ? (
              <Alert>
                <CalendarClock className="h-4 w-4" />
                <AlertTitle>Subscription active</AlertTitle>
                <AlertDescription>
                  {renewalDate ? `Your PRO access renews on ${renewalDate}.` : "Your PRO access is active."}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <CreditCard className="h-4 w-4" />
                  Razorpay Checkout
                </div>
                <p className="text-sm text-muted-foreground">
                  The backend creates the order and verifies the payment signature before your plan changes.
                </p>
              </div>
            )}

            {!activePro ? (
              <UpgradeButton currentUser={currentUser} className="w-full" size="lg" />
            ) : null}
          </CardContent>
          {!activePro ? (
            <CardFooter className="text-xs text-muted-foreground">
              Test mode uses Razorpay test cards. No real money moves.
            </CardFooter>
          ) : null}
        </Card>
      </div>

      <UsageMeter planContext={planContext} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Plan Comparison</CardTitle>
          <CardDescription>
            Current plan values are live from the backend. PRO catalog values need a plan-catalog endpoint.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Capability</TableHead>
                <TableHead>Current plan</TableHead>
                <TableHead>PRO catalog</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Monitors</TableCell>
                <TableCell>{formatNumber(plan.maxMonitors)}</TableCell>
                <TableCell className="text-muted-foreground">Pending catalog endpoint</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Minimum interval</TableCell>
                <TableCell>{formatMilliseconds(plan.minIntervalMs)}</TableCell>
                <TableCell className="text-muted-foreground">Pending catalog endpoint</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Timeout</TableCell>
                <TableCell>{formatMilliseconds(plan.maxTimeoutMs)}</TableCell>
                <TableCell className="text-muted-foreground">Pending catalog endpoint</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Monthly checks</TableCell>
                <TableCell>{formatNumber(plan.monthlyCheckQuota)}</TableCell>
                <TableCell className="text-muted-foreground">Pending catalog endpoint</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Retention</TableCell>
                <TableCell>{formatNumber(plan.retentionDays)} days</TableCell>
                <TableCell className="text-muted-foreground">Pending catalog endpoint</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {planContext.usingFallbackPlan ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Using fallback plan limits</AlertTitle>
          <AlertDescription>
            GET /api/v1/auth/me did not return plan data. Upgrade remains available, but current-plan display is limited.
          </AlertDescription>
        </Alert>
      ) : null}

      <Separator />

      <Alert>
        <Lock className="h-4 w-4" />
        <AlertTitle>Payment authority stays on the backend</AlertTitle>
        <AlertDescription>
          The frontend never sends an amount and never changes the plan. PRO is unlocked only after backend signature verification.
        </AlertDescription>
      </Alert>
    </div>
  );
}
