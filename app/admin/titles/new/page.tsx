import Link from "next/link";

import { TitleCreateForm } from "@/components/admin/title-create-form";

export default function NewTitlePage() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-3xl px-6 py-10">
        <Link href="/admin/titles" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to titles
        </Link>
        <div className="mt-6">
          <p className="text-sm font-medium text-muted-foreground">Catalog setup</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Create a title</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Set up the canonical title record, catalog description, and optional cover. The title is created as a draft so you can finish its arcs and chapters or volumes before publishing.
          </p>
        </div>

        <TitleCreateForm />
      </section>
    </main>
  );
}
