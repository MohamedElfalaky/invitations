"use client";

import { I18nProvider, useI18n } from "@/i18n/I18nProvider";
import { LanguageToggle } from "@/components/LanguageToggle";
import { THEMES } from "@/themes";
import type { Invitation, Locale } from "@/types/invitation";

function PreviewInner({ invitation }: { invitation: Invitation }) {
  const { dir } = useI18n();
  const Theme = THEMES[invitation.theme] ?? THEMES.classic;

  return (
    <div dir={dir} className="relative">
      <div className="absolute end-3 top-3 z-10">
        <LanguageToggle />
      </div>
      <Theme invitation={invitation} />
    </div>
  );
}

/**
 * Live, scrollable mobile-width preview of the actual theme using the in-progress
 * form data. `manageDocument={false}` keeps it from flipping the admin page's
 * direction; `persist={false}` keeps the preview's locale separate.
 */
export function ThemePreview({ invitation }: { invitation: Invitation }) {
  const available: Locale[] = invitation.languages.length
    ? invitation.languages
    : ["ar"];
  const defaultLocale: Locale = available.includes("ar") ? "ar" : available[0];

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-300 bg-white shadow-sm">
      <div className="flex items-center gap-1.5 border-b border-neutral-200 bg-neutral-100 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
        <span className="ms-2 text-xs text-neutral-500">Live preview</span>
      </div>
      <div className="h-[70vh] overflow-y-auto">
        <I18nProvider
          available={available}
          defaultLocale={defaultLocale}
          manageDocument={false}
          persist={false}
        >
          <PreviewInner invitation={invitation} />
        </I18nProvider>
      </div>
    </div>
  );
}
