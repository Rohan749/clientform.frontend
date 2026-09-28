import { Check, Copy, ExternalLink, Loader2, Pencil } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCopy } from "@/hooks/useCopy";
import { displayUrl, publicFormPrefix, publicFormUrl } from "@/lib/links";
import { cn } from "@/lib/utils";

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{1,58}[a-z0-9]$/;

interface ShareLinkProps {
  slug: string;
  /** When provided, the slug can be edited inline. Should throw on failure. */
  onChangeSlug?: (slug: string) => Promise<void>;
  className?: string;
}

export function ShareLink({ slug, onChangeSlug, className }: ShareLinkProps) {
  const url = publicFormUrl(slug);
  const { copy, copied } = useCopy();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(slug);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const next = value.trim().toLowerCase();
    if (next === slug) {
      setEditing(false);
      return;
    }
    if (!SLUG_PATTERN.test(next)) {
      setError("Use 3–60 lowercase letters, numbers and hyphens");
      return;
    }
    if (!onChangeSlug) return;
    setSaving(true);
    setError(null);
    try {
      await onChangeSlug(next);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update the link");
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <form onSubmit={submit} className={cn("space-y-2", className)}>
        <div className="flex items-center gap-2">
          <div className="flex h-10 min-w-0 flex-1 items-center rounded-lg border border-input bg-background pl-3 text-sm shadow-xs focus-within:border-foreground/30 focus-within:ring-[3px] focus-within:ring-ring/20">
            <span className="shrink-0 text-muted-foreground">{publicFormPrefix()}</span>
            <Input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
              className="h-full border-0 pl-0 shadow-none focus-visible:ring-0"
              maxLength={60}
              aria-label="Form link"
            />
          </div>
          <Button type="submit" size="sm" className="h-10" disabled={saving}>
            {saving && <Loader2 className="animate-spin" />}
            Save
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-10"
            onClick={() => {
              setEditing(false);
              setValue(slug);
              setError(null);
            }}
          >
            Cancel
          </Button>
        </div>
        {error && <p className="text-xs font-medium text-destructive">{error}</p>}
      </form>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border bg-muted/50 px-3">
        <span className="truncate font-mono text-[13px]">{displayUrl(url)}</span>
        {onChangeSlug && (
          <button
            type="button"
            onClick={() => {
              setValue(slug);
              setEditing(true);
            }}
            className="ml-auto shrink-0 rounded p-1 text-muted-foreground hover:bg-background hover:text-foreground"
            aria-label="Customize link"
          >
            <Pencil className="size-3.5" />
          </button>
        )}
      </div>
      <Button type="button" variant="outline" className="h-10" onClick={() => copy(url)}>
        {copied ? <Check /> : <Copy />}
        <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
      </Button>
      <Button variant="outline" className="h-10" asChild>
        <a href={url} target="_blank" rel="noopener noreferrer">
          <ExternalLink />
          <span className="hidden sm:inline">Open</span>
        </a>
      </Button>
    </div>
  );
}
