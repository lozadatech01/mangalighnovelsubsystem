"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateItemAction } from "@/app/actions/staff";
import type { Item } from "@/lib/types";

interface Params {
  params: Promise<{ itemId: string }>;
}

// Next.js requires async server-side params, but this is a client component.
// We use searchParams via a wrapper instead. For simplicity, this page
// fetches the item on mount using the itemId from the URL.
export default function EditItemPage({ params }: Params) {
  const router = useRouter();
  const [itemId, setItemId] = useState<string | null>(null);
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFreePreview, setIsFreePreview] = useState(false);

  useEffect(() => {
    params.then(({ itemId: id }) => {
      setItemId(id);
      const supabase = createClient();
      supabase
        .from("items")
        .select("*")
        .eq("item_id", id)
        .single()
        .then(({ data }) => {
          if (data) {
            setItem(data as Item);
            setIsFreePreview(data.is_free_preview);
          }
          setFetching(false);
        });
    });
  }, [params]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!itemId) return;
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("is_free_preview", isFreePreview ? "true" : "false");
    const result = await updateItemAction(itemId, formData);
    setLoading(false);

    if (result?.error) {
      setError(result.error);
    } else {
      router.push(`/titles/${item?.title_id}/items/${itemId}`);
    }
  }

  if (fetching) {
    return <p className="text-sm text-foreground/60">Loading item…</p>;
  }

  if (!item) {
    return <p className="text-red-500 text-sm">Item not found.</p>;
  }

  const label = item.item_type === "manga" ? "Chapter" : "Volume";

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold mb-1">Edit Item</h1>
      <p className="text-sm text-foreground/60 mb-6">
        {label} {item.chapter_or_volume_number} — {item.format}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Free preview toggle */}
        <div className="flex items-center gap-3">
          <input
            id="is_free_preview"
            name="is_free_preview"
            type="checkbox"
            checked={isFreePreview}
            onChange={(e) => setIsFreePreview(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="is_free_preview" className="text-sm font-medium">
            Free preview
          </label>
        </div>

        {/* Stock quantity (physical only) */}
        {item.format === "physical" && (
          <div>
            <label htmlFor="stock_quantity" className="block text-sm font-medium mb-1">
              Stock quantity
            </label>
            <input
              id="stock_quantity"
              name="stock_quantity"
              type="number"
              min={0}
              defaultValue={item.stock_quantity ?? 0}
              className="w-full border border-foreground/20 rounded px-3 py-2 text-sm bg-background"
            />
          </div>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
