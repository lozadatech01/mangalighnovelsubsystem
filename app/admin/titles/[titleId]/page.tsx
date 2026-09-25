import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  archiveTitle,
  createArc,
  createItem,
  deleteArc,
  deleteTitle,
  removeTitleCover,
  updateArc,
  updateTitle,
  uploadTitleCover,
} from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ titleId: string }>;
  searchParams: Promise<{ notice?: string; error?: string }>;
};

function statusClass(status: string) {
  if (status === "published") return "border-foreground/30 bg-secondary";
  if (status === "archived") return "border-muted bg-muted text-muted-foreground";
  return "border-dashed";
}

async function TitleEditor({ params, searchParams }: PageProps) {
  const { titleId } = await params;
  const query = await searchParams;
  const supabase = await createClient();

  const [{ data: title }, { data: arcs }, { data: items }] = await Promise.all([
    supabase
      .from("titles")
      .select("title_id,title_name,origin_type,description,cover_image_path,status,published_at,updated_at")
      .eq("title_id", titleId)
      .maybeSingle(),
    supabase
      .from("arcs")
      .select("arc_id,arc_name,sequence_order")
      .eq("title_id", titleId)
      .order("sequence_order")
      .order("arc_name"),
    supabase
      .from("items")
      .select("item_id,item_type,chapter_or_volume_number,format,price,is_free_preview,release_date,stock_quantity,status,content_path")
      .eq("title_id", titleId)
      .order("item_type")
      .order("chapter_or_volume_number"),
  ]);

  if (!title) notFound();

  const coverUrl = title.cover_image_path
    ? supabase.storage.from("manga-ln-assets").getPublicUrl(title.cover_image_path).data.publicUrl
    : null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/admin/titles" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to titles
          </Link>
          <p className="mt-5 text-sm text-muted-foreground">Title editor</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">{title.title_name}</h1>
          <p className="mt-1 text-xs text-muted-foreground">{title.title_id}</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-sm ${statusClass(title.status)}`}>{title.status}</span>
      </div>

      {query.notice ? <p className="mt-6 rounded-lg border bg-secondary p-3 text-sm">{query.notice}</p> : null}
      {query.error ? <p className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm">{query.error}</p> : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-6">
          <form action={updateTitle} className="space-y-5 rounded-lg border p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold">Title metadata</h2>
              <span className="text-xs text-muted-foreground">
                {title.published_at ? `Published ${new Date(title.published_at).toLocaleDateString()}` : "Not published"}
              </span>
            </div>

            <input type="hidden" name="title_id" value={title.title_id} />

            <div>
              <label className="text-sm font-medium" htmlFor="title_name">Title name</label>
              <input id="title_name" name="title_name" defaultValue={title.title_name} required className="mt-2 w-full rounded-md border px-3 py-2" />
            </div>

            <div>
              <label className="text-sm font-medium" htmlFor="origin_type">Origin</label>
              <select id="origin_type" name="origin_type" defaultValue={title.origin_type ?? "original"} className="mt-2 w-full rounded-md border px-3 py-2">
                <option value="original">Original</option>
                <option value="licensed">Licensed</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium" htmlFor="status">Publication status</label>
              <select id="status" name="status" defaultValue={title.status} className="mt-2 w-full rounded-md border px-3 py-2">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium" htmlFor="description">Description</label>
              <textarea id="description" name="description" defaultValue={title.description ?? ""} rows={6} className="mt-2 w-full rounded-md border px-3 py-2" />
            </div>

            <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              Save title
            </button>
          </form>

          <div className="rounded-lg border p-6">
            <div>
              <h2 className="text-lg font-semibold">Arcs</h2>
              <p className="mt-1 text-sm text-muted-foreground">Optional grouping for chapters and volumes.</p>
            </div>

            <form action={createArc} className="mt-5 grid gap-3 md:grid-cols-[1fr_1.5fr_110px_auto]">
              <input type="hidden" name="title_id" value={title.title_id} />
              <input name="arc_id" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="arc-slug" className="rounded-md border px-3 py-2" />
              <input name="arc_name" required placeholder="Arc name" className="rounded-md border px-3 py-2" />
              <input name="sequence_order" type="number" min="0" placeholder="Order" className="rounded-md border px-3 py-2" />
              <button type="submit" className="rounded-md border px-4 py-2 text-sm font-medium">Add arc</button>
            </form>

            <div className="mt-5 space-y-3">
              {(arcs ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No arcs yet.</p>
              ) : (
                (arcs ?? []).map((arc) => (
                  <div key={arc.arc_id} className="rounded-md border p-4">
                    <form action={updateArc} className="grid gap-3 md:grid-cols-[1fr_1.5fr_110px_auto]">
                      <input type="hidden" name="title_id" value={title.title_id} />
                      <input type="hidden" name="arc_id" value={arc.arc_id} />
                      <input name="arc_id_display" value={arc.arc_id} readOnly aria-label="Arc ID" className="rounded-md border bg-secondary/30 px-3 py-2 text-sm" />
                      <input name="arc_name" defaultValue={arc.arc_name} required aria-label="Arc name" className="rounded-md border px-3 py-2" />
                      <input name="sequence_order" type="number" min="0" defaultValue={arc.sequence_order ?? ""} aria-label="Sequence order" className="rounded-md border px-3 py-2" />
                      <button type="submit" className="rounded-md border px-4 py-2 text-sm font-medium">Save</button>
                    </form>
                    <form action={deleteArc} className="mt-2">
                      <input type="hidden" name="title_id" value={title.title_id} />
                      <input type="hidden" name="arc_id" value={arc.arc_id} />
                      <button type="submit" className="text-xs text-destructive hover:underline">Delete arc</button>
                    </form>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-lg border p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Items</h2>
                <p className="mt-1 text-sm text-muted-foreground">Chapters and volumes are published independently from the title.</p>
              </div>
              <span className="text-xs text-muted-foreground">{(items ?? []).length} total</span>
            </div>

            <form action={createItem} className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <input type="hidden" name="title_id" value={title.title_id} />
              <label className="text-sm">
                <span className="font-medium">Type</span>
                <select name="item_type" defaultValue="manga" className="mt-2 w-full rounded-md border px-3 py-2">
                  <option value="manga">Manga</option>
                  <option value="light_novel">Light novel</option>
                </select>
              </label>
              <label className="text-sm">
                <span className="font-medium">Chapter / volume</span>
                <input name="chapter_or_volume_number" type="number" min="1" className="mt-2 w-full rounded-md border px-3 py-2" />
              </label>
              <label className="text-sm">
                <span className="font-medium">Format</span>
                <select name="format" defaultValue="digital" className="mt-2 w-full rounded-md border px-3 py-2">
                  <option value="digital">Digital</option>
                  <option value="physical">Physical</option>
                </select>
              </label>
              <label className="text-sm">
                <span className="font-medium">Price</span>
                <input name="price" type="number" min="0" step="0.01" className="mt-2 w-full rounded-md border px-3 py-2" />
              </label>
              <label className="text-sm md:col-span-2">
                <span className="font-medium">Arc</span>
                <select name="arc_id" defaultValue="" className="mt-2 w-full rounded-md border px-3 py-2">
                  <option value="">No arc</option>
                  {(arcs ?? []).map((arc) => <option key={arc.arc_id} value={arc.arc_id}>{arc.arc_name}</option>)}
                </select>
              </label>
              <label className="text-sm">
                <span className="font-medium">Release date</span>
                <input name="release_date" type="date" className="mt-2 w-full rounded-md border px-3 py-2" />
              </label>
              <label className="text-sm">
                <span className="font-medium">Physical stock</span>
                <input name="stock_quantity" type="number" min="0" className="mt-2 w-full rounded-md border px-3 py-2" />
              </label>
              <label className="flex items-center gap-2 text-sm md:col-span-2">
                <input name="is_free_preview" type="checkbox" />
                Mark this item as a free preview
              </label>
              <div className="flex items-end">
                <button type="submit" className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                  Create draft item
                </button>
              </div>
            </form>

            <div className="mt-6 space-y-3">
              {(items ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No items yet.</p>
              ) : (
                (items ?? []).map((item) => (
                  <Link key={item.item_id} href={`/admin/items/${item.item_id}`} className="block rounded-md border p-4 transition hover:bg-secondary/40">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">
                          {item.item_type === "light_novel" ? "Volume" : "Chapter"} {item.chapter_or_volume_number ?? "—"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.format} · {item.price == null ? "Free" : `₱${Number(item.price).toFixed(2)}`}
                          {item.release_date ? ` · ${item.release_date}` : ""}
                        </p>
                      </div>
                      <span className="rounded-full border px-2 py-1 text-xs">{item.status}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-lg border p-6">
            <h2 className="text-lg font-semibold">Cover</h2>
            <div className="mt-4 overflow-hidden rounded-md border bg-secondary/30">
              {coverUrl ? (
                <a href={coverUrl} target="_blank" rel="noreferrer" className="block p-4 text-sm hover:underline">
                  Open current cover
                </a>
              ) : (
                <p className="p-6 text-sm text-muted-foreground">No cover uploaded.</p>
              )}
            </div>
            <form action={uploadTitleCover} encType="multipart/form-data" className="mt-4 space-y-3">
              <input type="hidden" name="title_id" value={title.title_id} />
              <input name="cover" type="file" accept="image/*" required className="w-full text-sm" />
              <button type="submit" className="w-full rounded-md border px-4 py-2 text-sm font-medium">Upload cover</button>
            </form>
            {coverUrl ? (
              <form action={removeTitleCover} className="mt-2">
                <input type="hidden" name="title_id" value={title.title_id} />
                <button type="submit" className="text-xs text-destructive hover:underline">Remove cover</button>
              </form>
            ) : null}
          </div>

          <div className="rounded-lg border p-6">
            <h2 className="text-lg font-semibold">Publishing</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              A title is visible publicly only when its status is published. Individual items are also required to be published.
            </p>
            <form action={archiveTitle} className="mt-4">
              <input type="hidden" name="title_id" value={title.title_id} />
              <button type="submit" className="w-full rounded-md border px-4 py-2 text-sm font-medium">
                Archive title
              </button>
            </form>
            <form action={deleteTitle} className="mt-2">
              <input type="hidden" name="title_id" value={title.title_id} />
              <button type="submit" className="w-full rounded-md border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive">
                Delete empty title
              </button>
            </form>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default function AdminTitlePage({ params, searchParams }: PageProps) {
  return (
    <main className="min-h-screen">
      <Suspense
        fallback={
          <section className="mx-auto max-w-6xl px-6 py-10">
            <div className="h-10 w-64 animate-pulse rounded bg-secondary" />
            <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
              <div className="h-[720px] animate-pulse rounded-lg border" />
              <div className="h-80 animate-pulse rounded-lg border" />
            </div>
          </section>
        }
      >
        <TitleEditor params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
