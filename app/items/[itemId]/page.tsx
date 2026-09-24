import Link from "next/link";
import { notFound } from "next/navigation";

import {
  preorderItem,
  purchaseItem,
  saveReadingProgress,
} from "@/app/actions";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ itemId: string }>;
  searchParams: Promise<{ error?: string; notice?: string }>;
};

const prototypePages = [
  "The city wakes under a brass-colored moon. Somewhere beyond the eastern wall, a machine starts ticking.",
  "Mira follows the sound through an orchard where every tree is made of copper and every fruit remembers a different year.",
  "At the center of the grove, she finds a map that should not exist: a map of places that have not happened yet.",
];

export default async function ItemPage({ params, searchParams }: PageProps) {
  const { itemId } = await params;
  const query = await searchParams;
  const supabase = await createClient();

  const [{ data: item }, { data: claims }] = await Promise.all([
    supabase
      .from("items")
      .select(
        "item_id,title_id,item_type,chapter_or_volume_number,format,price,is_free_preview,release_date,stock_quantity",
      )
      .eq("item_id", itemId)
      .maybeSingle(),
    supabase.auth.getClaims(),
  ]);

  if (!item) {
    notFound();
  }

  const [{ data: title }, { data: progress }] = await Promise.all([
    supabase
      .from("titles")
      .select("title_name")
      .eq("title_id", item.title_id)
      .maybeSingle(),
    claims?.claims?.sub
      ? supabase
          .from("reading_progress")
          .select("progress_pct,completed_at,access_mode,last_accessed_at")
          .eq("user_id", claims.claims.sub)
          .eq("item_id", itemId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const userId = claims?.claims?.sub as string | undefined;

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-6 py-10">
        <Link
          href={`/titles/${item.title_id}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to {title?.title_name ?? "title"}
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border px-2 py-1">{item.format}</span>
                {item.is_free_preview ? (
                  <span className="rounded-full bg-secondary px-2 py-1">
                    Free preview
                  </span>
                ) : null}
              </div>
              <h1 className="text-4xl font-bold tracking-tight">
                {item.item_type === "light_novel" ? "Volume" : "Chapter"}{" "}
                {item.chapter_or_volume_number ?? "—"}
              </h1>
              <p className="text-muted-foreground">
                {title?.title_name ?? "Manga / Light Novel"}
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Prototype reader</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-sm text-muted-foreground">
                  Placeholder content is used here so the reading-progress workflow
                  can be tested before the real content pipeline is connected.
                </p>
                <div className="space-y-4">
                  {prototypePages.map((page, index) => (
                    <article key={index} className="rounded-lg border bg-secondary/30 p-5">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Page {index + 1}
                      </p>
                      <p className="leading-7">{page}</p>
                    </article>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Item</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-semibold">
                    {item.price == null ? "Free" : `₱${Number(item.price).toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Release</span>
                  <span>{item.release_date ?? "TBD"}</span>
                </div>
                {item.format === "physical" ? (
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Stock</span>
                    <span>{item.stock_quantity ?? "—"}</span>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {query.error ? (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm">
                {query.error}
              </p>
            ) : null}

            {query.notice ? (
              <p className="rounded-lg border bg-secondary p-3 text-sm">
                {query.notice}
              </p>
            ) : null}

            {!userId ? (
              <Card>
                <CardHeader>
                  <CardTitle>Sign in to test stateful features</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link
                    href="/auth/login"
                    className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                  >
                    Sign in
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Reading progress</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Current: {progress?.progress_pct ?? 0}%
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {[25, 50, 75, 100].map((value) => (
                        <form key={value} action={saveReadingProgress}>
                          <input type="hidden" name="item_id" value={itemId} />
                          <input type="hidden" name="progress_pct" value={value} />
                          <button
                            className="w-full rounded-md border px-3 py-2 text-sm hover:bg-secondary"
                            type="submit"
                          >
                            {value}%
                          </button>
                        </form>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Commerce prototype</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <form action={purchaseItem}>
                      <input type="hidden" name="item_id" value={itemId} />
                      <button
                        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                        type="submit"
                      >
                        Simulate purchase
                      </button>
                    </form>

                    {item.format === "physical" ? (
                      <form action={preorderItem}>
                        <input type="hidden" name="item_id" value={itemId} />
                        <button
                          className="w-full rounded-md border px-4 py-2 text-sm font-medium"
                          type="submit"
                        >
                          Simulate preorder
                        </button>
                      </form>
                    ) : null}
                  </CardContent>
                </Card>
              </>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
