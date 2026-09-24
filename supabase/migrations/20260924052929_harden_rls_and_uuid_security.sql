-- Security hardening for the Manga/Light Novel subsystem.

ALTER FUNCTION public.uuid_generate_v7()
  SET search_path = pg_catalog, public, extensions;

ALTER TABLE public.titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arcs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preorders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "catalog_titles_read" ON public.titles;
CREATE POLICY "catalog_titles_read"
  ON public.titles
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "catalog_arcs_read" ON public.arcs;
CREATE POLICY "catalog_arcs_read"
  ON public.arcs
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "catalog_items_read" ON public.items;
CREATE POLICY "catalog_items_read"
  ON public.items
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "preorders_read_own" ON public.preorders;
CREATE POLICY "preorders_read_own"
  ON public.preorders
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "preorders_create_own" ON public.preorders;
CREATE POLICY "preorders_create_own"
  ON public.preorders
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "purchases_read_own" ON public.purchases;
CREATE POLICY "purchases_read_own"
  ON public.purchases
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "subscriptions_read_own" ON public.subscriptions;
CREATE POLICY "subscriptions_read_own"
  ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "reading_progress_read_own" ON public.reading_progress;
CREATE POLICY "reading_progress_read_own"
  ON public.reading_progress
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "reading_progress_create_own" ON public.reading_progress;
CREATE POLICY "reading_progress_create_own"
  ON public.reading_progress
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "reading_progress_update_own" ON public.reading_progress;
CREATE POLICY "reading_progress_update_own"
  ON public.reading_progress
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

ALTER VIEW mart.monthly_revenue SET (security_invoker = true);
ALTER VIEW mart.item_performance SET (security_invoker = true);
ALTER VIEW mart.subscription_performance SET (security_invoker = true);
ALTER VIEW mart.etl_sales SET (security_invoker = true);
ALTER VIEW mart.etl_engagement SET (security_invoker = true);
ALTER VIEW mart.etl_subscriptions SET (security_invoker = true);
ALTER VIEW mart.top_chapters SET (security_invoker = true);
