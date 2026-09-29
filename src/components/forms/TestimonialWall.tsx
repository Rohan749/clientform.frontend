import { Quote } from "lucide-react";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { Testimonial } from "@/types";
import { TestimonialCard } from "./TestimonialCard";

const SCROLL_SPEED_PX_PER_SECOND = 32;
const PANEL_PADDING_PX = 32; // p-4 top + bottom

interface TestimonialWallProps {
  testimonials: Testimonial[];
  /** Optional heading pinned above the moving list; empty hides it. */
  heading?: string;
  /** Optional line under the heading; empty hides it. */
  description?: string;
  embed?: boolean;
  className?: string;
}

/**
 * Fixed-height testimonial panel. When the testimonials are taller than the panel they
 * scroll upward in a seamless, continuous loop (paused on hover); overflow is clipped.
 * When they fit, they simply sit still.
 */
export function TestimonialWall({
  testimonials,
  heading = "",
  description = "",
  embed = true,
  className,
}: TestimonialWallProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const firstCopyRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const [overflowing, setOverflowing] = useState(false);
  const [duration, setDuration] = useState(40);

  useEffect(() => {
    const viewport = viewportRef.current;
    const list = listRef.current;
    if (!viewport || !list) return;

    // Measure the cards only (not the padding, which changes between modes) so the
    // static/moving decision can't flip back and forth.
    const measure = () => {
      const contentHeight = list.offsetHeight;
      // One full loop = the first copy's height (cards + its bottom padding, which equals the gap).
      const loop = firstCopyRef.current?.offsetHeight ?? contentHeight + 16;
      setOverflowing(contentHeight + PANEL_PADDING_PX > viewport.clientHeight + 1);
      setDistance(loop);
      setDuration(Math.max(12, loop / SCROLL_SPEED_PX_PER_SECOND));
    };

    measure();
    // Embeds (X, Senja, Testimonial.to) change height as they load, so keep re-measuring.
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(list);
    if (firstCopyRef.current) observer.observe(firstCopyRef.current);
    return () => observer.disconnect();
  }, [testimonials]);

  const cards = testimonials.map((testimonial) => (
    <TestimonialCard key={testimonial.id} testimonial={testimonial} embed={embed} />
  ));

  return (
    <div
      className={cn(
        "cf-testimonials relative flex flex-col overflow-hidden rounded-2xl border border-violet-100 bg-linear-to-br from-violet-50 via-fuchsia-50/60 to-pink-50",
        className,
      )}
    >
      {(heading.trim() || description.trim()) && (
        <div className="shrink-0 px-5 pt-6 pb-2">
          {heading.trim() && (
            <h2 className="flex items-center gap-2.5 text-xl font-semibold tracking-tight @2xl:text-2xl">
              <span className="cf-testimonials-icon flex size-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-violet-600 to-pink-500 text-white shadow-sm">
                <Quote className="size-4 fill-current" />
              </span>
              <span className="min-w-0 wrap-anywhere">{heading.trim()}</span>
            </h2>
          )}
          {description.trim() && (
            <p className="mt-2 text-sm leading-relaxed wrap-anywhere text-muted-foreground">{description.trim()}</p>
          )}
        </div>
      )}
      <div className="relative min-h-0 flex-1">
      <div
        ref={viewportRef}
        className={cn(
          "group absolute inset-0 overflow-hidden",
          overflowing &&
            "[mask-image:linear-gradient(to_bottom,transparent,black_40px,black_calc(100%-40px),transparent)] motion-reduce:overflow-y-auto",
        )}
      >
        <div
          className={cn(
            overflowing &&
              "animate-marquee-up group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] motion-reduce:animate-none",
          )}
          style={{ "--marquee-duration": `${duration}s`, "--marquee-distance": `${distance}px` } as CSSProperties}
        >
          {/* In loop mode each copy ends with pb-4 (= the gap), so copy 2 starts one gap below copy 1. */}
          <div ref={firstCopyRef} className={overflowing ? "px-4 pb-4" : "p-4"}>
            <div ref={listRef} className="flex flex-col gap-4">
              {cards}
            </div>
          </div>
          {overflowing && (
            <div className="px-4 pb-4 motion-reduce:hidden" aria-hidden inert>
              <div className="flex flex-col gap-4">{cards}</div>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
