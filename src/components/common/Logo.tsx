import { Link } from "react-router";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-7", className)}>
      <rect width="32" height="32" rx="9" className="fill-foreground" />
      <rect x="9" y="10" width="14" height="2.5" rx="1.25" className="fill-background" />
      <rect x="9" y="15" width="10" height="2.5" rx="1.25" className="fill-background" opacity=".7" />
      <rect x="9" y="20" width="6" height="2.5" rx="1.25" className="fill-background" opacity=".45" />
    </svg>
  );
}

export function Logo({ to = "/", className }: { to?: string; className?: string }) {
  return (
    <Link to={to} className={cn("inline-flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/40", className)}>
      <LogoMark />
      <span className="text-[15px] font-semibold tracking-tight">ClientForm</span>
    </Link>
  );
}
