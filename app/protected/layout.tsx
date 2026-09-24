import { Suspense } from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

async function ProtectedGate({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect("/auth/login");
  }

  return children;
}

export default function ProtectedLayout({
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
      <ProtectedGate>{children}</ProtectedGate>
    </Suspense>
  );
}
