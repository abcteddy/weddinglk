-- ═══════════════════════════════════════════════════════════════════
-- WeddingLK — Supabase Database Schema
-- Run this in your Supabase SQL Editor: https://app.supabase.com
-- ═══════════════════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── COUPLES TABLE ──────────────────────────────────────────────────
-- One row per wedding invitation
create table if not exists couples (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  slug            text unique not null,           -- e.g. "kamal-nisha-2026"
  partner1_name   text not null,
  partner2_name   text not null,
  wedding_date    date not null,
  wedding_time    text not null default '6:00 PM',
  venue_name      text not null,
  venue_address   text,
  rsvp_deadline   date,
  template_id     text not null default 'classic',
  custom_message  text,
  photo_url       text,                           -- Supabase Storage URL
  couple_phone    text,                           -- for SMS notifications
  is_published    boolean not null default false,
  is_paid         boolean not null default false,
  package         text not null default 'basic',  -- 'basic' | 'premium'
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ─── RSVPS TABLE ────────────────────────────────────────────────────
-- One row per guest RSVP response
create table if not exists rsvps (
  id               uuid primary key default uuid_generate_v4(),
  invitation_id    uuid references couples(id) on delete cascade not null,
  guest_name       text not null,
  guest_phone      text,
  attending        boolean not null,
  guest_count      int not null default 1,
  meal_preference  text,                          -- 'veg' | 'non-veg' | 'vegan' | 'halal'
  message          text,
  created_at       timestamptz not null default now()
);

-- ─── PAYMENTS TABLE ─────────────────────────────────────────────────
-- PayHere transaction log
create table if not exists payments (
  id                 uuid primary key default uuid_generate_v4(),
  invitation_id      uuid references couples(id) on delete cascade not null,
  payhere_order_id   text unique,
  amount             decimal(10,2) not null,
  currency           text not null default 'LKR',
  status             text not null default 'pending', -- 'pending' | 'completed' | 'cancelled' | 'failed'
  package            text,
  created_at         timestamptz not null default now()
);

-- ─── INDEXES ────────────────────────────────────────────────────────
create index if not exists couples_user_id_idx on couples(user_id);
create index if not exists couples_slug_idx on couples(slug);
create index if not exists couples_is_published_idx on couples(is_published);
create index if not exists rsvps_invitation_id_idx on rsvps(invitation_id);
create index if not exists rsvps_guest_phone_idx on rsvps(guest_phone);
create index if not exists payments_invitation_id_idx on payments(invitation_id);
create index if not exists payments_order_id_idx on payments(payhere_order_id);

-- ─── AUTO-UPDATE updated_at ─────────────────────────────────────────
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_couples_updated on couples;
create trigger on_couples_updated
  before update on couples
  for each row execute procedure handle_updated_at();

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────
alter table couples enable row level security;
alter table rsvps enable row level security;
alter table payments enable row level security;

-- Couples: owner can do everything with their own rows
create policy "Couples: owner CRUD"
  on couples for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Couples: anyone can read published invitations (for public /inv/[slug] page)
create policy "Couples: public read published"
  on couples for select
  using (is_published = true);

-- RSVPs: anyone can insert (guests submitting RSVP form)
create policy "RSVPs: public insert"
  on rsvps for insert
  with check (true);

-- RSVPs: only the invitation owner can read their RSVPs
create policy "RSVPs: owner read"
  on rsvps for select
  using (
    invitation_id in (
      select id from couples where user_id = auth.uid()
    )
  );

-- Payments: only owner can read
create policy "Payments: owner read"
  on payments for select
  using (
    invitation_id in (
      select id from couples where user_id = auth.uid()
    )
  );

-- ─── REALTIME ────────────────────────────────────────────────────────
-- Enable Realtime for the rsvps table so dashboard updates live (idempotent DO block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'rsvps'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE rsvps;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════
-- After running this schema, generate TypeScript types with:
-- npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts
-- ═══════════════════════════════════════════════════════════════════
