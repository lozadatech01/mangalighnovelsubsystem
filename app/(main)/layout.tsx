import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { isStaff } from "@/lib/utils";
import { AuthButton } from "@/components/auth-button";

// All pages in this group read cookies (auth session) at request time
export const instant = false;

async function NavLinks() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const staff = isStaff(user);

  return (
    <div className="flex items-center gap-4 text-sm">
      <Link href="/titles" className="hover:underline">
        Browse Titles
      </Link>
      {user && (
        <>
          <Link href="/account" className="hover:underline">
            My Account
          </Link>
          <Link href="/subscribe" className="hover:underline">
            Subscribe
          </Link>
        </>
      )}
      {staff && (
        <Link
          href="/staff"
          className="font-semibold text-amber-600 hover:underline"
        >
          Staff ▲
        </Link>
      )}
    </div>
  );
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Navigation ── */}
      <nav className="w-full border-b border-foreground/10 h-14 flex items-center px-6">
        <div className="w-full max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/titles" className="font-bold text-lg tracking-tight">
            Loxada M&amp;LN
          </Link>
          <div className="flex items-center gap-6">
            <Suspense
              fallback={
                <div className="h-4 w-32 bg-foreground/10 rounded animate-pulse" />
              }
            >
              <NavLinks />
            </Suspense>
            <Suspense>
              <AuthButton />
            </Suspense>
          </div>
        </div>
      </nav>

      {/* ── Page content ── */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-foreground/10 text-center text-xs text-foreground/50 py-6">
        © 2026 Loxada Entertainments — Manga &amp; Light Novel subsystem
      </footer>
    </div>
  );
}
