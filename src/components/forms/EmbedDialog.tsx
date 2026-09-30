import { Check, Copy, Crown } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCopy } from "@/hooks/useCopy";
import { usePlan } from "@/hooks/usePlan";
import { appOrigin } from "@/lib/links";
import { cn } from "@/lib/utils";

type Kind = "script" | "iframe";

export function embedCode(slug: string, kind: Kind) {
  const origin = appOrigin();
  return kind === "script"
    ? `<script src="${origin}/embed.js" data-clientform="${slug}" async></script>`
    : `<iframe src="${origin}/f/${slug}?embed=1" title="Project request form" width="100%" height="900" style="border:0" loading="lazy"></iframe>`;
}

/** Copy-paste code to put a published form on the user's own website. */
export function EmbedDialog({
  open,
  onOpenChange,
  slug,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Null when the form isn't published yet. */
  slug: string | null;
}) {
  const [kind, setKind] = useState<Kind>("script");
  const { copy, copied } = useCopy();
  const { isPro, billing } = usePlan();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-lg">Embed on your website</DialogTitle>
          <DialogDescription>
            Paste this code where you want the form to appear, on any site builder that allows custom code.
          </DialogDescription>
        </DialogHeader>

        {!slug ? (
          <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
            Publish the form first. Then you can embed it anywhere.
          </p>
        ) : (
          <div className="min-w-0 space-y-4">
            <div className="inline-flex rounded-lg bg-muted p-1" role="tablist" aria-label="Embed type">
              {(
                [
                  ["script", "Fits automatically"],
                  ["iframe", "Simple iframe"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={kind === value}
                  onClick={() => setKind(value)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-[13px] font-medium transition-all",
                    kind === value ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="relative">
              <pre className="overflow-x-auto rounded-xl border bg-neutral-50 p-4 pr-24 font-mono text-xs leading-relaxed whitespace-pre-wrap break-all">
                {embedCode(slug, kind)}
              </pre>
              <Button size="sm" className="absolute top-2.5 right-2.5" onClick={() => copy(embedCode(slug, kind))}>
                {copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy"}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              {kind === "script"
                ? "Recommended. The form grows and shrinks with its content, so there's never a scrollbar inside it."
                : "Use this if your site builder doesn't allow scripts. Change the height if the form needs more room."}
            </p>

            {billing &&
              (isPro ? (
                <p className="flex items-center gap-2 rounded-xl border bg-muted/40 px-3 py-2.5 text-xs">
                  <Crown className="size-3.5 shrink-0" /> Pro: the ClientForm badge is removed from embedded forms.
                </p>
              ) : (
                <p className="rounded-xl border bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
                  Embedded forms show a small ClientForm badge.{" "}
                  <Link to="/billing" className="font-medium text-foreground underline-offset-4 hover:underline" onClick={() => onOpenChange(false)}>
                    Go Pro
                  </Link>{" "}
                  to remove it.
                </p>
              ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
