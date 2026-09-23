"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { addArcAction } from "@/app/actions/staff";
import type { Title } from "@/lib/types";

export default function NewArcPage() {
  const router = useRouter();
  const [titles, setTitles] = useState<Title[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("titles")
      .select("title_id, title_name")
      .order("title_name")
      .then(({ data }) => setTitles((data as Title[]) ?? []));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await addArcAction(formData);
    setLoading(false);

    if (result?.error) {
      setError(result.error);
    } else {
      const titleId = formData.get("title_id");
      router.push(`/titles/${titleId}`);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold mb-6">Add New Arc</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title_id" className="block text-sm font-medium mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <select
            id="title_id"
            name="title_id"
            required
            className="w-full border border-foreground/20 rounded px-3 py-2 text-sm bg-background"
          >
            <option value="">— select a title —</option>
            {titles.map((t) => (
              <option key={t.title_id} value={t.title_id}>
                {t.title_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="arc_name" className="block text-sm font-medium mb-1">
            Arc name <span className="text-red-500">*</span>
          </label>
          <input
            id="arc_name"
            name="arc_name"
            type="text"
            required
            className="w-full border border-foreground/20 rounded px-3 py-2 text-sm bg-background"
            placeholder="e.g. The Beginning Arc"
          />
        </div>

        <div>
          <label htmlFor="sequence_order" className="block text-sm font-medium mb-1">
            Sequence order
          </label>
          <input
            id="sequence_order"
            name="sequence_order"
            type="number"
            min={1}
            className="w-full border border-foreground/20 rounded px-3 py-2 text-sm bg-background"
            placeholder="1"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving…" : "Add Arc"}
        </button>
      </form>
    </div>
  );
}
