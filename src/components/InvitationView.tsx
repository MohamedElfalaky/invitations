"use client";

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
export function InvitationView({ invitation }: { invitation: Invitation }) {
  const { dir } = useI18n();
  const Theme = THEMES[invitation.theme] ?? THEMES.classic;

  return (
    <div dir={dir} className="relative">
      <div className="fixed top-4 end-4 z-40">
        <LanguageToggle />
      </div>

      <Theme invitation={invitation} />

      {invitation.musicUrl && <MusicPlayer src={invitation.musicUrl} />}
    </div>
  );
}
