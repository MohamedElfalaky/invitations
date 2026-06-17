import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { CopyLinkButton } from "@/components/admin/CopyLinkButton";
import { DeleteInvitationButton } from "@/components/admin/DeleteInvitationButton";
import { listInvitations } from "@/lib/invitations";

// Always render fresh for the admin (reads the authenticated session).
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const invitations = await listInvitations();

  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Invitations</h1>
            <p className="text-sm text-neutral-500">
              {invitations.length} total
            </p>
          </div>
          <Link
            href="/admin/invitations/new"
            className="rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
          >
            + New invitation
          </Link>
        </div>

        {invitations.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-neutral-300 p-12 text-center text-neutral-500">
            No invitations yet. Create your first one.
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            <table className="w-full text-start text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-500">
                <tr>
                  <th className="px-4 py-3 text-start font-medium">Hosts</th>
                  <th className="px-4 py-3 text-start font-medium">Date</th>
                  <th className="px-4 py-3 text-start font-medium">Theme</th>
                  <th className="px-4 py-3 text-start font-medium">RSVPs</th>
                  <th className="px-4 py-3 text-end font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {invitations.map((inv) => (
                  <tr key={inv.id} className="align-middle">
                    <td className="px-4 py-3">
                      <div className="font-medium">
                        {inv.hostNames.en || inv.hostNames.ar || "—"}
                      </div>
                      <div className="text-xs text-neutral-400">/i/{inv.slug}</div>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {new Date(inv.eventDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs capitalize">
                        {inv.theme}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{inv.rsvpCount}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Link
                          href={`/i/${inv.slug}`}
                          target="_blank"
                          className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-100"
                        >
                          View
                        </Link>
                        <CopyLinkButton path={`/i/${inv.slug}`} />
                        <Link
                          href={`/admin/invitations/${inv.id}/rsvps`}
                          className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-100"
                        >
                          RSVPs
                        </Link>
                        <Link
                          href={`/admin/invitations/${inv.id}/edit`}
                          className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-100"
                        >
                          Edit
                        </Link>
                        <DeleteInvitationButton
                          id={inv.id}
                          name={inv.hostNames.en || inv.hostNames.ar || inv.slug}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
