import { cn } from "@/lib/utils";
import type { FormStatus, SubmissionStatus } from "@/types";

const FORM_STATUS: Record<FormStatus, { label: string; dot: string }> = {
  published: { label: "Live", dot: "bg-success" },
  draft: { label: "Draft", dot: "bg-neutral-300" },
  archived: { label: "Archived", dot: "bg-neutral-400" },
};

const SUBMISSION_STATUS: Record<SubmissionStatus, { label: string; dot: string }> = {
  new: { label: "New", dot: "bg-foreground" },
  reviewed: { label: "Reviewed", dot: "bg-neutral-300" },
  archived: { label: "Archived", dot: "bg-neutral-400" },
};

function Pill({ label, dot, className }: { label: string; dot: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border bg-background px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", dot)} />
      {label}
    </span>
  );
}

export function FormStatusPill({ status, className }: { status: FormStatus; className?: string }) {
  return <Pill {...FORM_STATUS[status]} className={className} />;
}

export function SubmissionStatusPill({ status, className }: { status: SubmissionStatus; className?: string }) {
  return <Pill {...SUBMISSION_STATUS[status]} className={className} />;
}

export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  new: "New",
  reviewed: "Reviewed",
  archived: "Archived",
};
