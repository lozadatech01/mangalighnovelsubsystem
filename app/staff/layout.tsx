import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isStaff } from "@/lib/utils";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");
  if (!isStaff(user)) redirect("/");

  return (
    <div className="min-h-screen flex flex-col">
      {/* Staff nav */}
      <nav className="w-full border-b border-amber-300 bg-amber-50 dark:bg-amber-950/20 h-12 flex items-center px-6">
        <div className="w-full max-w-6xl mx-auto flex items-center gap-6 text-sm font-medium">
          <Link href="/staff" className="text-amber-700 font-bold">
            ▲ Staff Panel
          </Link>
          <Link href="/staff/titles/new" className="hover:underline">
            + Title
          </Link>
          <Link href="/staff/arcs/new" className="hover:underline">
            + Arc
          </Link>
          <Link href="/staff/items/new" className="hover:underline">
            + Item
          </Link>
          <Link href="/staff/reports" className="hover:underline">
            Reports
          </Link>
          <Link href="/titles" className="ml-auto text-foreground/50 hover:underline">
            ← Customer View
          </Link>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
