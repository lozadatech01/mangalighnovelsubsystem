import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

type AuthClaims = {
  email?: string;
  app_metadata?: {
    role?: string;
  };
};

export async function AuthButton() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return (
      <div className="flex gap-2">
        <Button asChild size="sm" variant="outline">
          <Link href="/auth/login">Sign in</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/auth/sign-up">Sign up</Link>
        </Button>
      </div>
    );
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims as AuthClaims | undefined;
  const user = claims;
  const isAdmin = user?.app_metadata?.role === "admin";

  return user ? (
    <div className="flex items-center gap-4">
      {isAdmin ? (
        <Link href="/admin" className="text-sm font-medium hover:underline">
          Admin
        </Link>
      ) : null}
      <span className="text-sm text-muted-foreground">{user.email}</span>
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant="outline">
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="sm">
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
