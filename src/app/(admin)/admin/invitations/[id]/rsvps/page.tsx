import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { CopyLinkButton } from "@/components/admin/CopyLinkButton";
import { getInvitationById } from "@/lib/invitations";
import { computeCounts, listRsvpsForInvitation } from "@/lib/rsvps";
import type { RsvpStatus } from "@/types/invitation";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<RsvpStatus, string> = {
  attending: "Attending",
  declined: "Declined",
  maybe: "Maybe",
};

const STATUS_STYLE: Record<RsvpStatus, string> = {
  attending: "bg-green-100 text-green-700",
  declined: "bg-red-100 text-red-700",
  maybe: "bg-amber-100 text-amber-700",
};

export default async function RsvpDashboard({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invitation = await getInvitationById(id);
  if (!invitation) notFound();

  const rsvps = await listRsvpsForInvitation(id);
  const counts = computeCounts(rsvps);

  const hostName = invitation.hostNames.en || invitation.hostNames.ar || invitation.slug;

  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <Link href="/admin" className="text-sm text-neutral-500 hover:underline">
          ← Back to invitations
        </Link>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">RSVPs — {hostName}</h1>
            <p className="text-sm text-neutral-500">/i/{invitation.slug}</p>
          </div>
          <CopyLinkButton path={`/i/${invitation.slug}`} label="Copy invitation link" />
        </div>

        {/* Private host link: share with the event host so they can watch the
            numbers live without an admin login. */}
        {invitation.viewToken && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e6dcc8] bg-[#faf7f2] p-4">
            <div className="text-sm">
              <p className="font-medium text-[#2e2a23]">
                Host link — live RSVP summary (no login)
              </p>
              <p className="text-neutral-500">
                Private, read-only. Share only with the event host.
              </p>
            </div>
            <CopyLinkButton
              path={`/r/${invitation.viewToken}`}
              label="Copy host link"
              className="rounded-full bg-[#a98b5d] px-4 py-2 text-xs font-medium text-white hover:opacity-90"
            />
          </div>
        )}

        {/* Counts */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Attending" value={counts.attending} accent="text-green-600" />
          <StatCard label="Maybe" value={counts.maybe} accent="text-amber-600" />
          <StatCard label="Declined" value={counts.declined} accent="text-red-600" />
          <StatCard label="Total guests" value={counts.totalGuests} accent="text-neutral-900" />
        </div>

        {/* Responses */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          {rsvps.length === 0 ? (
            <p className="p-10 text-center text-neutral-500">No responses yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-500">
                <tr>
                  <th className="px-4 py-3 text-start font-medium">Guest</th>
                  <th className="px-4 py-3 text-start font-medium">Status</th>
                  <th className="px-4 py-3 text-start font-medium">Guests</th>
                  <th className="px-4 py-3 text-start font-medium">Message</th>
                  <th className="px-4 py-3 text-start font-medium">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {rsvps.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 font-medium">{r.guestName}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[r.status]}`}
                      >
                        {STATUS_LABEL[r.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{r.guestsCount}</td>
                    <td className="px-4 py-3 text-neutral-600">{r.message ?? "—"}</td>
                    <td className="px-4 py-3 text-neutral-500">
                      {new Date(r.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className={`text-3xl font-bold ${accent}`}>{value}</div>
      <div className="mt-1 text-sm text-neutral-500">{label}</div>
    </div>
  );
}
