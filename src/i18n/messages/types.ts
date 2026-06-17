import type { EventType, RsvpStatus } from "@/types/invitation";

/** Shape every locale catalog must implement. */
export type Messages = {
  dir: "ltr" | "rtl";
  localeName: string;
  otherLocaleName: string;

  invited: string;
  /** "You are invited to {event}" — `{event}` is replaced with the event type. */
  invitedTo: string;
  weInviteYou: string;

  eventType: Record<EventType, string>;

  countdown: {
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
    started: string;
  };

  details: {
    title: string;
    when: string;
    where: string;
    openInMaps: string;
  };

  gallery: {
    title: string;
    close: string;
  };

  music: {
    play: string;
    mute: string;
  };

  footer: {
    cta: string;
    contact: string;
    prefill: string;
  };

  rsvp: {
    title: string;
    subtitle: string;
    name: string;
    namePlaceholder: string;
    status: string;
    guestsCount: string;
    message: string;
    messagePlaceholder: string;
    submit: string;
    submitting: string;
    thankYouTitle: string;
    thankYouMessage: string;
    errorGeneric: string;
    required: string;
  } & Record<RsvpStatus, string>;
};
