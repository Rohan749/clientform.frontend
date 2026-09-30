import { AlertTriangle, CreditCard, Crown, ExternalLink, Loader2 } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";
import { FreePlanCard, ProPlanCard } from "@/components/billing/PlanCards";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ErrorState } from "@/components/common/ErrorState";
import { PageHeader } from "@/components/common/PageHeader";
import { PageContainer } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlan } from "@/hooks/usePlan";
import { api, errorMessage } from "@/lib/api";
import { PRO_PRICES } from "@/lib/plans";
import { queryCache, queryKeys } from "@/lib/queryCache";
import type { BillingInterval, BillingState } from "@/types";

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : null;

/** After checkout the webhook can take a few seconds; keep checking for up to this long. */
const CONFIRM_TIMEOUT_MS = 45_000;

export default function BillingPage() {
  const { billing, loading, error, reload, testMode, testPlan } = usePlan();
  const [searchParams, setSearchParams] = useSearchParams();
  const [interval, setBillingInterval] = useState<BillingInterval>(() =>
    searchParams.get("interval") === "month" ? "month" : "year",
  );
  const [busy, setBusy] = useState<null | "checkout" | "portal">(null);
  const [confirming, setConfirming] = useState(false);
  const [dialog, setDialog] = useState<null | "cancel" | "switch">(null);
  const handledReturn = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const store = (state: BillingState) => queryCache.set<BillingState>(queryKeys.billing, () => state);

  // Coming back from Dodo checkout: confirm the payment, then clean up the URL.
  useEffect(() => {
    const checkout = searchParams.get("checkout");
    if (!checkout || handledReturn.current) return;
    handledReturn.current = true;
    setSearchParams({}, { replace: true });

    if (checkout === "cancelled") {
      toast("Checkout cancelled", { description: "You weren't charged." });
      return;
    }

    setConfirming(true);
    const started = Date.now();
    const check = async () => {
      try {
        const state = await api.billing.sync();
        store(state);
        if (state.plan === "pro") {
          toast.success("Welcome to Pro!", { description: "Open a form and choose Design to make it yours." });
          setConfirming(false);
          return;
        }
      } catch {
        // Keep trying: the webhook usually lands within seconds.
      }
      if (!mounted.current) return;
      if (Date.now() - started > CONFIRM_TIMEOUT_MS) {
        setConfirming(false);
        toast("We're still confirming your payment", {
          description: "This can take a minute. Refresh this page soon. You won't be charged twice.",
        });
        return;
      }
      window.setTimeout(check, 3000);
    };
    void check();
  }, [searchParams, setSearchParams]);

  const startCheckout = async () => {
    setBusy("checkout");
    try {
      const { checkout_url } = await api.billing.checkout(interval);
      window.location.assign(checkout_url);
    } catch (err) {
      toast.error(errorMessage(err));
      setBusy(null);
    }
  };

  const openPortal = async () => {
    setBusy("portal");
    try {
      const { url } = await api.billing.portal();
      window.location.assign(url);
    } catch (err) {
      toast.error(errorMessage(err));
      setBusy(null);
    }
  };

  const runAction = async (action: () => Promise<BillingState>, success: string) => {
    try {
      store(await action());
      toast.success(success);
    } catch (err) {
      toast.error(errorMessage(err));
      throw err; // keeps the dialog open
    }
  };

  if (loading) {
    return (
      <PageContainer className="max-w-4xl">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-3 h-4 w-64" />
        <Skeleton className="mt-8 h-40 rounded-2xl" />
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </PageContainer>
    );
  }

  if (error || !billing) {
    return (
      <PageContainer className="max-w-4xl">
        <ErrorState message={error ?? "Couldn't load your plan."} onRetry={() => void reload().catch(() => undefined)} />
      </PageContainer>
    );
  }

  const sub = billing.subscription;
  const isPro = billing.plan === "pro";
  const paymentProblem = !isPro && sub?.status === "on_hold";
  const otherInterval: BillingInterval = sub?.interval === "year" ? "month" : "year";

  return (
    <PageContainer className="max-w-4xl">
      <PageHeader title="Billing" description="Your plan and payments." />

      {testMode && (
        <div className="mt-8 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-950">
          <p className="font-semibold">🧪 You're in Test Mode, acting as {testPlan === "pro" ? "Pro" : "Free"}.</p>
          <p className="mt-1">
            Below is your <strong>real</strong> plan. Upgrading, cancelling and payment changes are turned off while
            testing. Switch to Live Mode in the sidebar to manage it.
          </p>
        </div>
      )}

      {confirming && (
        <div className="mt-8 flex items-center gap-3 rounded-2xl border bg-neutral-50 p-5 text-sm animate-in fade-in-0">
          <Loader2 className="size-4 animate-spin" />
          Confirming your payment with Dodo Payments…
        </div>
      )}

      {/* Current plan */}
      <section className="mt-8 rounded-2xl border bg-background p-6 shadow-xs">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">Current plan</p>
            <p className="mt-2 flex items-center gap-2 text-2xl font-semibold tracking-tight">
              {isPro ? (
                <>
                  <Crown className="size-5" /> Pro
                  {sub?.interval && (
                    <span className="rounded-full border px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {PRO_PRICES[sub.interval].label}
                    </span>
                  )}
                </>
              ) : (
                "Free"
              )}
            </p>
            <PlanStatusLine billing={billing} />
          </div>

          {billing.has_billing_account && (
            <Button variant="outline" onClick={openPortal} disabled={busy !== null || testMode} className="shrink-0">
              {busy === "portal" ? <Loader2 className="animate-spin" /> : <CreditCard />}
              Manage payments <ExternalLink className="size-3 opacity-60" />
            </Button>
          )}
        </div>

        {isPro && sub?.status === "active" && !testMode && (
          <div className="mt-6 flex flex-wrap gap-2 border-t pt-5">
            {sub.cancel_at_period_end ? (
              <Button size="sm" onClick={() => void runAction(api.billing.resume, "Your Pro plan will keep going").catch(() => undefined)}>
                Keep my Pro plan
              </Button>
            ) : (
              <>
                {sub.interval && (
                  <Button size="sm" variant="outline" onClick={() => setDialog("switch")}>
                    Switch to {PRO_PRICES[otherInterval].label.toLowerCase()} billing
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => setDialog("cancel")}>
                  Cancel plan
                </Button>
              </>
            )}
          </div>
        )}
      </section>

      {/* Upgrade */}
      {!isPro && !paymentProblem && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold tracking-tight">Upgrade to Pro</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep everything in Free. Add your own look to every form.
          </p>
          {!billing.configured && (
            <p className="mt-4 rounded-xl border border-dashed px-4 py-3 text-sm text-muted-foreground">
              Payments aren't set up yet, so upgrading isn't available right now.
            </p>
          )}
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <FreePlanCard
              action={
                <Button variant="outline" className="h-11 w-full" disabled>
                  Your current plan
                </Button>
              }
            />
            <ProPlanCard
              interval={interval}
              onIntervalChange={setBillingInterval}
              action={
                <Button
                  className="h-11 w-full"
                  onClick={startCheckout}
                  disabled={!billing.configured || busy !== null || confirming || testMode}
                >
                  {busy === "checkout" && <Loader2 className="animate-spin" />}
                  Upgrade for ${PRO_PRICES[interval].amount} {PRO_PRICES[interval].per}
                </Button>
              }
            />
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Secure checkout by Dodo Payments. Cancel any time; Pro stays on until the end of the period you paid for.
          </p>
        </section>
      )}

      <ConfirmDialog
        open={dialog === "cancel"}
        onOpenChange={(open) => !open && setDialog(null)}
        title="Cancel your Pro plan?"
        description={`Pro stays on until ${formatDate(sub?.current_period_end ?? null) ?? "the end of this billing period"}. After that, your forms go back to the standard look and show the ClientForm badge. Your saved designs are kept.`}
        confirmLabel="Cancel plan"
        destructive
        onConfirm={() => runAction(api.billing.cancel, "Your plan is cancelled. Pro stays on until the period ends.")}
      />
      <ConfirmDialog
        open={dialog === "switch"}
        onOpenChange={(open) => !open && setDialog(null)}
        title={`Switch to ${PRO_PRICES[otherInterval].label.toLowerCase()} billing?`}
        description={`Your plan changes now to $${PRO_PRICES[otherInterval].amount} ${PRO_PRICES[otherInterval].per}. The price difference is worked out for the time left in this period and charged or credited right away.`}
        confirmLabel="Switch plan"
        onConfirm={() =>
          runAction(() => api.billing.changeInterval(otherInterval), `You're now on ${PRO_PRICES[otherInterval].label.toLowerCase()} billing`)
        }
      />
    </PageContainer>
  );
}

function PlanStatusLine({ billing }: { billing: BillingState }) {
  const sub = billing.subscription;
  const isPro = billing.plan === "pro";

  if (isPro && sub) {
    if (sub.status === "past_due") {
      return (
        <Notice tone="warning">
          Your last payment didn't go through. Update your card
          {sub.past_due_ends_at ? ` by ${formatDate(sub.past_due_ends_at)}` : ""} to keep Pro.
        </Notice>
      );
    }
    if (sub.status === "cancelled" || sub.cancel_at_period_end) {
      return (
        <p className="mt-2 text-sm text-muted-foreground">
          Cancelled. Pro stays on until {formatDate(sub.current_period_end) ?? "the end of this period"}.
        </p>
      );
    }
    return (
      <p className="mt-2 text-sm text-muted-foreground">
        {sub.current_period_end ? `Renews on ${formatDate(sub.current_period_end)}.` : "Active."}
      </p>
    );
  }

  switch (sub?.status) {
    case "on_hold":
      return (
        <Notice tone="warning">
          Your last payment didn't go through, so Pro is paused. Update your card under “Manage payments” to turn it
          back on.
        </Notice>
      );
    case "pending":
      return <p className="mt-2 text-sm text-muted-foreground">Your payment is still being processed.</p>;
    case "failed":
      return <p className="mt-2 text-sm text-muted-foreground">Your last checkout didn't go through. You can try again below.</p>;
    case "expired":
    case "cancelled":
      return <p className="mt-2 text-sm text-muted-foreground">Your Pro plan has ended. Your saved designs are kept.</p>;
    default:
      return <p className="mt-2 text-sm text-muted-foreground">All the basics, free forever.</p>;
  }
}

function Notice({ tone, children }: { tone: "warning"; children: ReactNode }) {
  return (
    <p
      className={
        tone === "warning"
          ? "mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900"
          : undefined
      }
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
