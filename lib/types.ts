// ─── Public schema (OLTP) ────────────────────────────────────────────────────

export interface Title {
  title_id: string;
  title_name: string;
  origin_type: "licensed" | "original" | null;
  created_at: string | null;
}

export interface Arc {
  arc_id: string;
  title_id: string;
  arc_name: string;
  sequence_order: number | null;
}

export interface Item {
  item_id: string;
  title_id: string;
  arc_id: string | null;
  item_type: "manga" | "light_novel" | null;
  chapter_or_volume_number: number | null;
  format: "digital" | "physical" | null;
  price: number | null;
  is_free_preview: boolean;
  release_date: string | null;
  stock_quantity: number | null;
  created_at: string | null;
}

export interface Purchase {
  purchase_id: string;
  user_id: string;
  item_id: string;
  purchase_type: "single_purchase" | "subscription_access";
  price_paid: number;
  purchased_at: string | null;
}

export interface Preorder {
  preorder_id: string;
  user_id: string;
  item_id: string;
  status: "pending" | "fulfilled" | "cancelled";
  preordered_at: string | null;
}

export interface Subscription {
  subscription_id: string;
  user_id: string;
  tier: string | null;
  started_at: string | null;
  ended_at: string | null; // null = still active
}

// ─── Mart schema (OLAP read-only views) ──────────────────────────────────────

export interface MartMonthlyRevenue {
  title_id: string;
  month: string;
  total_revenue: number;
  total_purchases: number;
}

export interface MartTopChapter {
  item_id: string;
  title_id: string;
  chapter_or_volume_number: number;
  purchase_count: number;
}
