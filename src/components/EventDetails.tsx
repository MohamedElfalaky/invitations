"use client";

import { useI18n } from "@/i18n/I18nProvider";
import type { Invitation } from "@/types/invitation";

type EventDetailsProps = {
  invitation: Invitation;
  className?: string;
  cardClassName?: string;
  buttonClassName?: string;
};

/**
 * Date/time + venue + "Open in Maps". Date formatting and the localized venue
 * override are handled here so themes don't reimplement them.
 */
export function EventDetails({
  invitation,
  className = "",
  cardClassName = "rounded-2xl bg-white/70 p-5 shadow-sm backdrop-blur",
  buttonClassName = "mt-3 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2 text-sm font-medium text-white transition hover:opacity-90",
}: EventDetailsProps) {
  const { m, localized, formatDate } = useI18n();

  const dateLabel = formatDate(invitation.eventDate, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeLabel = formatDate(invitation.eventDate, {
    hour: "numeric",
    minute: "2-digit",
  });

  const venueName =
    localized(invitation.extraConfig.venue) || invitation.venueName;

  return (
    <div className={`grid gap-4 sm:grid-cols-2 ${className}`}>
      <div className={cardClassName}>
        <h3 className="text-sm font-semibold uppercase tracking-wide opacity-60">
          {m.details.when}
        </h3>
        <p className="mt-1 text-lg">{dateLabel}</p>
        <p className="text-base opacity-80">{timeLabel}</p>
      </div>

      <div className={cardClassName}>
        <h3 className="text-sm font-semibold uppercase tracking-wide opacity-60">
          {m.details.where}
        </h3>
        {venueName && <p className="mt-1 text-lg">{venueName}</p>}
        {invitation.venueAddress && (
          <p className="text-base opacity-80">{invitation.venueAddress}</p>
        )}
        {invitation.mapUrl && (
          <a
            href={invitation.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClassName}
          >
            <span aria-hidden>📍</span>
            {m.details.openInMaps}
          </a>
        )}
      </div>
    </div>
  );
}
