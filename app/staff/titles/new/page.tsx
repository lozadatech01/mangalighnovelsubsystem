"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addTitleAction } from "@/app/actions/staff";

export default function NewTitlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await addTitleAction(formData);
    setLoading(false);

    if (result?.error) {
      setError(result.error);
    } else {
      router.push(`/titles/${result.title_id}`);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold mb-6">Add New Title</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title_name" className="block text-sm font-medium mb-1">
            Title name <span className="text-red-500">*</span>
          </label>
          <input
            id="title_name"
            name="title_name"
            type="text"
            required
            className="w-full border border-foreground/20 rounded px-3 py-2 text-sm bg-background"
            placeholder="e.g. Loxada Chronicles"
          />
        </div>

        <div>
          <label htmlFor="origin_type" className="block text-sm font-medium mb-1">
            Origin type
          </label>
          <select
            id="origin_type"
            name="origin_type"
            className="w-full border border-foreground/20 rounded px-3 py-2 text-sm bg-background"
          >
            <option value="">— select —</option>
            <option value="licensed">Licensed</option>
            <option value="original">Original</option>
          </select>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving…" : "Add Title"}
        </button>
      </form>
    </div>
  );
}
