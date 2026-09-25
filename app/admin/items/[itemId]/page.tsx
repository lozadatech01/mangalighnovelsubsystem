import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteItem, saveItemContentPath, updateItem } from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ itemId: string }>;
  searchParams: Promise<{ notice?: string; error?: string }>;
};

async function ItemEditor({ params, searchParams }: PageProps) {
  const { itemId } = await params;
  const query = await searchParams;
  const supabase = await createClient();

  const { data: item } = await supabase
    .from("items")
    .select(
      "item_id,title_id,item_type,chapter_or_volume_number,format,price,is_free_preview,release_date,stock_quantity,status,published_at,content_path",
    )
    .eq("item_id", itemId)
    .maybeSingle();

  if (!item) notFound();

  const [{ data: title }, { data: arcs }] = await Promise.all([
    supabase.from("titles").select("title_name").eq("title_id", item.title_id).maybeSingle(),
    supabase.from("arcs").select("arc_id,arc_name,sequence_order").eq("title_id", item.title_id).order("sequence_order"),
  ]);

  if (!title) notFound();

  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <Link href={`/admin/titles/${item.title_id}`} className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to {title.title_name}
      </Link>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Item editor</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            {item.item_type === "light_novel" ? "Volume" : "Chapter"} {item.chapter_or_volume_number ?? "—"}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">{item.item_id}</p>
        </div>
        <span className="rounded-full border px-3 py-1 text-sm">{item.status}</span>
      </div>

      {query.notice ? <p className="mt-6 rounded-lg border bg-secondary p-3 text-sm">{query.notice}</p> : null}
      {query.error ? <p className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm">{query.error}</p> : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <form action={updateItem} className="space-y-5 rounded-lg border p-6">
          <input type="hidden" name="item_id" value={item.item_id} />
          <input type="hidden" name="title_id" value={item.title_id} />

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              <span className="font-medium">Type</span>
              <select name="item_type" defaultValue={item.item_type ?? "manga"} className="mt-2 w-full rounded-md border px-3 py-2">
                <option value="manga">Manga</option>
                <option value="light_novel">Light novel</option>
              </select>
            </label>

            <label className="text-sm">
              <span className="font-medium">Chapter / volume number</span>
              <input name="chapter_or_volume_number" type="number" min="1" defaultValue={item.chapter_or_volume_number ?? ""} className="mt-2 w-full rounded-md border px-3 py-2" />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              <span className="font-medium">Format</span>
              <select name="format" defaultValue={item.format ?? "digital"} className="mt-2 w-full rounded-md border px-3 py-2">
                <option value="digital">Digital</option>
                <option value="physical">Physical</option>
              </select>
            </label>

            <label className="text-sm">
              <span className="font-medium">Status</span>
              <select name="status" defaultValue={item.status} className="mt-2 w-full rounded-md border px-3 py-2">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </label>
          </div>

          <label className="block text-sm">
            <span className="font-medium">Arc</span>
            <select name="arc_id" defaultValue={arcs?.some((arc) => arc.arc_id === item.arc_id) ? item.arc_id ?? "" : ""} className="mt-2 w-full rounded-md border px-3 py-2">
              <option value="">No arc</option>
              {(arcs ?? []).map((arc) => (
                <option key={arc.arc_id} value={arc.arc_id}>{arc.arc_name}</option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="text-sm">
              <span className="font-medium">Price</span>
              <input name="price" type="number" min="0" step="0.01" defaultValue={item.price ?? ""} className="mt-2 w-full rounded-md border px-3 py-2" />
            </label>

            <label className="text-sm">
              <span className="font-medium">Release date</span>
              <input name="release_date" type="date" defaultValue={item.release_date ?? ""} className="mt-2 w-full rounded-md border px-3 py-2" />
            </label>

            <label className="text-sm">
              <span className="font-medium">Physical stock</span>
              <input name="stock_quantity" type="number" min="0" defaultValue={item.stock_quantity ?? ""} className="mt-2 w-full rounded-md border px-3 py-2" />
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input name="is_free_preview" type="checkbox" defaultChecked={item.is_free_preview ?? false} />
            Mark as a free preview
          </label>

          <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Save item
          </button>
        </form>

        <aside className="space-y-6">
          <div className="rounded-lg border p-6">
            <h2 className="text-lg font-semibold">Content asset</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Store the private Storage object path here. The reader/delivery layer will use this path later.
            </p>
            <form action={saveItemContentPath} className="mt-4 space-y-3">
              <input type="hidden" name="item_id" value={item.item_id} />
              <input type="hidden" name="title_id" value={item.title_id} />
              <input
                name="content_path"
                defaultValue={item.content_path ?? ""}
                placeholder="items/item-id/content.pdf"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
              <button type="submit" className="w-full rounded-md border px-4 py-2 text-sm font-medium">
                Save content path
              </button>
            </form>
            <p className="mt-3 break-all text-xs text-muted-foreground">
              {item.content_path ? `Current: ${item.content_path}` : "No content asset linked."}
            </p>
          </div>

          <div className="rounded-lg border p-6">
            <h2 className="text-lg font-semibold">Danger zone</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Items with customer purchases, preorders, or reading history cannot be deleted. Archive them instead.
            </p>
            <form action={deleteItem} className="mt-4">
              <input type="hidden" name="item_id" value={item.item_id} />
              <input type="hidden" name="title_id" value={item.title_id} />
              <button type="submit" className="w-full rounded-md border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive">
                Delete item
              </button>
            </form>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default function AdminItemPage({ params, searchParams }: PageProps) {
  return (
    <main className="min-h-screen">
      <Suspense
        fallback={
          <section className="mx-auto max-w-5xl px-6 py-10">
            <div className="h-10 w-64 animate-pulse rounded bg-secondary" />
            <div className="mt-8 h-[600px] animate-pulse rounded-lg border" />
          </section>
        }
      >
        <ItemEditor params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
