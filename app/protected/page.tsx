import { Suspense } from "react";

import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

async function AccountContent() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = typeof data?.claims?.email === "string" ? data.claims.email : "Signed-in user";

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">Account</p>
        <h1 className="text-4xl font-bold tracking-tight">Your workspace</h1>
        <p className="max-w-2xl text-muted-foreground">
          This area will contain your reading and commerce activity once those services are enabled.
        </p>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Signed-in account</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{email}</p>
        </CardContent>
      </Card>
    </section>
  );
}

export default function ProtectedPage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <Suspense
        fallback={
          <section className="mx-auto max-w-6xl px-6 py-10">
            <div className="h-10 w-80 animate-pulse rounded bg-secondary" />
            <div className="mt-8 h-24 animate-pulse rounded-lg border animate-pulse" />
          </section>
        }
      >
        <AccountContent />
      </Suspense>
    </main>
  );
}
