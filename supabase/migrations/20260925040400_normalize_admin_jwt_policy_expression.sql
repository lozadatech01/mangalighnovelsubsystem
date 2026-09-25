-- Use the documented RLS shape: (select auth.jwt()) -> ...
-- This keeps the JWT function call initplan-friendly.

DROP POLICY IF EXISTS "admin_titles_insert" ON public.titles;
CREATE POLICY "admin_titles_insert"
  ON public.titles FOR INSERT TO authenticated
  WITH CHECK (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "admin_titles_update" ON public.titles;
CREATE POLICY "admin_titles_update"
  ON public.titles FOR UPDATE TO authenticated
  USING (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "admin_titles_delete" ON public.titles;
CREATE POLICY "admin_titles_delete"
  ON public.titles FOR DELETE TO authenticated
  USING (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "admin_arcs_insert" ON public.arcs;
CREATE POLICY "admin_arcs_insert"
  ON public.arcs FOR INSERT TO authenticated
  WITH CHECK (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "admin_arcs_update" ON public.arcs;
CREATE POLICY "admin_arcs_update"
  ON public.arcs FOR UPDATE TO authenticated
  USING (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "admin_arcs_delete" ON public.arcs;
CREATE POLICY "admin_arcs_delete"
  ON public.arcs FOR DELETE TO authenticated
  USING (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "admin_items_insert" ON public.items;
CREATE POLICY "admin_items_insert"
  ON public.items FOR INSERT TO authenticated
  WITH CHECK (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "admin_items_update" ON public.items;
CREATE POLICY "admin_items_update"
  ON public.items FOR UPDATE TO authenticated
  USING (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "admin_items_delete" ON public.items;
CREATE POLICY "admin_items_delete"
  ON public.items FOR DELETE TO authenticated
  USING (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "admin_manga_assets_read" ON storage.objects;
CREATE POLICY "admin_manga_assets_read"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id IN ('manga-ln-assets', 'manga-ln-content')
    AND ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  );

DROP POLICY IF EXISTS "admin_manga_assets_insert" ON storage.objects;
CREATE POLICY "admin_manga_assets_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id IN ('manga-ln-assets', 'manga-ln-content')
    AND ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  );

DROP POLICY IF EXISTS "admin_manga_assets_update" ON storage.objects;
CREATE POLICY "admin_manga_assets_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id IN ('manga-ln-assets', 'manga-ln-content')
    AND ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    bucket_id IN ('manga-ln-assets', 'manga-ln-content')
    AND ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  );

DROP POLICY IF EXISTS "admin_manga_assets_delete" ON storage.objects;
CREATE POLICY "admin_manga_assets_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id IN ('manga-ln-assets', 'manga-ln-content')
    AND ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  );