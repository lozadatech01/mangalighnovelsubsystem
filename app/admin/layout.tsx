import { Suspense } from "react";

import { requireAdmin } from "@/lib/auth/admin";

async function AdminGate({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return children;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen animate-pulse p-6">
          <div className="mx-auto max-w-6xl">
            <div className="h-10 w-48 rounded bg-secondary" />
          </div>
        </div>
      }
    >
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}
