import Link from "next/link";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PlanLimits } from "@/lib/types";
import { formatMilliseconds, formatMoney, formatNumber, FALLBACK_FREE_PLAN } from "@/lib/plans";

function PlanCard({
  name,
  price,
  priceIsAmount = true,
  description,
  features,
  highlighted,
  cta,
}: {
  name: string;
  price: string;
  priceIsAmount?: boolean;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}) {
  return (
    <div
      className={
        highlighted
          ? "glow-primary relative flex flex-col rounded-2xl border-2 border-primary bg-card p-8"
          : "flex flex-col rounded-2xl border bg-card p-8"
      }
    >
      {highlighted ? (
        <span className="absolute -top-3 left-8 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
          Most flexible
        </span>
      ) : null}
      <h3 className="text-lg font-semibold">{name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <p
        className={
          priceIsAmount
            ? "mt-6 font-mono text-4xl font-bold"
            : "mt-6 font-mono text-xl font-semibold text-muted-foreground"
        }
        data-metric
      >
        {price}
      </p>
      <ul className="mt-6 flex-1 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>
      <Button className="mt-8 w-full" variant={highlighted ? "default" : "outline"} asChild>
        <Link href="/signup">{cta}</Link>
      </Button>
    </div>
  );
}

export function Pricing({ plans }: { plans?: PlanLimits[] }) {
  const free = plans?.find((p) => p.name === "FREE") ?? FALLBACK_FREE_PLAN;
  const pro = plans?.find((p) => p.name === "PRO");

  const freeFeatures = [
    `${formatNumber(free.maxMonitors)} monitors`,
    `Checks every ${formatMilliseconds(free.minIntervalMs)} or slower`,
    `${formatNumber(free.monthlyCheckQuota)} checks / month`,
    `${formatNumber(free.retentionDays)}-day log retention`,
    `${formatNumber(free.maxAlertsPerDay)} alert emails / day`,
  ];

  const proFeatures = pro
    ? [
        `${formatNumber(pro.maxMonitors)} monitors`,
        `Checks every ${formatMilliseconds(pro.minIntervalMs)} or slower`,
        `${formatNumber(pro.monthlyCheckQuota)} checks / month`,
        `${formatNumber(pro.retentionDays)}-day log retention`,
        `${formatNumber(pro.maxAlertsPerDay)} alert emails / day`,
      ]
    : [
        "Higher monitor limits",
        "Faster check intervals",
        "Longer log retention",
        "More alert headroom",
        "Priority support",
      ];

  const proPriceIsAmount = Boolean(pro && typeof pro.priceAmount === "number");
  const proPrice = pro && typeof pro.priceAmount === "number"
    ? formatMoney(pro.priceAmount, pro.currency)
    : "See pricing after signup";

  return (
    <section id="pricing" className="border-y bg-muted/30">
      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Simple pricing, real limits
          </h2>
          <p className="mt-4 text-muted-foreground">
            Start free. The numbers below are the same limits enforced by the backend —
            not marketing rounding.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
          <PlanCard
            name="Free"
            price={formatMoney(0, free.currency ?? "INR")}
            description="Everything you need to start monitoring."
            features={freeFeatures}
            cta="Start for free"
          />
          <PlanCard
            name="Pro"
            price={proPrice}
            priceIsAmount={proPriceIsAmount}
            description="For teams that need tighter checks and longer history."
            features={proFeatures}
            highlighted
            cta="Upgrade to Pro"
          />
        </div>
      </div>
    </section>
  );
}
