-- ═══════════════════════════════════════════════════════════════════
-- WeddingLK — Seed Data for Development
-- Run AFTER schema.sql to populate test data
-- ═══════════════════════════════════════════════════════════════════

-- NOTE: Replace 'YOUR_USER_ID_HERE' with your actual Supabase auth user ID
-- You can find it in: Supabase Dashboard → Authentication → Users

do $$
declare
  demo_invitation_id uuid := uuid_generate_v4();
  demo_user_id uuid := '00000000-0000-0000-0000-000000000000'; -- Replace with your user ID
begin

-- ─── Sample invitation ───────────────────────────────────────────────
insert into couples (
  id, user_id, slug, partner1_name, partner2_name,
  wedding_date, wedding_time, venue_name, venue_address,
  rsvp_deadline, template_id, custom_message, couple_phone,
  is_published, is_paid, package
) values (
  demo_invitation_id,
  demo_user_id,
  'kamal-nisha-2026',
  'Kamal',
  'Nisha',
  '2026-12-20',
  '6:30 PM',
  'Shangri-La Hotel Colombo',
  'Colombo 03, Sri Lanka',
  '2026-12-01',
  'classic',
  'Together with our families, we joyfully request the pleasure of your company as we celebrate our union.',
  '0771234567',
  true,
  true,
  'premium'
) on conflict (slug) do nothing;

-- ─── Sample RSVPs ────────────────────────────────────────────────────
insert into rsvps (invitation_id, guest_name, guest_phone, attending, guest_count, meal_preference, message)
values
  (demo_invitation_id, 'Amara Silva', '0712345678', true, 2, 'veg', 'So excited for your big day!'),
  (demo_invitation_id, 'Roshan Fernando', '0723456789', true, 3, 'non-veg', 'Congratulations to both of you!'),
  (demo_invitation_id, 'Priya Perera', '0734567890', false, 1, null, 'So sorry I cannot make it. Wishing you all the best!'),
  (demo_invitation_id, 'Dinesh Mendis', '0745678901', true, 2, 'halal', 'Cannot wait to celebrate with you!'),
  (demo_invitation_id, 'Sasha Wickramasinghe', '0756789012', true, 1, 'vegan', 'You two are perfect together!')
on conflict do nothing;

end $$;
