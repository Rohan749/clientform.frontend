import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BUDGETS, PROJECT_TYPES } from "./samples";

function Label({ children, compact }: { children: ReactNode; compact?: boolean }) {
  return (
    <p className={cn("font-medium", compact ? "text-[11px]" : "text-[13px]")}>
      {children}
      <span className="ml-0.5 text-muted-foreground">*</span>
    </p>
  );
}

function FakeInput({ placeholder, tall, compact }: { placeholder: string; tall?: boolean; compact?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-background text-muted-foreground/70",
        compact ? "min-h-7 px-2.5 py-1.5 text-[10px]" : "min-h-9 px-3 py-2.5 text-xs",
        tall && (compact ? "h-12" : "h-16"),
      )}
    >
      {placeholder}
    </div>
  );
}

function Pills({ options, selected, compact }: { options: string[]; selected?: string; compact?: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {options.map((option) => {
        const active = option === selected;
        return (
          <div
            key={option}
            className={cn(
              "flex items-center gap-2 rounded-lg border",
              compact ? "px-2 py-1.5 text-[10px]" : "px-3 py-2 text-xs",
              active ? "border-foreground bg-foreground text-background" : "bg-background",
            )}
          >
            <span
              className={cn(
                "flex shrink-0 items-center justify-center rounded-full border",
                compact ? "size-2.5" : "size-3",
                active ? "border-background" : "border-foreground/25",
              )}
            >
              {active && <span className="size-1 rounded-full bg-background" />}
            </span>
            <span className="truncate">{option}</span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * A static, non-interactive project request form for landing-page mockups.
 * `plain` renders the neutral "generic form" look used in the before/after comparison.
 */
export function MiniForm({
  variant = "clientform",
  compact = false,
  title = "Let's make your next launch video",
  submitLabel = "Send project request",
  className,
}: {
  variant?: "clientform" | "plain";
  compact?: boolean;
  title?: string;
  submitLabel?: string;
  className?: string;
}) {
  const plain = variant === "plain";
  const gap = compact ? "space-y-2.5" : "space-y-4";

  return (
    <div className={cn("rounded-2xl border bg-background", compact ? "p-4" : "p-6", className)} aria-hidden>
      {!plain && (
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex items-center justify-center rounded-full bg-foreground font-semibold text-background",
              compact ? "size-6 text-[9px]" : "size-8 text-[11px]",
            )}
          >
            JS
          </div>
          <p className={cn("font-semibold", compact ? "text-[11px]" : "text-[13px]")}>Juno Studio</p>
        </div>
      )}

      <p
        className={cn(
          "cf-title font-semibold tracking-tight",
          compact ? "text-sm" : "text-xl",
          !plain && (compact ? "mt-3" : "mt-5"),
          !plain &&
            "w-fit bg-linear-to-r from-neutral-950 from-55% via-violet-700 via-85% to-pink-500 bg-clip-text text-transparent",
        )}
      >
        {plain ? "Project request" : title}
      </p>
      {!plain && (
        <p className={cn("mt-1 text-muted-foreground", compact ? "text-[10px]" : "text-xs")}>
          Tell me about your project. I reply within two days.
        </p>
      )}

      <div className={cn(compact ? "mt-3" : "mt-5", gap)}>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label compact={compact}>Name</Label>
            <FakeInput placeholder="Jane Cooper" compact={compact} />
          </div>
          <div className="space-y-1.5">
            <Label compact={compact}>Email</Label>
            <FakeInput placeholder="jane@company.com" compact={compact} />
          </div>
        </div>
        {plain ? (
          <div className="space-y-1.5">
            <Label compact={compact}>Project details</Label>
            <FakeInput placeholder="" tall compact={compact} />
          </div>
        ) : (
          <div className="space-y-1.5">
            <Label compact={compact}>What are we making?</Label>
            <Pills options={PROJECT_TYPES} selected="Product demo" compact={compact} />
          </div>
        )}
        <div className="space-y-1.5">
          <Label compact={compact}>Budget</Label>
          {plain ? <FakeInput placeholder="" compact={compact} /> : <Pills options={BUDGETS} selected="$5k – $10k" compact={compact} />}
        </div>
        <div className="space-y-1.5">
          <Label compact={compact}>Timeline</Label>
          <FakeInput placeholder={plain ? "" : "Launching early March"} compact={compact} />
        </div>
      </div>

      <div
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg font-medium",
          compact ? "mt-3 px-3 py-1.5 text-[10px]" : "mt-5 px-4 py-2.5 text-xs",
          plain ? "border bg-muted text-foreground" : "bg-foreground text-background",
        )}
      >
        {plain ? "Submit" : submitLabel}
        {!plain && <ArrowRight className={compact ? "size-3" : "size-3.5"} />}
      </div>
    </div>
  );
}
