"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isStaff } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

// ─── Staff guard ──────────────────────────────────────────────────────────────

async function requireStaff() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");
  if (!isStaff(user)) redirect("/");
  return { supabase, user };
}

// ─── Add title ────────────────────────────────────────────────────────────────

export async function addTitleAction(formData: FormData) {
  const { supabase } = await requireStaff();

  const title_name = formData.get("title_name") as string;
  const origin_type = formData.get("origin_type") as
    | "licensed"
    | "original"
    | null;

  if (!title_name?.trim()) return { error: "Title name is required." };

  // Generate a slug-style ID: lowercase, spaces→underscores, + short uuid suffix
  const slug = title_name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .slice(0, 40);
  const title_id = `${slug}_${uuidv4().split("-")[0]}`;

  const { error } = await supabase.from("titles").insert({
    title_id,
    title_name: title_name.trim(),
    origin_type: origin_type || null,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error("addTitleAction error:", error);
    return { error: "Failed to add title. " + error.message };
  }

  return { success: true, title_id };
}

// ─── Add arc ──────────────────────────────────────────────────────────────────

export async function addArcAction(formData: FormData) {
  const { supabase } = await requireStaff();

  const title_id = formData.get("title_id") as string;
  const arc_name = formData.get("arc_name") as string;
  const sequence_order = parseInt(
    formData.get("sequence_order") as string,
    10,
  );

  if (!title_id || !arc_name?.trim())
    return { error: "Title and arc name are required." };

  const arc_id = `arc_${uuidv4().split("-")[0]}`;

  const { error } = await supabase.from("arcs").insert({
    arc_id,
    title_id,
    arc_name: arc_name.trim(),
    sequence_order: isNaN(sequence_order) ? null : sequence_order,
  });

  if (error) {
    console.error("addArcAction error:", error);
    return { error: "Failed to add arc. " + error.message };
  }

  return { success: true, arc_id };
}

// ─── Add item ─────────────────────────────────────────────────────────────────

export async function addItemAction(formData: FormData) {
  const { supabase } = await requireStaff();

  const title_id = formData.get("title_id") as string;
  const arc_id = (formData.get("arc_id") as string) || null;
  const item_type = formData.get("item_type") as "manga" | "light_novel";
  const chapter_or_volume_number = parseInt(
    formData.get("chapter_or_volume_number") as string,
    10,
  );
  const format = formData.get("format") as "digital" | "physical";
  const price = parseFloat(formData.get("price") as string);
  const is_free_preview = formData.get("is_free_preview") === "true";
  const release_date = (formData.get("release_date") as string) || null;
  const stock_quantity_raw = formData.get("stock_quantity") as string;
  const stock_quantity =
    format === "physical" && stock_quantity_raw
      ? parseInt(stock_quantity_raw, 10)
      : null;

  if (!title_id || !item_type || !format)
    return { error: "Title, item type, and format are required." };

  const item_id = uuidv4();

  const { error } = await supabase.from("items").insert({
    item_id,
    title_id,
    arc_id,
    item_type,
    chapter_or_volume_number: isNaN(chapter_or_volume_number)
      ? null
      : chapter_or_volume_number,
    format,
    price: isNaN(price) ? null : price,
    is_free_preview,
    release_date,
    stock_quantity,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error("addItemAction error:", error);
    return { error: "Failed to add item. " + error.message };
  }

  return { success: true, item_id };
}

// ─── Update item ──────────────────────────────────────────────────────────────

export async function updateItemAction(
  itemId: string,
  formData: FormData,
) {
  const { supabase } = await requireStaff();

  const is_free_preview = formData.get("is_free_preview") === "true";
  const stock_quantity_raw = formData.get("stock_quantity") as string;
  const stock_quantity = stock_quantity_raw
    ? parseInt(stock_quantity_raw, 10)
    : null;

  const { error } = await supabase
    .from("items")
    .update({
      is_free_preview,
      stock_quantity: isNaN(stock_quantity as number) ? null : stock_quantity,
    })
    .eq("item_id", itemId);

  if (error) {
    console.error("updateItemAction error:", error);
    return { error: "Failed to update item. " + error.message };
  }

  return { success: true };
}
