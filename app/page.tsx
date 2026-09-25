import { Suspense } from "react";

import { CatalogCard } from "@/components/catalog-card";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";

async function HomeCatalog() {
  const supabase = await createClient();
  const [{ data: titles }, { data: items }] = await Promise.all([
    supabase.from("titles").select("title_id,title_name,origin_type").order("title_name"),
    supabase.from("items").select("item_id,title_id,item_type,format,price"),
  ]);

  const safeTitles = titles ?? [];
  const safeItems = items ?? [];

  return safeTitles.length === 0 ? (
    <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
      No titles have been published yet.
    </div>
  ) : (
    <div className="grid gap-5 md:grid-cols-2">
      {safeTitles.map((title) => {
        const titleItems = safeItems.filter((item) => item.title_id === title.title_id);
        const minPrice = titleItems.reduce((value: number | null, item) => {
          if (item.price == null) return value;
          const price = Number(item.price);
          return value == null ? price : Math.min(value, price);
        }, null);

        return (
          <CatalogCard
            key={title.title_id}
            titleId={title.title_id}
            titleName={title.title_name}
            originType={title.origin_type}
            itemCount={titleItems.length}
            itemTypes={[...new Set(titleItems.map((item) => item.item_type).filter(Boolean))] as string[]}
            formats={[...new Set(titleItems.map((item) => item.format).filter(Boolean))] as string[]}
            minPrice={minPrice}
          />
        );
      })}
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="border-b">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <p className="text-sm font-medium text-muted-foreground">Manga / Light Novel Subsystem</p>
          <div className="mt-2 max-w-3xl space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Browse the catalog.</h1>
            <p className="text-lg text-muted-foreground">
              Browse published manga and light novel titles. Sign in to access your account workspace.
            </p>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 py-10">
        <Suspense
          fallback={
            <div className="grid gap-5 md:grid-cols-2">
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className="h-40 animate-pulse rounded-lg border" />
              ))}
            </div>
          }
        >
          <HomeCatalog />
        </Suspense>
      </section>
    </main>
  );
}
