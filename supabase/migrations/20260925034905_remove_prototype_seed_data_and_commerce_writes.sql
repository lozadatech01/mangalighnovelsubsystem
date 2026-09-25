-- Remove prototype-only catalog data and client-side commerce writes.
-- Real listing and commerce workflows will be introduced through the admin/application layer.

DROP POLICY IF EXISTS "purchases_create_own" ON public.purchases;
DROP POLICY IF EXISTS "subscriptions_create_own" ON public.subscriptions;
DROP POLICY IF EXISTS "preorders_create_own" ON public.preorders;

DELETE FROM public.reading_progress
WHERE item_id IN (
  SELECT item_id
  FROM public.items
  WHERE title_id LIKE 'demo-%'
);

DELETE FROM public.purchases
WHERE item_id IN (
  SELECT item_id
  FROM public.items
  WHERE title_id LIKE 'demo-%'
);

DELETE FROM public.preorders
WHERE item_id IN (
  SELECT item_id
  FROM public.items
  WHERE title_id LIKE 'demo-%'
);

DELETE FROM public.items
WHERE title_id LIKE 'demo-%';

DELETE FROM public.arcs
WHERE title_id LIKE 'demo-%';

DELETE FROM public.titles
WHERE title_id LIKE 'demo-%';
