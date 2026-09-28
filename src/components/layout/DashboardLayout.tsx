import { type ReactNode, Suspense } from "react";
import { Outlet } from "react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function DashboardLayout() {
  return (
    <div className="min-h-dvh bg-background">
      <Sidebar />
      <Header />
      <main className="lg:pl-60">
        <Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}

/** Standard padded, width-limited container for dashboard pages. */
export function PageContainer({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10 animate-in fade-in-0 duration-300 ${className}`}>
      {children}
    </div>
  );
}

function PageSkeleton() {
  return (
    <PageContainer>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-3 h-4 w-72" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    </PageContainer>
  );
}
