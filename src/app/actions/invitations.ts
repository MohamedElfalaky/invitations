"use server";

import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import type { Invitation } from "@/types/invitation";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  createInvitation,
  deleteInvitation,
  generateUniqueSlug,
  getInvitationById,
  invitationTag,
  updateInvitation,
  type InvitationInput,
} from "@/lib/invitations";
import { slugify } from "@/lib/slug";

async function requireAuth() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
}

function revalidateInvitation(slug: string) {
  revalidatePath(`/i/${slug}`);
  revalidateTag(invitationTag(slug));
}

export type SavePayload = { id?: string; input: InvitationInput };
export type SaveResult =
  | { ok: true; invitation: Invitation }
  | { ok: false; error: string };

/**
 * Create or update an invitation, enforce slug uniqueness, then revalidate the
 * affected public page(s) + the admin list. Returns the saved row (the client
 * navigates to the dashboard on success).
 */
export async function saveInvitation(payload: SavePayload): Promise<SaveResult> {
  await requireAuth();

  try {
    const { id, input } = payload;

    const base =
      slugify(input.slug) ||
      slugify(input.hostNames.en) ||
      slugify(input.hostNames.ar) ||
      "invitation";
    const slug = await generateUniqueSlug(base, id);
    const finalInput: InvitationInput = { ...input, slug };

    let saved: Invitation;
    if (id) {
      const prev = await getInvitationById(id);
      saved = await updateInvitation(id, finalInput);
      revalidateInvitation(saved.slug);
      if (prev && prev.slug !== saved.slug) revalidateInvitation(prev.slug);
    } else {
      saved = await createInvitation(finalInput);
      revalidateInvitation(saved.slug);
    }

    revalidatePath("/admin");
    return { ok: true, invitation: saved };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to save" };
  }
}

/** Delete an invitation and refresh caches. */
export async function removeInvitation(id: string): Promise<void> {
  await requireAuth();
  const prev = await getInvitationById(id);
  await deleteInvitation(id);
  if (prev) revalidateInvitation(prev.slug);
  revalidatePath("/admin");
}
