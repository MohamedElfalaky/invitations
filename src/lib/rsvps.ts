import { createServerSupabase } from "@/lib/supabase/server";
import { mapRsvp, type RsvpRow } from "@/lib/mappers";
import type { Rsvp, RsvpCounts, RsvpStatus } from "@/types/invitation";

export const rsvpTag = (invitationId: string) => `rsvps:${invitationId}`;

const RSVP_COLUMNS =
  "id, invitation_id, guest_name, status, guests_count, message, created_at";

/** ADMIN: all responses for an invitation, newest first (authenticated). */
export async function listRsvpsForInvitation(
  invitationId: string,
): Promise<Rsvp[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("rsvps")
    .select(RSVP_COLUMNS)
    .eq("invitation_id", invitationId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapRsvp(row as RsvpRow));
}

/** Derive counts from a list of responses. */
export function computeCounts(rsvps: Rsvp[]): RsvpCounts {
  const counts: RsvpCounts = {
    attending: 0,
    declined: 0,
    maybe: 0,
    responses: rsvps.length,
    totalGuests: 0,
  };

  for (const r of rsvps) {
    counts[r.status as RsvpStatus] += 1;
    if (r.status === "attending") counts.totalGuests += r.guestsCount;
  }
  return counts;
}

export type CreateRsvpInput = {
  invitationId: string;
  guestName: string;
  status: RsvpStatus;
  guestsCount: number;
  message: string | null;
};

/**
 * Insert a guest RSVP. Uses the cookie-bound client which, for an anonymous
 * guest, acts as `anon` — allowed by the public INSERT policy on `rsvps`.
 */
export async function createRsvp(input: CreateRsvpInput): Promise<void> {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("rsvps").insert({
    invitation_id: input.invitationId,
    guest_name: input.guestName,
    status: input.status,
    guests_count: input.guestsCount,
    message: input.message,
  });
  if (error) throw error;
}
