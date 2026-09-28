import { Link } from "react-router";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export function MarketingNav() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-transparent bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Logo />
        <nav className="flex items-center gap-1">
          <a href="#features" className="hidden rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:block">
            Features
          </a>
          <a href="#pricing" className="hidden rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:block">
            Pricing
          </a>
          {user ? (
            <Button asChild size="sm" className="ml-2">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Link to="/login" className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                Login
              </Link>
              <Button asChild size="sm" className="ml-1">
                <Link to="/signup">Get Started</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
