-- Prototype catalog and authenticated write policies.

DROP POLICY IF EXISTS "purchases_create_own" ON public.purchases;
CREATE POLICY "purchases_create_own"
  ON public.purchases
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "subscriptions_create_own" ON public.subscriptions;
CREATE POLICY "subscriptions_create_own"
  ON public.subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

INSERT INTO public.titles (title_id, title_name, origin_type)
VALUES
  ('demo-clockwork-orchard', 'The Clockwork Orchard', 'licensed'),
  ('demo-moonlit-cartographer', 'Moonlit Cartographer', 'original'),
  ('demo-paper-stars-academy', 'Paper Stars Academy', 'licensed'),
  ('demo-last-lantern', 'The Last Lantern', 'original')
ON CONFLICT (title_id) DO NOTHING;

INSERT INTO public.arcs (arc_id, title_id, arc_name, sequence_order)
VALUES
  ('demo-clockwork-arc-1', 'demo-clockwork-orchard', 'The Brass Orchard', 1),
  ('demo-clockwork-arc-2', 'demo-clockwork-orchard', 'The Midnight Harvest', 2),
  ('demo-moonlit-arc-1', 'demo-moonlit-cartographer', 'Map of the Hidden Sea', 1),
  ('demo-paper-stars-arc-1', 'demo-paper-stars-academy', 'First Term', 1),
  ('demo-last-lantern-arc-1', 'demo-last-lantern', 'The Sleeping City', 1)
ON CONFLICT (arc_id) DO NOTHING;

INSERT INTO public.items (
  item_id,
  title_id,
  arc_id,
  item_type,
  chapter_or_volume_number,
  format,
  price,
  is_free_preview,
  release_date,
  stock_quantity
)
VALUES
  ('00000000-0000-7000-8000-000000000001', 'demo-clockwork-orchard', 'demo-clockwork-arc-1', 'manga', 1, 'digital', 49.00, true, CURRENT_DATE - 90, NULL),
  ('00000000-0000-7000-8000-000000000002', 'demo-clockwork-orchard', 'demo-clockwork-arc-1', 'manga', 2, 'digital', 59.00, false, CURRENT_DATE - 60, NULL),
  ('00000000-0000-7000-8000-000000000003', 'demo-clockwork-orchard', 'demo-clockwork-arc-2', 'manga', 3, 'digital', 69.00, false, CURRENT_DATE - 20, NULL),
  ('00000000-0000-7000-8000-000000000004', 'demo-moonlit-cartographer', 'demo-moonlit-arc-1', 'manga', 1, 'digital', 39.00, true, CURRENT_DATE - 75, NULL),
  ('00000000-0000-7000-8000-000000000005', 'demo-moonlit-cartographer', 'demo-moonlit-arc-1', 'manga', 1, 'physical', 499.00, false, CURRENT_DATE - 75, 25),
  ('00000000-0000-7000-8000-000000000006', 'demo-paper-stars-academy', 'demo-paper-stars-arc-1', 'light_novel', 1, 'digital', 99.00, true, CURRENT_DATE - 45, NULL),
  ('00000000-0000-7000-8000-000000000007', 'demo-paper-stars-academy', 'demo-paper-stars-arc-1', 'light_novel', 2, 'digital', 109.00, false, CURRENT_DATE - 10, NULL),
  ('00000000-0000-7000-8000-000000000008', 'demo-last-lantern', 'demo-last-lantern-arc-1', 'light_novel', 1, 'digital', 89.00, true, CURRENT_DATE - 30, NULL)
ON CONFLICT (item_id) DO NOTHING;
