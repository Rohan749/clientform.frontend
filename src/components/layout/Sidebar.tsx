import { CreditCard, Crown, FileText, Inbox, LayoutGrid, LogOut, type LucideIcon, Plus, Settings } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router";
import { Logo } from "@/components/common/Logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/context/ProfileContext";
import { usePlan } from "@/hooks/usePlan";
import { ModeSwitch } from "./ModeSwitch";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/create-form", label: "Create Form", icon: Plus, end: true },
  { to: "/forms", label: "Forms", icon: FileText },
  { to: "/submissions", label: "Submissions", icon: Inbox },
];

function SidebarLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "group flex h-9 items-center gap-2.5 rounded-lg border px-2.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
          isActive
            ? "border-border bg-background text-foreground shadow-xs"
            : "border-transparent text-muted-foreground hover:bg-background/70 hover:text-foreground",
        )
      }
    >
      <Icon className="size-4 shrink-0" />
      {item.label}
    </NavLink>
  );
}

function UserMenu() {
  const { user, signOut } = useAuth();
  const { profile, displayName } = useProfile();
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-2.5 rounded-lg p-1.5 text-left transition-colors outline-none hover:bg-background/70 focus-visible:ring-2 focus-visible:ring-ring/40 data-[state=open]:bg-background/70">
        <Avatar className="size-8 border">
          {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt="" />}
          <AvatarFallback>{initials(displayName)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{displayName}</p>
          <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-56">
        <DropdownMenuLabel className="truncate">{user?.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate("/settings")}>
          <Settings /> Settings
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate("/billing")}>
          <CreditCard /> Billing
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={async () => {
            await signOut();
            navigate("/login", { replace: true });
          }}
        >
          <LogOut /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** A quiet nudge for Free users. Hidden while the plan loads, and for Pro users. */
function UpgradeNudge({ onNavigate }: { onNavigate?: () => void }) {
  const { billing, isPro } = usePlan();
  if (!billing || isPro || !billing.configured) return null;
  return (
    <Link
      to="/billing"
      onClick={onNavigate}
      className="mb-1 block rounded-xl border border-violet-100 bg-linear-to-br from-violet-50 via-background to-pink-50 p-3 transition-colors hover:border-violet-200"
    >
      <span className="flex items-center gap-1.5 text-[13px] font-semibold">
        <Crown className="size-3.5" /> Go Pro
      </span>
      <span className="mt-0.5 block text-xs text-muted-foreground">Your fonts, colors and no badge.</span>
    </Link>
  );
}

/** Sidebar contents, shared by the fixed desktop sidebar and the mobile sheet. */
export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Logo to="/dashboard" />
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 pt-2">
        {NAV_ITEMS.map((item) => (
          <SidebarLink key={item.to} item={item} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="flex flex-col gap-1 px-3 pb-3">
        <UpgradeNudge onNavigate={onNavigate} />
        <ModeSwitch />
        <SidebarLink item={{ to: "/billing", label: "Billing", icon: CreditCard }} onNavigate={onNavigate} />
        <SidebarLink item={{ to: "/settings", label: "Settings", icon: Settings }} onNavigate={onNavigate} />
        <div className="mt-1 border-t pt-2">
          <UserMenu />
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r bg-neutral-50/80 lg:block">
      <SidebarContent />
    </aside>
  );
}
