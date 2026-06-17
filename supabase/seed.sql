-- =============================================================================
-- Seed data: one demo invitation + a couple of RSVPs.
-- Run AFTER 0001_init.sql. Safe to re-run (uses a fixed id + upsert).
-- =============================================================================

insert into public.invitations (
  id, slug, theme, host_names, event_type, event_date,
  venue_name, venue_address, map_url, hero_image_url, gallery,
  music_url, languages, rsvp_enabled, extra_config
) values (
  '11111111-1111-1111-1111-111111111111',
  'demo-wedding',
  'classic',
  '{"en":"Sara & Omar","ar":"سارة و عمر"}'::jsonb,
  'wedding',
  '2026-12-12 18:00:00+03',
  'Grand Ballroom — The Ritz-Carlton',
  'King Fahd Rd, Riyadh, Saudi Arabia',
  'https://maps.google.com/?q=Ritz-Carlton+Riyadh',
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1600&q=80',
  '[
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200&q=80",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&q=80",
    "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=1200&q=80",
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1200&q=80",
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80",
    "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1200&q=80"
  ]'::jsonb,
  null,
  '["ar","en"]'::jsonb,
  true,
  '{
    "invitation_message": {
      "en": "With joyful hearts, we invite you to celebrate our wedding. Your presence is the greatest gift.",
      "ar": "بقلوب مفعمة بالفرح، ندعوكم لمشاركتنا فرحة زفافنا. حضوركم أجمل هدية."
    },
    "note": {
      "en": "Dress code: Formal",
      "ar": "نوع اللباس: رسمي"
    }
  }'::jsonb
)
on conflict (id) do update set
  slug = excluded.slug,
  theme = excluded.theme,
  host_names = excluded.host_names,
  event_type = excluded.event_type,
  event_date = excluded.event_date,
  venue_name = excluded.venue_name,
  venue_address = excluded.venue_address,
  map_url = excluded.map_url,
  hero_image_url = excluded.hero_image_url,
  gallery = excluded.gallery,
  music_url = excluded.music_url,
  languages = excluded.languages,
  rsvp_enabled = excluded.rsvp_enabled,
  extra_config = excluded.extra_config;

-- Sample RSVPs (cleared + reinserted so re-running stays idempotent).
delete from public.rsvps
where invitation_id = '11111111-1111-1111-1111-111111111111';

insert into public.rsvps (invitation_id, guest_name, status, guests_count, message) values
  ('11111111-1111-1111-1111-111111111111', 'Layla Ahmed', 'attending', 2, 'Can''t wait to celebrate with you!'),
  ('11111111-1111-1111-1111-111111111111', 'John Carter', 'maybe', 1, null),
  ('11111111-1111-1111-1111-111111111111', 'Fatima Z.', 'declined', 1, 'So sorry, traveling that week.');
