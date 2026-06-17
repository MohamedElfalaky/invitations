"use client";

import { useTransition } from "react";
import { removeInvitation } from "@/app/actions/invitations";

/** Deletes an invitation after a confirmation prompt. */
export function DeleteInvitationButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const [pending, startTransition] = useTransition();

  function onDelete() {
    if (!confirm(`Delete invitation for "${name}"? This cannot be undone.`)) {
      return;
    }
    startTransition(() => removeInvitation(id));
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={pending}
      className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
