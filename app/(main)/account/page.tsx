import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { cancelSubscriptionAction } from "@/app/actions/purchase";

export const metadata = { title: "My Account — Loxada M&LN" };
// Opt out of prerendering — this page requires auth session at request time
export const instant = false;

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const [
    { data: purchases },
    { data: preorders },
    { data: subscriptions },
  ] = await Promise.all([
    supabase
      .from("purchases")
      .select("*, items(item_type, chapter_or_volume_number, titles(title_name))")
      .eq("user_id", user.id)
      .order("purchased_at", { ascending: false }),
    supabase
      .from("preorders")
      .select("*, items(item_type, chapter_or_volume_number, titles(title_name))")
      .eq("user_id", user.id)
      .order("preordered_at", { ascending: false }),
    supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false }),
  ]);

  const activeSub = subscriptions?.find((s) => !s.ended_at) ?? null;

  return (
    <div className="max-w-2xl space-y-10">
      <h1 className="text-2xl font-bold">My Account</h1>
      <p className="text-sm text-foreground/60 -mt-6">{user.email}</p>

      {/* ── Subscription ── */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Subscription</h2>
        {activeSub ? (
          <div className="border border-foreground/10 rounded p-4 space-y-2">
            <p className="font-medium capitalize">
              {activeSub.tier ?? "Standard"} plan — Active
            </p>
            <p className="text-sm text-foreground/60">
              Started:{" "}
              {activeSub.started_at
                ? new Date(activeSub.started_at).toLocaleDateString()
                : "—"}
            </p>
            <form action={async () => { await cancelSubscriptionAction(); }}>
              <button
                type="submit"
                className="text-sm text-red-600 hover:underline"
              >
                Cancel subscription
              </button>
            </form>
          </div>
        ) : (
          <div className="text-sm text-foreground/60">
            No active subscription.{" "}
            <Link href="/subscribe" className="text-blue-600 hover:underline">
              Subscribe now
            </Link>
          </div>
        )}
      </section>

      {/* ── Purchases ── */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Purchases</h2>
        {!purchases?.length ? (
          <p className="text-sm text-foreground/60">No purchases yet.</p>
        ) : (
          <div className="border border-foreground/10 rounded divide-y divide-foreground/10">
            {purchases.map((p) => {
              const item = p.items as {
                item_type: string;
                chapter_or_volume_number: number;
                titles: { title_name: string } | null;
              } | null;
              const label = item?.item_type === "manga" ? "Chapter" : "Volume";
              return (
                <div key={p.purchase_id} className="flex justify-between items-center px-4 py-3 text-sm">
                  <span>
                    {item?.titles?.title_name ?? "—"} — {label}{" "}
                    {item?.chapter_or_volume_number ?? ""}
                  </span>
                  <span className="text-foreground/60">
                    ₱{Number(p.price_paid).toFixed(2)} &middot;{" "}
                    {p.purchased_at
                      ? new Date(p.purchased_at).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Pre-orders ── */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Pre-orders</h2>
        {!preorders?.length ? (
          <p className="text-sm text-foreground/60">No pre-orders.</p>
        ) : (
          <div className="border border-foreground/10 rounded divide-y divide-foreground/10">
            {preorders.map((pr) => {
              const item = pr.items as {
                item_type: string;
                chapter_or_volume_number: number;
                titles: { title_name: string } | null;
              } | null;
              const label = item?.item_type === "manga" ? "Chapter" : "Volume";
              return (
                <div key={pr.preorder_id} className="flex justify-between items-center px-4 py-3 text-sm">
                  <span>
                    {item?.titles?.title_name ?? "—"} — {label}{" "}
                    {item?.chapter_or_volume_number ?? ""}
                  </span>
                  <span className={`capitalize font-medium text-xs px-2 py-0.5 rounded ${
                    pr.status === "pending"
                      ? "bg-amber-100 text-amber-700"
                      : pr.status === "fulfilled"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                  }`}>
                    {pr.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
