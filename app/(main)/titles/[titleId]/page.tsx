import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { ItemRow } from "@/components/manga/item-row";
import type { Arc, Item } from "@/lib/types";
import { getImageUrl } from "@/lib/utils";

// Opt out of prerendering — dynamic params + DB queries at request time
export const instant = false;

interface Params {
  params: Promise<{ titleId: string }>;
}

export async function generateMetadata({ params }: Params) {
  const { titleId } = await params;
  const supabase = await createClient();
  const { data: title } = await supabase
    .from("titles")
    .select("title_name")
    .eq("title_id", titleId)
    .single();
  return { title: title ? `${title.title_name} — Loxada M&LN` : "Title" };
}

export default async function TitleDetailPage({ params }: Params) {
  const { titleId } = await params;
  const supabase = await createClient();

  const [{ data: title }, { data: arcs }, { data: items }] = await Promise.all(
    [
      supabase
        .from("titles")
        .select("*")
        .eq("title_id", titleId)
        .single(),
      supabase
        .from("arcs")
        .select("*")
        .eq("title_id", titleId)
        .order("sequence_order", { ascending: true }),
      supabase
        .from("items")
        .select("*")
        .eq("title_id", titleId)
        .order("chapter_or_volume_number", { ascending: true }),
    ],
  );

  if (!title) notFound();

  // Group items by arc_id
  const itemsByArc: Record<string, Item[]> = {};
  const unarchedItems: Item[] = [];

  for (const item of items ?? []) {
    if (item.arc_id) {
      if (!itemsByArc[item.arc_id]) itemsByArc[item.arc_id] = [];
      itemsByArc[item.arc_id].push(item);
    } else {
      unarchedItems.push(item);
    }
  }

  // Cover of first item (best-effort)
  const firstItem = items?.[0];
  const coverUrl = firstItem
    ? getImageUrl(titleId, firstItem.item_id)
    : null;

  return (
    <div>
      {/* Title header */}
      <div className="flex gap-6 mb-8">
        {coverUrl && (
          <div className="shrink-0 w-32 h-44 relative rounded overflow-hidden border border-foreground/10">
            <Image
              src={coverUrl}
              alt={`${title.title_name} cover`}
              fill
              className="object-cover"
              onError={() => {}} // silently fail on missing image
            />
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold">{title.title_name}</h1>
          <p className="text-sm text-foreground/60 mt-1 capitalize">
            {title.origin_type ?? "—"}
          </p>
          <Link
            href="/titles"
            className="text-sm text-blue-600 hover:underline mt-3 block"
          >
            ← Back to Browse
          </Link>
        </div>
      </div>

      {/* Items without an arc */}
      {unarchedItems.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-2">Chapters / Volumes</h2>
          <div className="divide-y divide-foreground/10 border border-foreground/10 rounded">
            {unarchedItems.map((item) => (
              <ItemRow key={item.item_id} item={item} titleId={titleId} />
            ))}
          </div>
        </section>
      )}

      {/* Items grouped by arc */}
      {(arcs ?? []).map((arc: Arc) => {
        const arcItems = itemsByArc[arc.arc_id] ?? [];
        return (
          <section key={arc.arc_id} className="mb-8">
            <h2 className="text-lg font-semibold mb-2">{arc.arc_name}</h2>
            {arcItems.length === 0 ? (
              <p className="text-sm text-foreground/50">No items in this arc yet.</p>
            ) : (
              <div className="divide-y divide-foreground/10 border border-foreground/10 rounded">
                {arcItems.map((item) => (
                  <ItemRow key={item.item_id} item={item} titleId={titleId} />
                ))}
              </div>
            )}
          </section>
        );
      })}

      {(arcs ?? []).length === 0 && unarchedItems.length === 0 && (
        <p className="text-foreground/60">No items added yet.</p>
      )}
    </div>
  );
}
