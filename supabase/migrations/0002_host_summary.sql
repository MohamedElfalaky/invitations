-- =============================================================================
-- Host summary link: a private, read-only RSVP view the admin can share with
-- the event host (no login needed). Run AFTER 0001_init.sql.
-- =============================================================================

-- A per-invitation secret token. Existing rows get a random token (the volatile
-- default is evaluated per row), new rows get one automatically.
alter table public.invitations
  add column if not exists view_token uuid not null default gen_random_uuid();

create unique index if not exists invitations_view_token_idx
  on public.invitations (view_token);

-- Token-gated summary. SECURITY DEFINER so it can read RSVPs (whose table is
-- otherwise admin-only) ONLY when the caller presents a valid token. Returns
-- null for an unknown token, so the page can 404 gracefully.
create or replace function public.host_rsvp_summary(p_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  inv public.invitations%rowtype;
  result jsonb;
begin
  select * into inv from public.invitations where view_token = p_token;
  if inv.id is null then
    return null;
  end if;

  select jsonb_build_object(
    'slug', inv.slug,
    'host_names', inv.host_names,
    'event_date', inv.event_date,
    'rsvps', coalesce(
      jsonb_agg(
        jsonb_build_object(
          'guest_name', r.guest_name,
          'status', r.status,
          'guests_count', r.guests_count,
          'message', r.message,
          'created_at', r.created_at
        ) order by r.created_at desc
      ) filter (where r.id is not null),
      '[]'::jsonb
    )
  )
  into result
  from public.rsvps r
  where r.invitation_id = inv.id;

  return result;
end;
$$;

-- Anyone holding a valid token may call it (the function itself enforces the gate).
grant execute on function public.host_rsvp_summary(uuid) to anon, authenticated;
