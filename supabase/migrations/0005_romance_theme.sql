-- =============================================================================
-- Add the "romance" theme to the allowed set. The original CHECK constraint
-- (created inline in 0001_init.sql as a column check) only permitted
-- 'classic', 'modern' and 'playful'. Postgres auto-named that column check
-- `invitations_theme_check`; we drop it and recreate it with the new key.
-- =============================================================================

alter table public.invitations
  drop constraint if exists invitations_theme_check;

alter table public.invitations
  add constraint invitations_theme_check
  check (theme in ('classic', 'modern', 'playful', 'romance'));
