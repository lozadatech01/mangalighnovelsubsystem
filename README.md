# Manga / Light Novel Subsystem

The Manga / Light Novel subsystem is one department application in the Loxada Entertainments platform.

## Stack

- Next.js App Router
- React
- Tailwind CSS
- Supabase Auth + Postgres
- Supabase Storage
- Vercel
- GitHub

## Project responsibilities

The application is the operational user/admin interface for the Manga / Light Novel subsystem.

Supabase is split into:

- `public`: OLTP operational tables
- `mart`: analytical views used by reporting and ETL
- Storage: department data lake

The central Business Intelligence system will consume the subsystem's ETL-oriented marts rather than querying the OLTP tables directly.

## Public catalog

The public catalog only exposes records whose publication status is `published`.

- `/` — published titles
- `/titles/[titleId]` — published title and published items
- `/items/[itemId]` — published item details
- `/auth/login` — sign in
- `/auth/sign-up` — create an account
- `/protected` — authenticated account workspace

An empty catalog is valid until an administrator publishes content.

## Admin catalog management

The admin interface is part of the same deployment under `/admin`.

Admin access requires the authenticated user's Supabase Auth `app_metadata.role` to equal `admin`. Authorization is enforced both in the Next.js route/action layer and in Postgres RLS policies.

Admin routes include:

- `/admin` — dashboard
- `/admin/titles` — title list and publication filters
- `/admin/titles/new` — create a title
- `/admin/titles/[titleId]` — edit title metadata, cover, arcs, and items
- `/admin/items/[itemId]` — edit item metadata and content path

### Publishing lifecycle

Titles and items use:

`draft` → `published` → `archived`

Published titles and published items are the only records shown to customers.

New titles and items are created as drafts. Deletes are deliberately restricted when dependent records or customer history exist; archive is the safe lifecycle operation for content that has already been used.

### Assigning the first admin

Set the role in Supabase Auth application metadata, not user metadata:

```sql
UPDATE auth.users
SET raw_app_meta_data =
  jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'::jsonb
  )
WHERE email = 'YOUR_EMAIL_HERE';
```

Sign out and sign back in after changing the role so the new JWT contains the updated metadata.

## Local setup

Create `.env.local` from `.env.example` and provide the Supabase project URL and publishable key.

Then run:

```bash
npm install
npm run dev
```

## Database changes

Production database changes are tracked in `supabase/migrations/`.

Do not put service-role or secret Supabase keys in browser-exposed environment variables.
