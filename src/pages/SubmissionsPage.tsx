import { Inbox } from "lucide-react";
import { useSearchParams } from "react-router";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { PageHeader } from "@/components/common/PageHeader";
import { SUBMISSION_STATUS_LABELS } from "@/components/common/StatusPill";
import { PageContainer } from "@/components/layout/DashboardLayout";
import { SubmissionTable } from "@/components/submissions/SubmissionTable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useApi } from "@/hooks/useApi";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { SubmissionStatus } from "@/types";

const FILTERS: Array<{ value: SubmissionStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "new", label: SUBMISSION_STATUS_LABELS.new },
  { value: "reviewed", label: SUBMISSION_STATUS_LABELS.reviewed },
  { value: "archived", label: SUBMISSION_STATUS_LABELS.archived },
];

const ALL_FORMS = "all";

export default function SubmissionsPage() {
  const [params, setParams] = useSearchParams();
  const status = (params.get("status") as SubmissionStatus | null) ?? undefined;
  const formId = params.get("form") ?? undefined;

  const { data: submissions, loading, error, reload } = useApi(
    () => api.submissions.list({ status, form_id: formId }),
    [status, formId],
  );
  const { data: forms } = useApi(() => api.forms.list(), []);

  const setParam = (key: string, value: string | undefined) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const filtered = Boolean(status || formId);

  return (
    <PageContainer>
      <PageHeader title="Submissions" description="Project requests from your clients." />

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex w-fit rounded-lg bg-muted p-1">
          {FILTERS.map((filter) => {
            const active = (status ?? "all") === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setParam("status", filter.value === "all" ? undefined : filter.value)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-[13px] font-medium transition-all",
                  active ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {forms && forms.length > 1 && (
          <Select value={formId ?? ALL_FORMS} onValueChange={(value) => setParam("form", value === ALL_FORMS ? undefined : value)}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="All forms" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value={ALL_FORMS}>All forms</SelectItem>
              {forms.map((form) => (
                <SelectItem key={form.id} value={form.id}>
                  {form.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="mt-5">
        {loading && !submissions ? (
          <div className="overflow-hidden rounded-2xl border">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 border-b px-5 py-4 last:border-0">
                <Skeleton className="size-8 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-44" />
                </div>
                <Skeleton className="ml-auto h-5 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : submissions && submissions.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title={filtered ? "Nothing here" : "No submissions yet."}
            description={
              filtered
                ? "No submissions match these filters."
                : "Once clients submit your form, they'll appear here."
            }
          />
        ) : (
          submissions && <SubmissionTable submissions={submissions} />
        )}
      </div>
    </PageContainer>
  );
}
