import { ArrowUpRight, Download, FileText } from "lucide-react";
import { Link } from "react-router";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDateTime, initials } from "@/lib/format";
import type { SubmissionAnswer, SubmissionDetail } from "@/types";

function AnswerValue({ answer }: { answer: SubmissionAnswer }) {
  if (!answer.value) return <p className="text-sm text-muted-foreground italic">No answer</p>;

  switch (answer.question_type) {
    case "url":
      return (
        <a
          href={answer.value}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm break-all underline underline-offset-4 hover:text-muted-foreground"
        >
          {answer.value} <ArrowUpRight className="size-3.5 shrink-0" />
        </a>
      );
    case "email":
      return (
        <a href={`mailto:${answer.value}`} className="text-sm underline underline-offset-4 hover:text-muted-foreground">
          {answer.value}
        </a>
      );
    case "file":
      return (
        <div className="flex max-w-md items-center gap-3 rounded-xl border px-3 py-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
            <FileText className="size-4 text-muted-foreground" />
          </div>
          <span className="min-w-0 flex-1 truncate text-sm font-medium">{answer.file_name ?? "Attachment"}</span>
          {answer.file_url ? (
            <Button variant="outline" size="sm" asChild>
              <a href={answer.file_url} target="_blank" rel="noopener noreferrer">
                <Download /> Download
              </a>
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">Unavailable</span>
          )}
        </div>
      );
    case "multiple_choice":
    case "budget":
      return (
        <span className="inline-flex rounded-full border bg-muted/50 px-3 py-1 text-sm font-medium">{answer.value}</span>
      );
    default:
      return <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{answer.value}</p>;
  }
}

export function SubmissionClientCard({ submission }: { submission: SubmissionDetail }) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <Avatar className="size-14">
        <AvatarFallback className="bg-foreground text-lg font-semibold text-background">
          {initials(submission.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-semibold tracking-tight">{submission.name}</h1>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <a href={`mailto:${submission.email}`} className="text-foreground hover:underline">
            {submission.email}
          </a>
          <span>·</span>
          {submission.form ? (
            <Link to={`/forms/${submission.form.id}/edit`} className="hover:text-foreground hover:underline">
              {submission.form.name}
            </Link>
          ) : (
            <span>Deleted form</span>
          )}
          <span>·</span>
          <span>{formatDateTime(submission.submitted_at)}</span>
        </p>
      </div>
    </div>
  );
}

export function SubmissionDetails({ submission }: { submission: SubmissionDetail }) {
  return (
    <div className="rounded-2xl border shadow-xs">
      <div className="border-b px-5 py-4 sm:px-6">
        <h2 className="text-sm font-semibold">Responses</h2>
      </div>
      <dl className="divide-y">
        <div className="grid gap-1.5 px-5 py-5 sm:grid-cols-[200px_1fr] sm:gap-6 sm:px-6">
          <dt className="text-sm text-muted-foreground">Name</dt>
          <dd className="text-[15px]">{submission.name}</dd>
        </div>
        <div className="grid gap-1.5 px-5 py-5 sm:grid-cols-[200px_1fr] sm:gap-6 sm:px-6">
          <dt className="text-sm text-muted-foreground">Email</dt>
          <dd className="text-[15px]">{submission.email}</dd>
        </div>
        {submission.answers.map((answer) => (
          <div key={answer.id} className="grid gap-2 px-5 py-5 sm:grid-cols-[200px_1fr] sm:gap-6 sm:px-6">
            <dt className="text-sm text-muted-foreground">{answer.question_label || "Untitled question"}</dt>
            <dd className="min-w-0">
              <AnswerValue answer={answer} />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
