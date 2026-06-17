import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { InvitationForm } from "@/components/admin/InvitationForm";
import { getInvitationById } from "@/lib/invitations";

export const dynamic = "force-dynamic";

export default async function EditInvitationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invitation = await getInvitationById(id);
  if (!invitation) notFound();

  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <Link href="/admin" className="text-sm text-neutral-500 hover:underline">
          ← Back to invitations
        </Link>
        <h1 className="mb-6 mt-2 text-2xl font-semibold">
          Edit invitation
        </h1>
        <InvitationForm invitation={invitation} />
      </main>
    </>
  );
}
