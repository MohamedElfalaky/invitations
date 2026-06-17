-- =============================================================================
-- Digital Invitations — initial schema
-- Run this in the Supabase SQL editor (or `supabase db push`) before seeding.
-- =============================================================================

-- gen_random_uuid()
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'rsvp_status') then
    create type rsvp_status as enum ('attending', 'declined', 'maybe');
  end if;
end$$;

-- -----------------------------------------------------------------------------
-- invitations
-- -----------------------------------------------------------------------------
create table if not exists public.invitations (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  theme         text not null default 'classic'
                  check (theme in ('classic', 'modern', 'playful')),
  host_names    jsonb not null default '{"en":"","ar":""}'::jsonb,
  event_type    text not null default 'wedding'
                  check (event_type in ('wedding','engagement','birthday','graduation','party')),
  event_date    timestamptz not null,
  venue_name    text not null default '',
  venue_address text not null default '',
  map_url       text,
  hero_image_url text,
  gallery       jsonb not null default '[]'::jsonb,
  music_url     text,
  languages     jsonb not null default '["en","ar"]'::jsonb,
  rsvp_enabled  boolean not null default true,
  extra_config  jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- rsvps
-- -----------------------------------------------------------------------------
create table if not exists public.rsvps (
  id            uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  guest_name    text not null,
  status        rsvp_status not null,
  guests_count  int not null default 1 check (guests_count >= 1),
  message       text,
  created_at    timestamptz not null default now()
);

create index if not exists rsvps_invitation_id_idx on public.rsvps (invitation_id);

-- -----------------------------------------------------------------------------
-- updated_at trigger
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists invitations_set_updated_at on public.invitations;
create trigger invitations_set_updated_at
  before update on public.invitations
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Row Level Security
--   invitations: public can READ (pages are public); only authenticated writes.
--   rsvps:       anyone can INSERT (guests submit); only authenticated reads.
-- -----------------------------------------------------------------------------
alter table public.invitations enable row level security;
alter table public.rsvps enable row level security;

drop policy if exists "Public can read invitations" on public.invitations;
create policy "Public can read invitations"
  on public.invitations for select
  using (true);

drop policy if exists "Authenticated can insert invitations" on public.invitations;
create policy "Authenticated can insert invitations"
  on public.invitations for insert to authenticated
  with check (true);

drop policy if exists "Authenticated can update invitations" on public.invitations;
create policy "Authenticated can update invitations"
  on public.invitations for update to authenticated
  using (true) with check (true);

drop policy if exists "Authenticated can delete invitations" on public.invitations;
create policy "Authenticated can delete invitations"
  on public.invitations for delete to authenticated
  using (true);

drop policy if exists "Anyone can insert rsvps" on public.rsvps;
create policy "Anyone can insert rsvps"
  on public.rsvps for insert to anon, authenticated
  with check (true);

drop policy if exists "Authenticated can read rsvps" on public.rsvps;
create policy "Authenticated can read rsvps"
  on public.rsvps for select to authenticated
  using (true);

-- -----------------------------------------------------------------------------
-- Storage: public bucket for hero/gallery/music assets.
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('invitation-assets', 'invitation-assets', true)
on conflict (id) do nothing;

drop policy if exists "Public read invitation assets" on storage.objects;
create policy "Public read invitation assets"
  on storage.objects for select
  using (bucket_id = 'invitation-assets');

drop policy if exists "Authenticated upload invitation assets" on storage.objects;
create policy "Authenticated upload invitation assets"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'invitation-assets');

drop policy if exists "Authenticated update invitation assets" on storage.objects;
create policy "Authenticated update invitation assets"
  on storage.objects for update to authenticated
  using (bucket_id = 'invitation-assets')
  with check (bucket_id = 'invitation-assets');

drop policy if exists "Authenticated delete invitation assets" on storage.objects;
create policy "Authenticated delete invitation assets"
  on storage.objects for delete to authenticated
  using (bucket_id = 'invitation-assets');
