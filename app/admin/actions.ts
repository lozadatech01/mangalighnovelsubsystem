"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/admin";

const titleStatuses = new Set(["draft", "published", "archived"]);
const itemStatuses = new Set(["draft", "published", "archived"]);
const originTypes = new Set(["original", "licensed"]);
const itemTypes = new Set(["manga", "light_novel"]);
const formats = new Set(["digital", "physical"]);

function value(formData: FormData, key: string) {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw.trim() : "";
}

function optionalNumber(formData: FormData, key: string) {
  const raw = value(formData, key);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function optionalInteger(formData: FormData, key: string) {
  const raw = value(formData, key);
  if (!raw) return null;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function checked(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

function success(path: string, message: string): never {
  redirect(`${path}?notice=${encodeURIComponent(message)}`);
}

function validateCover(file: FormDataEntryValue | null, path: string): file is File {
  if (!(file instanceof File) || file.size === 0) return false;
  if (!file.type.startsWith("image/")) fail(path, "Cover must be an image.");
  if (file.size > 900_000) fail(path, "Cover image must be smaller than 900 KB.");
  return true;
}

function coverExtension(file: File) {
  const extension = file.name.includes(".") ? file.name.split(".").pop()?.toLowerCase() : "jpg";
  return extension || "jpg";
}

function revalidateCatalog(titleId?: string) {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/titles");
  if (titleId) {
    revalidatePath(`/titles/${titleId}`);
    revalidatePath(`/admin/titles/${titleId}`);
  }
}

export async function createTitle(formData: FormData) {
  const { supabase } = await requireAdmin();
  const titleId = value(formData, "title_id");
  const titleName = value(formData, "title_name");
  const originType = value(formData, "origin_type");
  const description = value(formData, "description");
  const cover = formData.get("cover");
  const path = "/admin/titles/new";

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(titleId)) {
    fail(path, "Title ID must be a lowercase kebab-case slug.");
  }
  if (!titleName) fail(path, "Title name is required.");
  if (titleName.length > 200) fail(path, "Title name must be 200 characters or fewer.");
  if (description.length > 5000) fail(path, "Description must be 5,000 characters or fewer.");
  if (!originTypes.has(originType)) fail(path, "Choose a valid origin type.");

  if (cover instanceof File && cover.size > 0) {
    validateCover(cover, path);
  }

  const { error } = await supabase.from("titles").insert({
    title_id: titleId,
    title_name: titleName,
    origin_type: originType,
    description: description || null,
    status: "draft",
  });

  if (error) {
    fail(path, error.code === "23505" ? "That title ID already exists." : "Unable to create title.");
  }

  if (cover instanceof File && cover.size > 0) {
    const objectPath = `titles/${titleId}/cover-${crypto.randomUUID()}.${coverExtension(cover)}`;
    const { error: uploadError } = await supabase.storage
      .from("manga-ln-assets")
      .upload(objectPath, cover, {
        contentType: cover.type,
        upsert: false,
        cacheControl: "3600",
      });

    if (uploadError) {
      await supabase.from("titles").delete().eq("title_id", titleId);
      fail(path, "Title was not created because the cover could not be uploaded.");
    }

    const { error: coverLinkError } = await supabase
      .from("titles")
      .update({
        cover_image_path: objectPath,
        updated_at: new Date().toISOString(),
      })
      .eq("title_id", titleId);

    if (coverLinkError) {
      await supabase.storage.from("manga-ln-assets").remove([objectPath]);
      await supabase.from("titles").delete().eq("title_id", titleId);
      fail(path, "Title was not created because the cover could not be linked.");
    }
  }

  revalidateCatalog();
  redirect(`/admin/titles/${encodeURIComponent(titleId)}?notice=${encodeURIComponent("Title created in draft.")}`);
}

export async function updateTitle(formData: FormData) {
  const { supabase } = await requireAdmin();
  const titleId = value(formData, "title_id");
  const titleName = value(formData, "title_name");
  const originType = value(formData, "origin_type");
  const description = value(formData, "description");
  const status = value(formData, "status");

  const path = `/admin/titles/${encodeURIComponent(titleId)}`;

  if (!titleId || !titleName) fail(path, "Title ID and title name are required.");
  if (titleName.length > 200) fail(path, "Title name must be 200 characters or fewer.");
  if (description.length > 5000) fail(path, "Description must be 5,000 characters or fewer.");
  if (!originTypes.has(originType)) fail(path, "Choose a valid origin type.");
  if (!titleStatuses.has(status)) fail(path, "Choose a valid status.");

  const { data: existing } = await supabase
    .from("titles")
    .select("status,published_at")
    .eq("title_id", titleId)
    .maybeSingle();

  if (!existing) fail("/admin/titles", "Title not found.");

  if (status === "published") {
    const { count: publishedItemCount } = await supabase
      .from("items")
      .select("item_id", { count: "exact", head: true })
      .eq("title_id", titleId)
      .eq("status", "published");

    if ((publishedItemCount ?? 0) === 0) {
      fail(path, "Publish at least one chapter or volume before publishing the title.");
    }
  }

  const nextPublishedAt =
    status === "published"
      ? existing.published_at ?? new Date().toISOString()
      : status === "draft"
        ? null
        : existing.published_at;

  const { error } = await supabase
    .from("titles")
    .update({
      title_name: titleName,
      origin_type: originType,
      description: description || null,
      status,
      published_at: nextPublishedAt,
      updated_at: new Date().toISOString(),
    })
    .eq("title_id", titleId);

  if (error) fail(path, "Unable to update title.");

  revalidateCatalog(titleId);
  success(path, "Title saved.");
}

export async function archiveTitle(formData: FormData) {
  const { supabase } = await requireAdmin();
  const titleId = value(formData, "title_id");
  if (!titleId) fail("/admin/titles", "Missing title ID.");

  const { error } = await supabase
    .from("titles")
    .update({ status: "archived", updated_at: new Date().toISOString() })
    .eq("title_id", titleId);

  if (error) fail(`/admin/titles/${encodeURIComponent(titleId)}`, "Unable to archive title.");

  revalidateCatalog(titleId);
  success(`/admin/titles/${encodeURIComponent(titleId)}`, "Title archived.");
}

export async function deleteTitle(formData: FormData) {
  const { supabase } = await requireAdmin();
  const titleId = value(formData, "title_id");
  const path = `/admin/titles/${encodeURIComponent(titleId)}`;

  if (!titleId) fail("/admin/titles", "Missing title ID.");

  const [{ count: arcCount }, { count: itemCount }] = await Promise.all([
    supabase.from("arcs").select("arc_id", { count: "exact", head: true }).eq("title_id", titleId),
    supabase.from("items").select("item_id", { count: "exact", head: true }).eq("title_id", titleId),
  ]);

  if ((arcCount ?? 0) > 0 || (itemCount ?? 0) > 0) {
    fail(path, "Cannot delete a title that still has arcs or items. Archive it instead.");
  }

  const { error } = await supabase.from("titles").delete().eq("title_id", titleId);
  if (error) fail(path, "Unable to delete title.");

  revalidateCatalog();
  redirect("/admin/titles?notice=Title deleted.");
}

export async function createArc(formData: FormData) {
  const { supabase } = await requireAdmin();
  const titleId = value(formData, "title_id");
  const arcId = value(formData, "arc_id");
  const arcName = value(formData, "arc_name");
  const sequenceOrder = optionalInteger(formData, "sequence_order");
  const path = `/admin/titles/${encodeURIComponent(titleId)}`;

  if (!titleId || !arcId || !arcName) fail(path, "Arc ID and arc name are required.");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(arcId)) {
    fail(path, "Arc ID must be a lowercase kebab-case slug.");
  }
  if (sequenceOrder !== null && sequenceOrder < 0) fail(path, "Sequence order cannot be negative.");

  const { data: title } = await supabase
    .from("titles")
    .select("title_id")
    .eq("title_id", titleId)
    .maybeSingle();
  if (!title) fail("/admin/titles", "Title not found.");

  const { error } = await supabase.from("arcs").insert({
    arc_id: arcId,
    title_id: titleId,
    arc_name: arcName,
    sequence_order: sequenceOrder,
  });

  if (error) {
    fail(path, error.code === "23505" ? "That arc ID already exists." : "Unable to create arc.");
  }

  revalidateCatalog(titleId);
  success(path, "Arc created.");
}

export async function updateArc(formData: FormData) {
  const { supabase } = await requireAdmin();
  const titleId = value(formData, "title_id");
  const arcId = value(formData, "arc_id");
  const arcName = value(formData, "arc_name");
  const sequenceOrder = optionalInteger(formData, "sequence_order");
  const path = `/admin/titles/${encodeURIComponent(titleId)}`;

  if (!titleId || !arcId || !arcName) fail(path, "Arc ID, title ID, and arc name are required.");
  if (sequenceOrder !== null && sequenceOrder < 0) fail(path, "Sequence order cannot be negative.");

  const { error } = await supabase
    .from("arcs")
    .update({
      arc_name: arcName,
      sequence_order: sequenceOrder,
      updated_at: new Date().toISOString(),
    })
    .eq("arc_id", arcId)
    .eq("title_id", titleId);

  if (error) fail(path, "Unable to update arc.");

  revalidateCatalog(titleId);
  success(path, "Arc saved.");
}

export async function deleteArc(formData: FormData) {
  const { supabase } = await requireAdmin();
  const titleId = value(formData, "title_id");
  const arcId = value(formData, "arc_id");
  const path = `/admin/titles/${encodeURIComponent(titleId)}`;

  const { count } = await supabase
    .from("items")
    .select("item_id", { count: "exact", head: true })
    .eq("arc_id", arcId);

  if ((count ?? 0) > 0) {
    fail(path, "Cannot delete an arc that still contains items. Move the items first.");
  }

  const { error } = await supabase
    .from("arcs")
    .delete()
    .eq("arc_id", arcId)
    .eq("title_id", titleId);

  if (error) fail(path, "Unable to delete arc.");

  revalidateCatalog(titleId);
  success(path, "Arc deleted.");
}

export async function createItem(formData: FormData) {
  const { supabase } = await requireAdmin();
  const titleId = value(formData, "title_id");
  const itemType = value(formData, "item_type");
  const format = value(formData, "format");
  const arcId = value(formData, "arc_id");
  const chapterOrVolumeNumber = optionalInteger(formData, "chapter_or_volume_number");
  const price = optionalNumber(formData, "price");
  const releaseDate = value(formData, "release_date");
  const stockQuantity = optionalInteger(formData, "stock_quantity");
  const isFreePreview = checked(formData, "is_free_preview");
  const path = `/admin/titles/${encodeURIComponent(titleId)}`;

  if (!titleId) fail("/admin/titles", "Missing title ID.");
  if (!itemTypes.has(itemType)) fail(path, "Choose a valid item type.");
  if (!formats.has(format)) fail(path, "Choose a valid format.");
  if (chapterOrVolumeNumber !== null && chapterOrVolumeNumber < 1) {
    fail(path, "Chapter/volume number must be at least 1.");
  }
  if (price !== null && price < 0) fail(path, "Price cannot be negative.");
  if (format === "physical" && stockQuantity !== null && stockQuantity < 0) {
    fail(path, "Stock cannot be negative.");
  }

  const { data: title } = await supabase.from("titles").select("title_id").eq("title_id", titleId).maybeSingle();
  if (!title) fail("/admin/titles", "Title not found.");

  if (arcId) {
    const { data: arc } = await supabase
      .from("arcs")
      .select("arc_id")
      .eq("arc_id", arcId)
      .eq("title_id", titleId)
      .maybeSingle();
    if (!arc) fail(path, "Selected arc does not belong to this title.");
  }

  const { error } = await supabase.from("items").insert({
    title_id: titleId,
    arc_id: arcId || null,
    item_type: itemType,
    chapter_or_volume_number: chapterOrVolumeNumber,
    format,
    price,
    is_free_preview: isFreePreview,
    release_date: releaseDate || null,
    stock_quantity: format === "physical" ? stockQuantity : null,
    status: "draft",
  });

  if (error) fail(path, "Unable to create item.");

  revalidateCatalog(titleId);
  success(path, "Item created in draft.");
}

export async function updateItem(formData: FormData) {
  const { supabase } = await requireAdmin();
  const itemId = value(formData, "item_id");
  const titleId = value(formData, "title_id");
  const itemType = value(formData, "item_type");
  const format = value(formData, "format");
  const arcId = value(formData, "arc_id");
  const chapterOrVolumeNumber = optionalInteger(formData, "chapter_or_volume_number");
  const price = optionalNumber(formData, "price");
  const releaseDate = value(formData, "release_date");
  const stockQuantity = optionalInteger(formData, "stock_quantity");
  const isFreePreview = checked(formData, "is_free_preview");
  const status = value(formData, "status");
  const path = `/admin/items/${encodeURIComponent(itemId)}`;

  if (!itemId || !titleId) fail("/admin/titles", "Missing item or title ID.");
  if (!itemTypes.has(itemType)) fail(path, "Choose a valid item type.");
  if (!formats.has(format)) fail(path, "Choose a valid format.");
  if (!itemStatuses.has(status)) fail(path, "Choose a valid status.");
  if (chapterOrVolumeNumber !== null && chapterOrVolumeNumber < 1) fail(path, "Chapter/volume number must be at least 1.");
  if (price !== null && price < 0) fail(path, "Price cannot be negative.");
  if (format === "physical" && stockQuantity !== null && stockQuantity < 0) fail(path, "Stock cannot be negative.");

  if (arcId) {
    const { data: arc } = await supabase
      .from("arcs")
      .select("arc_id")
      .eq("arc_id", arcId)
      .eq("title_id", titleId)
      .maybeSingle();
    if (!arc) fail(path, "Selected arc does not belong to this title.");
  }

  const { data: existing } = await supabase
    .from("items")
    .select("published_at")
    .eq("item_id", itemId)
    .eq("title_id", titleId)
    .maybeSingle();

  if (!existing) fail("/admin/titles", "Item not found.");

  const nextPublishedAt =
    status === "published"
      ? existing.published_at ?? new Date().toISOString()
      : status === "draft"
        ? null
        : existing.published_at;

  const { error } = await supabase
    .from("items")
    .update({
      arc_id: arcId || null,
      item_type: itemType,
      chapter_or_volume_number: chapterOrVolumeNumber,
      format,
      price,
      is_free_preview: isFreePreview,
      release_date: releaseDate || null,
      stock_quantity: format === "physical" ? stockQuantity : null,
      status,
      published_at: nextPublishedAt,
      updated_at: new Date().toISOString(),
    })
    .eq("item_id", itemId)
    .eq("title_id", titleId);

  if (error) fail(path, "Unable to update item.");

  revalidateCatalog(titleId);
  success(path, "Item saved.");
}

export async function deleteItem(formData: FormData) {
  const { supabase } = await requireAdmin();
  const itemId = value(formData, "item_id");
  const titleId = value(formData, "title_id");
  const path = `/admin/items/${encodeURIComponent(itemId)}`;

  const [{ count: purchases }, { count: preorders }, { count: progress }] = await Promise.all([
    supabase.from("purchases").select("purchase_id", { count: "exact", head: true }).eq("item_id", itemId),
    supabase.from("preorders").select("preorder_id", { count: "exact", head: true }).eq("item_id", itemId),
    supabase.from("reading_progress").select("reading_progress_id", { count: "exact", head: true }).eq("item_id", itemId),
  ]);

  if ((purchases ?? 0) > 0 || (preorders ?? 0) > 0 || (progress ?? 0) > 0) {
    fail(path, "Cannot delete an item with customer history. Archive it instead.");
  }

  const { error } = await supabase
    .from("items")
    .delete()
    .eq("item_id", itemId)
    .eq("title_id", titleId);

  if (error) fail(path, "Unable to delete item.");

  revalidateCatalog(titleId);
  redirect(`/admin/titles/${encodeURIComponent(titleId)}?notice=Item deleted.`);
}

export async function uploadTitleCover(formData: FormData) {
  const { supabase } = await requireAdmin();
  const titleId = value(formData, "title_id");
  const file = formData.get("cover");
  const path = `/admin/titles/${encodeURIComponent(titleId)}`;

  if (!titleId || !(file instanceof File) || file.size === 0) {
    fail(path, "Choose an image to upload.");
  }
  validateCover(file, path);

  const objectPath = `titles/${titleId}/cover-${crypto.randomUUID()}.${coverExtension(file)}`;

  const { error: uploadError } = await supabase.storage
    .from("manga-ln-assets")
    .upload(objectPath, file, {
      contentType: file.type,
      upsert: false,
      cacheControl: "3600",
    });

  if (uploadError) fail(path, "Unable to upload cover.");

  const { data: existing } = await supabase
    .from("titles")
    .select("cover_image_path")
    .eq("title_id", titleId)
    .maybeSingle();

  const { error: updateError } = await supabase
    .from("titles")
    .update({
      cover_image_path: objectPath,
      updated_at: new Date().toISOString(),
    })
    .eq("title_id", titleId);

  if (updateError) {
    await supabase.storage.from("manga-ln-assets").remove([objectPath]);
    fail(path, "Cover uploaded but could not be linked to the title.");
  }

  if (existing?.cover_image_path) {
    await supabase.storage.from("manga-ln-assets").remove([existing.cover_image_path]);
  }

  revalidateCatalog(titleId);
  success(path, "Cover uploaded.");
}

export async function removeTitleCover(formData: FormData) {
  const { supabase } = await requireAdmin();
  const titleId = value(formData, "title_id");
  const path = `/admin/titles/${encodeURIComponent(titleId)}`;

  const { data: existing } = await supabase
    .from("titles")
    .select("cover_image_path")
    .eq("title_id", titleId)
    .maybeSingle();

  if (!existing) fail("/admin/titles", "Title not found.");

  const { error } = await supabase
    .from("titles")
    .update({ cover_image_path: null, updated_at: new Date().toISOString() })
    .eq("title_id", titleId);

  if (error) fail(path, "Unable to remove cover.");

  if (existing.cover_image_path) {
    await supabase.storage.from("manga-ln-assets").remove([existing.cover_image_path]);
  }

  revalidateCatalog(titleId);
  success(path, "Cover removed.");
}

export async function saveItemContentPath(formData: FormData) {
  const { supabase } = await requireAdmin();
  const itemId = value(formData, "item_id");
  const titleId = value(formData, "title_id");
  const contentPath = value(formData, "content_path");
  const path = `/admin/items/${encodeURIComponent(itemId)}`;

  if (!itemId || !titleId) fail("/admin/titles", "Missing item or title ID.");
  if (contentPath && !contentPath.startsWith("items/")) {
    fail(path, "Content path must live under items/ in private storage.");
  }

  const { error } = await supabase
    .from("items")
    .update({
      content_path: contentPath || null,
      updated_at: new Date().toISOString(),
    })
    .eq("item_id", itemId)
    .eq("title_id", titleId);

  if (error) fail(path, "Unable to save content path.");

  revalidateCatalog(titleId);
  success(path, "Content path saved.");
}