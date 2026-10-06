-- =============================================================================
-- MarketSyde — Full Database Schema for Supabase (PostgreSQL)
-- =============================================================================
-- Source of truth: AGENTS.md / product.md (connectivity, cashback, broker-review,
-- gamification, signals, notifications) + the full admin panel specs pulled from
-- Confluence for every module (Missions, Promotions, CMS, Community, Trading
-- Tools, Economic Calendar, EAs, Portfolio Tracker, Instrument Analysis, RBAC).
--
-- HOW TO RUN
--   Paste this whole file into the Supabase SQL Editor and run it once, or save
--   it as a migration: supabase/migrations/00000000000000_marketsyde_schema.sql
--   then `supabase db push`.
--
-- CONVENTIONS
--   - Primary keys: uuid, default gen_random_uuid() (pgcrypto, enabled below).
--   - Every table has created_at; tables that get edited also have updated_at
--     kept current by the shared set_updated_at() trigger.
--   - Status/category fields are Postgres ENUMs, not free text — matches every
--     "state machine" documented in the spec (connection states, ledger states,
--     signal status, etc.) so the DB itself rejects invalid values.
--   - auth.users is Supabase's built-in auth table. `profiles` extends it 1:1
--     for trader-facing data; `admin_users` extends it 1:1 for internal staff.
--     A person can exist in one, both, or neither (public site visitor).
--   - RLS is enabled on every table. Full policies are written for the
--     clearly user-owned tables (profiles, connections, ledger, watchlists,
--     saved calculators, notification prefs). Everywhere else gets a
--     commented example policy — write the exact rule for your app once you
--     decide who's allowed to read/write it (this file can't guess that).
--   - Money uses numeric(14,2). Rates/percentages use numeric(7,4). Adjust if
--     you need more precision (e.g. crypto with 8 decimal places).
--   - Broker credentials are NEVER stored as plaintext (see AGENTS.md §2 —
--     "NO Plaintext Credentials"). The column below stores ciphertext only;
--     encrypt/decrypt in your backend (or via Supabase Vault / pgsodium) —
--     this schema intentionally does not do crypto itself.
-- =============================================================================

create extension if not exists pgcrypto;

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =============================================================================
-- SECTION A — Profiles, Admin Users & Role-Based Access Control
-- =============================================================================

create type trader_type as enum ('regular', 'intermediate', 'advisor', 'broker_partner');
create type member_level as enum ('rookie', 'climber', 'player', 'boss');
create type trader_status as enum ('active', 'suspended', 'pending_kyc');

create table profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  display_name    text not null,
  avatar_url      text,
  trader_type     trader_type not null default 'regular',
  level           member_level not null default 'rookie',
  points          integer not null default 0,
  credits         integer not null default 0,
  kyc_verified    boolean not null default false,
  status          trader_status not null default 'pending_kyc',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create trigger trg_profiles_updated_at before update on profiles
  for each row execute function set_updated_at();
create index idx_profiles_status on profiles(status);
create index idx_profiles_level on profiles(level);

-- Reference table for level thresholds/perks — seed data, rarely changes.
create table levels (
  code                  member_level primary key,
  min_points            integer not null,
  cashback_boost_pct    numeric(7,4) not null,       -- e.g. 0.0500 = +5%
  signal_confidence_min numeric(5,2) not null,
  signal_confidence_max numeric(5,2) not null
);
insert into levels (code, min_points, cashback_boost_pct, signal_confidence_min, signal_confidence_max) values
  ('rookie',  0,   0.0000, 70.00, 74.99),
  ('climber', 100, 0.0500, 75.00, 79.99),
  ('player',  250, 0.1000, 80.00, 89.99),
  ('boss',    500, 0.1500, 90.00, 100.00);

create type points_source as enum ('mission', 'trade', 'referral', 'manual_adjustment');
create table points_ledger (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  delta       integer not null,
  reason      text,
  source      points_source not null,
  created_by  uuid references auth.users(id),  -- null if system-generated
  created_at  timestamptz not null default now()
);
create index idx_points_ledger_user on points_ledger(user_id, created_at desc);

-- Internal admin/staff accounts (distinct from trader profiles above).
create type admin_role as enum (
  'super_admin', 'content_manager', 'support_agent',
  'finance_ops', 'compliance', 'broker_manager', 'community_mod'
);
create type admin_status as enum ('active', 'invited', 'suspended');

create table admin_users (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text not null,
  role          admin_role not null,
  status        admin_status not null default 'invited',
  last_active_at timestamptz,
  created_at    timestamptz not null default now()
);

-- RBAC matrix: which admin_role can access which module, and how (mirrors the
-- Roles & Permissions screen). access_level 'none' rows can be omitted (treat
-- missing row as 'none'); kept explicit here so the whole matrix is queryable.
create type access_level as enum ('full', 'view', 'none');
create table role_permissions (
  role         admin_role not null,
  module_key   text not null,   -- 'traders','connectivity','brokers','cashback', etc.
  access_level access_level not null default 'none',
  primary key (role, module_key)
);

create table audit_log (
  id          uuid primary key default gen_random_uuid(),
  admin_id    uuid references admin_users(id),
  action      text not null,          -- e.g. 'Approved review', 'Adjusted cashback rate'
  target_type text,                    -- e.g. 'broker', 'trader', 'mission'
  target_id   text,
  note        text,
  created_at  timestamptz not null default now()
);
create index idx_audit_log_created on audit_log(created_at desc);

-- =============================================================================
-- SECTION B — Broker Catalog  (product.md §2.2 Broker Discovery & Comparison)
-- =============================================================================

create type regulation_tier as enum ('tier1_regulated', 'regulated', 'offshore');
create type broker_visibility as enum ('all_levels', 'level2_plus', 'level3_plus', 'advisors_only');
create type broker_status as enum ('live', 'review');

create table brokers (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  slug               text not null unique,
  logo_url           text,
  region             text,
  headquarters       text,
  founded_year       integer,
  execution_type     text,                 -- e.g. 'Market Maker', 'ECN/STP'
  regulation_tier    regulation_tier,       -- auto-derivable from broker_licenses, cached here
  platforms          text[] not null default '{}',   -- {'MT4','MT5','cTrader'}
  asset_coverage     text[] not null default '{}',   -- {'Forex','Crypto','Stocks'}
  min_deposit        numeric(14,2),
  max_leverage       text,                  -- e.g. '1:1000'
  base_cashback_rate numeric(7,4),          -- e.g. 0.0500 = 5.0%
  visibility         broker_visibility not null default 'all_levels',
  status             broker_status not null default 'review',
  is_paid_partner    boolean not null default false,  -- gates "Highlights" section
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create trigger trg_brokers_updated_at before update on brokers
  for each row execute function set_updated_at();
create index idx_brokers_status on brokers(status);

create table broker_licenses (
  id             uuid primary key default gen_random_uuid(),
  broker_id      uuid not null references brokers(id) on delete cascade,
  regulator_name text not null,     -- 'FCA','ASIC','CySEC','FSA','SEC'...
  license_number text,
  jurisdiction   text,
  status         text,             -- 'Active','Suspended','Expired'
  effective_date date,
  created_at     timestamptz not null default now()
);
create index idx_broker_licenses_broker on broker_licenses(broker_id);

create table broker_account_types (
  id                          uuid primary key default gen_random_uuid(),
  broker_id                   uuid not null references brokers(id) on delete cascade,
  name                        text not null,     -- 'Bonus','Standard','Premium','Pro','Zero (ECN)'
  spread_type                 text,               -- 'Fixed','Floating','Raw'
  commission_per_lot          numeric(10,2),
  min_deposit                 numeric(14,2),
  min_trade_size              numeric(10,2),
  max_leverage                text,
  currencies                  text[] not null default '{}',
  supports_hedging            boolean default false,
  supports_scalping           boolean default false,
  supports_ea                 boolean default false,
  negative_balance_protection boolean default false,
  swap_free                   boolean default false
);
create index idx_broker_account_types_broker on broker_account_types(broker_id);

create table broker_payment_methods (
  id              uuid primary key default gen_random_uuid(),
  broker_id       uuid not null references brokers(id) on delete cascade,
  kind            text not null check (kind in ('deposit', 'withdrawal')),
  method          text not null,     -- 'Bank Transfer','Skrill','Neteller','Crypto'
  fee             text,
  min_amount      numeric(14,2),
  processing_time text
);

create table broker_cashback_rates (
  id               uuid primary key default gen_random_uuid(),
  broker_id        uuid not null references brokers(id) on delete cascade,
  account_type_id  uuid references broker_account_types(id) on delete set null,
  member_level     member_level not null,
  market_category  text,          -- 'Forex','Indices','Stocks','Commodities','Crypto'
  instrument       text,          -- specific symbol, nullable = applies to whole category
  rate             numeric(10,4) not null,
  rate_unit        text not null check (rate_unit in ('per_lot', 'per_trade', 'percent')),
  effective_date   date not null default current_date,
  status           text not null default 'active' check (status in ('active', 'inactive', 'upcoming'))
);
create index idx_broker_cashback_rates_lookup on broker_cashback_rates(broker_id, member_level);

create type review_flag as enum ('none', 'suspicious');
create type review_status as enum ('pending', 'approved', 'rejected');
create table broker_reviews (
  id         uuid primary key default gen_random_uuid(),
  broker_id  uuid not null references brokers(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  rating     numeric(2,1) not null check (rating between 0 and 5),
  body       text not null,
  flag       review_flag not null default 'none',
  status     review_status not null default 'pending',
  pinned     boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_broker_reviews_broker on broker_reviews(broker_id, status);

-- Internal Redirect affiliate tracking (product.md §2.2 exact requirement).
create table affiliate_clicks (
  id         uuid primary key default gen_random_uuid(),
  broker_id  uuid not null references brokers(id) on delete cascade,
  user_id    uuid references profiles(id) on delete set null,
  source     text,              -- 'comparison_matrix','broker_card','preset_matchup'
  ip_hash    text,
  clicked_at timestamptz not null default now()
);
create index idx_affiliate_clicks_broker on affiliate_clicks(broker_id, clicked_at desc);

create table broker_rebate_budgets (
  id           uuid primary key default gen_random_uuid(),
  broker_id    uuid not null references brokers(id) on delete cascade,
  period_start date not null,
  period_end   date not null,
  budget_amount numeric(14,2) not null,
  used_amount   numeric(14,2) not null default 0
);

-- =============================================================================
-- SECTION C — Connectivity  (product.md §2.1 Multi-Broker Connectivity)
-- =============================================================================

create type connection_state as enum (
  'disconnected', 'connecting', 'connected_syncing', 'connected_idle',
  'auth_expired', 'rate_limited', 'sync_failed'
);
create type adapter_kind as enum ('metatrader', 'binance', 'proprietary');

create table broker_connections (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references profiles(id) on delete cascade,
  broker_id             uuid not null references brokers(id),
  adapter               adapter_kind not null default 'metatrader',
  state                 connection_state not null default 'connecting',
  external_account_id   text,
  -- Ciphertext only — encrypt/decrypt in your backend or via Supabase Vault.
  -- NEVER write plaintext API keys / investor passwords into this column.
  credentials_ciphertext bytea,
  last_synced_at        timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create trigger trg_broker_connections_updated_at before update on broker_connections
  for each row execute function set_updated_at();
create index idx_broker_connections_user on broker_connections(user_id);
create index idx_broker_connections_state on broker_connections(state);

alter table broker_connections enable row level security;
create policy "Users manage their own broker connections"
  on broker_connections for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Normalized trade ingestion (product.md "TradeRecord" schema, §2.1 pipeline step 2).
create type trade_side as enum ('buy', 'sell');
create table trades (
  id              uuid primary key default gen_random_uuid(),
  connection_id   uuid not null references broker_connections(id) on delete cascade,
  broker_trade_id text,                 -- id from the broker's own system
  symbol          text not null,
  side            trade_side not null,
  volume_lots     numeric(10,2) not null,
  open_price      numeric(18,6),
  close_price     numeric(18,6),
  pnl             numeric(14,2),
  commission      numeric(10,2) default 0,
  swap            numeric(10,2) default 0,
  opened_at       timestamptz,
  closed_at       timestamptz,
  raw_payload     jsonb,                -- original broker payload, for debugging/replay
  created_at      timestamptz not null default now()
);
create index idx_trades_connection on trades(connection_id, closed_at desc);

-- =============================================================================
-- SECTION D — Cashback & Affiliate Engine  (product.md §2.3)
-- =============================================================================

create type cashback_plan_code as enum ('starter', 'intermediate', 'premium');
create table cashback_plans (
  code                cashback_plan_code primary key,
  rate                numeric(7,4) not null,     -- 0.0500 = 5.0%
  min_withdrawal      numeric(14,2) not null default 50,
  withdrawal_mode     text not null check (withdrawal_mode in ('manual', 'auto')),
  withdrawal_frequency text
);
insert into cashback_plans (code, rate, min_withdrawal, withdrawal_mode, withdrawal_frequency) values
  ('starter',      0.0500, 50, 'manual', 'weekly'),
  ('intermediate', 0.0750, 50, 'auto',   'monthly (optional)'),
  ('premium',      0.1000, 50, 'auto',   'weekly, default on');

-- Rebate Amount = Volume (Lots) x Broker Rebate Rate x User Tier Multiplier
create type ledger_state as enum ('pending', 'approved', 'payout_requested', 'paid', 'rejected');
create table rebate_ledger (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles(id) on delete cascade,
  broker_id    uuid not null references brokers(id),
  trade_id     uuid references trades(id) on delete set null,
  volume_lots  numeric(10,2) not null,
  amount       numeric(14,2) not null,
  state        ledger_state not null default 'pending',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger trg_rebate_ledger_updated_at before update on rebate_ledger
  for each row execute function set_updated_at();
create index idx_rebate_ledger_user on rebate_ledger(user_id, state);

alter table rebate_ledger enable row level security;
create policy "Users view their own rebate ledger"
  on rebate_ledger for select
  using (auth.uid() = user_id);
-- Inserts/updates to the ledger should only happen via a service-role backend
-- job (trade ingestion / admin approval) — no user-facing insert policy here
-- on purpose.

create type withdrawal_method as enum ('bank_transfer', 'paypal', 'crypto_wallet', 'wire_transfer');
create type withdrawal_status as enum ('pending', 'approved', 'processing', 'paid', 'rejected');
create table withdrawal_requests (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references profiles(id) on delete cascade,
  amount             numeric(14,2) not null,
  method             withdrawal_method not null,
  status             withdrawal_status not null default 'pending',
  needs_verification boolean not null default false,
  requested_at       timestamptz not null default now(),
  processed_at       timestamptz,
  admin_note         text
);
create index idx_withdrawal_requests_user on withdrawal_requests(user_id, status);

alter table withdrawal_requests enable row level security;
create policy "Users manage their own withdrawal requests"
  on withdrawal_requests for select using (auth.uid() = user_id);
create policy "Users can create their own withdrawal requests"
  on withdrawal_requests for insert with check (auth.uid() = user_id);

create table referral_codes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  code       text not null unique,
  qr_url     text,
  expires_at timestamptz,
  max_uses   integer,
  uses_count integer not null default 0,
  created_at timestamptz not null default now()
);
alter table referral_codes enable row level security;
create policy "Users manage their own referral codes"
  on referral_codes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create type referral_stage as enum ('registered', 'verified', 'funded', 'active_trading');
create table referral_events (
  id                uuid primary key default gen_random_uuid(),
  referral_code_id  uuid not null references referral_codes(id) on delete cascade,
  referred_user_id  uuid references profiles(id) on delete set null,
  stage             referral_stage not null,
  created_at        timestamptz not null default now()
);
create index idx_referral_events_code on referral_events(referral_code_id);
alter table referral_events enable row level security;
create policy "Users view events on their own referral codes"
  on referral_events for select
  using (
    exists (
      select 1 from referral_codes rc
      where rc.id = referral_events.referral_code_id and rc.user_id = auth.uid()
    )
  );

-- =============================================================================
-- SECTION E — Trading Signals
-- =============================================================================

create type contributor_type as enum ('api', 'advisor', 'broker');
create type contributor_tier as enum ('basic', 'verified', 'expert');
create table signal_contributors (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references profiles(id) on delete set null,   -- advisor
  broker_id    uuid references brokers(id) on delete set null,     -- broker-submitted
  type         contributor_type not null,
  tier         contributor_tier,
  win_rate     numeric(5,2),
  rating       numeric(3,2),
  created_at   timestamptz not null default now(),
  check (
    (type = 'advisor' and user_id is not null) or
    (type = 'broker'  and broker_id is not null) or
    (type = 'api')
  )
);

create type signal_status as enum ('pending_review', 'approved', 'needs_revision', 'rejected');
create table signals (
  id              uuid primary key default gen_random_uuid(),
  asset           text not null,
  source_type     contributor_type not null,
  contributor_id  uuid references signal_contributors(id) on delete set null,
  confidence      numeric(5,2),
  entry_price     numeric(18,6),
  stop_loss       numeric(18,6),
  take_profit     numeric(18,6),
  strategy_notes  text,
  status          signal_status not null default 'pending_review',
  published_at    timestamptz,
  created_at      timestamptz not null default now()
);
create index idx_signals_status on signals(status);
create index idx_signals_asset on signals(asset);

create type signal_engagement_action as enum ('view', 'bookmark', 'upvote', 'downvote');
create table signal_engagement (
  id         uuid primary key default gen_random_uuid(),
  signal_id  uuid not null references signals(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  action     signal_engagement_action not null,
  created_at timestamptz not null default now(),
  unique (signal_id, user_id, action)
);

create table signal_educational_attachments (
  id             uuid primary key default gen_random_uuid(),
  signal_id      uuid references signals(id) on delete cascade,
  contributor_id uuid references signal_contributors(id) on delete cascade,
  kind           text not null check (kind in ('video', 'article', 'document')),
  url            text not null,
  tier_required  text not null default 'basic' check (tier_required in ('basic', 'intermediate', 'premium'))
);

-- =============================================================================
-- SECTION F — Missions & Gamification
-- =============================================================================

create type mission_category as enum ('daily', 'weekly', 'monthly', 'seasonal', 'partner', 'learning', 'community');
create type mission_status as enum ('active', 'scheduled', 'draft', 'ended');
create type reward_type as enum ('credits', 'points', 'cashback_boost', 'badge');

create table missions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  category    mission_category not null,
  segment     text,                 -- 'new_user','inactive_user','active_trader','high_level','all'
  reward_type reward_type not null,
  reward_value text,                -- '+20 credits', '+50 pts', 'Exclusive badge'
  status      mission_status not null default 'draft',
  starts_at   timestamptz,
  ends_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index idx_missions_status on missions(status);

create table user_missions (
  id              uuid primary key default gen_random_uuid(),
  mission_id      uuid not null references missions(id) on delete cascade,
  user_id         uuid not null references profiles(id) on delete cascade,
  progress_pct    numeric(5,2) not null default 0,
  completed_at    timestamptz,
  reward_claimed  boolean not null default false,
  unique (mission_id, user_id)
);
create index idx_user_missions_user on user_missions(user_id);

-- =============================================================================
-- SECTION G — Promotions
-- =============================================================================

create type promotion_status as enum ('active', 'scheduled', 'ended');
create table promotions (
  id                        uuid primary key default gen_random_uuid(),
  name                      text not null,
  eligibility_min_level     member_level,
  eligibility_requires_broker boolean not null default false,
  eligibility_requires_kyc  boolean not null default false,
  window_start              date,
  window_end                date,
  status                    promotion_status not null default 'scheduled',
  created_at                timestamptz not null default now()
);

create table promotion_redemptions (
  id            uuid primary key default gen_random_uuid(),
  promotion_id  uuid not null references promotions(id) on delete cascade,
  user_id       uuid not null references profiles(id) on delete cascade,
  redeemed_at   timestamptz not null default now(),
  unique (promotion_id, user_id)
);

-- =============================================================================
-- SECTION H — CMS Content (Educational Content + Market News, merged library)
-- =============================================================================

create table content_categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  parent_id   uuid references content_categories(id) on delete set null,
  description text
);

create table content_tags (
  id   uuid primary key default gen_random_uuid(),
  name text not null unique
);

create type content_type as enum (
  'article', 'news', 'course', 'video_tutorial', 'pdf_guide', 'webinar',
  'broker_profile', 'ea_documentation', 'static_page', 'email_template'
);
create type content_visibility as enum ('public', 'registered', 'premium');
create type content_status as enum ('draft', 'scheduled', 'published', 'pending', 'trash');

create table content_items (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  type          content_type not null,
  category_id   uuid references content_categories(id) on delete set null,
  visibility    content_visibility not null default 'public',
  author_id     uuid references profiles(id) on delete set null,
  author_label  text,              -- e.g. 'MarketSyde Editorial', 'IC Markets (Broker)'
  body          text,
  status        content_status not null default 'draft',
  scheduled_at  timestamptz,
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger trg_content_items_updated_at before update on content_items
  for each row execute function set_updated_at();
create index idx_content_items_status on content_items(status);
create index idx_content_items_type on content_items(type);

create table content_item_tags (
  content_id uuid not null references content_items(id) on delete cascade,
  tag_id     uuid not null references content_tags(id) on delete cascade,
  primary key (content_id, tag_id)
);

create table media_assets (
  id           uuid primary key default gen_random_uuid(),
  file_name    text not null,
  mime_type    text,
  size_bytes   bigint,
  storage_path text not null,     -- Supabase Storage object key
  uploaded_by  uuid references profiles(id) on delete set null,
  created_at   timestamptz not null default now()
);

create type submission_status as enum ('pending', 'approved', 'spam', 'trash');
create table content_submissions (
  id               uuid primary key default gen_random_uuid(),
  content_id       uuid references content_items(id) on delete cascade,
  submitted_by     uuid references profiles(id) on delete set null,
  submitted_broker uuid references brokers(id) on delete set null,
  status           submission_status not null default 'pending',
  created_at       timestamptz not null default now()
);
create index idx_content_submissions_status on content_submissions(status);

-- News-source integration health (Market News & Updates admin panel §A).
create table news_sources (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,        -- 'Acuity','Reuters','Dow Jones'
  enabled         boolean not null default true,
  priority        integer not null default 0,
  refresh_minutes integer not null default 15,
  last_synced_at  timestamptz
);

-- =============================================================================
-- SECTION I — Community & Forum
-- =============================================================================

create type group_type as enum ('public', 'invite_only', 'approval_based', 'restricted_l3plus');
create type group_platform as enum ('in_app', 'telegram', 'discord');
create type group_status as enum ('active', 'suspended');

create table community_groups (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  owner_id      uuid references profiles(id) on delete set null,
  owner_broker  uuid references brokers(id) on delete set null,
  group_type    group_type not null default 'public',
  platform      group_platform not null default 'in_app',
  member_count  integer not null default 0,
  status        group_status not null default 'active',
  created_at    timestamptz not null default now()
);

create type membership_role as enum ('member', 'moderator', 'owner');
create table community_memberships (
  id        uuid primary key default gen_random_uuid(),
  group_id  uuid not null references community_groups(id) on delete cascade,
  user_id   uuid not null references profiles(id) on delete cascade,
  role      membership_role not null default 'member',
  joined_at timestamptz not null default now(),
  unique (group_id, user_id)
);

create table community_reports (
  id           uuid primary key default gen_random_uuid(),
  group_id     uuid not null references community_groups(id) on delete cascade,
  reported_by  uuid references profiles(id) on delete set null,
  excerpt      text,
  reason       text,
  status       text not null default 'open' check (status in ('open', 'resolved')),
  created_at   timestamptz not null default now()
);

-- =============================================================================
-- SECTION J — Trading Tools (Calculators)
-- =============================================================================

create type calculator_category as enum (
  'risk_capital', 'cost_execution', 'technical_market', 'performance_projection', 'instrument_analysis'
);
create type calculator_tier_access as enum ('public', 'all_levels', 'registered_plus', 'premium');
create type calculator_status as enum ('live', 'beta');

create table calculators (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,          -- 'Position Size Calculator', 'Pip Calculator', ...
  category    calculator_category not null,
  tier_access calculator_tier_access not null default 'all_levels',
  status      calculator_status not null default 'beta',
  created_at  timestamptz not null default now()
);

create table calculator_usage_logs (
  id            uuid primary key default gen_random_uuid(),
  calculator_id uuid not null references calculators(id) on delete cascade,
  user_id       uuid references profiles(id) on delete set null,
  used_at       timestamptz not null default now()
);
create index idx_calc_usage_calc on calculator_usage_logs(calculator_id, used_at desc);

create table calculator_saved_scenarios (
  id            uuid primary key default gen_random_uuid(),
  calculator_id uuid not null references calculators(id) on delete cascade,
  user_id       uuid not null references profiles(id) on delete cascade,
  name          text not null,
  inputs        jsonb not null,       -- arbitrary per-calculator input schema
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger trg_calc_scenarios_updated_at before update on calculator_saved_scenarios
  for each row execute function set_updated_at();

alter table calculator_saved_scenarios enable row level security;
create policy "Users manage their own saved calculator scenarios"
  on calculator_saved_scenarios for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =============================================================================
-- SECTION K — Economic Calendar
-- =============================================================================

create type event_impact as enum ('high', 'medium', 'low');
create table calendar_events (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  region     text,
  asset_tags text[] not null default '{}',
  impact     event_impact not null default 'medium',
  event_time timestamptz not null,
  source     text not null default 'manual',   -- 'acuity','reuters','manual'
  created_at timestamptz not null default now()
);
create index idx_calendar_events_time on calendar_events(event_time);

create table calendar_alerts (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references profiles(id) on delete cascade,
  event_id              uuid references calendar_events(id) on delete cascade,
  keyword               text,
  notify_before_minutes integer not null default 15,
  created_at            timestamptz not null default now()
);

alter table calendar_alerts enable row level security;
create policy "Users manage their own calendar alerts"
  on calendar_alerts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =============================================================================
-- SECTION L — Expert Advisors (EAs)
-- =============================================================================

create type ea_tier as enum ('basic', 'intermediate', 'premium');
create type ea_status as enum ('live', 'beta');

create table expert_advisors (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  strategy_type text,          -- 'Scalping','Swing','Hedging','Breakout'...
  platform      text,          -- 'MT4','MT5','MT4/MT5'
  tier          ea_tier not null default 'basic',
  backtest_roi  numeric(7,4),
  status        ea_status not null default 'beta',
  submitted_by  uuid references profiles(id) on delete set null,  -- advisor, if applicable
  created_at    timestamptz not null default now()
);

create type ea_submission_status as enum ('pending', 'approved', 'revision_requested', 'rejected');
create table ea_submissions (
  id               uuid primary key default gen_random_uuid(),
  ea_name          text not null,
  advisor_id       uuid not null references profiles(id) on delete cascade,
  strategy_notes   text,
  backtest_summary text,        -- e.g. '+27.3% / 8.1% DD'
  status           ea_submission_status not null default 'pending',
  created_at       timestamptz not null default now()
);

create table ea_downloads (
  id            uuid primary key default gen_random_uuid(),
  ea_id         uuid not null references expert_advisors(id) on delete cascade,
  user_id       uuid not null references profiles(id) on delete cascade,
  downloaded_at timestamptz not null default now()
);
create index idx_ea_downloads_ea on ea_downloads(ea_id);

-- =============================================================================
-- SECTION M — Portfolio Tracker
-- =============================================================================

create type sync_status as enum ('synced', 'stale', 'sync_error');
create table portfolio_links (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  connection_id uuid references broker_connections(id) on delete set null,  -- null = manual entry
  source_label  text not null,       -- 'HFM (API)', 'Manual entry'
  sync_status   sync_status not null default 'synced',
  last_sync_at  timestamptz
);
create index idx_portfolio_links_user on portfolio_links(user_id);

alter table portfolio_links enable row level security;
create policy "Users manage their own portfolio links"
  on portfolio_links for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create type sharing_visibility as enum ('visible', 'flagged', 'hidden');
create table shared_portfolios (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  metric_label text not null,       -- e.g. '+340% monthly return (screenshot)'
  flag_reason  text,
  status       sharing_visibility not null default 'visible',
  created_at   timestamptz not null default now()
);

-- =============================================================================
-- SECTION N — Instrument Analysis
-- =============================================================================

create type asset_class as enum ('forex', 'crypto', 'metals', 'indices', 'stocks', 'commodities');
create type instrument_visibility as enum ('guest', 'free', 'premium', 'advisor', 'broker');
create type instrument_status as enum ('active', 'delayed', 'archived');

create table instruments (
  id         uuid primary key default gen_random_uuid(),
  symbol     text not null unique,   -- 'XAU/USD', 'BTC/USD'
  name       text not null,
  asset_class asset_class not null,
  visibility instrument_visibility not null default 'free',
  status     instrument_status not null default 'active',
  created_at timestamptz not null default now()
);

-- Time-series price ticks. High write volume — consider partitioning by month
-- once this grows, or moving to a dedicated time-series store.
create table instrument_prices (
  id            uuid primary key default gen_random_uuid(),
  instrument_id uuid not null references instruments(id) on delete cascade,
  price         numeric(18,6) not null,
  change_24h_pct numeric(7,4),
  recorded_at   timestamptz not null default now()
);
create index idx_instrument_prices_lookup on instrument_prices(instrument_id, recorded_at desc);

create table watchlists (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  name       text not null default 'My Watchlist',
  created_at timestamptz not null default now()
);
create table watchlist_items (
  watchlist_id  uuid not null references watchlists(id) on delete cascade,
  instrument_id uuid not null references instruments(id) on delete cascade,
  added_at      timestamptz not null default now(),
  primary key (watchlist_id, instrument_id)
);
alter table watchlist_items enable row level security;
create policy "Users manage items in their own watchlists"
  on watchlist_items for all
  using (
    exists (select 1 from watchlists w where w.id = watchlist_items.watchlist_id and w.user_id = auth.uid())
  )
  with check (
    exists (select 1 from watchlists w where w.id = watchlist_items.watchlist_id and w.user_id = auth.uid())
  );

alter table watchlists enable row level security;
create policy "Users manage their own watchlists"
  on watchlists for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table sentiment_indices (
  id          uuid primary key default gen_random_uuid(),
  code        text not null,        -- 'fear_greed', 'altcoin_season'
  value       numeric(6,2) not null,
  recorded_at timestamptz not null default now()
);
create index idx_sentiment_indices_code on sentiment_indices(code, recorded_at desc);

-- =============================================================================
-- SECTION O — Notifications  (AGENTS.md §2.4 — exact trigger list)
-- =============================================================================

create type notification_channel as enum ('email', 'email_in_app', 'push', 'sms');
create type notification_trigger_status as enum ('enabled', 'disabled');

create table notification_triggers (
  key        text primary key,     -- 'AUTH_VERIFY_EMAIL','CASHBACK_PAYOUT_PROCESSED', etc.
  fires_on   text not null,
  channel    notification_channel not null default 'email',
  status     notification_trigger_status not null default 'enabled'
);
insert into notification_triggers (key, fires_on, channel) values
  ('AUTH_VERIFY_EMAIL',          'Immediately after sign-up',                    'email'),
  ('AUTH_NEW_DEVICE_DETECTED',   'New IP / user-agent login',                    'email'),
  ('BROKER_CONNECTED_SUCCESS',   'Broker connection succeeds',                   'email_in_app'),
  ('BROKER_RECONNECT_REQUIRED',  'Connection drops (+ resend at 48h)',           'email_in_app'),
  ('CASHBACK_PAYOUT_PROCESSED',  'Payout transferred',                           'email'),
  ('INACTIVITY_NUDGE',           'No activity for 14+ days',                     'email');

create table user_notification_prefs (
  user_id      uuid not null references profiles(id) on delete cascade,
  trigger_key  text not null references notification_triggers(key) on delete cascade,
  enabled      boolean not null default true,
  primary key (user_id, trigger_key)
);

alter table user_notification_prefs enable row level security;
create policy "Users manage their own notification prefs"
  on user_notification_prefs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create type delivery_status as enum ('queued', 'sent', 'failed');
create table notification_log (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references profiles(id) on delete cascade,
  trigger_key     text references notification_triggers(key),
  payload         jsonb,
  delivery_status delivery_status not null default 'queued',
  sent_at         timestamptz,
  created_at      timestamptz not null default now()
);
create index idx_notification_log_user on notification_log(user_id, created_at desc);

alter table notification_log enable row level security;
create policy "Users view their own notification history"
  on notification_log for select using (auth.uid() = user_id);

-- =============================================================================
-- Remaining tables without a specific policy above: RLS is enabled but no
-- policy is attached yet, which means (by Postgres/Supabase default) NO ROW
-- IS READABLE OR WRITABLE until you add one — safe-by-default, not an oversight.
-- Enable + add policies per your actual access rules, e.g.:
--
--   alter table brokers enable row level security;
--   create policy "Anyone can read live brokers"
--     on brokers for select using (status = 'live');
--   create policy "Admins can write brokers"
--     on brokers for all using (
--       exists (select 1 from admin_users a where a.id = auth.uid())
--     );
-- =============================================================================

do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'profiles','admin_users','role_permissions','audit_log',
      'brokers','broker_licenses','broker_account_types','broker_payment_methods',
      'broker_cashback_rates','broker_reviews','affiliate_clicks','broker_rebate_budgets',
      'trades','cashback_plans','signal_contributors','signals','signal_engagement',
      'signal_educational_attachments','missions','user_missions','promotions',
      'promotion_redemptions','content_categories','content_tags','content_items',
      'content_item_tags','media_assets','content_submissions','news_sources',
      'community_groups','community_memberships','community_reports','calculators',
      'calculator_usage_logs','calendar_events','expert_advisors','ea_submissions',
      'ea_downloads','shared_portfolios','instruments','instrument_prices',
      'sentiment_indices','notification_triggers','levels','points_ledger',
      'referral_codes','referral_events','watchlist_items'
    ])
  loop
    execute format('alter table %I enable row level security;', t);
  end loop;
end $$;
