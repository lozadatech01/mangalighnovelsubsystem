import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ itemId: string }>;
};

async function ItemContent({ params }: PageProps) {
  const { itemId } = await params;
  const supabase = await createClient();

  const { data: item } = await supabase
    .from("items")
    .select(
      "item_id,title_id,item_type,chapter_or_volume_number,format,price,is_free_preview,release_date,stock_quantity,status",
    )
    .eq("item_id", itemId)
    .eq("status", "published")
    .maybeSingle();

  if (!item) notFound();

  const { data: title } = await supabase
    .from("titles")
    .select("title_name,status")
    .eq("title_id", item.title_id)
    .eq("status", "published")
    .maybeSingle();

  if (!title) notFound();

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <Link
        href={`/titles/${item.title_id}`}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to {title.title_name}
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
            <p className="text-muted-foreground">{title.title_name}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Content for this item has not been published yet.
              </p>
            </CardContent>
          </Card>
        </div>

        <aside>
          <Card>
            <CardHeader>
              <CardTitle>Item details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Format</span>
                <span>{item.format}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Price</span>
                <span className="font-semibold">
                  {item.price == null ? "Free" : `₱${Number(item.price).toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Release</span>
                <span>{item.release_date ?? "Not scheduled"}</span>
              </div>
              {item.format === "physical" ? (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Stock</span>
                  <span>{item.stock_quantity ?? "Not set"}</span>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </aside>
      </div>
    </section>
  );
}

export default function ItemPage({ params }: PageProps) {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <Suspense
        fallback={
          <section className="mx-auto max-w-6xl px-6 py-10">
            <div className="h-4 w-32 animate-pulse rounded bg-secondary" />
            <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
              <div className="space-y-4">
                <div className="h-10 w-2/3 animate-pulse rounded bg-secondary" />
                <div className="h-64 animate-pulse rounded-lg border" />
              </div>
              <div className="h-56 animate-pulse rounded-lg border" />
            </div>
          </section>
        }
      >
        <ItemContent params={params} />
      </Suspense>
    </main>
  );
}
