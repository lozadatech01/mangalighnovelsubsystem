"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (!userId) {
    redirect("/auth/login");
  }

  return { supabase, userId };
}

export async function purchaseItem(formData: FormData) {
  const { supabase, userId } = await requireUser();
  const itemId = String(formData.get("item_id") ?? "");

  if (!itemId) {
    redirect("/?error=Missing item");
  }

  const { data: item } = await supabase
    .from("items")
    .select("title_id,price")
    .eq("item_id", itemId)
    .single();

  if (!item) {
    redirect("/?error=Item not found");
  }

  const { error } = await supabase.from("purchases").insert({
    user_id: userId,
    item_id: itemId,
    purchase_type: "single_purchase",
    price_paid: item.price ?? 0,
  });

  if (error) {
    redirect(`/items/${itemId}?error=Purchase failed`);
  }

  revalidatePath("/protected");
  redirect("/protected?notice=Prototype purchase recorded");
}

export async function preorderItem(formData: FormData) {
  const { supabase, userId } = await requireUser();
  const itemId = String(formData.get("item_id") ?? "");

  if (!itemId) {
    redirect("/?error=Missing item");
  }

  const { data: item } = await supabase
    .from("items")
    .select("price,format")
    .eq("item_id", itemId)
    .single();

  if (!item || item.format !== "physical") {
    redirect(`/items/${itemId}?error=This item is not a physical preorder`);
  }

  const { error } = await supabase.from("preorders").insert({
    user_id: userId,
    item_id: itemId,
    price_at_preorder: item.price ?? 0,
  });

  if (error) {
    redirect(`/items/${itemId}?error=Preorder failed`);
  }

  revalidatePath("/protected");
  redirect("/protected?notice=Prototype preorder recorded");
}

export async function subscribeUser(formData: FormData) {
  const { supabase, userId } = await requireUser();
  const tier = String(formData.get("tier") ?? "");

  const prices: Record<string, number> = {
    basic: 99,
    reader: 149,
    premium: 199,
  };

  const price = prices[tier];

  if (!price) {
    redirect("/protected?notice=Choose a valid plan");
  }

  const { error } = await supabase.from("subscriptions").insert({
    user_id: userId,
    tier,
    price,
  });

  if (error) {
    redirect("/protected?notice=Subscription failed");
  }

  revalidatePath("/protected");
  redirect(`/protected?notice=Prototype ${tier} subscription recorded`);
}

export async function saveReadingProgress(formData: FormData) {
  const { supabase, userId } = await requireUser();
  const itemId = String(formData.get("item_id") ?? "");
  const progress = Number(formData.get("progress_pct") ?? 0);

  if (!itemId || !Number.isFinite(progress) || progress < 0 || progress > 100) {
    redirect(`/items/${itemId}?error=Invalid progress`);
  }

  const now = new Date().toISOString();
  const { data: existing } = await supabase
    .from("reading_progress")
    .select("reading_progress_id")
    .eq("user_id", userId)
    .eq("item_id", itemId)
    .maybeSingle();

  const payload = {
    progress_pct: progress,
    last_accessed_at: now,
    completed_at: progress >= 100 ? now : null,
  };

  const { error } = existing
    ? await supabase
        .from("reading_progress")
        .update(payload)
        .eq("reading_progress_id", existing.reading_progress_id)
    : await supabase.from("reading_progress").insert({
        ...payload,
        user_id: userId,
        item_id: itemId,
        first_accessed_at: now,
        access_mode: "purchase",
      });

  if (error) {
    redirect(`/items/${itemId}?error=Progress not saved`);
  }

  revalidatePath(`/items/${itemId}`);
  revalidatePath("/protected");
  redirect(`/items/${itemId}?notice=Progress saved at ${progress}%`);
}
