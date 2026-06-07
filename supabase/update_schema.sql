-- ═══════════════════════════════════════════════════════════════════
-- WeddingLK — Schema & Storage Update for Full Features
-- Run this in your Supabase SQL Editor: https://app.supabase.com
-- ═══════════════════════════════════════════════════════════════════

-- 1. Extend couples table with profile, event details, contacts, timeline, registry, and live stream columns
ALTER TABLE couples
ADD COLUMN IF NOT EXISTS bride_photo_url text,
ADD COLUMN IF NOT EXISTS bride_full_name text,
ADD COLUMN IF NOT EXISTS bride_parents text,
ADD COLUMN IF NOT EXISTS bride_bio text,
ADD COLUMN IF NOT EXISTS groom_photo_url text,
ADD COLUMN IF NOT EXISTS groom_full_name text,
ADD COLUMN IF NOT EXISTS groom_parents text,
ADD COLUMN IF NOT EXISTS groom_bio text,
ADD COLUMN IF NOT EXISTS reception_time text DEFAULT '7:00 PM',
ADD COLUMN IF NOT EXISTS dress_code text,
ADD COLUMN IF NOT EXISTS additional_instructions text,
ADD COLUMN IF NOT EXISTS google_maps_embed_url text,
ADD COLUMN IF NOT EXISTS bride_contact text,
ADD COLUMN IF NOT EXISTS groom_contact text,
ADD COLUMN IF NOT EXISTS family_contact text,
ADD COLUMN IF NOT EXISTS whatsapp_number text,
ADD COLUMN IF NOT EXISTS timeline_events jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS registry_bank_details text,
ADD COLUMN IF NOT EXISTS registry_qr_url text,
ADD COLUMN IF NOT EXISTS registry_preferences text,
ADD COLUMN IF NOT EXISTS registry_online_contributions boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS live_stream_platform text DEFAULT 'youtube',
ADD COLUMN IF NOT EXISTS live_stream_url text,
ADD COLUMN IF NOT EXISTS live_stream_active boolean DEFAULT false;

-- 2. Extend rsvps table with guest_id, dietary_notes, email, and attendance_status columns
ALTER TABLE rsvps
ADD COLUMN IF NOT EXISTS guest_id uuid,
ADD COLUMN IF NOT EXISTS dietary_notes text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS attendance_status text DEFAULT 'yes';

-- 3. Create the guests table
CREATE TABLE IF NOT EXISTS guests (
  id              uuid primary key default uuid_generate_v4(),
  invitation_id   uuid references couples(id) on delete cascade not null,
  name            text not null,
  email           text,
  phone           text,
  token           text unique not null,
  status          text not null default 'pending', -- 'pending' | 'sent' | 'opened'
  rsvp_status     text not null default 'pending', -- 'pending' | 'yes' | 'no' | 'maybe'
  guest_count     int not null default 1,
  dietary_notes   text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- 4. Create the guest_uploads table
CREATE TABLE IF NOT EXISTS guest_uploads (
  id            uuid primary key default uuid_generate_v4(),
  invitation_id uuid references couples(id) on delete cascade not null,
  url           text not null,
  file_type     text not null default 'image', -- 'image' | 'video'
  guest_name    text not null default 'Guest',
  is_moderated  boolean not null default false,
  created_at    timestamptz not null default now()
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_uploads ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for Guests table
DROP POLICY IF EXISTS "Guests: owner CRUD" ON guests;
CREATE POLICY "Guests: owner CRUD"
  ON guests FOR ALL
  USING (
    invitation_id IN (
      SELECT id FROM couples WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    invitation_id IN (
      SELECT id FROM couples WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Guests: public read by token" ON guests;
CREATE POLICY "Guests: public read by token"
  ON guests FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Guests: public update by token" ON guests;
CREATE POLICY "Guests: public update by token"
  ON guests FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 7. RLS Policies for Guest Uploads table
DROP POLICY IF EXISTS "Guest Uploads: public insert" ON guest_uploads;
CREATE POLICY "Guest Uploads: public insert"
  ON guest_uploads FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Guest Uploads: public read moderated" ON guest_uploads;
CREATE POLICY "Guest Uploads: public read moderated"
  ON guest_uploads FOR SELECT
  USING (is_moderated = true);

DROP POLICY IF EXISTS "Guest Uploads: owner CRUD all" ON guest_uploads;
CREATE POLICY "Guest Uploads: owner CRUD all"
  ON guest_uploads FOR ALL
  USING (
    invitation_id IN (
      SELECT id FROM couples WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    invitation_id IN (
      SELECT id FROM couples WHERE user_id = auth.uid()
    )
  );

-- 8. Storage Policy: Add Guest Upload storage policy to allow guest uploads to the public wedding-assets bucket
-- Anyone can upload files to the guest-uploads folder of an invitation
DROP POLICY IF EXISTS "Guest Insert Access" ON storage.objects;
CREATE POLICY "Guest Insert Access"
ON storage.objects FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'wedding-assets'
  AND (storage.foldername(name))[2] = 'guest-uploads'
);

-- 9. Add foreign key index for search performance
CREATE INDEX IF NOT EXISTS guests_invitation_id_idx ON guests(invitation_id);
CREATE INDEX IF NOT EXISTS guests_token_idx ON guests(token);
CREATE INDEX IF NOT EXISTS guest_uploads_invitation_id_idx ON guest_uploads(invitation_id);

-- 10. Setup realtime for new tables (idempotent DO blocks)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'guests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE guests;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'guest_uploads'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE guest_uploads;
  END IF;
END $$;
