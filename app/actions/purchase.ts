"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { v4 as uuidv4 } from "uuid";

// ─── Single-item purchase ─────────────────────────────────────────────────────

/**
 * Inserts a row into `purchases` with purchase_type='single_purchase' and
 * price_paid snapshotted from items.price at time of purchase.
 */
export async function purchaseItemAction(itemId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Snapshot the price
  const { data: item, error: itemErr } = await supabase
    .from("items")
    .select("price")
    .eq("item_id", itemId)
    .single();

  if (itemErr || !item) {
    return { error: "Item not found." };
  }

  const { error } = await supabase.from("purchases").insert({
    purchase_id: uuidv4(),
    user_id: user.id,
    item_id: itemId,
    purchase_type: "single_purchase",
    price_paid: item.price ?? 0,
    purchased_at: new Date().toISOString(),
  });

  if (error) {
    console.error("purchaseItemAction error:", error);
    return { error: "Purchase failed. Please try again." };
  }

  return { success: true };
}

// ─── Pre-order ────────────────────────────────────────────────────────────────

/**
 * Inserts a row into `preorders` with status='pending'.
 * Intended for physical items that are not yet in stock or not yet released.
 */
export async function preorderItemAction(itemId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { error } = await supabase.from("preorders").insert({
    preorder_id: uuidv4(),
    user_id: user.id,
    item_id: itemId,
    status: "pending",
    preordered_at: new Date().toISOString(),
  });

  if (error) {
    console.error("preorderItemAction error:", error);
    return { error: "Pre-order failed. Please try again." };
  }

  return { success: true };
}

// ─── Subscription ─────────────────────────────────────────────────────────────

/**
 * Inserts a row into `subscriptions`.
 * Payment is simulated — integrate a payment gateway before going live.
 */
export async function subscribeAction(tier: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Check if user already has an active subscription
  const { data: existing } = await supabase
    .from("subscriptions")
    .select("subscription_id")
    .eq("user_id", user.id)
    .is("ended_at", null)
    .maybeSingle();

  if (existing) {
    return { error: "You already have an active subscription." };
  }

  const { error } = await supabase.from("subscriptions").insert({
    subscription_id: uuidv4(),
    user_id: user.id,
    tier,
    started_at: new Date().toISOString(),
    ended_at: null,
  });

  if (error) {
    console.error("subscribeAction error:", error);
    return { error: "Subscription failed. Please try again." };
  }

  return { success: true };
}

// ─── Cancel subscription ──────────────────────────────────────────────────────

/**
 * Sets ended_at on the user's active subscription (soft cancel).
 */
export async function cancelSubscriptionAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { error } = await supabase
    .from("subscriptions")
    .update({ ended_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("ended_at", null);

  if (error) {
    console.error("cancelSubscriptionAction error:", error);
    return { error: "Cancel failed. Please try again." };
  }

  return { success: true };
}
