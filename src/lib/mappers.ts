import type {
  EventType,
  Invitation,
  Locale,
  Localized,
  Rsvp,
  RsvpStatus,
  ThemeKey,
} from "@/types/invitation";

/** Raw snake_case row as stored in Postgres. */
export type InvitationRow = {
  id: string;
  slug: string;
  theme: string;
  host_names: unknown;
  event_type: string;
  event_date: string;
  venue_name: string;
  venue_address: string;
  map_url: string | null;
  hero_image_url: string | null;
  gallery: unknown;
  music_url: string | null;
  languages: unknown;
  rsvp_enabled: boolean;
  extra_config: unknown;
  view_token?: string | null;
  view_count?: number | null;
  created_at: string;
  updated_at: string;
};

export type RsvpRow = {
  id: string;
  invitation_id: string;
  guest_name: string;
  status: string;
  guests_count: number;
  message: string | null;
  created_at: string;
};

function toLocalized(value: unknown): Localized {
  const v = (value ?? {}) as Record<string, unknown>;
  return {
    en: typeof v.en === "string" ? v.en : "",
    ar: typeof v.ar === "string" ? v.ar : "",
  };
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((x): x is string => typeof x === "string") : [];
}

function toLocales(value: unknown): Locale[] {
  const arr = toStringArray(value).filter((l): l is Locale => l === "en" || l === "ar");
  return arr.length ? arr : ["en", "ar"];
}

/** Map a DB row into the app-facing `Invitation` shape. */
export function mapInvitation(row: InvitationRow): Invitation {
  return {
    id: row.id,
    slug: row.slug,
    theme: row.theme as ThemeKey,
    hostNames: toLocalized(row.host_names),
    eventType: row.event_type as EventType,
    eventDate: row.event_date,
    venueName: row.venue_name ?? "",
    venueAddress: row.venue_address ?? "",
    mapUrl: row.map_url,
    heroImageUrl: row.hero_image_url,
    gallery: toStringArray(row.gallery),
    musicUrl: row.music_url,
    languages: toLocales(row.languages),
    rsvpEnabled: row.rsvp_enabled,
    extraConfig: (row.extra_config ?? {}) as Invitation["extraConfig"],
    viewToken: row.view_token ?? null,
    viewCount: typeof row.view_count === "number" ? row.view_count : 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Parse a bilingual jsonb value into a Localized object. */
export function toLocalizedValue(value: unknown): Localized {
  return toLocalized(value);
}

export function mapRsvp(row: RsvpRow): Rsvp {
  return {
    id: row.id,
    invitationId: row.invitation_id,
    guestName: row.guest_name,
    status: row.status as RsvpStatus,
    guestsCount: row.guests_count,
    message: row.message,
    createdAt: row.created_at,
  };
}
