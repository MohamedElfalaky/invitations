"use client";

import { useI18n } from "@/i18n/I18nProvider";

/**
 * Instant EN/AR switch. Renders nothing if the invitation only supports one
 * language. Switching flips the whole page direction with no navigation.
 */
export function LanguageToggle({ className = "" }: { className?: string }) {
  const { available, m, toggle } = useI18n();

  if (available.length < 2) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${m.otherLocaleName}`}
      className={`rounded-full border border-black/10 bg-white/70 px-4 py-1.5 text-sm font-medium text-ink shadow-sm backdrop-blur transition hover:bg-white ${className}`}
    >
      {m.otherLocaleName}
    </button>
  );
}
