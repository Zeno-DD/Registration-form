# Topic Registration Website (Next.js + Supabase)

## Features
- Student registration without student login
- Filter topics by advisor
- Existing PDF registrations imported as occupied topics
- Server-side availability check + PostgreSQL unique constraint to prevent double booking
- Admin-only dashboard (Supabase Auth + admin allowlist)
- Export registration data to Excel (.xlsx)
- Supabase Realtime topic status updates (public topic table only; no student PII)

## Setup
1. Create a Supabase project.
2. Run `supabase/schema.sql` in Supabase SQL Editor.
3. Copy `.env.example` to `.env.local`.
4. Set `ADMIN_EMAILS` to your admin email(s), comma-separated.
5. Install packages: `npm install`
6. Run locally: `npm run dev`
7. Deploy to Vercel and set the same environment variables.

## Important
- `SUPABASE_SERVICE_ROLE_KEY` is server-only. Never prefix it with `NEXT_PUBLIC_`.
- Student details are stored in `registrations`; public clients must never query that table directly.
- Admin sign-in uses Supabase Auth. Create an admin user in Supabase Auth and add the email to `ADMIN_EMAILS`.
- `topics` contains the public topic catalog and availability only. It does not contain student PII.
- Existing PDF registrations should be imported as `occupied=true` topics, with their student data imported only into the private admin records if required.
- The topic data in `data/topics.csv` is a template, not extracted PDF data. Import the actual PDF list before production.
- For production, enable Supabase RLS and keep all registration writes behind the Next.js API.
