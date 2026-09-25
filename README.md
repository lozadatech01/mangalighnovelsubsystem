# Manga / Light Novel Subsystem

The Manga / Light Novel subsystem is one department application in the Loxada Entertainments platform.

## Stack

- Next.js App Router
- React
- Tailwind CSS
- Supabase Auth + Postgres
- Vercel
- GitHub

## Project responsibilities

The application is the operational user/admin interface for the Manga / Light Novel subsystem.

Supabase is split into:

- `public`: OLTP operational tables
- `mart`: analytical views used by reporting and ETL
- Storage: department data lake

The central Business Intelligence system will consume the subsystem's ETL-oriented marts rather than querying the OLTP tables directly.

## Current public behavior

The public application currently provides a real catalog shell backed by Supabase. It does not fabricate titles, reader pages, purchases, subscriptions, or preorders. Until the publishing/admin workflow is implemented, an empty catalog is a valid state.

## Local setup

Create `.env.local` from `.env.example` and provide the Supabase project URL and publishable key.

Then run:

```bash
npm install
npm run dev
```

## Useful routes

- `/` — public catalog
- `/auth/login` — sign in
- `/auth/sign-up` — create an account
- `/protected` — authenticated account workspace

## Database changes

Production database changes are tracked in `supabase/migrations/`.

Do not put service-role or secret Supabase keys in browser-exposed environment variables.
