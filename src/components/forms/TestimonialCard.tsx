import { ArrowUpRight, Heart, MessageSquareQuote } from "lucide-react";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { XLogo } from "@/components/common/XLogo";
import { displayUrl } from "@/lib/links";
import { initials } from "@/lib/format";
import { authorLine, getEmbed, platformLabel } from "@/lib/testimonials";
import { cn } from "@/lib/utils";
import type { Testimonial } from "@/types";
import { SenjaEmbed } from "./SenjaEmbed";
import { TestimonialToEmbed } from "./TestimonialToEmbed";
import { XEmbed } from "./XEmbed";

type TestimonialLike = Pick<Testimonial, "provider" | "url" | "author_name" | "author_handle" | "content">;

export function ProviderIcon({ testimonial, className }: { testimonial: Pick<Testimonial, "provider">; className?: string }) {
  const classes = cn("size-3.5", className);
  switch (testimonial.provider) {
    case "x":
      return <XLogo className={classes} />;
    case "senja":
      return <Heart className={classes} />;
    default:
      return <MessageSquareQuote className={classes} />;
  }
}

/** Clean, self-contained card used whenever an embed isn't available. */
export function TestimonialFallbackCard({ testimonial, className }: { testimonial: TestimonialLike; className?: string }) {
  const { name, handle } = authorLine(testimonial);
  const platform = platformLabel(testimonial);

  return (
    <figure className={cn("rounded-2xl border bg-background p-4 shadow-xs", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
            {name ? initials(name.replace(/^@/, "")) : <ProviderIcon testimonial={testimonial} />}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium">{name ?? `Testimonial on ${platform}`}</p>
            <p className="truncate text-[11px] text-muted-foreground">{handle ?? platform}</p>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          <ProviderIcon testimonial={testimonial} className="size-3" />
          {testimonial.provider !== "x" && platform}
        </span>
      </div>

      {testimonial.content && (
        <blockquote className="mt-3 line-clamp-6 text-[13px] leading-relaxed whitespace-pre-line text-foreground/90">
          {testimonial.content}
        </blockquote>
      )}

      <figcaption className="mt-3 flex items-center justify-between gap-3 border-t pt-2.5 text-[11px]">
        <span className="min-w-0 truncate text-muted-foreground">{displayUrl(testimonial.url)}</span>
        <a
          href={testimonial.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-0.5 font-medium text-foreground hover:underline"
        >
          View testimonial <ArrowUpRight className="size-3.5" />
        </a>
      </figcaption>
    </figure>
  );
}

/**
 * Renders a testimonial with its provider's official embed (X post, Senja widget,
 * Testimonial.to embed), falling back to a clean card when embeds are disabled or fail.
 */
export function TestimonialCard({ testimonial, embed = true }: { testimonial: TestimonialLike; embed?: boolean }) {
  const fallback = <TestimonialFallbackCard testimonial={testimonial} />;
  const info = embed ? getEmbed(testimonial) : null;

  if (!info) return fallback;

  return (
    <ErrorBoundary fallback={fallback}>
      {info.kind === "x" && <XEmbed postId={info.postId} fallback={fallback} />}
      {info.kind === "senja" && <SenjaEmbed widgetId={info.widgetId} fallback={fallback} />}
      {info.kind === "testimonial_to" && <TestimonialToEmbed src={info.src} fallback={fallback} />}
    </ErrorBoundary>
  );
}
