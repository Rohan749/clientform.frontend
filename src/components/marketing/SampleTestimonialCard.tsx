import { ProviderIcon } from "@/components/forms/TestimonialCard";
import { cn } from "@/lib/utils";
import { type SampleTestimonial, SOURCE_LABELS } from "./samples";

function SourceBadge({ source, className }: { source: SampleTestimonial["source"]; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit shrink-0 items-center gap-1 rounded-full border bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground",
        className,
      )}
    >
      <ProviderIcon testimonial={{ provider: source }} className="size-2.5" />
      {SOURCE_LABELS[source]}
    </span>
  );
}

/** Static testimonial card for landing-page mockups (mirrors the product's card style). */
export function SampleTestimonialCard({
  testimonial,
  className,
  compact = false,
}: {
  testimonial: SampleTestimonial;
  className?: string;
  compact?: boolean;
}) {
  const initials = testimonial.name
    .split(" ")
    .map((part) => part[0])
    .join("");

  return (
    <figure className={cn("rounded-2xl border bg-background shadow-xs", compact ? "p-3" : "p-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className={cn(
              "flex shrink-0 items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground",
              compact ? "size-7 text-[10px]" : "size-8 text-[11px]",
            )}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className={cn("truncate font-medium", compact ? "text-[11px]" : "text-[13px]")}>{testimonial.name}</p>
            <p className={cn("truncate text-muted-foreground", compact ? "text-[10px]" : "text-[11px]")}>
              {testimonial.role}
            </p>
          </div>
        </div>
        {!compact && <SourceBadge source={testimonial.source} />}
      </div>
      <blockquote className={cn("leading-relaxed text-foreground/90", compact ? "mt-2 text-[11px]" : "mt-3 text-[13px]")}>
        {testimonial.quote}
      </blockquote>
      {/* In narrow cards the badge moves below the quote so names don't get cut off. */}
      {compact && <SourceBadge source={testimonial.source} className="mt-2" />}
    </figure>
  );
}
