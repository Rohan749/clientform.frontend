import { ArrowLeft, ChevronDown, ExternalLink, EyeOff, Loader2 } from "lucide-react";
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
import { type BuilderTab, BuilderTabs } from "./BuilderTabs";

interface BuilderHeaderProps {
  tab: BuilderTab;
  onTabChange: (tab: BuilderTab) => void;
  name: string;
  onNameChange: (name: string) => void;
  meta: FormRecord | null;
  dirty: boolean;
  saving: boolean;
  publishing: boolean;
  onSave: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
}

export function BuilderHeader({
  tab,
  onTabChange,
  name,
  onNameChange,
  meta,
  dirty,
  saving,
  publishing,
  onSave,
  onPublish,
  onUnpublish,
}: BuilderHeaderProps) {
  const status = meta?.status ?? "draft";
  const isPublished = status === "published";
  const busy = saving || publishing;

  const saveState = !meta ? "Not saved yet" : dirty ? "Unsaved changes" : "All changes saved";

  return (
    <div className="sticky top-14 z-20 shrink-0 border-b bg-background/90 backdrop-blur-md lg:top-0">
    <div className="relative flex h-16 items-center gap-2 px-3 sm:gap-3 sm:px-6">
      <Button variant="ghost" size="icon-sm" asChild className="shrink-0 text-muted-foreground">
        <Link to="/forms" aria-label="Back to forms">
          <ArrowLeft />
        </Link>
      </Button>

      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          maxLength={120}
          placeholder="Untitled form"
          aria-label="Form name"
          className="h-8 min-w-0 flex-1 truncate rounded-md bg-transparent px-1.5 text-[15px] font-semibold tracking-tight outline-none transition-colors hover:bg-muted focus:bg-muted sm:max-w-56 xl:max-w-xs"
        />
        <FormStatusPill status={status} className="hidden shrink-0 sm:inline-flex" />
        <span className="hidden shrink-0 text-xs text-muted-foreground 2xl:inline">{saveState}</span>
      </div>

      <BuilderTabs value={tab} onChange={onTabChange} className="absolute left-1/2 hidden -translate-x-1/2 lg:inline-flex" />

      <div className="flex shrink-0 items-center gap-2">
        {isPublished ? (
          <>
            <Button onClick={onSave} disabled={busy || !dirty} size="sm" className="h-9">
              {saving && <Loader2 className="animate-spin" />}
              {dirty ? "Save changes" : "Saved"}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon-sm" className="size-9" aria-label="More publishing options">
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
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={onUnpublish} disabled={busy}>
                  <EyeOff /> Unpublish
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <>
            <Button variant="outline" size="sm" className="h-9" onClick={onSave} disabled={busy || (!dirty && Boolean(meta))}>
              {saving && !publishing && <Loader2 className="animate-spin" />}
              Save draft
            </Button>
            <Button size="sm" className="h-9" onClick={onPublish} disabled={busy}>
              {publishing && <Loader2 className="animate-spin" />}
              Publish
            </Button>
          </>
        )}
      </div>
    </div>
    <div className="flex justify-center pb-3 lg:hidden">
      <BuilderTabs value={tab} onChange={onTabChange} />
    </div>
    </div>
  );
}
