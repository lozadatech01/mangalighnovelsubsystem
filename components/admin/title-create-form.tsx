"use client";

import { useEffect, useMemo, useState } from "react";

import { createTitle } from "@/app/admin/actions";

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

export function TitleCreateForm() {
  const [titleName, setTitleName] = useState("");
  const [titleId, setTitleId] = useState("");
  const [description, setDescription] = useState("");
  const [cover, setCover] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [idTouched, setIdTouched] = useState(false);

  useEffect(() => {
    if (idTouched) return;
    setTitleId(slugify(titleName));
  }, [titleName, idTouched]);

  useEffect(() => {
    if (!cover) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(cover);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [cover]);

  const coverHint = useMemo(() => {
    if (!cover) return "Optional. PNG, JPG, WEBP, or another browser-supported image. Max 900 KB.";
    return cover.name + " · " + (cover.size / 1024).toFixed(0) + " KB";
  }, [cover]);

  return (
    <form action={createTitle} className="mt-8 space-y-8 rounded-lg border p-6" encType="multipart/form-data">
      <section className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold">Basic information</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This creates the canonical title record used by the Manga/LN subsystem.
          </p>
        </div>

        <div>
          <label className="text-sm font-medium" htmlFor="title_name">Title name</label>
          <input
            id="title_name"
            name="title_name"
            required
            maxLength={200}
            value={titleName}
            onChange={(event) => setTitleName(event.target.value)}
            placeholder="e.g. The Moonlit Archive"
            className="mt-2 w-full rounded-md border px-3 py-2"
          />
          <p className="mt-1 text-xs text-muted-foreground">{titleName.length}/200 characters</p>
        </div>

        <div>
          <label className="text-sm font-medium" htmlFor="title_id">Title ID</label>
          <div className="mt-2 flex gap-2">
            <input
              id="title_id"
              name="title_id"
              required
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              maxLength={100}
              value={titleId}
              onChange={(event) => {
                setIdTouched(true);
                setTitleId(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-"));
              }}
              placeholder="the-moonlit-archive"
              className="min-w-0 flex-1 rounded-md border px-3 py-2 font-mono text-sm"
            />
            <button
              type="button"
              onClick={() => {
                setIdTouched(true);
                setTitleId(slugify(titleName));
              }}
              className="rounded-md border px-3 py-2 text-sm font-medium"
            >
              Generate
            </button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Stable shared identifier. Use lowercase kebab-case and avoid changing it after creation.
          </p>
        </div>

        <div>
          <label className="text-sm font-medium" htmlFor="origin_type">Origin</label>
          <select id="origin_type" name="origin_type" defaultValue="original" className="mt-2 w-full rounded-md border px-3 py-2">
            <option value="original">Original — Loxada-originated work</option>
            <option value="licensed">Licensed — licensed external work</option>
          </select>
        </div>
      </section>

      <section className="space-y-5 border-t pt-8">
        <div>
          <h2 className="text-lg font-semibold">Description</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This appears on the public title page once the title is published.
          </p>
        </div>

        <div>
          <textarea
            id="description"
            name="description"
            rows={7}
            maxLength={5000}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Write the official title synopsis or catalog description."
            className="w-full rounded-md border px-3 py-2"
          />
          <p className="mt-1 text-xs text-muted-foreground">{description.length}/5000 characters</p>
        </div>
      </section>

      <section className="space-y-5 border-t pt-8">
        <div>
          <h2 className="text-lg font-semibold">Cover</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add the catalog cover now or upload/change it later from the title editor.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-[180px_1fr]">
          <div className="overflow-hidden rounded-md border bg-secondary/30">
            {previewUrl ? (
              <img src={previewUrl} alt="Cover preview" className="aspect-[2/3] w-full object-cover" />
            ) : (
              <div className="flex aspect-[2/3] items-center justify-center p-4 text-center text-xs text-muted-foreground">
                No cover selected
              </div>
            )}
          </div>

          <div className="space-y-3">
            <input
              id="cover"
              name="cover"
              type="file"
              accept="image/*"
              onChange={(event) => setCover(event.target.files?.[0] ?? null)}
              className="w-full text-sm"
            />
            <p className="text-xs text-muted-foreground">{coverHint}</p>
            {cover ? (
              <button
                type="button"
                onClick={() => {
                  setCover(null);
                  const input = document.getElementById("cover") as HTMLInputElement | null;
                  if (input) input.value = "";
                }}
                className="text-xs text-destructive hover:underline"
              >
                Remove selected cover
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-lg bg-secondary/40 p-4">
        <p className="text-sm font-medium">Creation workflow</p>
        <p className="mt-1 text-sm text-muted-foreground">
          A new title is created as a draft. After creation, you will be taken directly to its editor to add arcs and chapters/volumes, upload or replace the cover, and publish it when ready.
        </p>
      </section>

      <div className="flex flex-wrap gap-3 border-t pt-6">
        <button type="submit" className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">
          Create draft & continue
        </button>
        <a href="/admin/titles" className="rounded-md border px-5 py-2.5 text-sm font-medium">
          Cancel
        </a>
      </div>
    </form>
  );
}
