-- BI schema improvements for the Manga/Light Novel subsystem
-- Applied to Supabase project vkyqexnfefwdhttsdhxf as migration
-- 20260924052305_complete_bi_reading_and_etl_marts

CREATE TABLE IF NOT EXISTS public.reading_progress (
  reading_progress_id uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  user_id uuid NOT NULL,
  item_id uuid NOT NULL REFERENCES public.items(item_id) ON DELETE CASCADE,
  first_accessed_at timestamp without time zone NOT NULL DEFAULT now(),
  last_accessed_at timestamp without time zone NOT NULL DEFAULT now(),
  progress_pct numeric(5,2) NOT NULL DEFAULT 0,
  completed_at timestamp without time zone,
  access_mode text NOT NULL DEFAULT 'purchase',
  CONSTRAINT reading_progress_progress_pct_check CHECK (progress_pct >= 0 AND progress_pct <= 100),
  CONSTRAINT reading_progress_access_mode_check CHECK (access_mode IN ('preview','purchase','subscription')),
  CONSTRAINT reading_progress_completed_check CHECK (completed_at IS NULL OR progress_pct >= 100),
  CONSTRAINT reading_progress_user_item_unique UNIQUE (user_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_reading_progress_user_last_accessed
  ON public.reading_progress (user_id, last_accessed_at DESC);

CREATE INDEX IF NOT EXISTS idx_reading_progress_item
  ON public.reading_progress (item_id);

DROP VIEW IF EXISTS mart.etl_engagement;
DROP VIEW IF EXISTS mart.etl_sales;
DROP VIEW IF EXISTS mart.etl_subscriptions;
DROP VIEW IF EXISTS mart.item_performance;
DROP VIEW IF EXISTS mart.subscription_performance;
DROP VIEW IF EXISTS mart.monthly_revenue;

CREATE VIEW mart.monthly_revenue AS
SELECT
  i.title_id,
  date_trunc('month', p.purchased_at) AS month,
  sum(p.price_paid) AS total_revenue,
  count(*) AS total_purchases,
  count(DISTINCT p.user_id) AS unique_buyers,
  sum(CASE WHEN i.format = 'digital' THEN p.price_paid ELSE 0 END) AS digital_revenue,
  sum(CASE WHEN i.format = 'physical' THEN p.price_paid ELSE 0 END) AS physical_revenue
FROM public.purchases p
JOIN public.items i ON p.item_id = i.item_id
GROUP BY i.title_id, date_trunc('month', p.purchased_at);

CREATE VIEW mart.item_performance AS
SELECT
  i.item_id,
  i.title_id,
  i.arc_id,
  i.item_type,
  i.chapter_or_volume_number,
  i.format,
  i.is_free_preview,
  i.release_date,
  count(p.purchase_id) AS purchase_count,
  count(DISTINCT p.user_id) AS unique_buyers,
  coalesce(sum(p.price_paid), 0) AS total_revenue
FROM public.items i
LEFT JOIN public.purchases p ON p.item_id = i.item_id
GROUP BY
  i.item_id,
  i.title_id,
  i.arc_id,
  i.item_type,
  i.chapter_or_volume_number,
  i.format,
  i.is_free_preview,
  i.release_date;

CREATE VIEW mart.subscription_performance AS
SELECT
  s.tier,
  count(*) AS subscription_count,
  count(*) FILTER (WHERE s.ended_at IS NULL) AS active_subscription_count,
  count(*) FILTER (WHERE s.ended_at IS NOT NULL) AS ended_subscription_count,
  count(DISTINCT s.user_id) AS unique_subscribers,
  coalesce(sum(s.price), 0) AS subscription_value
FROM public.subscriptions s
GROUP BY s.tier;

CREATE VIEW mart.etl_sales AS
SELECT
  p.purchase_id AS source_record_id,
  p.user_id,
  p.item_id,
  i.title_id,
  i.arc_id,
  p.purchase_type,
  i.item_type,
  i.format,
  p.price_paid,
  p.purchased_at
FROM public.purchases p
JOIN public.items i ON p.item_id = i.item_id;

CREATE VIEW mart.etl_engagement AS
SELECT
  r.reading_progress_id AS source_record_id,
  r.user_id,
  r.item_id,
  i.title_id,
  i.arc_id,
  r.access_mode,
  r.progress_pct,
  r.first_accessed_at,
  r.last_accessed_at,
  r.completed_at
FROM public.reading_progress r
JOIN public.items i ON r.item_id = i.item_id;

CREATE VIEW mart.etl_subscriptions AS
SELECT
  s.subscription_id AS source_record_id,
  s.user_id,
  s.tier,
  s.price,
  s.started_at,
  s.ended_at
FROM public.subscriptions s;
