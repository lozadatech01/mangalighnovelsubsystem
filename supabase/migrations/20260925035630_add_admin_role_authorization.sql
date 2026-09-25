-- Admin authorization uses Supabase Auth app_metadata.
-- app_metadata is server-controlled; user_metadata must never be used for authorization.

DROP POLICY IF EXISTS "admin_titles_insert" ON public.titles;
CREATE POLICY "admin_titles_insert"
  ON public.titles
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "admin_titles_update" ON public.titles;
CREATE POLICY "admin_titles_update"
  ON public.titles
  FOR UPDATE
  TO authenticated
  USING ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "admin_titles_delete" ON public.titles;
CREATE POLICY "admin_titles_delete"
  ON public.titles
  FOR DELETE
  TO authenticated
  USING ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "admin_arcs_insert" ON public.arcs;
CREATE POLICY "admin_arcs_insert"
  ON public.arcs
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "admin_arcs_update" ON public.arcs;
CREATE POLICY "admin_arcs_update"
  ON public.arcs
  FOR UPDATE
  TO authenticated
  USING ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "admin_arcs_delete" ON public.arcs;
CREATE POLICY "admin_arcs_delete"
  ON public.arcs
  FOR DELETE
  TO authenticated
  USING ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "admin_items_insert" ON public.items;
CREATE POLICY "admin_items_insert"
  ON public.items
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "admin_items_update" ON public.items;
CREATE POLICY "admin_items_update"
  ON public.items
  FOR UPDATE
  TO authenticated
  USING ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "admin_items_delete" ON public.items;
CREATE POLICY "admin_items_delete"
  ON public.items
  FOR DELETE
  TO authenticated
  USING ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

REVOKE TRUNCATE ON public.titles, public.arcs, public.items FROM anon, authenticated;
