import type { ReactNode } from "react";
import { Logo } from "@/components/common/Logo";

export function AuthLayout({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col bg-background">
      <div className="pointer-events-none absolute inset-0 bg-dotted [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_65%)]" />
      <header className="relative flex h-16 items-center px-6">
        <Logo />
      </header>
      <main className="relative flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
          <div className="rounded-2xl border bg-background p-7 shadow-sm">
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
            <div className="mt-7">{children}</div>
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
        </div>
      </main>
    </div>
  );
}
