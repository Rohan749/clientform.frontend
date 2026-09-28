import * as React from "react";
import { cn } from "@/lib/utils";

/** Borderless textarea that grows with its content — for inline, document-style editing. */
function AutoTextarea({ className, value, ...props }: React.ComponentProps<"textarea">) {
  const ref = React.useRef<HTMLTextAreaElement>(null);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      className={cn(
        "block w-full resize-none overflow-hidden border-0 bg-transparent p-0 outline-none placeholder:text-muted-foreground/45",
        className,
      )}
      {...props}
    />
  );
}

export { AutoTextarea };
