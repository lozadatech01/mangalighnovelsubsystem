import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client using the service-role key.
 * Use ONLY in server-side code for privileged operations (e.g., mart schema
 * queries).  Never expose the service-role key to the browser.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local.
 * If the key is absent, falls back to the anon/publishable key so the app
 * won't crash during local dev — just mart data may be inaccessible.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

  return createSupabaseClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
