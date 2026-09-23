import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TitleCard } from "@/components/manga/title-card";

export const metadata = {
  title: "Browse Titles — Loxada M&LN",
};

// Opt out of prerendering — layout reads cookies + DB query at request time
export const instant = false;

export default async function TitlesPage() {
  const supabase = await createClient();
  const { data: titles, error } = await supabase
    .from("titles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Browse Titles</h1>

      {error && (
        <div className="text-red-500 text-sm mb-4">
          Error loading titles: {error.message}
        </div>
      )}

      {!titles?.length && !error && (
        <div className="text-foreground/60">
          No titles yet.{" "}
          <Link href="/staff/titles/new" className="underline">
            Add one as staff
          </Link>
          .
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {titles?.map((title) => (
          <TitleCard key={title.title_id} title={title} />
        ))}
      </div>
    </div>
  );
}
