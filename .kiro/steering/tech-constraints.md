---
inclusion: always
---

# Monfily — Technical Constraints

These are hard constraints. Do not suggest alternatives.

## Backend
- **Supabase** for all backend needs: Auth, PostgreSQL database, Storage
- Use Supabase Row Level Security (RLS) on all tables — every table scoped to `auth.uid()`
- No custom backend server — Supabase only

## Deployment
- **Vercel** — the app must deploy to Vercel without additional configuration
- No Docker, no custom servers, no self-hosted infrastructure

## Routing
- **Next.js App Router** — no Pages Router
- Use route groups for auth `(auth)` and protected `(app)` layouts

## Environment Variables
- Supabase URL and anon key via `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Never expose service role key on the client
