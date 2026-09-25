import { Suspense } from "react";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

type PageProps = {
  searchParams: Promise<{ status?: string; notice?: string; error?: string }>;
};

async function TitlesContent({ searchParams }: PageProps) {
  const query = await searchParams;
  const supabase = await createClient();
  const status = ["all", "draft", "published", "archived"].includes(query.status ?? "")
    ? query.status ?? "all"
    : "all";

  let titleQuery = supabase
    .from("titles")
    .select("title_id,title_name,origin_type,status,published_at,updated_at")
    .order("updated_at", { ascending: false });

  if (status !== "all") {
    titleQuery = titleQuery.eq("status", status);
  }

  const [{ data: titles }, { data: items }] = await Promise.all([
    titleQuery,
    supabase.from("items").select("item_id,title_id,status,item_type"),
  ]);

  const safeTitles = titles ?? [];
  const safeItems = items ?? [];

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Catalog management</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Titles</h1>
        </div>
        <Link
          href="/admin/titles/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          New title
        </Link>
      </div>

      {query.notice ? <p className="mt-6 rounded-lg border bg-secondary p-3 text-sm">{query.notice}</p> : null}
      {query.error ? <p className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm">{query.error}</p> : null}

      <div className="mt-6 flex flex-wrap gap-2">
        {["all", "draft", "published", "archived"].map((value) => (
          <Link
            key={value}
            href={value === "all" ? "/admin/titles" : `/admin/titles?status=${value}`}
            className={`rounded-full border px-3 py-1 text-sm ${status === value ? "bg-secondary font-medium" : "text-muted-foreground"}`}
          >
            {value}
          </Link>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {safeTitles.length === 0 ? (
          <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
            No titles match this filter.
          </div>
        ) : (
          safeTitles.map((title) => {
            const titleItems = safeItems.filter((item) => item.title_id === title.title_id);
            const publishedItems = titleItems.filter((item) => item.status === "published").length;
            return (
              <Link key={title.title_id} href={`/admin/titles/${title.title_id}`}>
                <div className="rounded-lg border p-5 transition hover:bg-secondary/40">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold">{title.title_name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {title.title_id} · {title.origin_type ?? "unclassified"}
                      </p>
                    </div>
                    <span className="rounded-full border px-2 py-1 text-xs">{title.status}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span>{titleItems.length} items</span>
                    <span>{publishedItems} published</span>
                    <span>{title.published_at ? `Published ${new Date(title.published_at).toLocaleDateString()}` : "Not published"}</span>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
}

export default function AdminTitlesPage({ searchParams }: PageProps) {
  return (
    <main className="min-h-screen">
      <Suspense
        fallback={
          <section className="mx-auto max-w-6xl px-6 py-10">
            <div className="h-10 w-48 animate-pulse rounded bg-secondary" />
            <div className="mt-6 space-y-3">
              {[0, 1, 2].map((index) => <div key={index} className="h-28 rounded-lg border animate-pulse" />)}
            </div>
          </section>
        }
      >
        <TitlesContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
