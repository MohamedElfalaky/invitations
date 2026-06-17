"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { saveInvitation } from "@/app/actions/invitations";
import { MediaUpload } from "@/components/admin/MediaUpload";
import { ThemePreview } from "@/components/admin/ThemePreview";
import { slugify } from "@/lib/slug";
import type { InvitationInput } from "@/lib/invitations";
import { THEME_LABELS } from "@/themes";
import {
  EVENT_TYPES,
  THEME_KEYS,
  type EventType,
  type ExtraConfig,
  type Invitation,
  type Locale,
  type ThemeKey,
} from "@/types/invitation";

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  wedding: "Wedding",
  engagement: "Engagement",
  birthday: "Birthday",
  graduation: "Graduation",
  party: "Party",
};

const ALL_LOCALES: Locale[] = ["ar", "en"];

type FormState = {
  slug: string;
  theme: ThemeKey;
  hostNames: { en: string; ar: string };
  eventType: EventType;
  eventDateLocal: string;
  venueName: string;
  venueAddress: string;
  mapUrl: string;
  heroImageUrl: string;
  gallery: string[];
  musicUrl: string;
  languages: Locale[];
  rsvpEnabled: boolean;
  messageEn: string;
  messageAr: string;
  noteEn: string;
  noteAr: string;
};

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

function initialState(inv?: Invitation): FormState {
  return {
    slug: inv?.slug ?? "",
    theme: inv?.theme ?? "classic",
    hostNames: { en: inv?.hostNames.en ?? "", ar: inv?.hostNames.ar ?? "" },
    eventType: inv?.eventType ?? "wedding",
    eventDateLocal: inv ? toLocalInput(inv.eventDate) : "",
    venueName: inv?.venueName ?? "",
    venueAddress: inv?.venueAddress ?? "",
    mapUrl: inv?.mapUrl ?? "",
    heroImageUrl: inv?.heroImageUrl ?? "",
    gallery: inv?.gallery ?? [],
    musicUrl: inv?.musicUrl ?? "",
    languages: inv?.languages ?? ["ar", "en"],
    rsvpEnabled: inv?.rsvpEnabled ?? true,
    messageEn: inv?.extraConfig.invitation_message?.en ?? "",
    messageAr: inv?.extraConfig.invitation_message?.ar ?? "",
    noteEn: inv?.extraConfig.note?.en ?? "",
    noteAr: inv?.extraConfig.note?.ar ?? "",
  };
}

function buildExtraConfig(s: FormState): ExtraConfig {
  const extra: ExtraConfig = {};
  if (s.messageEn || s.messageAr)
    extra.invitation_message = { en: s.messageEn, ar: s.messageAr };
  if (s.noteEn || s.noteAr) extra.note = { en: s.noteEn, ar: s.noteAr };
  return extra;
}

const labelCls = "mb-1 block text-sm font-medium text-neutral-700";
const inputCls =
  "w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-900";

export function InvitationForm({ invitation }: { invitation?: Invitation }) {
  const router = useRouter();
  const [state, setState] = useState<FormState>(() => initialState(invitation));
  const [slugTouched, setSlugTouched] = useState(Boolean(invitation));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  // Auto-suggest a slug from host names until the admin edits it manually.
  function onHostNameChange(locale: "en" | "ar", value: string) {
    setState((s) => {
      const hostNames = { ...s.hostNames, [locale]: value };
      const slug = slugTouched
        ? s.slug
        : slugify(hostNames.en || hostNames.ar);
      return { ...s, hostNames, slug };
    });
  }

  function toggleLanguage(locale: Locale) {
    setState((s) => {
      const has = s.languages.includes(locale);
      const next = has
        ? s.languages.filter((l) => l !== locale)
        : [...ALL_LOCALES].filter((l) => l === locale || s.languages.includes(l));
      return { ...s, languages: next.length ? next : s.languages };
    });
  }

  const preview = useMemo<Invitation>(() => {
    const now = new Date().toISOString();
    const future = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
    return {
      // Sentinel (not a UUID) so a stray RSVP submitted from the live preview
      // fails server validation instead of creating a real response.
      id: "preview",
      slug: state.slug || "preview",
      theme: state.theme,
      hostNames: state.hostNames,
      eventType: state.eventType,
      eventDate: state.eventDateLocal
        ? new Date(state.eventDateLocal).toISOString()
        : future,
      venueName: state.venueName,
      venueAddress: state.venueAddress,
      mapUrl: state.mapUrl || null,
      heroImageUrl: state.heroImageUrl || null,
      gallery: state.gallery,
      musicUrl: state.musicUrl || null,
      languages: state.languages.length ? state.languages : ["ar"],
      rsvpEnabled: state.rsvpEnabled,
      extraConfig: buildExtraConfig(state),
      createdAt: invitation?.createdAt ?? now,
      updatedAt: now,
    };
  }, [state, invitation]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!state.hostNames.en && !state.hostNames.ar) {
      setError("Please enter the host names (in at least one language).");
      return;
    }
    if (!state.eventDateLocal) {
      setError("Please choose the event date and time.");
      return;
    }
    if (state.languages.length === 0) {
      setError("Select at least one language.");
      return;
    }

    const input: InvitationInput = {
      slug: state.slug,
      theme: state.theme,
      hostNames: state.hostNames,
      eventType: state.eventType,
      eventDate: new Date(state.eventDateLocal).toISOString(),
      venueName: state.venueName,
      venueAddress: state.venueAddress,
      mapUrl: state.mapUrl || null,
      heroImageUrl: state.heroImageUrl || null,
      gallery: state.gallery,
      musicUrl: state.musicUrl || null,
      languages: state.languages,
      rsvpEnabled: state.rsvpEnabled,
      extraConfig: buildExtraConfig(state),
    };

    startTransition(async () => {
      const result = await saveInvitation({ id: invitation?.id, input });
      if (result.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_minmax(320px,420px)]">
      {/* Form column */}
      <form onSubmit={onSubmit} className="space-y-8">
        {/* Theme picker */}
        <Fieldset title="Theme">
          <div className="grid grid-cols-3 gap-3">
            {THEME_KEYS.map((key) => (
              <button
                type="button"
                key={key}
                onClick={() => set("theme", key)}
                className={`rounded-xl border px-3 py-3 text-sm font-medium capitalize transition ${
                  state.theme === key
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 hover:bg-neutral-100"
                }`}
              >
                {THEME_LABELS[key]}
              </button>
            ))}
          </div>
        </Fieldset>

        {/* Hosts + basics */}
        <Fieldset title="Hosts & event">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Host names (English)</label>
              <input
                className={inputCls}
                value={state.hostNames.en}
                onChange={(e) => onHostNameChange("en", e.target.value)}
                placeholder="Sara & Omar"
              />
            </div>
            <div>
              <label className={labelCls}>Host names (Arabic)</label>
              <input
                dir="rtl"
                className={inputCls}
                value={state.hostNames.ar}
                onChange={(e) => onHostNameChange("ar", e.target.value)}
                placeholder="سارة و عمر"
              />
            </div>
            <div>
              <label className={labelCls}>Event type</label>
              <select
                className={inputCls}
                value={state.eventType}
                onChange={(e) => set("eventType", e.target.value as EventType)}
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {EVENT_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Date & time</label>
              <input
                type="datetime-local"
                className={inputCls}
                value={state.eventDateLocal}
                onChange={(e) => set("eventDateLocal", e.target.value)}
              />
            </div>
          </div>
        </Fieldset>

        {/* Slug */}
        <Fieldset title="Link (slug)">
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-400">/i/</span>
            <input
              className={inputCls}
              value={state.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", e.target.value);
              }}
              placeholder="sara-and-omar"
            />
            <button
              type="button"
              onClick={() => {
                setSlugTouched(false);
                set("slug", slugify(state.hostNames.en || state.hostNames.ar));
              }}
              className="whitespace-nowrap rounded-xl border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-100"
            >
              Auto
            </button>
          </div>
          <p className="mt-1 text-xs text-neutral-400">
            The final slug is sanitized and made unique on save.
          </p>
        </Fieldset>

        {/* Venue */}
        <Fieldset title="Venue">
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Venue name</label>
              <input
                className={inputCls}
                value={state.venueName}
                onChange={(e) => set("venueName", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Address</label>
              <input
                className={inputCls}
                value={state.venueAddress}
                onChange={(e) => set("venueAddress", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Map URL (Open in Maps)</label>
              <input
                className={inputCls}
                value={state.mapUrl}
                onChange={(e) => set("mapUrl", e.target.value)}
                placeholder="https://maps.google.com/?q=…"
              />
            </div>
          </div>
        </Fieldset>

        {/* Hero image */}
        <Fieldset title="Hero image">
          <div className="flex items-start gap-4">
            {state.heroImageUrl && (
              <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-neutral-200">
                <Image src={state.heroImageUrl} alt="" fill className="object-cover" sizes="96px" />
              </div>
            )}
            <div className="space-y-2">
              <MediaUpload
                folder="hero"
                label="Upload image"
                onUploaded={(url) => set("heroImageUrl", url)}
              />
              <input
                className={inputCls}
                value={state.heroImageUrl}
                onChange={(e) => set("heroImageUrl", e.target.value)}
                placeholder="…or paste an image URL"
              />
              {state.heroImageUrl && (
                <button
                  type="button"
                  onClick={() => set("heroImageUrl", "")}
                  className="text-xs text-red-600"
                >
                  Remove hero
                </button>
              )}
            </div>
          </div>
        </Fieldset>

        {/* Gallery */}
        <Fieldset title="Gallery">
          {state.gallery.length > 0 && (
            <div className="mb-3 grid grid-cols-4 gap-2">
              {state.gallery.map((url, i) => (
                <div key={`${url}-${i}`} className="group relative aspect-square overflow-hidden rounded-lg border border-neutral-200">
                  <Image src={url} alt="" fill className="object-cover" sizes="120px" />
                  <button
                    type="button"
                    onClick={() =>
                      set(
                        "gallery",
                        state.gallery.filter((_, idx) => idx !== i),
                      )
                    }
                    className="absolute end-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-xs text-white opacity-0 transition group-hover:opacity-100"
                    aria-label="Remove image"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          <MediaUpload
            folder="gallery"
            label="Add photo"
            onUploaded={(url) => set("gallery", [...state.gallery, url])}
          />
        </Fieldset>

        {/* Music */}
        <Fieldset title="Background music (optional)">
          <div className="space-y-2">
            <MediaUpload
              folder="music"
              accept="audio/*"
              label="Upload audio"
              onUploaded={(url) => set("musicUrl", url)}
            />
            <input
              className={inputCls}
              value={state.musicUrl}
              onChange={(e) => set("musicUrl", e.target.value)}
              placeholder="…or paste an audio URL"
            />
            {state.musicUrl && (
              <button
                type="button"
                onClick={() => set("musicUrl", "")}
                className="text-xs text-red-600"
              >
                Remove music
              </button>
            )}
          </div>
        </Fieldset>

        {/* Invitation message + note */}
        <Fieldset title="Invitation message (optional)">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Message (English)</label>
              <textarea
                rows={3}
                className={inputCls}
                value={state.messageEn}
                onChange={(e) => set("messageEn", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Message (Arabic)</label>
              <textarea
                rows={3}
                dir="rtl"
                className={inputCls}
                value={state.messageAr}
                onChange={(e) => set("messageAr", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Note (English)</label>
              <input
                className={inputCls}
                value={state.noteEn}
                onChange={(e) => set("noteEn", e.target.value)}
                placeholder="Dress code: Formal"
              />
            </div>
            <div>
              <label className={labelCls}>Note (Arabic)</label>
              <input
                dir="rtl"
                className={inputCls}
                value={state.noteAr}
                onChange={(e) => set("noteAr", e.target.value)}
              />
            </div>
          </div>
        </Fieldset>

        {/* Languages + RSVP */}
        <Fieldset title="Options">
          <div className="space-y-4">
            <div>
              <span className={labelCls}>Languages</span>
              <div className="flex gap-4">
                {ALL_LOCALES.map((l) => (
                  <label key={l} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={state.languages.includes(l)}
                      onChange={() => toggleLanguage(l)}
                      className="accent-neutral-900"
                    />
                    {l === "ar" ? "Arabic" : "English"}
                  </label>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={state.rsvpEnabled}
                onChange={(e) => set("rsvpEnabled", e.target.checked)}
                className="accent-neutral-900"
              />
              Enable RSVP form
            </label>
          </div>
        </Fieldset>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-neutral-900 px-6 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Saving…" : invitation ? "Save changes" : "Create invitation"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="rounded-full border border-neutral-300 px-6 py-3 font-medium hover:bg-neutral-100"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Preview column */}
      <div className="lg:sticky lg:top-6 lg:h-fit">
        <ThemePreview invitation={preview} />
      </div>
    </div>
  );
}

function Fieldset({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
        {title}
      </h2>
      {children}
    </section>
  );
}
