import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type AuthClaims = {
  sub?: string;
  app_metadata?: {
    role?: string;
  };
};

export async function requireAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims as AuthClaims | undefined;

  if (!claims?.sub) {
    redirect("/auth/login");
  }

  if (claims.app_metadata?.role !== "admin") {
    redirect("/");
  }

  return {
    supabase,
    userId: claims.sub,
    claims,
  };
}
