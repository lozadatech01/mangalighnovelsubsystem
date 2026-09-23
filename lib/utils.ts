import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { User } from "@supabase/supabase-js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// ─── Staff role ───────────────────────────────────────────────────────────────

/**
 * Hardcoded staff email allow-list — supplement or replace with
 * user_metadata.role once you have a proper provisioning flow.
 */
const STAFF_EMAILS: string[] = [
  // e.g. "hans@loxada.com", "carlo@loxada.com"
];

export function isStaff(user: User | null): boolean {
  if (!user) return false;
  if (user.user_metadata?.role === "staff") return true;
  if (user.email && STAFF_EMAILS.includes(user.email)) return true;
  return false;
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

/**
 * Returns the public URL for a cover image in the `manga-ln-assets` bucket.
 * Convention: {title_id}/{item_id}/cover.jpg
 */
export function getImageUrl(titleId: string, itemId: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${supabaseUrl}/storage/v1/object/public/manga-ln-assets/${titleId}/${itemId}/cover.jpg`;
}

/**
 * Returns the storage path (used for upload) for a cover image.
 */
export function getImagePath(titleId: string, itemId: string): string {
  return `${titleId}/${itemId}/cover.jpg`;
}
