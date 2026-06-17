import Link from "next/link";
import { signOut } from "@/app/actions/auth";

/** Top bar for authenticated admin pages (not shown on the login screen). */
export function AdminHeader() {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/admin" className="text-lg font-semibold">
          💌 Invitations Admin
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-full border border-neutral-300 px-4 py-1.5 text-sm font-medium hover:bg-neutral-100"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
