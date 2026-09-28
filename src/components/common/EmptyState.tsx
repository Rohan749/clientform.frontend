import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-16 text-center animate-in fade-in-0 duration-300",
        className,
      )}
    >
      <div className="flex size-11 items-center justify-center rounded-xl border bg-background shadow-xs">
        <Icon className="size-5 text-muted-foreground" />
      </div>
      <h3 className="mt-5 text-[15px] font-semibold tracking-tight">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-balance text-muted-foreground">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
