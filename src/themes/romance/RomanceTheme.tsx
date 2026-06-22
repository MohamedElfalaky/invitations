"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Countdown } from "@/components/Countdown";
import { EventDetails } from "@/components/EventDetails";
import { Gallery } from "@/components/Gallery";
import { RsvpForm } from "@/components/RsvpForm";
import { useI18n } from "@/i18n/I18nProvider";
import type { ThemeProps } from "@/types/invitation";

/**
 * Romance — soft cream & floral, delicate serif/script typography, shimmering
 * gold-foil accents, a full-bleed photo hero that reveals with a slow fade, and
 * hand-drawn floral dividers framing every section.
 */
export function RomanceTheme({ invitation }: ThemeProps) {
  const { m, locale, localized } = useI18n();
  const display = locale === "ar" ? "font-arabic-serif" : "font-serif";

  const hostNames = localized(invitation.hostNames);
  const headline = localized(invitation.extraConfig.headline);
  const message = localized(invitation.extraConfig.invitation_message);

  return (
    <main className={`min-h-dvh bg-[#f8f2e9] text-[#5a4d3f] ${display}`}>
      {/* Full-bleed photo hero */}
      <section className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-20 text-center">
        {invitation.heroImageUrl ? (
          <>
            <motion.div
              initial={{ scale: 1.08, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.6, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <Image
                src={invitation.heroImageUrl}
                alt=""
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            </motion.div>
            {/* Warm cream vignette so the text stays legible over any photo */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#2b2118]/45 via-[#2b2118]/25 to-[#f8f2e9]" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-[#efe3d2] via-[#f4ebdd] to-[#f8f2e9]" />
        )}

        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.22, delayChildren: 0.5 } },
          }}
          className={`relative flex w-full max-w-2xl flex-col items-center ${
            invitation.heroImageUrl ? "text-[#fdfaf4]" : ""
          }`}
        >
          <motion.p
            variants={fadeUp}
            className="text-xs uppercase tracking-[0.4em] sm:text-sm"
          >
            {headline ||
              m.invitedTo.replace("{event}", m.eventType[invitation.eventType])}
          </motion.p>

          <motion.div variants={fadeUp}>
            <FloralDivider className="my-6 w-44 text-[#d9b15e]" />
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-5xl leading-tight sm:text-7xl"
          >
            <GoldText>{hostNames}</GoldText>
          </motion.h1>

          <motion.div variants={fadeUp} className="mt-12">
            <Countdown
              eventDate={invitation.eventDate}
              cellClassName="min-w-[4.5rem] rounded-2xl border border-[#d9b15e]/50 bg-white/15 px-4 py-3 text-center backdrop-blur-sm"
              numberClassName="text-3xl font-semibold tabular-nums text-[#f0d79a]"
              labelClassName="mt-1 text-xs uppercase tracking-wide opacity-80"
            />
          </motion.div>
        </motion.div>
      </section>

      <div className="mx-auto max-w-2xl space-y-16 px-6 pb-28 pt-4">
        {message && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-2xl leading-relaxed text-[#6b5d4c]"
          >
            {message}
          </motion.p>
        )}

        <Section>
          <SectionTitle>{m.details.title}</SectionTitle>
          <EventDetails
            invitation={invitation}
            cardClassName="rounded-2xl border border-[#e3d4bb] bg-white/70 p-5 shadow-sm"
            buttonClassName="mt-3 inline-flex items-center gap-2 rounded-full bg-[#c9a14a] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#b78f3c]"
          />
        </Section>

        {invitation.gallery.length > 0 && (
          <Section>
            <SectionTitle>{m.gallery.title}</SectionTitle>
            <Gallery images={invitation.gallery} imageClassName="rounded-2xl" />
          </Section>
        )}

        {invitation.rsvpEnabled && (
          <Section>
            <SectionTitle>{m.rsvp.title}</SectionTitle>
            <p className="mb-5 text-center text-[#6b5d4c] opacity-80">
              {m.rsvp.subtitle}
            </p>
            <div className="rounded-3xl border border-[#e3d4bb] bg-white/70 p-6 shadow-sm">
              <RsvpForm
                invitation={invitation}
                inputClassName="w-full rounded-xl border border-[#e3d4bb] bg-white px-4 py-2.5 text-start outline-none transition focus:border-[#c9a14a]"
                buttonClassName="w-full rounded-full bg-[#c9a14a] px-6 py-3 font-medium text-white transition hover:bg-[#b78f3c] disabled:opacity-60"
              />
            </div>
          </Section>
        )}
      </div>
    </main>
  );
}

/** Staggered child: slow rise + fade, the "letter unfolding" entrance. */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function Section({ children }: { children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7 }}
    >
      {children}
    </motion.section>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col items-center">
      <h2 className="text-3xl">
        <GoldText>{children}</GoldText>
      </h2>
      <FloralDivider className="mt-4 w-32 text-[#c9a14a]" />
    </div>
  );
}

/**
 * Shimmering gold-foil text. A metallic gradient is clipped to the glyphs and
 * the `shimmer` keyframe (defined in tailwind.config) sweeps the highlight
 * across, giving a subtle foil-stamp glint.
 */
function GoldText({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="animate-shimmer bg-[length:200%_100%] bg-clip-text text-transparent"
      style={{
        backgroundImage:
          "linear-gradient(110deg, #a87d2e 0%, #e6c878 25%, #fff4d6 50%, #e6c878 75%, #a87d2e 100%)",
      }}
    >
      {children}
    </span>
  );
}

/** Hand-drawn floral sprig divider — two leafy stems meeting at a centre bud. */
function FloralDivider({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 24"
      fill="none"
      aria-hidden
      className={className}
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    >
      {/* centre stems */}
      <path d="M100 4v16" />
      <path d="M70 12h60" />
      {/* left leaves */}
      <path d="M90 12c-6-4-14-4-20 0 6 4 14 4 20 0Z" fill="currentColor" fillOpacity="0.25" />
      <path d="M78 12c-4-3-10-3-14 0 4 3 10 3 14 0Z" fill="currentColor" fillOpacity="0.25" />
      {/* right leaves */}
      <path d="M110 12c6-4 14-4 20 0-6 4-14 4-20 0Z" fill="currentColor" fillOpacity="0.25" />
      <path d="M122 12c4-3 10-3 14 0-4 3-10 3-14 0Z" fill="currentColor" fillOpacity="0.25" />
      {/* centre bud */}
      <circle cx="100" cy="12" r="3" fill="currentColor" fillOpacity="0.55" />
    </svg>
  );
}
