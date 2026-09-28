import { Quote } from "lucide-react";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { SampleTestimonialCard } from "./SampleTestimonialCard";
import type { SampleTestimonial } from "./samples";

/**
 * The "What clients say" panel as it appears on a ClientForm, for landing mockups.
 * `moving` shows the product's continuous upward scroll (paused on hover).
 */
export function ProofPanel({
  testimonials,
  moving = false,
  compact = false,
  className,
}: {
  testimonials: SampleTestimonial[];
  moving?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const list = (hidden = false) => (
    <div
      className={cn("flex flex-col", compact ? "gap-2 pb-2" : "gap-3 pb-3", compact ? "px-3" : "px-4")}
      aria-hidden={hidden || undefined}
    >
      {testimonials.map((t) => (
        <SampleTestimonialCard key={t.id} testimonial={t} compact={compact} />
      ))}
    </div>
  );

  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-2xl border border-violet-100 bg-linear-to-br from-violet-50 via-fuchsia-50/60 to-pink-50",
        className,
      )}
    >
      <div className={cn("shrink-0", compact ? "px-3 pt-3 pb-2" : "px-4 pt-5 pb-3")}>
        <p className={cn("flex items-center gap-2 font-semibold tracking-tight", compact ? "text-xs" : "text-base")}>
          <span
            className={cn(
              "flex shrink-0 items-center justify-center rounded-md bg-linear-to-br from-violet-600 to-pink-500 text-white",
              compact ? "size-5" : "size-7",
            )}
          >
            <Quote className={cn("fill-current", compact ? "size-2.5" : "size-3.5")} />
          </span>
          What clients say
        </p>
      </div>

      {moving ? (
        <div className="group relative min-h-0 flex-1">
          <div className="absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_24px,black_calc(100%-32px),transparent)]">
            <div
              className="animate-marquee-up group-hover:[animation-play-state:paused] motion-reduce:animate-none"
              style={{ "--marquee-duration": "26s" } as CSSProperties}
            >
              {list()}
              {list(true)}
            </div>
          </div>
        </div>
      ) : (
        list()
      )}
    </div>
  );
}
