import { ArrowLeft, Mail, MoreHorizontal, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ErrorState } from "@/components/common/ErrorState";
import { SUBMISSION_STATUS_LABELS } from "@/components/common/StatusPill";
import { PageContainer } from "@/components/layout/DashboardLayout";
import { SubmissionClientCard, SubmissionDetails } from "@/components/submissions/SubmissionDetails";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useCachedQuery } from "@/hooks/useCachedQuery";
import { api, errorMessage } from "@/lib/api";
import { queryCache, queryKeys } from "@/lib/queryCache";
import type { SubmissionStatus } from "@/types";

export default function SubmissionDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: submission, loading, error, reload, setData } = useCachedQuery(
    queryKeys.submission(id),
    () => api.submissions.get(id),
    { staleTime: 60_000 },
  );
  const [confirmDelete, setConfirmDelete] = useState(false);
  const markedRead = useRef(false);

  // Opening a new submission marks it as reviewed, like an inbox.
  useEffect(() => {
    if (!submission || submission.status !== "new" || markedRead.current) return;
    markedRead.current = true;
    api.submissions
      .updateStatus(submission.id, "reviewed")
      .then(({ status }) => {
        setData((prev) => (prev ? { ...prev, status } : prev));
        queryCache.invalidate(queryKeys.submissionLists, queryKeys.dashboard);
      })
      .catch(() => undefined);
  }, [submission, setData]);

  const changeStatus = async (status: SubmissionStatus) => {
    if (!submission) return;
    try {
      await api.submissions.updateStatus(submission.id, status);
      setData((prev) => (prev ? { ...prev, status } : prev));
      queryCache.invalidate(queryKeys.submissionLists, queryKeys.dashboard);
      toast.success(`Marked as ${SUBMISSION_STATUS_LABELS[status].toLowerCase()}`);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const remove = async () => {
    try {
      await api.submissions.remove(id);
      queryCache.remove(queryKeys.submission(id));
      queryCache.invalidate(queryKeys.submissionLists, queryKeys.dashboard, queryKeys.forms);
      toast.success("Submission deleted");
      navigate("/submissions", { replace: true });
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <PageContainer className="max-w-4xl">
      <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
        <Link to="/submissions">
          <ArrowLeft /> Submissions
        </Link>
      </Button>

      <div className="mt-6">
        {loading && !submission ? (
          <div className="space-y-8">
            <div className="flex items-center gap-5">
              <Skeleton className="size-14 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-72" />
              </div>
            </div>
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => void reload().catch(() => undefined)} />
        ) : submission ? (
          <div className="space-y-8">
            <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <SubmissionClientCard submission={submission} />
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <Select value={submission.status} onValueChange={(value) => changeStatus(value as SubmissionStatus)}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(SUBMISSION_STATUS_LABELS) as SubmissionStatus[]).map((status) => (
                      <SelectItem key={status} value={status}>
                        {SUBMISSION_STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button asChild>
                  <a
                    href={`mailto:${submission.email}?subject=${encodeURIComponent(
                      `Re: ${submission.form?.name ?? "Your project request"}`,
                    )}`}
                  >
                    <Mail /> Reply
                  </a>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" aria-label="More actions">
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem variant="destructive" onSelect={() => setConfirmDelete(true)}>
                      <Trash2 /> Delete submission
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <SubmissionDetails submission={submission} />
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this submission?"
        description="The submission and any attached files will be permanently deleted."
        confirmLabel="Delete"
        destructive
        onConfirm={remove}
      />
    </PageContainer>
  );
}
