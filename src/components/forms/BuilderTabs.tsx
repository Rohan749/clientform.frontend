import { Eye, Palette, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";

export type BuilderTab = "edit" | "design" | "preview";

const TABS: Array<{ value: BuilderTab; label: string; icon: typeof Eye }> = [
  { value: "edit", label: "Edit", icon: PenLine },
  { value: "design", label: "Design", icon: Palette },
  { value: "preview", label: "Preview", icon: Eye },
];

export function BuilderTabs({
  value,
  onChange,
  className,
}: {
  value: BuilderTab;
  onChange: (tab: BuilderTab) => void;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex rounded-lg bg-muted p-1", className)} role="tablist" aria-label="Builder view">
      {TABS.map(({ value: tab, label, icon: Icon }) => (
        <button
          key={tab}
          type="button"
          role="tab"
          aria-selected={value === tab}
          onClick={() => onChange(tab)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-all",
            value === tab ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon className="size-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}
