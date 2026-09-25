import Link from "next/link";

import { createTitle } from "@/app/admin/actions";

export default function NewTitlePage() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-3xl px-6 py-10">
        <Link href="/admin/titles" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to titles
        </Link>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">Create title</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          New titles start as drafts and are invisible on the public catalog until published.
        </p>

        <form action={createTitle} className="mt-8 space-y-5 rounded-lg border p-6">
          <div>
            <label className="text-sm font-medium" htmlFor="title_id">Title ID</label>
            <input id="title_id" name="title_id" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="example-title" className="mt-2 w-full rounded-md border px-3 py-2" />
            <p className="mt-1 text-xs text-muted-foreground">Stable shared slug used across Loxada subsystems.</p>
          </div>

          <div>
            <label className="text-sm font-medium" htmlFor="title_name">Title name</label>
            <input id="title_name" name="title_name" required className="mt-2 w-full rounded-md border px-3 py-2" />
          </div>

          <div>
            <label className="text-sm font-medium" htmlFor="origin_type">Origin</label>
            <select id="origin_type" name="origin_type" defaultValue="original" className="mt-2 w-full rounded-md border px-3 py-2">
              <option value="original">Original</option>
              <option value="licensed">Licensed</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium" htmlFor="description">Description</label>
            <textarea id="description" name="description" rows={5} className="mt-2 w-full rounded-md border px-3 py-2" />
          </div>

          <div className="flex gap-3">
            <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              Create draft
            </button>
            <Link href="/admin/titles" className="rounded-md border px-4 py-2 text-sm font-medium">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
