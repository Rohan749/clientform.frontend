import { Plus, X } from "lucide-react";
import { useRef } from "react";

const MAX_OPTIONS = 20;

/** Inline, pill-style option editing — looks like the choices clients will see. */
export function OptionsEditor({ options, onChange }: { options: string[]; onChange: (options: string[]) => void }) {
  const listRef = useRef<HTMLDivElement>(null);

  const focusOption = (index: number) => {
    requestAnimationFrame(() => {
      listRef.current?.querySelectorAll<HTMLInputElement>("input")[index]?.focus();
    });
  };

  const addOption = () => {
    if (options.length >= MAX_OPTIONS) return;
    onChange([...options, ""]);
    focusOption(options.length);
  };

  return (
    <div ref={listRef} className="grid gap-2 sm:grid-cols-2">
      {options.map((option, index) => (
        <div
          key={index}
          className="group/option flex h-11 items-center gap-3 rounded-xl border bg-background px-4 transition-colors focus-within:border-foreground/30"
        >
          <span className="size-4 shrink-0 rounded-full border border-foreground/25" />
          <input
            value={option}
            placeholder={`Option ${index + 1}`}
            maxLength={120}
            aria-label={`Option ${index + 1}`}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
            onChange={(e) => onChange(options.map((o, i) => (i === index ? e.target.value : o)))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (index === options.length - 1) addOption();
                else focusOption(index + 1);
              }
              if (e.key === "Backspace" && option === "" && options.length > 1) {
                e.preventDefault();
                onChange(options.filter((_, i) => i !== index));
                focusOption(Math.max(0, index - 1));
              }
            }}
          />
          <button
            type="button"
            onClick={() => onChange(options.filter((_, i) => i !== index))}
            className="rounded-md p-0.5 text-muted-foreground opacity-0 transition-opacity group-hover/option:opacity-100 hover:text-foreground focus-visible:opacity-100"
            aria-label={`Remove option ${index + 1}`}
          >
            <X className="size-3.5" />
          </button>
        </div>
      ))}
      {options.length < MAX_OPTIONS && (
        <button
          type="button"
          onClick={addOption}
          className="flex h-11 items-center gap-2 rounded-xl border border-dashed px-4 text-sm text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground"
        >
          <Plus className="size-4" /> Add option
        </button>
      )}
    </div>
  );
}
