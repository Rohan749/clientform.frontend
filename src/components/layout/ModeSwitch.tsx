import { FlaskConical } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { usePlan } from "@/hooks/usePlan";
import { api, errorMessage } from "@/lib/api";
import { queryCache, queryKeys } from "@/lib/queryCache";
import { cn } from "@/lib/utils";
import type { AdminMode, BillingState } from "@/types";

/**
 * Switches the admin between Live Mode and Test Mode (acting as Free or Pro). The change shows
 * instantly and is saved on the server, which is where every Pro rule is checked.
 */
export function useAdminMode() {
  const { billing } = usePlan();
  const [busy, setBusy] = useState(false);

  const set = async (mode: AdminMode["mode"], testPlan?: AdminMode["test_plan"]) => {
    if (!billing?.admin) return;
    const previous = billing;
    const test_plan = testPlan ?? billing.admin.test_plan;
    queryCache.set<BillingState>(queryKeys.billing, () => ({
      ...previous,
      admin: { mode, test_plan },
      effective_plan: mode === "test" ? test_plan : previous.plan,
    }));
    setBusy(true);
    try {
      const next = await api.admin.setMode(mode, test_plan);
      queryCache.set<BillingState>(queryKeys.billing, () => next);
    } catch (error) {
      queryCache.set<BillingState>(queryKeys.billing, () => previous);
      toast.error(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return { admin: billing?.admin ?? null, realPlan: billing?.plan ?? "free", busy, set };
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
  disabled,
}: {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="grid grid-cols-2 gap-0.5 rounded-lg bg-muted p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          disabled={disabled}
          onClick={() => value !== option.value && onChange(option.value)}
          className={cn(
            "rounded-md px-2 py-1 text-xs font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
            value === option.value ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/** Sidebar control, shown only to the admin account (the server decides who that is). */
export function ModeSwitch() {
  const { admin, realPlan, busy, set } = useAdminMode();
  if (!admin) return null;
  const testing = admin.mode === "test";

  return (
    <div
      className={cn(
        "mb-1 rounded-xl border p-2.5 transition-colors",
        testing ? "border-amber-300 bg-amber-50" : "bg-background",
      )}
    >
      <p className="mb-2 flex items-center gap-1.5 px-0.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
        <FlaskConical className="size-3" /> Admin
      </p>
      <Segmented
        label="Mode"
        value={admin.mode}
        disabled={busy}
        onChange={(mode) => void set(mode)}
        options={[
          { value: "live", label: "🟢 Live" },
          { value: "test", label: "🧪 Test" },
        ]}
      />
      {testing ? (
        <div className="mt-2 space-y-1.5 animate-in fade-in-0 slide-in-from-top-1 duration-200">
          <Segmented
            label="Test plan"
            value={admin.test_plan}
            disabled={busy}
            onChange={(plan) => void set("test", plan)}
            options={[
              { value: "free", label: "Free" },
              { value: "pro", label: "Pro" },
            ]}
          />
          <p className="px-0.5 text-[11px] leading-snug text-amber-900">
            Acting as {admin.test_plan === "pro" ? "Pro" : "Free"}. Not your real plan.
          </p>
        </div>
      ) : (
        <p className="mt-1.5 px-0.5 text-[11px] text-muted-foreground">Your real plan: {realPlan === "pro" ? "Pro" : "Free"}</p>
      )}
    </div>
  );
}

/** Strip across the top of every dashboard page while testing, so it's never mistaken for real. */
export function TestModeBanner() {
  const { admin, busy, set } = useAdminMode();
  if (admin?.mode !== "test") return null;
  return (
    <div
      role="status"
      className="flex h-9 items-center justify-center gap-2 border-b border-amber-300 bg-amber-100 px-3 text-xs text-amber-950 sm:text-[13px]"
    >
      <span className="truncate">
        🧪 <strong>Test Mode:</strong> acting as {admin.test_plan === "pro" ? "Pro" : "Free"}
        <span className="hidden sm:inline">, including your live forms. Your real plan and billing are unchanged.</span>
      </span>
      <button
        type="button"
        disabled={busy}
        onClick={() => void set("live")}
        className="shrink-0 rounded-md bg-amber-950 px-2 py-0.5 font-medium text-amber-50 hover:bg-amber-900 disabled:opacity-60"
      >
        Switch to Live
      </button>
    </div>
  );
}
