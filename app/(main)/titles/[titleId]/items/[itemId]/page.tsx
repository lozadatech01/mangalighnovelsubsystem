import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getImageUrl } from "@/lib/utils";
import { PurchaseButton } from "@/components/manga/purchase-button";
import { PreorderButton } from "@/components/manga/preorder-button";

// Opt out of prerendering — page checks auth + purchase state at request time
export const instant = false;

interface Params {
  params: Promise<{ titleId: string; itemId: string }>;
}

export default async function ItemDetailPage({ params }: Params) {
  const { titleId, itemId } = await params;
  const supabase = await createClient();

  const [
    { data: item },
    { data: title },
    {
      data: { user },
    },
  ] = await Promise.all([
    supabase.from("items").select("*, arcs(arc_name)").eq("item_id", itemId).single(),
    supabase.from("titles").select("title_name").eq("title_id", titleId).single(),
    supabase.auth.getUser(),
  ]);

  if (!item) notFound();

  // Check if the user already purchased this item
  let alreadyPurchased = false;
  let hasActiveSubscription = false;
  let alreadyPreordered = false;

  if (user) {
    const [{ data: purchase }, { data: subscription }, { data: preorder }] =
      await Promise.all([
        supabase
          .from("purchases")
          .select("purchase_id")
          .eq("user_id", user.id)
          .eq("item_id", itemId)
          .maybeSingle(),
        supabase
          .from("subscriptions")
          .select("subscription_id")
          .eq("user_id", user.id)
          .is("ended_at", null)
          .maybeSingle(),
        supabase
          .from("preorders")
          .select("preorder_id")
          .eq("user_id", user.id)
          .eq("item_id", itemId)
          .maybeSingle(),
      ]);

    alreadyPurchased = !!purchase;
    hasActiveSubscription = !!subscription;
    alreadyPreordered = !!preorder;
  }

  const coverUrl = getImageUrl(titleId, itemId);
  const isReleased =
    !item.release_date || new Date(item.release_date) <= new Date();
  const isInStock =
    item.format === "digital" ||
    (item.stock_quantity !== null && item.stock_quantity > 0);

  const canRead =
    item.is_free_preview || alreadyPurchased || hasActiveSubscription;
  const canPreorder =
    item.format === "physical" && (!isReleased || !isInStock) && !alreadyPreordered;
  const canPurchase =
    !canRead && !canPreorder && isReleased && (isInStock || item.format === "digital");

  const label =
    item.item_type === "manga" ? "Chapter" : "Volume";

  return (
    <div className="max-w-2xl">
      <Link
        href={`/titles/${titleId}`}
        className="text-sm text-blue-600 hover:underline mb-6 block"
      >
        ← {title?.title_name ?? "Back to Title"}
      </Link>

      <div className="flex gap-6">
        {/* Cover image */}
        <div className="shrink-0 w-36 h-52 relative rounded overflow-hidden border border-foreground/10">
          <Image
            src={coverUrl}
            alt="Cover"
            fill
            className="object-cover"
          />
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs uppercase text-foreground/50 font-medium tracking-wide">
              {item.item_type?.replace("_", " ")}
            </p>
            <h1 className="text-2xl font-bold">
              {label} {item.chapter_or_volume_number}
            </h1>
            {(item as { arcs?: { arc_name: string } | null }).arcs && (
              <p className="text-sm text-foreground/60">
                Arc:{" "}
                {(item as { arcs?: { arc_name: string } | null }).arcs!.arc_name}
              </p>
            )}
          </div>

          <div className="text-sm text-foreground/70 space-y-1">
            <p>
              <span className="font-medium">Format:</span>{" "}
              <span className="capitalize">{item.format}</span>
            </p>
            <p>
              <span className="font-medium">Price:</span>{" "}
              {item.price != null ? `₱${Number(item.price).toFixed(2)}` : "—"}
            </p>
            {item.release_date && (
              <p>
                <span className="font-medium">Release:</span>{" "}
                {new Date(item.release_date).toLocaleDateString()}
              </p>
            )}
            {item.format === "physical" && item.stock_quantity !== null && (
              <p>
                <span className="font-medium">Stock:</span>{" "}
                {item.stock_quantity > 0
                  ? `${item.stock_quantity} available`
                  : "Out of stock"}
              </p>
            )}
            {item.is_free_preview && (
              <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded">
                Free Preview
              </span>
            )}
          </div>

          {/* CTA area */}
          <div className="mt-2 flex flex-col gap-2">
            {!user && !item.is_free_preview && (
              <Link
                href="/auth/login"
                className="text-sm text-blue-600 hover:underline"
              >
                Log in to purchase or subscribe
              </Link>
            )}

            {canRead && (
              <Link
                href={`/reader/${itemId}`}
                className="inline-block bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded hover:bg-blue-700 text-center"
              >
                {item.is_free_preview && !alreadyPurchased && !hasActiveSubscription
                  ? "Read Free Preview"
                  : "Read"}
              </Link>
            )}

            {canPurchase && user && (
              <PurchaseButton
                itemId={itemId}
                price={item.price ?? 0}
              />
            )}

            {canPreorder && user && (
              <PreorderButton itemId={itemId} />
            )}

            {alreadyPreordered && (
              <p className="text-sm text-amber-600 font-medium">
                ✓ You have a pending pre-order for this item.
              </p>
            )}

            {!hasActiveSubscription && !canRead && user && (
              <Link
                href="/subscribe"
                className="text-sm text-foreground/60 hover:underline"
              >
                Or subscribe to unlock subscription-access items
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
