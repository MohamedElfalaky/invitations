-- =============================================================================
-- Invitation visit tracking: a per-invitation counter of how many times the
-- public invitation page has been opened. The guest page is statically
-- rendered (served from the CDN), so visits are recorded by a small client-side
-- beacon that calls record_invitation_view() instead of a server render.
-- Run AFTER 0003_media_assets.sql.
-- =============================================================================

alter table public.invitations
  add column if not exists view_count bigint not null default 0;

-- -----------------------------------------------------------------------------
-- Increment helper. RLS only lets authenticated users UPDATE invitations, so
-- guests cannot write the table directly. This SECURITY DEFINER function runs
-- as the owner and does exactly one thing — bump the counter for a slug — which
-- is safe to expose to anonymous visitors.
-- -----------------------------------------------------------------------------
create or replace function public.record_invitation_view(p_slug text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.invitations
     set view_count = view_count + 1
   where slug = p_slug;
$$;

revoke all on function public.record_invitation_view(text) from public;
grant execute on function public.record_invitation_view(text) to anon, authenticated;
