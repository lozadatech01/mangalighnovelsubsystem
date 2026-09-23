import { redirect, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getImageUrl } from "@/lib/utils";

// Opt out of prerendering — access-check reads cookies at request time
export const instant = false;

interface Params {
  params: Promise<{ itemId: string }>;
}

export default async function ReaderPage({ params }: Params) {
  const { itemId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: item } = await supabase
    .from("items")
    .select("*, titles(title_name)")
    .eq("item_id", itemId)
    .single();

  if (!item) notFound();

  // ─── Access check ─────────────────────────────────────────────────────────
  // Free preview → anyone can read (no auth required)
  if (!item.is_free_preview) {
    // Must be logged in for non-preview items
    if (!user) redirect(`/auth/login?next=/reader/${itemId}`);

    // Check: has active subscription?
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("subscription_id")
      .eq("user_id", user.id)
      .is("ended_at", null)
      .maybeSingle();

    // Check: has purchased this item?
    const { data: purchase } = await supabase
      .from("purchases")
      .select("purchase_id")
      .eq("user_id", user.id)
      .eq("item_id", itemId)
      .maybeSingle();

    if (!subscription && !purchase) {
      // No access — redirect to item page
      const titleId = item.title_id;
      redirect(`/titles/${titleId}/items/${itemId}`);
    }
  }

  const coverUrl = getImageUrl(item.title_id, itemId);
  const titleObj = (item as { titles?: { title_name: string } | null }).titles;
  const label = item.item_type === "manga" ? "Chapter" : "Volume";

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href={`/titles/${item.title_id}/items/${itemId}`}
        className="text-sm text-blue-600 hover:underline mb-6 block"
      >
        ← Back to item details
      </Link>

      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase text-foreground/50 tracking-wide">
            {titleObj?.title_name}
          </p>
          <h1 className="text-xl font-bold">
            {label} {item.chapter_or_volume_number}
          </h1>
        </div>
        {item.is_free_preview && (
          <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
            Free Preview
          </span>
        )}
      </div>

      {/* Cover image */}
      <div className="w-full aspect-[3/4] max-w-sm mx-auto relative rounded overflow-hidden border border-foreground/10 mb-6">
        <Image src={coverUrl} alt="Cover" fill className="object-cover" />
      </div>

      {/* Placeholder reader content */}
      <div className="border border-foreground/10 rounded p-8 text-center text-foreground/50 space-y-2">
        <p className="text-lg font-medium">📖 Reader Placeholder</p>
        <p className="text-sm">
          Chapter / volume content would render here. Connect your content
          delivery pipeline (e.g., page images from{" "}
          <code className="bg-foreground/10 px-1 rounded">manga-ln-assets</code>{" "}
          bucket) to display actual pages.
        </p>
      </div>
    </div>
  );
}
