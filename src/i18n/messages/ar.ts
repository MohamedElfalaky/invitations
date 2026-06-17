import type { Messages } from "./types";

/** Arabic UI strings. Must structurally match the English catalog (`Messages`). */
export const ar: Messages = {
  dir: "rtl",
  localeName: "العربية",
  otherLocaleName: "English",

  invited: "أنتم مدعوون",
  weInviteYou: "يسعدنا دعوتكم لمشاركتنا",

  eventType: {
    wedding: "حفل زفاف",
    engagement: "حفل خطوبة",
    birthday: "عيد ميلاد",
    graduation: "حفل تخرج",
    party: "احتفال",
  },

  countdown: {
    days: "يوم",
    hours: "ساعة",
    minutes: "دقيقة",
    seconds: "ثانية",
    started: "بدأ الاحتفال",
  },

  details: {
    title: "تفاصيل المناسبة",
    when: "الموعد",
    where: "المكان",
    openInMaps: "افتح في الخرائط",
  },

  gallery: {
    title: "معرض الصور",
    close: "إغلاق",
  },

  music: {
    play: "تشغيل الموسيقى",
    mute: "كتم الموسيقى",
  },

  footer: {
    cta: "تريد دعوة مثل هذه؟",
    contact: "تواصل معنا عبر واتساب",
    prefill: "اريد دعوة مثل هذه:",
  },

  rsvp: {
    title: "تأكيد الحضور",
    subtitle: "نرجو إخبارنا إن كنتم ستشاركوننا",
    name: "الاسم",
    namePlaceholder: "الاسم الكامل",
    status: "هل ستحضرون؟",
    attending: "سأحضر بكل سرور",
    declined: "أعتذر عن الحضور",
    maybe: "ربما",
    guestsCount: "عدد الأشخاص",
    message: "رسالة (اختياري)",
    messagePlaceholder: "اكتب رسالة لأصحاب الدعوة…",
    submit: "إرسال التأكيد",
    submitting: "جارٍ الإرسال…",
    thankYouTitle: "شكراً لكم!",
    thankYouMessage: "تم تسجيل ردكم بنجاح.",
    errorGeneric: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
    required: "يرجى إدخال الاسم.",
  },
};
