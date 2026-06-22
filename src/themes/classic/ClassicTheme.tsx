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
 * Classic — elegant, cream & gold, serif typography, centered and ornamental.
 */
export function ClassicTheme({ invitation }: ThemeProps) {
  const { m, locale, localized } = useI18n();
  const display = locale === "ar" ? "font-arabic-serif" : "font-serif";

  const hostNames = localized(invitation.hostNames);
  const headline = localized(invitation.extraConfig.headline);
  const message = localized(invitation.extraConfig.invitation_message);

  return (
    <main className="min-h-dvh bg-[#faf7f2] text-[#2e2a23]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {invitation.heroImageUrl && (
          <div className="absolute inset-0">
            <Image
              src={invitation.heroImageUrl}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#faf7f2]/40 via-[#faf7f2]/70 to-[#faf7f2]" />
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative mx-auto flex max-w-2xl flex-col items-center px-6 py-24 text-center"
        >
          {headline && (
            <p
              className={`whitespace-pre-line text-sm text-[#a98b5d] ${
                locale === "ar" ? display : "uppercase tracking-[0.3em]"
              }`}
            >
              {headline}
            </p>
          )}
          <p className={`text-base opacity-70 ${headline ? "mt-4" : ""}`}>
            {m.invitedTo.replace("{event}", m.eventType[invitation.eventType])}
          </p>

          <h1
            className={`mt-3 whitespace-pre-line text-5xl leading-tight sm:text-6xl ${display}`}
          >
            {hostNames}
          </h1>

          <div className="my-6 flex items-center gap-3 text-[#a98b5d]">
            <span className="h-px w-12 bg-current" />
            <span aria-hidden>❦</span>
            <span className="h-px w-12 bg-current" />
          </div>

          <Countdown
            eventDate={invitation.eventDate}
            cellClassName="min-w-[4.5rem] rounded-2xl border border-[#e6dcc8] bg-white/70 px-4 py-3 text-center"
            numberClassName="text-3xl font-semibold tabular-nums text-[#a98b5d]"
            labelClassName="mt-1 text-xs uppercase tracking-wide opacity-60"
          />
        </motion.div>
      </section>

      <div className="mx-auto max-w-2xl space-y-16 px-6 pb-28">
        {message && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className={`whitespace-pre-line text-center text-2xl leading-relaxed text-[#5b5347] ${display}`}
          >
            {message}
          </motion.p>
        )}

        <Section>
          <SectionTitle className={display}>{m.details.title}</SectionTitle>
          <EventDetails
            invitation={invitation}
            cardClassName="rounded-2xl border border-[#e6dcc8] bg-white/70 p-5"
            buttonClassName="mt-3 inline-flex items-center gap-2 rounded-full bg-[#a98b5d] px-5 py-2 text-sm font-medium text-white transition hover:opacity-90"
          />
        </Section>

        {invitation.gallery.length > 0 && (
          <Section>
            <SectionTitle className={display}>{m.gallery.title}</SectionTitle>
            <Gallery images={invitation.gallery} />
          </Section>
        )}

        {invitation.rsvpEnabled && (
          <Section>
            <SectionTitle className={display}>{m.rsvp.title}</SectionTitle>
            <p className="mb-5 text-center opacity-70">{m.rsvp.subtitle}</p>
            <RsvpForm
              invitation={invitation}
              buttonClassName="w-full rounded-full bg-[#a98b5d] px-6 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-60"
            />
          </Section>
        )}
      </div>
    </main>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.section>
  );
}

function SectionTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={`mb-6 text-center text-3xl ${className}`}>{children}</h2>
  );
}
