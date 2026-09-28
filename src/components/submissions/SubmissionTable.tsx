import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";
import { SubmissionStatusPill } from "@/components/common/StatusPill";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime, initials, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SubmissionListItem } from "@/types";

function ClientCell({ submission }: { submission: SubmissionListItem }) {
  const isNew = submission.status === "new";
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar className="size-8">
        <AvatarFallback className={cn(isNew && "bg-foreground text-background")}>{initials(submission.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className={cn("truncate text-sm", isNew ? "font-semibold" : "font-medium")}>{submission.name}</p>
        <p className="truncate text-xs text-muted-foreground">{submission.email}</p>
      </div>
    </div>
  );
}

export function SubmissionTable({ submissions }: { submissions: SubmissionListItem[] }) {
  const navigate = useNavigate();
  const open = (id: string) => navigate(`/submissions/${id}`);

  return (
    <>
      {/* Desktop / tablet */}
      <div className="hidden overflow-hidden rounded-2xl border shadow-xs md:block">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-5">Client</TableHead>
              <TableHead>Form</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((submission) => (
              <TableRow
                key={submission.id}
                className="cursor-pointer"
                tabIndex={0}
                onClick={() => open(submission.id)}
                onKeyDown={(e) => e.key === "Enter" && open(submission.id)}
              >
                <TableCell className="max-w-72 pl-5">
                  <ClientCell submission={submission} />
                </TableCell>
                <TableCell className="max-w-56 truncate text-muted-foreground">{submission.form?.name ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground" title={formatDateTime(submission.submitted_at)}>
                  {timeAgo(submission.submitted_at)}
                </TableCell>
                <TableCell>
                  <SubmissionStatusPill status={submission.status} />
                </TableCell>
                <TableCell>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile */}
      <ul className="divide-y overflow-hidden rounded-2xl border md:hidden">
        {submissions.map((submission) => (
          <li key={submission.id}>
            <button
              type="button"
              onClick={() => open(submission.id)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/60"
            >
              <div className="min-w-0 flex-1">
                <ClientCell submission={submission} />
                <p className="mt-2 truncate pl-11 text-xs text-muted-foreground">
                  {submission.form?.name} · {timeAgo(submission.submitted_at)}
                </p>
              </div>
              <SubmissionStatusPill status={submission.status} />
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
