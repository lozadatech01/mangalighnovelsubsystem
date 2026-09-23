import { createServiceClient } from "@/lib/supabase/service";
import { DataTable } from "@/components/staff/data-table";
import type { MartMonthlyRevenue, MartTopChapter } from "@/lib/types";

export const metadata = { title: "Reports — Staff — Loxada M&LN" };

export default async function ReportsPage() {
  const supabase = createServiceClient();

  const [{ data: revenue, error: revErr }, { data: topChapters, error: topErr }] =
    await Promise.all([
      supabase.schema("mart").from("monthly_revenue").select("*").order("month", { ascending: false }),
      supabase.schema("mart").from("top_chapters").select("*").order("purchase_count", { ascending: false }).limit(50),
    ]);

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold">Reports</h1>

      {/* ── Monthly Revenue ── */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Monthly Revenue</h2>
        {revErr && (
          <p className="text-red-500 text-sm mb-2">
            Error loading revenue: {revErr.message}
            {!process.env.SUPABASE_SERVICE_ROLE_KEY && (
              <span className="ml-2 text-amber-600">
                (SUPABASE_SERVICE_ROLE_KEY may be required in .env.local)
              </span>
            )}
          </p>
        )}
        <DataTable<MartMonthlyRevenue>
          rows={(revenue as MartMonthlyRevenue[]) ?? []}
          columns={[
            { key: "title_id", header: "Title ID" },
            { key: "month", header: "Month" },
            {
              key: "total_revenue",
              header: "Revenue",
              render: (v) => `₱${Number(v).toFixed(2)}`,
            },
            { key: "total_purchases", header: "Purchases" },
          ]}
          emptyMessage="No revenue data yet."
        />
      </section>

      {/* ── Top Chapters ── */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Top Chapters / Volumes</h2>
        {topErr && (
          <p className="text-red-500 text-sm mb-2">
            Error loading top chapters: {topErr.message}
          </p>
        )}
        <DataTable<MartTopChapter>
          rows={(topChapters as MartTopChapter[]) ?? []}
          columns={[
            { key: "title_id", header: "Title ID" },
            { key: "item_id", header: "Item ID" },
            { key: "chapter_or_volume_number", header: "Chapter / Vol." },
            { key: "purchase_count", header: "Purchases" },
          ]}
          emptyMessage="No chapter purchase data yet."
        />
      </section>
    </div>
  );
}
