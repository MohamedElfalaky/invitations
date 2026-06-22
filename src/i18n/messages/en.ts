import type { Messages } from "./types";

/** English UI strings (also the reference catalog). */
export const en: Messages = {
  dir: "ltr",
  localeName: "English",
  otherLocaleName: "العربية",

  invited: "You are invited",
  invitedTo: "You are invited to {event}",
  weInviteYou: "We joyfully invite you to celebrate",

  eventType: {
    wedding: "Wedding",
    engagement: "Engagement",
    birthday: "Birthday",
    graduation: "Graduation",
    party: "Celebration",
  },

  countdown: {
    days: "Days",
    hours: "Hours",
    minutes: "Minutes",
    seconds: "Seconds",
    started: "The celebration has begun",
  },

  details: {
    title: "Event Details",
    when: "When",
    where: "Where",
    openInMaps: "Open in Maps",
  },

  gallery: {
    title: "Gallery",
    close: "Close",
  },

  music: {
    play: "Play music",
    mute: "Mute music",
  },

  envelope: {
    caption: "This invitation is exclusive for you",
    open: "Open invitation",
  },

  footer: {
    cta: "Want an invitation like this one?",
    contact: "Chat with us on WhatsApp",
    prefill: "I'd love to create an invitation like this one:",
  },

  rsvp: {
    title: "RSVP",
    subtitle: "Kindly let us know if you'll be joining us",
    name: "Your name",
    namePlaceholder: "Full name",
    status: "Will you attend?",
    attending: "Joyfully attending",
    declined: "Regretfully declines",
    maybe: "Maybe",
    guestsCount: "Number of guests",
    message: "Message (optional)",
    messagePlaceholder: "Share a note with the hosts…",
    submit: "Send RSVP",
    submitting: "Sending…",
    thankYouTitle: "Thank you!",
    thankYouMessage: "Your response has been recorded.",
    errorGeneric: "Something went wrong. Please try again.",
    required: "Please enter your name.",
  },
};
