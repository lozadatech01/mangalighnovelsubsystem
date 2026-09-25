import Link from "next/link";

import { SiteHeader } from "@/components/site-header";

export default function AdminPage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Administration</p>
          <h1 className="text-4xl font-bold tracking-tight">Manga / Light Novel Admin</h1>
          <p className="max-w-2xl text-muted-foreground">
            Admin access is enabled. Title, arc, item, media, and publishing management will live here.
          </p>
        </div>

        <div className="mt-8 rounded-lg border border-dashed p-6">
          <p className="text-sm text-muted-foreground">
            The admin authorization boundary is in place. Management screens will be added next.
          </p>
          <Link href="/" className="mt-4 inline-flex text-sm font-medium hover:underline">
            Back to catalog
          </Link>
        </div>
      </section>
    </main>
  );
}
