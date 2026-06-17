import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { I18nProvider } from "@/i18n/I18nProvider";
import { InvitationView } from "@/components/InvitationView";
import { getInvitationBySlug } from "@/lib/invitations";
import type { Locale } from "@/types/invitation";

// Statically rendered and cached in the Full Route Cache (served from the CDN).
// Unknown slugs render on demand, then cache. The DB is only queried at
// (re)generation time — never on a per-guest visit.
export const dynamic = "force-static";
export const dynamicParams = true;

type Params = { params: Promise<{ slug: string }> };

function pickDefaultLocale(available: Locale[]): Locale {
  return available.includes("ar") ? "ar" : (available[0] ?? "en");
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const invitation = await getInvitationBySlug(slug);
  if (!invitation) return { title: "Invitation not found" };

  const name = invitation.hostNames.ar || invitation.hostNames.en || "Invitation";
  const description =
    invitation.extraConfig.invitation_message?.ar ||
    invitation.extraConfig.invitation_message?.en ||
    undefined;

  // The link-preview image (WhatsApp/Twitter/iMessage): the dedicated share
  // cover if set, otherwise the hero image.
  const shareImage =
    invitation.extraConfig.share_image_url || invitation.heroImageUrl;
  const images = shareImage
    ? [{ url: shareImage, width: 1200, height: 630, alt: name }]
    : undefined;

  return {
    title: name,
    description,
    openGraph: {
      type: "website",
      title: name,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description,
      images: shareImage ? [shareImage] : undefined,
    },
  };
}

export default async function InvitationPage({ params }: Params) {
  const { slug } = await params;
  const invitation = await getInvitationBySlug(slug);
  if (!invitation) notFound();

  const available = invitation.languages;
  const defaultLocale = pickDefaultLocale(available);

  return (
    <I18nProvider available={available} defaultLocale={defaultLocale}>
      <InvitationView invitation={invitation} />
    </I18nProvider>
  );
}
