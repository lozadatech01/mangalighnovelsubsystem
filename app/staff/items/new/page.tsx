"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { addItemAction } from "@/app/actions/staff";
import { getImagePath } from "@/lib/utils";
import type { Title, Arc } from "@/lib/types";

export default function NewItemPage() {
  const router = useRouter();
  const [titles, setTitles] = useState<Title[]>([]);
  const [arcs, setArcs] = useState<Arc[]>([]);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [format, setFormat] = useState<"digital" | "physical">("digital");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("titles")
      .select("title_id, title_name")
      .order("title_name")
      .then(({ data }) => setTitles((data as Title[]) ?? []));
  }, []);

  useEffect(() => {
    if (!selectedTitle) {
      setArcs([]);
      return;
    }
    const supabase = createClient();
    supabase
      .from("arcs")
      .select("arc_id, arc_name, sequence_order")
      .eq("title_id", selectedTitle)
      .order("sequence_order")
      .then(({ data }) => setArcs((data as Arc[]) ?? []));
  }, [selectedTitle]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    // Ensure is_free_preview is sent as string 'true'/'false'
    const freePreviewChecked =
      (e.currentTarget.elements.namedItem("is_free_preview") as HTMLInputElement)?.checked;
    formData.set("is_free_preview", freePreviewChecked ? "true" : "false");

    const result = await addItemAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    const itemId = result.item_id!;
    const titleId = formData.get("title_id") as string;

    // Upload cover image if provided
    if (coverFile && itemId && titleId) {
      const supabase = createClient();
      const path = getImagePath(titleId, itemId);
      const { error: uploadErr } = await supabase.storage
        .from("manga-ln-assets")
        .upload(path, coverFile, { upsert: true });

      if (uploadErr) {
        setError(`Item saved, but cover upload failed: ${uploadErr.message}`);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    router.push(`/titles/${titleId}/items/${itemId}`);
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold mb-6">Add New Item (Chapter / Volume)</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="title_id" className="block text-sm font-medium mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <select
            id="title_id"
            name="title_id"
            required
            value={selectedTitle}
            onChange={(e) => setSelectedTitle(e.target.value)}
            className="w-full border border-foreground/20 rounded px-3 py-2 text-sm bg-background"
          >
            <option value="">— select —</option>
            {titles.map((t) => (
              <option key={t.title_id} value={t.title_id}>
                {t.title_name}
              </option>
            ))}
          </select>
        </div>

        {/* Arc (optional) */}
        <div>
          <label htmlFor="arc_id" className="block text-sm font-medium mb-1">
            Arc (optional)
          </label>
          <select
            id="arc_id"
            name="arc_id"
            className="w-full border border-foreground/20 rounded px-3 py-2 text-sm bg-background"
            disabled={!arcs.length}
          >
            <option value="">— none —</option>
            {arcs.map((a) => (
              <option key={a.arc_id} value={a.arc_id}>
                {a.arc_name}
              </option>
            ))}
          </select>
        </div>

        {/* Item type */}
        <div>
          <label htmlFor="item_type" className="block text-sm font-medium mb-1">
            Item type <span className="text-red-500">*</span>
          </label>
          <select
            id="item_type"
            name="item_type"
            required
            className="w-full border border-foreground/20 rounded px-3 py-2 text-sm bg-background"
          >
            <option value="manga">Manga (chapter)</option>
            <option value="light_novel">Light novel (volume)</option>
          </select>
        </div>

        {/* Chapter / volume number */}
        <div>
          <label htmlFor="chapter_or_volume_number" className="block text-sm font-medium mb-1">
            Chapter / volume number
          </label>
          <input
            id="chapter_or_volume_number"
            name="chapter_or_volume_number"
            type="number"
            min={1}
            className="w-full border border-foreground/20 rounded px-3 py-2 text-sm bg-background"
            placeholder="1"
          />
        </div>

        {/* Format */}
        <div>
          <label htmlFor="format" className="block text-sm font-medium mb-1">
            Format <span className="text-red-500">*</span>
          </label>
          <select
            id="format"
            name="format"
            required
            value={format}
            onChange={(e) => setFormat(e.target.value as "digital" | "physical")}
            className="w-full border border-foreground/20 rounded px-3 py-2 text-sm bg-background"
          >
            <option value="digital">Digital</option>
            <option value="physical">Physical</option>
          </select>
        </div>

        {/* Stock quantity — only for physical */}
        {format === "physical" && (
          <div>
            <label htmlFor="stock_quantity" className="block text-sm font-medium mb-1">
              Stock quantity
            </label>
            <input
              id="stock_quantity"
              name="stock_quantity"
              type="number"
              min={0}
              className="w-full border border-foreground/20 rounded px-3 py-2 text-sm bg-background"
              placeholder="0"
            />
          </div>
        )}

        {/* Price */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium mb-1">
            Price (₱)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            step="0.01"
            className="w-full border border-foreground/20 rounded px-3 py-2 text-sm bg-background"
            placeholder="0.00"
          />
        </div>

        {/* Release date */}
        <div>
          <label htmlFor="release_date" className="block text-sm font-medium mb-1">
            Release date
          </label>
          <input
            id="release_date"
            name="release_date"
            type="date"
            className="w-full border border-foreground/20 rounded px-3 py-2 text-sm bg-background"
          />
        </div>

        {/* Free preview */}
        <div className="flex items-center gap-2">
          <input
            id="is_free_preview"
            name="is_free_preview"
            type="checkbox"
            className="rounded"
          />
          <label htmlFor="is_free_preview" className="text-sm font-medium">
            Mark as free preview
          </label>
        </div>

        {/* Cover image */}
        <div>
          <label htmlFor="cover_image" className="block text-sm font-medium mb-1">
            Cover image (uploads to manga-ln-assets)
          </label>
          <input
            id="cover_image"
            name="cover_image"
            type="file"
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
            className="text-sm"
          />
          <p className="text-xs text-foreground/50 mt-1">
            Will be stored at{" "}
            <code className="bg-foreground/10 px-1 rounded">
              &#123;title_id&#125;/&#123;item_id&#125;/cover.jpg
            </code>
          </p>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving…" : "Add Item"}
        </button>
      </form>
    </div>
  );
}
