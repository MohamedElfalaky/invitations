/**
 * Shared domain types used everywhere: themes, admin forms, server actions and
 * the data layer all consume these. Keep this file as the single source of truth
 * for the shape of an invitation.
 */

export type Locale = "en" | "ar";

/** A bilingual string. Both languages are always present (one may be empty). */
export type Localized = {
  en: string;
  ar: string;
};

export const THEME_KEYS = ["classic", "modern", "playful", "romance"] as const;
export type ThemeKey = (typeof THEME_KEYS)[number];

export const EVENT_TYPES = [
  "wedding",
  "engagement",
  "birthday",
  "graduation",
  "party",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const RSVP_STATUSES = ["attending", "declined", "maybe"] as const;
export type RsvpStatus = (typeof RSVP_STATUSES)[number];

/**
 * Free-form, theme-readable extras kept in the `extra_config` jsonb column so we
 * never need a migration to add a presentational field.
 */
export type ExtraConfig = {
  /** Localized free-text headline shown at the top of the hero, above the invitation line. */
  headline?: Localized;
  /** Localized invitation body copy shown under the hero. */
  invitation_message?: Localized;
  /** Optional localized venue override (otherwise the plain text columns are used). */
  venue?: Localized;
  /** Localized dress code / notes. */
  note?: Localized;
  /**
   * Image shown in the link preview when the invitation is shared (WhatsApp,
   * Twitter/X, iMessage, …) — the Open Graph image. Falls back to the hero
   * image when not set. Best at ~1200×630.
   */
  share_image_url?: string;
};

/** The canonical invitation shape (camelCase, app-facing). */
export type Invitation = {
  id: string;
  slug: string;
  theme: ThemeKey;
  hostNames: Localized;
  eventType: EventType;
  /** ISO 8601 timestamp (UTC) for the event. */
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
  /**
   * Secret token for the private host-summary link (/r/<token>). Only populated
   * for admin reads — it is deliberately NOT selected for public invitation
   * pages, so it never leaks into a guest-facing bundle.
   */
  viewToken: string | null;
  /**
   * Total times the public invitation page has been opened. Populated for admin
   * reads only (0 on public reads, which never select it).
   */
  viewCount: number;
  createdAt: string;
  updatedAt: string;
};

export type Rsvp = {
  id: string;
  invitationId: string;
  guestName: string;
  status: RsvpStatus;
  guestsCount: number;
  message: string | null;
  createdAt: string;
};

export type RsvpCounts = {
  attending: number;
  declined: number;
  maybe: number;
  /** Total responses (rows). */
  responses: number;
  /** Sum of guests_count across attending responses. */
  totalGuests: number;
};

/** The shape every theme component receives. Adding a theme = consume this prop. */
export type ThemeProps = {
  invitation: Invitation;
};
