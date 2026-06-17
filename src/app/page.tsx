import Link from "next/link";

/** Minimal landing page. The product itself lives at /i/[slug] and /admin. */
export default function Home() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[#faf7f2] px-6 text-center text-[#2e2a23]">
      <div className="max-w-md">
        <p className="text-5xl" aria-hidden>
          💌
        </p>
        <h1 className="mt-4 font-serif text-4xl">Digital Invitations</h1>
        <p className="mt-3 opacity-70">
          Beautiful, bilingual invitations — each with its own shareable link.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/i/demo-wedding"
            className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-white"
          >
            View demo invitation
          </Link>
          <Link
            href="/admin"
            className="rounded-full border border-black/15 px-6 py-2.5 text-sm font-medium"
          >
            Admin
          </Link>
        </div>
      </div>
    </main>
  );
}
