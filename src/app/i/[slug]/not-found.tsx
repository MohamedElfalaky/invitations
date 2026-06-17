import Link from "next/link";

/** Graceful 404 for an unknown invitation slug (bilingual, no JS needed). */
export default function InvitationNotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[#faf7f2] px-6 text-center text-[#2e2a23]">
      <div>
        <p className="text-6xl" aria-hidden>
          💌
        </p>
        <h1 className="mt-4 text-3xl font-semibold">
          الدعوة غير موجودة
        </h1>
        <p className="mt-1 text-lg opacity-70">Invitation not found</p>
        <p className="mt-4 max-w-sm opacity-70">
          قد يكون الرابط غير صحيح أو تمت إزالة الدعوة.
          <br />
          This link may be incorrect or the invitation was removed.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-white"
        >
          الرئيسية / Home
        </Link>
      </div>
    </main>
  );
}
