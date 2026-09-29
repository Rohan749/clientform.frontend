import { Check, Crown } from "lucide-react";
import type { ReactNode } from "react";
import { FREE_FEATURES, PRO_FEATURES, PRO_PRICES } from "@/lib/plans";
import { cn } from "@/lib/utils";
import type { BillingInterval } from "@/types";

/** Monthly / Yearly switch. Yearly shows the saving. */
export function IntervalToggle({
  value,
  onChange,
  className,
}: {
  value: BillingInterval;
  onChange: (interval: BillingInterval) => void;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex rounded-full border bg-background p-1 shadow-xs", className)} role="radiogroup" aria-label="Billing period">
      {(["month", "year"] as const).map((interval) => (
        <button
          key={interval}
          type="button"
          role="radio"
          aria-checked={value === interval}
          onClick={() => onChange(interval)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
            value === interval ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {PRO_PRICES[interval].label}
          {interval === "year" && (
            <span
              className={cn(
                "rounded-full px-1.5 py-px text-[10px] font-semibold",
                value === "year" ? "bg-background/15 text-background" : "bg-violet-100 text-violet-700",
              )}
            >
              −25%
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

function FeatureList({ items, emphasis }: { items: string[]; emphasis?: boolean }) {
  return (
    <ul className="mt-6 space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm">
          <span
            className={cn(
              "mt-px flex size-5 shrink-0 items-center justify-center rounded-full",
              emphasis ? "bg-linear-to-br from-violet-600 to-pink-500 text-white" : "bg-foreground text-background",
            )}
          >
            <Check className="size-3" />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

export function FreePlanCard({ action, className }: { action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col rounded-2xl border bg-background p-7 shadow-sm", className)}>
      <p className="text-sm font-semibold">Free</p>
      <p className="mt-1 text-sm text-muted-foreground">Everything you need to show your reviews.</p>
      <div className="mt-6 flex items-baseline gap-1.5">
        <span className="text-4xl font-semibold tracking-tight">$0</span>
        <span className="text-sm text-muted-foreground">forever</span>
      </div>
      <p className="mt-1.5 h-5 text-xs text-muted-foreground" />
      <FeatureList items={FREE_FEATURES} />
      {action && <div className="mt-auto pt-8">{action}</div>}
    </div>
  );
}

export function ProPlanCard({
  interval,
  onIntervalChange,
  action,
  className,
}: {
  interval: BillingInterval;
  onIntervalChange?: (interval: BillingInterval) => void;
  action?: ReactNode;
  className?: string;
}) {
  const price = PRO_PRICES[interval];
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border border-violet-200 bg-linear-to-br from-violet-50/70 via-background to-pink-50/70 p-7 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="inline-flex items-center gap-1.5 text-sm font-semibold">
          <Crown className="size-3.5" /> Pro
        </p>
        {onIntervalChange && <IntervalToggle value={interval} onChange={onIntervalChange} />}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Make every form look like your brand.</p>
      <div className="mt-6 flex items-baseline gap-1.5">
        <span className="text-4xl font-semibold tracking-tight">${price.amount}</span>
        <span className="text-sm text-muted-foreground">{price.per}</span>
        {interval === "year" && <span className="ml-1 text-sm text-muted-foreground line-through">$144</span>}
      </div>
      <p className={cn("mt-1.5 h-5 text-xs", interval === "year" ? "font-medium text-violet-700" : "text-muted-foreground")}>
        {price.note}
      </p>
      <FeatureList items={PRO_FEATURES} emphasis />
      {action && <div className="mt-auto pt-8">{action}</div>}
    </div>
  );
}
