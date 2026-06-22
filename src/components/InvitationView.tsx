"use client";

import { useEffect, useState } from "react";
import { EnvelopeIntro } from "@/components/EnvelopeIntro";
import { LanguageToggle } from "@/components/LanguageToggle";
import { MusicPlayer } from "@/components/MusicPlayer";
import { useI18n } from "@/i18n/I18nProvider";
import { THEMES } from "@/themes";
import type { Invitation } from "@/types/invitation";

/**
 * Renders the selected theme inside the i18n context, plus shared chrome
 * (language toggle, optional music). Direction is applied on the subtree so the
 * statically-rendered markup is correct before hydration.
 */
const WHATSAPP_NUMBER = "201044378234";

export function InvitationView({ invitation }: { invitation: Invitation }) {
  const { dir, m } = useI18n();
  const Theme = THEMES[invitation.theme] ?? THEMES.classic;

  // The invitation link is only known in the browser; capture it after mount
  // so the WhatsApp message arrives pre-filled with the page the guest came from.
  const [pageUrl, setPageUrl] = useState("");
  useEffect(() => setPageUrl(window.location.href), []);

  const message = pageUrl
    ? `${m.footer.prefill}\n${pageUrl}`
    : m.footer.prefill;
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    message,
  )}`;

  return (
    <EnvelopeIntro>
      <div dir={dir} className="relative">
        <div className="fixed top-4 end-4 z-40">
          <LanguageToggle />
        </div>

        <Theme invitation={invitation} />

        <footer className="border-t border-black/10 bg-black/[0.03] px-6 py-10 text-center">
          <p className="text-sm opacity-70">{m.footer.cta}</p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#25d366] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden
              className="h-4 w-4 fill-current"
            >
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.23 8.23 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.25 8.24Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43-.14-.01-.31-.01-.48-.01a.92.92 0 0 0-.66.31c-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" />
            </svg>
            {m.footer.contact}
          </a>
        </footer>

        {invitation.musicUrl && <MusicPlayer src={invitation.musicUrl} />}
      </div>
    </EnvelopeIntro>
  );
}
