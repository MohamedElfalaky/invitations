import type { Metadata } from "next";
import { fontVariables } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Invitations",
  description: "Beautiful bilingual digital invitations.",
};

// Arabic-first product: the document defaults to RTL/Arabic. The public page's
// client i18n provider flips this instantly on toggle; the admin area overrides
// to LTR within its own layout.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
