import Link from "next/link";


export default function AdminPage() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Administration</p>
          <h1 className="text-4xl font-bold tracking-tight">Manga / Light Novel Admin</h1>
          <p className="max-w-2xl text-muted-foreground">
            Manage the Manga / Light Novel catalog, content, and publishing workflow.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link href="/admin/titles" className="rounded-lg border p-6 transition hover:bg-secondary/40">
            <p className="font-semibold">Titles</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Create, edit, organize, and publish titles, arcs, and items.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}
