import { Lock } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A minimal browser window used to present client-facing pages inside the app. */
export function BrowserFrame({ url, children, className }: { url: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col overflow-hidden rounded-2xl border  shadow-sm", className)}>
      <div className="flex h-10 shrink-0 items-center gap-3 border-b  px-4">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-neutral-200" />
          <span className="size-2.5 rounded-full bg-neutral-200" />
          <span className="size-2.5 rounded-full bg-neutral-200" />
        </div>
        <div className="mx-auto flex h-6 max-w-[70%] min-w-0 items-center gap-1.5 rounded-md border bg-background px-2.5 text-[11px] text-muted-foreground">
          <Lock className="size-2.5 shrink-0" />
          <span className="truncate">{url}</span>
        </div>
        <div className="w-[42px]" />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
