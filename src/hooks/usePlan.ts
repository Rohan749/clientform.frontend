import { useCachedQuery } from "@/hooks/useCachedQuery";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryCache";
import type { BillingState } from "@/types";

/** The signed-in user's plan. Cached and shared across the dashboard. */
export function usePlan() {
  const query = useCachedQuery<BillingState>(queryKeys.billing, api.billing.get, { staleTime: 60_000 });
  return {
    ...query,
    billing: query.data,
    isPro: query.data?.plan === "pro",
  };
}
