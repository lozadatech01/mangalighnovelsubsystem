import { Suspense } from "react";
import { AuthButton } from "@/components/auth-button";

export function AdminHeader() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Loxada Manga / Light Novel
          </p>
          <h1 className="mt-0.5 text-lg font-semibold">Admin</h1>
        </div>
        <Suspense
          fallback={
            <div className="flex gap-2">
              <div className="h-9 w-20 animate-pulse rounded-md bg-secondary" />
              <div className="h-9 w-20 animate-pulse rounded-md bg-secondary" />
            </div>
          }
        >
          <AuthButton />
        </Suspense>
      </div>
    </header>
  );
}
