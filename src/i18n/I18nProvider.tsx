"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Locale, Localized } from "@/types/invitation";
import { messages, type Messages } from "./messages";

const STORAGE_KEY = "invitation-locale";

type I18nContextValue = {
  locale: Locale;
  dir: "rtl" | "ltr";
  /** Locales this invitation actually supports. */
  available: Locale[];
  /** UI string catalog for the current locale. */
  m: Messages;
  setLocale: (locale: Locale) => void;
  /** Switch to the other available locale (no-op if only one). */
  toggle: () => void;
  /** Pick the right side of a bilingual value, falling back gracefully. */
  localized: (value: Localized | undefined | null) => string;
  /** Locale-aware date formatting. */
  formatDate: (iso: string, options?: Intl.DateTimeFormatOptions) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  children,
  available,
  defaultLocale,
  manageDocument = true,
  persist = true,
}: {
  children: React.ReactNode;
  available: Locale[];
  defaultLocale: Locale;
  /** Sync <html dir/lang> with the locale. Disable for scoped previews. */
  manageDocument?: boolean;
  /** Persist/restore the chosen locale in localStorage. Disable for previews. */
  persist?: boolean;
}) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  // After mount, restore a previously chosen locale if it's supported here.
  useEffect(() => {
    if (!persist) return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (stored && available.includes(stored) && stored !== locale) {
        setLocaleState(stored);
      }
    } catch {
      /* localStorage may be unavailable; ignore. */
    }
    // Only run on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dir = messages[locale].dir as "rtl" | "ltr";

  // Keep the document element in sync so global CSS (fonts, direction) applies.
  useEffect(() => {
    if (!manageDocument) return;
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir, manageDocument]);

  const setLocale = useCallback(
    (next: Locale) => {
      if (!available.includes(next)) return;
      setLocaleState(next);
      if (!persist) return;
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
    },
    [available, persist],
  );

  const toggle = useCallback(() => {
    const other = available.find((l) => l !== locale);
    if (other) setLocale(other);
  }, [available, locale, setLocale]);

  const localized = useCallback(
    (value: Localized | undefined | null) => {
      if (!value) return "";
      return value[locale] || value[locale === "ar" ? "en" : "ar"] || "";
    },
    [locale],
  );

  const formatDate = useCallback(
    (iso: string, options?: Intl.DateTimeFormatOptions) => {
      const intlLocale = locale === "ar" ? "ar-EG" : "en-US";
      return new Intl.DateTimeFormat(intlLocale, options).format(new Date(iso));
    },
    [locale],
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      dir,
      available,
      m: messages[locale],
      setLocale,
      toggle,
      localized,
      formatDate,
    }),
    [locale, dir, available, setLocale, toggle, localized, formatDate],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return ctx;
}
