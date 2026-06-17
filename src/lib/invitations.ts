import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  mapInvitation,
  type InvitationRow,
} from "@/lib/mappers";
import { slugify, withRandomSuffix } from "@/lib/slug";
import type {
  EventType,
  ExtraConfig,
  Invitation,
  Locale,
  Localized,
  ThemeKey,
} from "@/types/invitation";

// Public-safe columns (no view_token) — used for guest-facing invitation pages.
const PUBLIC_COLUMNS =
  "id, slug, theme, host_names, event_type, event_date, venue_name, venue_address, map_url, hero_image_url, gallery, music_url, languages, rsvp_enabled, extra_config, created_at, updated_at";

// Admin reads additionally include the secret host-link token.
const ADMIN_COLUMNS = `${PUBLIC_COLUMNS}, view_token`;

export const invitationTag = (slug: string) => `invitation:${slug}`;

/**
 * PUBLIC read used by the statically-rendered invitation page.
 * Cached in the Data Cache and tagged so an admin edit can invalidate it; the
 * page itself is `force-static`, so guests are served from the CDN — the DB is
 * only touched on (re)generation, never per guest visit.
 */
export function getInvitationBySlug(slug: string): Promise<Invitation | null> {
  return unstable_cache(
    async () => {
      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from("invitations")
        .select(PUBLIC_COLUMNS)
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      return data ? mapInvitation(data as InvitationRow) : null;
    },
    ["invitation-by-slug", slug],
    { tags: [invitationTag(slug)], revalidate: false },
  )();
}

export type InvitationListItem = Invitation & { rsvpCount: number };

/** ADMIN: list every invitation with a response count (authenticated). */
export async function listInvitations(): Promise<InvitationListItem[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("invitations")
    .select(`${ADMIN_COLUMNS}, rsvps(count)`)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const rsvps = (row as { rsvps?: { count: number }[] }).rsvps;
    return {
      ...mapInvitation(row as InvitationRow),
      rsvpCount: rsvps?.[0]?.count ?? 0,
    };
  });
}

/** ADMIN: fetch a single invitation by id (authenticated). */
export async function getInvitationById(id: string): Promise<Invitation | null> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("invitations")
    .select(ADMIN_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapInvitation(data as InvitationRow) : null;
}

export type InvitationInput = {
  slug: string;
  theme: ThemeKey;
  hostNames: Localized;
  eventType: EventType;
  eventDate: string;
  venueName: string;
  venueAddress: string;
  mapUrl: string | null;
  heroImageUrl: string | null;
  gallery: string[];
  musicUrl: string | null;
  languages: Locale[];
  rsvpEnabled: boolean;
  extraConfig: ExtraConfig;
};

function toRow(input: InvitationInput) {
  return {
    slug: input.slug,
    theme: input.theme,
    host_names: input.hostNames,
    event_type: input.eventType,
    event_date: input.eventDate,
    venue_name: input.venueName,
    venue_address: input.venueAddress,
    map_url: input.mapUrl,
    hero_image_url: input.heroImageUrl,
    gallery: input.gallery,
    music_url: input.musicUrl,
    languages: input.languages,
    rsvp_enabled: input.rsvpEnabled,
    extra_config: input.extraConfig,
  };
}

export async function createInvitation(
  input: InvitationInput,
): Promise<Invitation> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("invitations")
    .insert(toRow(input))
    .select(ADMIN_COLUMNS)
    .single();

  if (error) throw error;
  return mapInvitation(data as InvitationRow);
}

export async function updateInvitation(
  id: string,
  input: InvitationInput,
): Promise<Invitation> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("invitations")
    .update(toRow(input))
    .eq("id", id)
    .select(ADMIN_COLUMNS)
    .single();

  if (error) throw error;
  return mapInvitation(data as InvitationRow);
}

export async function deleteInvitation(id: string): Promise<void> {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("invitations").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Build a unique slug from a base string. Checks the DB and adds a short random
 * suffix on collision. `excludeId` lets an edit keep its own slug.
 */
export async function generateUniqueSlug(
  base: string,
  excludeId?: string,
): Promise<string> {
  const supabase = await createServerSupabase();
  let candidate = slugify(base) || "invitation";

  for (let attempt = 0; attempt < 10; attempt++) {
    let query = supabase
      .from("invitations")
      .select("id")
      .eq("slug", candidate)
      .limit(1);
    if (excludeId) query = query.neq("id", excludeId);

    const { data, error } = await query;
    if (error) throw error;
    if (!data || data.length === 0) return candidate;

    candidate = withRandomSuffix(slugify(base) || "invitation");
  }
  // Extremely unlikely fallback.
  return withRandomSuffix(slugify(base) || "invitation");
}
