import { Link } from "react-router";
import { LogoMark } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <LogoMark className="size-9" />
      <p className="mt-6 font-mono text-xs text-muted-foreground">404</p>
      <h1 className="mt-2 text-xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
      <Button asChild className="mt-8">
        <Link to="/">Back home</Link>
      </Button>
    </div>
  );
}
