import { ArrowDown, ArrowUp, ExternalLink, GripVertical, Loader2, MessageSquareQuote, Plus, Trash2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { moveItem, useReorder } from "@/hooks/useReorder";
import { api, errorMessage } from "@/lib/api";
import { displayUrl } from "@/lib/links";
import { authorLine, platformLabel } from "@/lib/testimonials";
import { cn } from "@/lib/utils";
import type { Testimonial } from "@/types";
import { ProviderIcon } from "./TestimonialCard";

const MAX_TESTIMONIALS = 20;

export function TestimonialManager({
  testimonials,
  onChange,
}: {
  testimonials: Testimonial[];
  onChange: (testimonials: Testimonial[]) => void;
}) {
  const [url, setUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const move = (from: number, to: number) => onChange(moveItem(testimonials, from, to));
  const reorder = useReorder(move);

  const handleAdd = async (event: FormEvent) => {
    event.preventDefault();
    const value = url.trim();
    if (!value) return;
    if (testimonials.length >= MAX_TESTIMONIALS) {
      setError(`You can add up to ${MAX_TESTIMONIALS} testimonials`);
      return;
    }

    setAdding(true);
    setError(null);
    try {
      const resolved = await api.testimonials.resolve(value);
      if (testimonials.some((t) => t.url === resolved.url)) {
        setError("That testimonial is already on this form");
        return;
      }
      onChange([...testimonials, { ...resolved, id: crypto.randomUUID() }]);
      setUrl("");
      toast.success("Testimonial added", { description: "Save your form to keep it." });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="space-y-2">
        <div className="flex gap-2">
          <Input
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError(null);
            }}
            placeholder="X post link, or Senja / Testimonial.to embed code"
            aria-invalid={Boolean(error)}
            aria-label="Testimonial link"
          />
          <Button type="submit" variant="outline" disabled={adding || !url.trim()} className="h-10 shrink-0">
            {adding ? <Loader2 className="animate-spin" /> : <Plus />}
            Add
          </Button>
        </div>
        {error ? (
          <p className="text-xs font-medium text-destructive">{error}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Paste an X post link, a Senja widget link or embed code, or a Testimonial.to embed code.
          </p>
        )}
      </form>

      {testimonials.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed px-6 py-8 text-center">
          <MessageSquareQuote className="size-5 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">No testimonials yet</p>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
            Add an X post, a Senja widget or a Testimonial.to wall. It appears right beside your form.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {testimonials.map((testimonial, index) => {
            const { name, handle } = authorLine(testimonial);
            return (
              <li key={testimonial.id}>
                <div
                  {...reorder.itemProps(index)}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border bg-background p-3 shadow-xs transition-opacity",
                    reorder.dragIndex === index && "opacity-50",
                  )}
                >
                  <button
                    type="button"
                    {...reorder.handleProps(index)}
                    className="mt-1.5 hidden cursor-grab touch-none rounded-md p-0.5 text-muted-foreground/50 hover:text-foreground active:cursor-grabbing sm:block"
                    aria-label="Drag to reorder"
                  >
                    <GripVertical className="size-4" />
                  </button>
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/50">
                    <ProviderIcon testimonial={testimonial} className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {name ?? platformLabel(testimonial)}
                      {handle && <span className="ml-1.5 font-normal text-muted-foreground">{handle}</span>}
                    </p>
                    {testimonial.content ? (
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{testimonial.content}</p>
                    ) : (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{displayUrl(testimonial.url)}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground"
                      disabled={index === 0}
                      onClick={() => move(index, index - 1)}
                      aria-label="Move up"
                    >
                      <ArrowUp />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground"
                      disabled={index === testimonials.length - 1}
                      onClick={() => move(index, index + 1)}
                      aria-label="Move down"
                    >
                      <ArrowDown />
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground" asChild>
                      <a href={testimonial.url} target="_blank" rel="noopener noreferrer" aria-label="Open testimonial">
                        <ExternalLink />
                      </a>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => onChange(testimonials.filter((t) => t.id !== testimonial.id))}
                      aria-label="Remove testimonial"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
