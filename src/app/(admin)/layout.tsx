import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin · Invitations",
};

/** The admin area is always English / LTR, regardless of the document default. */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div dir="ltr" lang="en" className="min-h-dvh bg-neutral-50 font-sans text-neutral-900">
      {children}
    </div>
  );
}
