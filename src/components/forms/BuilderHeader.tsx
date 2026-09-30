import { ArrowLeft, ChevronDown, Code2, ExternalLink, EyeOff, Loader2 } from "lucide-react";
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
import { publicFormUrl } from "@/lib/links";
import type { FormRecord } from "@/types";
import { type BuilderStep, BuilderStepper } from "./BuilderSteps";

interface BuilderHeaderProps {
  step: BuilderStep;
  onStepChange: (step: BuilderStep) => void;
  name: string;
  meta: FormRecord | null;
  dirty: boolean;
  saving: boolean;
  publishing: boolean;
  onSave: () => void;
  onUnpublish: () => void;
  onEmbed: () => void;
}

/** Top bar of the builder: form name + save on one row, the numbered steps below. */
export function BuilderHeader({
  step,
  onStepChange,
  name,
  meta,
  dirty,
  saving,
  publishing,
  onSave,
  onUnpublish,
  onEmbed,
}: BuilderHeaderProps) {
  const status = meta?.status ?? "draft";
  const isPublished = status === "published";
  const busy = saving || publishing;
  const saveState = !meta ? "Not saved yet" : dirty ? "Unsaved changes" : "All changes saved";

  return (
    <div className="sticky top-14 z-20 shrink-0 border-b bg-background/90 backdrop-blur-md lg:top-0">
      <div className="flex h-14 items-center gap-2 px-3 sm:gap-3 sm:px-6">
        <Button variant="ghost" size="icon-sm" asChild className="shrink-0 text-muted-foreground">
          <Link to="/forms" aria-label="Back to forms">
            <ArrowLeft />
          </Link>
        </Button>

        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <p className="truncate text-[15px] font-semibold tracking-tight">{name.trim() || "Untitled form"}</p>
          <FormStatusPill status={status} className="hidden shrink-0 sm:inline-flex" />
          <span className="hidden shrink-0 text-xs text-muted-foreground xl:inline">{saveState}</span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="sm" className="h-9" onClick={onSave} disabled={busy || (!dirty && Boolean(meta))}>
            {saving && !publishing && <Loader2 className="animate-spin" />}
            {isPublished ? (dirty ? "Save changes" : "Saved") : "Save draft"}
          </Button>
          {isPublished && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon-sm" className="size-9" aria-label="Live form options">
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {meta?.slug && (
                  <DropdownMenuItem asChild>
                    <a href={publicFormUrl(meta.slug)} target="_blank" rel="noopener noreferrer">
                      <ExternalLink /> View live form
                    </a>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onSelect={onEmbed}>
                  <Code2 /> Embed on website
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={onUnpublish} disabled={busy}>
                  <EyeOff /> Unpublish
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      <div className="border-t border-border/60 py-2">
        <BuilderStepper current={step} onSelect={onStepChange} />
      </div>
    </div>
  );
}
