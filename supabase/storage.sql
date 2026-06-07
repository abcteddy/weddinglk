-- ═══════════════════════════════════════════════════════════════════
-- WeddingLK — Media & Storage Database Setup
-- Run this in your Supabase SQL Editor: https://app.supabase.com
-- ═══════════════════════════════════════════════════════════════════

-- 1. Extend couples table with custom media columns
ALTER TABLE couples
ADD COLUMN IF NOT EXISTS cover_url text,
ADD COLUMN IF NOT EXISTS music_url text,
ADD COLUMN IF NOT EXISTS video_url text,
ADD COLUMN IF NOT EXISTS gallery_urls text[] DEFAULT '{}';

-- 2. Create the storage bucket for wedding assets if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wedding-assets', 
  'wedding-assets', 
  true, 
  31457280, -- 30MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'video/mp4', 'video/webm']
)
ON CONFLICT (id) DO NOTHING;

-- 3. Configure Row Level Security (RLS) policies for storage.objects
-- Note: Supabase storage folder structure will be: wedding-assets/[user_id]/[file]

-- Delete old policies to prevent duplicates
DROP POLICY IF EXISTS "Public Select Access" ON storage.objects;
DROP POLICY IF EXISTS "Owner Insert Access" ON storage.objects;
DROP POLICY IF EXISTS "Owner Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Owner Delete Access" ON storage.objects;

-- Policy 1: Anyone can read files (for public visitor pages)
CREATE POLICY "Public Select Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'wedding-assets');

-- Policy 2: Authenticated couples can upload files to their own user folder
CREATE POLICY "Owner Insert Access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'wedding-assets' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Authenticated couples can update files in their own user folder
CREATE POLICY "Owner Update Access"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'wedding-assets' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Authenticated couples can delete files in their own user folder
CREATE POLICY "Owner Delete Access"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'wedding-assets' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
