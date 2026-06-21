-- =============================================================================
-- Shared media library: every hero/gallery/share image and music track the
-- admin uploads is recorded here so it can be reused across invitations via a
-- dropdown instead of being re-uploaded. Run AFTER 0002_host_summary.sql.
-- =============================================================================

create table if not exists public.media_assets (
  id           uuid primary key default gen_random_uuid(),
  -- Images (hero / share cover / gallery) share one pool; audio is its own pool.
  kind         text not null check (kind in ('image', 'audio')),
  url          text not null unique,
  label        text not null default '',
  -- SHA-256 of the file contents, used to dedupe re-uploads of the same file.
  content_hash text,
  created_at   timestamptz not null default now()
);

create index if not exists media_assets_kind_idx on public.media_assets (kind);
create index if not exists media_assets_hash_idx on public.media_assets (kind, content_hash);

-- -----------------------------------------------------------------------------
-- Row Level Security: the library is an admin-only tool, so only authenticated
-- users can read or write it (guest-facing pages never touch this table).
-- -----------------------------------------------------------------------------
alter table public.media_assets enable row level security;

drop policy if exists "Authenticated can read media assets" on public.media_assets;
create policy "Authenticated can read media assets"
  on public.media_assets for select to authenticated
  using (true);

drop policy if exists "Authenticated can insert media assets" on public.media_assets;
create policy "Authenticated can insert media assets"
  on public.media_assets for insert to authenticated
  with check (true);

drop policy if exists "Authenticated can delete media assets" on public.media_assets;
create policy "Authenticated can delete media assets"
  on public.media_assets for delete to authenticated
  using (true);
