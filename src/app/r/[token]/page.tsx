import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getHostSummary } from "@/lib/rsvps";
import type { RsvpStatus } from "@/types/invitation";

// Always fresh — the host wants live numbers. Uses the anon client (no cookies),
// gated entirely by the secret token in the URL.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ملخص الحضور · RSVP summary",
  robots: { index: false, follow: false },
};

const STATUS = {
  attending: { ar: "سيحضر", en: "Attending", style: "bg-green-100 text-green-700" },
  maybe: { ar: "ربما", en: "Maybe", style: "bg-amber-100 text-amber-700" },
  declined: { ar: "اعتذر", en: "Declined", style: "bg-red-100 text-red-700" },
} satisfies Record<RsvpStatus, { ar: string; en: string; style: string }>;

export default async function HostSummaryPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const summary = await getHostSummary(token);
  if (!summary) notFound();

  const { counts, rsvps } = summary;
  const hostName = summary.hostNames.ar || summary.hostNames.en;
  const dateLabel = new Intl.DateTimeFormat("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(summary.eventDate));

  return (
    <main dir="rtl" className="min-h-dvh bg-[#faf7f2] px-5 py-10 text-[#2e2a23]">
      <div className="mx-auto max-w-3xl">
        <header className="text-center">
          <p className="text-sm opacity-60">ملخص تأكيد الحضور · RSVP summary</p>
          <h1 className="mt-1 font-arabic-serif text-3xl">{hostName}</h1>
          <p className="mt-1 opacity-70">{dateLabel}</p>
        </header>

        {/* Counts */}
        <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat value={counts.attending} ar="سيحضر" en="Attending" accent="text-green-600" />
          <Stat value={counts.maybe} ar="ربما" en="Maybe" accent="text-amber-600" />
          <Stat value={counts.declined} ar="اعتذر" en="Declined" accent="text-red-600" />
          <Stat value={counts.totalGuests} ar="إجمالي الأشخاص" en="Total guests" accent="text-[#a98b5d]" />
        </section>

        {/* Responses */}
        <section className="mt-8 overflow-hidden rounded-2xl border border-[#e6dcc8] bg-white">
          {rsvps.length === 0 ? (
            <p className="p-10 text-center opacity-60">
              لا توجد ردود بعد · No responses yet
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-[#e6dcc8] bg-[#faf7f2] text-start opacity-70">
                <tr>
                  <th className="px-4 py-3 text-start font-medium">الاسم · Name</th>
                  <th className="px-4 py-3 text-start font-medium">الحالة · Status</th>
                  <th className="px-4 py-3 text-start font-medium">العدد · Guests</th>
                  <th className="px-4 py-3 text-start font-medium">رسالة · Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0e9da]">
                {rsvps.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 font-medium">{r.guestName}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS[r.status].style}`}>
                        {STATUS[r.status].ar}
                      </span>
                    </td>
                    <td className="px-4 py-3 opacity-80">{r.guestsCount}</td>
                    <td className="px-4 py-3 opacity-80">{r.message ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <p className="mt-6 text-center text-xs opacity-50">
          هذا الرابط خاص — لا تشاركه إلا مع أصحاب الدعوة · This link is private.
        </p>
      </div>
    </main>
  );
}

function Stat({
  value,
  ar,
  en,
  accent,
}: {
  value: number;
  ar: string;
  en: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e6dcc8] bg-white p-4 text-center">
      <div className={`text-3xl font-bold ${accent}`}>{value}</div>
      <div className="mt-1 text-xs opacity-60">
        {ar} · {en}
      </div>
    </div>
  );
}
