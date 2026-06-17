"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";
import { createRsvp, rsvpTag } from "@/lib/rsvps";
import { RSVP_STATUSES } from "@/types/invitation";

export type RsvpState = {
  ok: boolean;
  error?: "validation" | "server";
} | null;

const schema = z.object({
  invitationId: z.string().uuid(),
  guestName: z.string().trim().min(1).max(120),
  status: z.enum(RSVP_STATUSES),
  guestsCount: z.coerce.number().int().min(1).max(50),
  message: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .transform((v) => (v ? v : null)),
});

/** Server action wired to `useActionState` in the RSVP form. */
export async function submitRsvp(
  _prev: RsvpState,
  formData: FormData,
): Promise<RsvpState> {
  const parsed = schema.safeParse({
    invitationId: formData.get("invitationId"),
    guestName: formData.get("guestName"),
    status: formData.get("status"),
    guestsCount: formData.get("guestsCount"),
    message: formData.get("message") ?? "",
  });

  if (!parsed.success) {
    return { ok: false, error: "validation" };
  }

  try {
    await createRsvp({
      invitationId: parsed.data.invitationId,
      guestName: parsed.data.guestName,
      status: parsed.data.status,
      guestsCount: parsed.data.guestsCount,
      message: parsed.data.message,
    });
    // Refresh the admin dashboard's cached counts. The public page shows no RSVP
    // data, so it intentionally is NOT revalidated here (keeps it CDN-cached).
    revalidateTag(rsvpTag(parsed.data.invitationId));
    return { ok: true };
  } catch {
    return { ok: false, error: "server" };
  }
}
