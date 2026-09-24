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

## Local setup

Create `.env.local` from `.env.example` and provide the Supabase project URL and publishable key.

Then run:

```bash
npm install
npm run dev
```

## Useful routes

- `/` — public subsystem landing page
- `/auth/login` — sign in
- `/auth/sign-up` — create an account
- `/protected` — authenticated application workspace

## Database changes

Production database changes are tracked in `supabase/migrations/`.

Do not put service-role or secret Supabase keys in browser-exposed environment variables.
