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
 * Modern — minimalist, full-bleed dark hero, bold sans-serif, generous space.
 */
export function ModernTheme({ invitation }: ThemeProps) {
  const { m, locale, localized } = useI18n();
  const display = locale === "ar" ? "font-arabic-sans" : "font-sans";

  const hostNames = localized(invitation.hostNames);
  const message = localized(invitation.extraConfig.invitation_message);

  return (
    <main className={`min-h-dvh bg-neutral-950 text-neutral-100 ${display}`}>
      {/* Full-bleed hero */}
      <section className="relative flex min-h-dvh flex-col justify-end overflow-hidden">
        {invitation.heroImageUrl ? (
          <Image
            src={invitation.heroImageUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/50 to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-3xl px-6 pb-20"
        >
          <p className="text-sm font-medium uppercase tracking-[0.35em] text-neutral-400">
            {m.eventType[invitation.eventType]}
          </p>
          <h1 className="mt-4 text-6xl font-bold leading-none sm:text-7xl">
            {hostNames}
          </h1>
          <div className="mt-10">
            <Countdown
              eventDate={invitation.eventDate}
              className="justify-start"
              cellClassName="min-w-[4.25rem] rounded-lg bg-white/10 px-4 py-3 text-center backdrop-blur"
              numberClassName="text-2xl font-bold tabular-nums"
              labelClassName="mt-1 text-[0.65rem] uppercase tracking-wider text-neutral-400"
            />
          </div>
        </motion.div>
      </section>

      <div className="mx-auto max-w-3xl space-y-24 px-6 py-24">
        {message && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-xl text-2xl font-light leading-relaxed text-neutral-300"
          >
            {message}
          </motion.p>
        )}

        <Section title={m.details.title}>
          <EventDetails
            invitation={invitation}
            cardClassName="rounded-2xl border border-white/10 bg-white/5 p-6"
            buttonClassName="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200"
          />
        </Section>

        {invitation.gallery.length > 0 && (
          <Section title={m.gallery.title}>
            <Gallery images={invitation.gallery} />
          </Section>
        )}

        {invitation.rsvpEnabled && (
          <Section title={m.rsvp.title}>
            <p className="mb-6 text-neutral-400">{m.rsvp.subtitle}</p>
            <RsvpForm
              invitation={invitation}
              inputClassName="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-start text-neutral-100 outline-none transition placeholder:text-neutral-500 focus:border-white/50"
              buttonClassName="w-full rounded-full bg-white px-6 py-3 font-semibold text-neutral-950 transition hover:bg-neutral-200 disabled:opacity-60"
            />
          </Section>
        )}
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="mb-6 text-sm font-semibold uppercase tracking-[0.25em] text-neutral-500">
        {title}
      </h2>
      {children}
    </motion.section>
  );
}
