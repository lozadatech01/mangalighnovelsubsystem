import { Suspense } from "react";
import Link from "next/link";

import { subscribeUser } from "@/app/actions";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  searchParams: Promise<{ notice?: string }>;
};

async function ProtectedContent({ searchParams }: PageProps) {
  const query = await searchParams;
  const supabase = await createClient();

  const [
    { data: purchasesData },
    { data: subscriptionsData },
    { data: preordersData },
    { data: progressData },
  ] = await Promise.all([
    supabase.from("purchases").select("purchase_id,purchased_at,price_paid,purchase_type,item_id").order("purchased_at", { ascending: false }),
    supabase.from("subscriptions").select("subscription_id,started_at,ended_at,tier,price").order("started_at", { ascending: false }),
    supabase.from("preorders").select("preorder_id,preordered_at,status,price_at_preorder,item_id").order("preordered_at", { ascending: false }),
    supabase.from("reading_progress").select("reading_progress_id,item_id,progress_pct,completed_at,last_accessed_at").order("last_accessed_at", { ascending: false }),
  ]);

  const purchases = purchasesData ?? [];
  const subscriptions = subscriptionsData ?? [];
  const preorders = preordersData ?? [];
  const progress = progressData ?? [];

  const purchaseTotal = purchases.reduce((total, purchase) => total + Number(purchase.price_paid ?? 0), 0);
  const activeSubscriptions = subscriptions.filter((subscription) => !subscription.ended_at).length;
  const completedItems = progress.filter((item) => Number(item.progress_pct ?? 0) >= 100).length;

  const recentItemIds = [...new Set([
    ...progress.slice(0, 5).map((item) => item.item_id),
    ...purchases.slice(0, 5).map((item) => item.item_id),
  ])];

  const { data: recentItems } = recentItemIds.length
    ? await supabase.from("items").select("item_id,item_type,chapter_or_volume_number").in("item_id", recentItemIds)
    : { data: [] };

  const itemLabels = new Map(
    (recentItems ?? []).map((item) => [
      item.item_id,
      `${item.item_type === "light_novel" ? "Volume" : "Chapter"} ${item.chapter_or_volume_number ?? "—"}`,
    ]),
  );

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">Personal workspace</p>
        <h1 className="text-4xl font-bold tracking-tight">Prototype dashboard</h1>
        <p className="max-w-2xl text-muted-foreground">
          These metrics are scoped to the signed-in user. Global BI stays in the central warehouse.
        </p>
      </div>

      {query.notice ? <div className="mt-6 rounded-lg border bg-secondary p-3 text-sm">{query.notice}</div> : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Purchases", purchases.length],
          ["Spent", `₱${purchaseTotal.toFixed(2)}`],
          ["Active plans", activeSubscriptions],
          ["Completed", completedItems],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">{value}</CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Subscription plans</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              ["basic", "₱99 / month", "Catalog access"],
              ["reader", "₱149 / month", "Catalog + reading"],
              ["premium", "₱199 / month", "Catalog + reading + early access"],
            ].map(([tier, price, description]) => (
              <div key={tier} className="flex items-center justify-between gap-4 rounded-lg border p-4">
                <div><p className="font-medium capitalize">{tier}</p><p className="text-sm text-muted-foreground">{description}</p></div>
                <form action={subscribeUser}>
                  <input type="hidden" name="tier" value={tier} />
                  <button className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground" type="submit">{price}</button>
                </form>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Reading activity</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {progress.length === 0 ? (
              <p className="text-sm text-muted-foreground">Open an item and save progress to see it here.</p>
            ) : (
              progress.slice(0, 6).map((item) => (
                <Link key={item.reading_progress_id} href={`/items/${item.item_id}`} className="flex items-center justify-between gap-4 rounded-lg border p-4 hover:bg-secondary">
                  <span className="text-sm">{itemLabels.get(item.item_id) ?? item.item_id.slice(0, 8)}</span>
                  <span className="font-medium">{Number(item.progress_pct ?? 0)}%</span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Purchase history</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {purchases.length === 0 ? (
              <p className="text-sm text-muted-foreground">Simulate a purchase from any item page.</p>
            ) : (
              purchases.slice(0, 5).map((purchase) => (
                <div key={purchase.purchase_id} className="flex justify-between gap-4 border-b py-3 text-sm last:border-0">
                  <Link href={`/items/${purchase.item_id}`} className="hover:underline">
                    {itemLabels.get(purchase.item_id) ?? purchase.item_id.slice(0, 8)}
                  </Link>
                  <span className="font-medium">₱{Number(purchase.price_paid ?? 0).toFixed(2)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Preorders</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {preorders.length === 0 ? (
              <p className="text-sm text-muted-foreground">Open a physical item and simulate a preorder.</p>
            ) : (
              preorders.slice(0, 5).map((preorder) => (
                <div key={preorder.preorder_id} className="flex justify-between gap-4 border-b py-3 text-sm last:border-0">
                  <Link href={`/items/${preorder.item_id}`} className="hover:underline">
                    {itemLabels.get(preorder.item_id) ?? preorder.item_id.slice(0, 8)}
                  </Link>
                  <span className="font-medium">{preorder.status} · ₱{Number(preorder.price_at_preorder ?? 0).toFixed(2)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export default function ProtectedPage({ searchParams }: PageProps) {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <Suspense
        fallback={
          <section className="mx-auto max-w-6xl px-6 py-10">
            <div className="h-10 w-80 animate-pulse rounded bg-secondary" />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className="h-28 animate-pulse rounded-lg border" />
              ))}
            </div>
          </section>
        }
      >
        <ProtectedContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
