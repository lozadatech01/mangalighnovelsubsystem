import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ titleId: string }>;
};

export default async function TitlePage({ params }: PageProps) {
  const { titleId } = await params;
  const supabase = await createClient();

  const [{ data: title }, { data: items }] = await Promise.all([
    supabase
      .from("titles")
      .select("title_id,title_name,origin_type")
      .eq("title_id", titleId)
      .maybeSingle(),
    supabase
      .from("items")
      .select(
        "item_id,item_type,chapter_or_volume_number,format,price,is_free_preview,release_date,stock_quantity,arc_id",
      )
      .eq("title_id", titleId)
      .order("chapter_or_volume_number"),
  ]);

  if (!title) {
    notFound();
  }

  const arcIds = [...new Set((items ?? []).map((item) => item.arc_id).filter(Boolean))];
  const { data: arcs } = arcIds.length
    ? await supabase
        .from("arcs")
        .select("arc_id,arc_name,sequence_order")
        .in("arc_id", arcIds)
        .order("sequence_order")
    : { data: [] };

  const arcName = new Map((arcs ?? []).map((arc) => [arc.arc_id, arc.arc_name]));

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-6 py-10">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to catalog
        </Link>

        <div className="mt-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full border px-2 py-1">
              {title.origin_type ?? "catalog"}
            </span>
            <span className="rounded-full bg-secondary px-2 py-1">
              {(items ?? []).length} items
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">{title.title_name}</h1>
          <p className="max-w-2xl text-muted-foreground">
            Explore chapters or volumes in this prototype catalog.
          </p>
        </div>

        <div className="mt-10 grid gap-4">
          {(items ?? []).map((item) => (
            <Link key={item.item_id} href={`/items/${item.item_id}`}>
              <Card className="transition hover:border-foreground/30">
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <CardTitle className="text-lg">
                      {item.item_type === "light_novel" ? "Volume" : "Chapter"}{" "}
                      {item.chapter_or_volume_number ?? "—"}
                    </CardTitle>
                    <div className="flex gap-2 text-xs">
                      {item.is_free_preview ? (
                        <span className="rounded-full bg-secondary px-2 py-1">
                          Free preview
                        </span>
                      ) : null}
                      <span className="rounded-full border px-2 py-1">{item.format}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 text-sm">
                  <div className="text-muted-foreground">
                    {item.arc_id ? arcName.get(item.arc_id) ?? "Unassigned arc" : "No arc"}
                    {" · "}
                    Released {item.release_date ?? "TBD"}
                  </div>
                  <div className="font-semibold">
                    {item.price == null ? "Free" : `₱${Number(item.price).toFixed(2)}`}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
