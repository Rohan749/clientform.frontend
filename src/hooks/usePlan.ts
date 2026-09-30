import { useCachedQuery } from "@/hooks/useCachedQuery";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryCache";
import type { BillingState } from "@/types";

/**
 * The signed-in user's plan. Cached and shared across the dashboard.
 * `isPro` is what the app acts as (it follows the admin's Test Mode); `realPlan` is what they pay for.
 */
export function usePlan() {
  const query = useCachedQuery<BillingState>(queryKeys.billing, api.billing.get, { staleTime: 60_000 });
  const billing = query.data;
  const testMode = billing?.admin?.mode === "test";
  return {
    ...query,
    billing,
    isPro: (billing?.effective_plan ?? billing?.plan) === "pro",
    realPlan: billing?.plan ?? "free",
    testMode,
    testPlan: testMode ? (billing?.admin?.test_plan ?? null) : null,
  };
}
