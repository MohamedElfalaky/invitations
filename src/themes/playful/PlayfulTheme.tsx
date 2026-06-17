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
 * Playful — bright gradients, rounded shapes, bouncy spring animations.
 */
export function PlayfulTheme({ invitation }: ThemeProps) {
  const { m, locale, localized } = useI18n();
  const display = locale === "ar" ? "font-arabic-sans" : "font-sans";

  const hostNames = localized(invitation.hostNames);
  const message = localized(invitation.extraConfig.invitation_message);

  return (
    <main
      className={`min-h-dvh bg-gradient-to-br from-rose-100 via-amber-50 to-sky-100 text-slate-800 ${display}`}
    >
      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-20">
        <div className="pointer-events-none absolute -start-10 -top-10 h-48 w-48 rounded-full bg-rose-300/40 blur-2xl" />
        <div className="pointer-events-none absolute -end-10 top-32 h-56 w-56 rounded-full bg-sky-300/40 blur-2xl" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 14 }}
          className="relative mx-auto flex max-w-2xl flex-col items-center text-center"
        >
          <span className="rounded-full bg-white/70 px-4 py-1.5 text-sm font-bold text-rose-500 shadow-sm">
            🎉 {m.eventType[invitation.eventType]}
          </span>

          {invitation.heroImageUrl && (
            <motion.div
              initial={{ rotate: -4, y: 20, opacity: 0 }}
              animate={{ rotate: -4, y: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="relative mt-8 aspect-square w-52 overflow-hidden rounded-[2rem] border-4 border-white shadow-xl"
            >
              <Image
                src={invitation.heroImageUrl}
                alt=""
                fill
                priority
                sizes="208px"
                className="object-cover"
              />
            </motion.div>
          )}

          <h1 className="mt-8 text-5xl font-extrabold leading-tight text-slate-900 sm:text-6xl">
            {hostNames}
          </h1>
          <p className="mt-3 text-lg text-slate-600">{m.invited}</p>

          <div className="mt-8">
            <Countdown
              eventDate={invitation.eventDate}
              cellClassName="min-w-[4.5rem] rounded-2xl bg-white px-4 py-3 text-center shadow-md"
              numberClassName="text-3xl font-extrabold tabular-nums text-rose-500"
              labelClassName="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400"
            />
          </div>
        </motion.div>
      </section>

      <div className="mx-auto max-w-2xl space-y-16 px-6 pb-28">
        {message && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-white/70 p-6 text-center text-xl font-medium leading-relaxed text-slate-700 shadow-sm"
          >
            {message}
          </motion.p>
        )}

        <Section title={m.details.title}>
          <EventDetails
            invitation={invitation}
            cardClassName="rounded-3xl bg-white p-6 shadow-md"
            buttonClassName="mt-3 inline-flex items-center gap-2 rounded-full bg-rose-500 px-5 py-2 text-sm font-bold text-white transition hover:bg-rose-600"
          />
        </Section>

        {invitation.gallery.length > 0 && (
          <Section title={m.gallery.title}>
            <Gallery images={invitation.gallery} imageClassName="rounded-2xl" />
          </Section>
        )}

        {invitation.rsvpEnabled && (
          <Section title={m.rsvp.title}>
            <p className="mb-5 text-center text-slate-600">{m.rsvp.subtitle}</p>
            <div className="rounded-3xl bg-white p-6 shadow-md">
              <RsvpForm
                invitation={invitation}
                buttonClassName="w-full rounded-full bg-rose-500 px-6 py-3 font-bold text-white transition hover:bg-rose-600 disabled:opacity-60"
              />
            </div>
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
      transition={{ type: "spring", stiffness: 90, damping: 16 }}
    >
      <h2 className="mb-6 text-center text-3xl font-extrabold text-slate-900">
        {title}
      </h2>
      {children}
    </motion.section>
  );
}
