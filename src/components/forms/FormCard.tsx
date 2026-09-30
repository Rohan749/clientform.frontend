import { Archive, ArchiveRestore, Check, Code2, Copy, CopyPlus, ExternalLink, EyeOff, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router";
import { FormStatusPill } from "@/components/common/StatusPill";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCopy } from "@/hooks/useCopy";
import { pluralize, timeAgo } from "@/lib/format";
import { displayUrl, publicFormUrl } from "@/lib/links";
import type { FormSummary } from "@/types";

interface FormCardProps {
  form: FormSummary;
  onUnpublish: () => void;
  onArchiveToggle: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onEmbed: () => void;
}

export function FormCard({ form, onUnpublish, onArchiveToggle, onDelete, onDuplicate, onEmbed }: FormCardProps) {
  const { copy, copied } = useCopy();
  const isLive = form.status === "published" && form.slug;
  const url = form.slug ? publicFormUrl(form.slug) : null;

  return (
    <div className="group flex min-w-0 flex-col rounded-2xl border bg-card p-5 shadow-xs transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <Link to={`/forms/${form.id}/edit`} className="min-w-0 outline-none">
          <h3 className="truncate text-[15px] font-semibold tracking-tight group-hover:underline group-hover:underline-offset-4">
            {form.name}
          </h3>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">{form.title || "No title yet"}</p>
        </Link>
        <div className="flex shrink-0 items-center gap-1">
          <FormStatusPill status={form.status} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="text-muted-foreground" aria-label="More actions">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={onDuplicate}>
                <CopyPlus /> Duplicate form
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onEmbed} disabled={!isLive}>
                <Code2 /> Embed on website
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {form.status === "published" && (
                <DropdownMenuItem onSelect={onUnpublish}>
                  <EyeOff /> Unpublish
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onSelect={onArchiveToggle}>
                {form.status === "archived" ? (
                  <>
                    <ArchiveRestore /> Restore to drafts
                  </>
                ) : (
                  <>
                    <Archive /> Archive
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={onDelete}>
                <Trash2 /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mt-5 flex items-baseline gap-2 text-sm">
        <Link to={`/submissions?form=${form.id}`} className="font-medium hover:underline">
          {pluralize(form.submission_count, "submission")}
        </Link>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">Updated {timeAgo(form.updated_at)}</span>
      </div>

      <div className="mt-3 flex h-8 items-center rounded-lg bg-muted/60 px-2.5">
        <span className="truncate font-mono text-xs text-muted-foreground">
          {isLive && url ? displayUrl(url) : "Not published yet"}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/forms/${form.id}/edit`}>
            <Pencil /> Edit
          </Link>
        </Button>
        <Button variant="outline" size="sm" disabled={!isLive} onClick={() => url && copy(url)}>
          {copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy"}
        </Button>
        {isLive && url ? (
          <Button variant="outline" size="sm" asChild>
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink /> Open
            </a>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            <ExternalLink /> Open
          </Button>
        )}
      </div>
    </div>
  );
}
