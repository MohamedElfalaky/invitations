import type { ComponentType } from "react";
import type { ThemeKey, ThemeProps } from "@/types/invitation";
import { ClassicTheme } from "./classic/ClassicTheme";
import { ModernTheme } from "./modern/ModernTheme";
import { PlayfulTheme } from "./playful/PlayfulTheme";
import { RomanceTheme } from "./romance/RomanceTheme";

/**
 * Theme registry. To add a new theme:
 *   1. Create `themes/<name>/<Name>Theme.tsx` exporting a component of type
 *      `ComponentType<ThemeProps>`.
 *   2. Add it here.
 *   3. Add the key to `THEME_KEYS` in `types/invitation.ts` and the DB CHECK
 *      constraint (migration).
 */
export const THEMES: Record<ThemeKey, ComponentType<ThemeProps>> = {
  classic: ClassicTheme,
  modern: ModernTheme,
  playful: PlayfulTheme,
  romance: RomanceTheme,
};

/** Human-friendly labels for the admin theme picker. */
export const THEME_LABELS: Record<ThemeKey, string> = {
  classic: "Classic",
  modern: "Modern",
  playful: "Playful",
  romance: "Romance",
};
