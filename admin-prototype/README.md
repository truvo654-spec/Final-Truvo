# MarketSyde Admin — Prototype

Static, self-contained HTML prototypes built to validate the admin panel spec
(18 modules, full A–Z sub-tabs per module) before real backend/React integration.

## Files

- **marketsyde-admin-dashboard.html** — The full admin console. Single-file
  vanilla HTML/CSS/JS. All CRUD tables, filters, dialogs, charts and exports
  are real and interactive (in-memory data only — no backend yet).
- **marketsyde-admin-auth.html** — Sign in / Create account page for admin
  users. Same vanilla stack, no live OAuth/backend yet.
- **marketsyde_schema.sql** — Full Postgres schema (57 tables across 16
  domains) ready to run in Supabase, matching this repo's real domain model
  (connectivity states, cashback ledger states, gamification tiers, etc. per
  `AGENTS.md` / `product.md`).

## Status

Prototype only. Next steps to go live:
1. Run `marketsyde_schema.sql` on a real Supabase project.
2. Replace the in-memory JS arrays in the dashboard with Supabase client calls.
3. Wire real Supabase Auth into the auth page.
4. Port the vanilla components into this repo's existing React/Vite structure
   under `src/components/` once the data layer is live, so the admin console
   and the member-facing app (this repo) share one Supabase backend.
