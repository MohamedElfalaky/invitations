import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { InvitationForm } from "@/components/admin/InvitationForm";

export const dynamic = "force-dynamic";

export default function NewInvitationPage() {
  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <Link href="/admin" className="text-sm text-neutral-500 hover:underline">
          ← Back to invitations
        </Link>
        <h1 className="mb-6 mt-2 text-2xl font-semibold">New invitation</h1>
        <InvitationForm />
      </main>
    </>
  );
}
