import { ArrowRight, Check, FileText, Inbox, Plus, Radio, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { ErrorState } from "@/components/common/ErrorState";
import { SubmissionStatusPill } from "@/components/common/StatusPill";
import { PageContainer } from "@/components/layout/DashboardLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile } from "@/context/ProfileContext";
import { useApi } from "@/hooks/useApi";
import { api } from "@/lib/api";
import { initials, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function Stat({ label, value, icon: Icon }: { label: string; value: number; icon: typeof FileText }) {
  return (
    <div className="rounded-2xl border p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { displayName, profile } = useProfile();
  const { data, loading, error, reload } = useApi(() => api.dashboard(), []);
  const firstName = (profile?.name || displayName).split(" ")[0];

  const steps = data
    ? [
        { label: "Create your first form", done: data.stats.forms > 0, to: "/create-form" },
        { label: "Publish it and grab your link", done: data.stats.published > 0, to: "/forms" },
        { label: "Receive your first project request", done: data.stats.submissions > 0, to: "/submissions" },
      ]
    : [];
  const onboarding = steps.some((step) => !step.done);

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{greeting()},</p>
          <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">{firstName}</h1>
        </div>
        <Button asChild>
          <Link to="/create-form">
            <Plus /> Create form
          </Link>
        </Button>
      </div>

      {error ? (
        <div className="mt-8">
          <ErrorState message={error} onRetry={reload} />
        </div>
      ) : loading || !data ? (
        <div className="mt-8 space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[106px] rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat label="Forms" value={data.stats.forms} icon={FileText} />
            <Stat label="Live forms" value={data.stats.published} icon={Radio} />
            <Stat label="Submissions" value={data.stats.submissions} icon={Inbox} />
            <Stat label="New" value={data.stats.new_submissions} icon={Sparkles} />
          </div>

          <div className={cn("grid gap-6", onboarding && "lg:grid-cols-[1fr_340px]")}>
            <section className="rounded-2xl border shadow-xs">
              <div className="flex items-center justify-between border-b px-5 py-4">
                <h2 className="text-sm font-semibold">Recent submissions</h2>
                <Button variant="ghost" size="sm" asChild className="-mr-2 text-muted-foreground">
                  <Link to="/submissions">
                    View all <ArrowRight />
                  </Link>
                </Button>
              </div>
              {data.recent_submissions.length === 0 ? (
                <div className="flex flex-col items-center px-6 py-14 text-center">
                  <Inbox className="size-5 text-muted-foreground" />
                  <p className="mt-3 text-sm font-medium">No submissions yet.</p>
                  <p className="mt-1 text-sm text-muted-foreground">Once clients submit your form, they'll appear here.</p>
                </div>
              ) : (
                <ul className="divide-y">
                  {data.recent_submissions.map((submission) => (
                    <li key={submission.id}>
                      <Link
                        to={`/submissions/${submission.id}`}
                        className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/50"
                      >
                        <Avatar className="size-8">
                          <AvatarFallback>{initials(submission.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{submission.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {submission.form?.name} · {timeAgo(submission.submitted_at)}
                          </p>
                        </div>
                        <SubmissionStatusPill status={submission.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {onboarding && (
              <section className="rounded-2xl border p-5 shadow-xs">
                <h2 className="text-sm font-semibold">Get set up</h2>
                <p className="mt-1 text-sm text-muted-foreground">Three steps to your first client request.</p>
                <ol className="mt-5 space-y-2">
                  {steps.map((step, index) => (
                    <li key={step.label}>
                      <Link
                        to={step.to}
                        className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted/60"
                      >
                        <span
                          className={cn(
                            "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                            step.done ? "border-foreground bg-foreground text-background" : "text-muted-foreground",
                          )}
                        >
                          {step.done ? <Check className="size-3.5" /> : index + 1}
                        </span>
                        <span className={cn("text-sm", step.done && "text-muted-foreground line-through")}>
                          {step.label}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
