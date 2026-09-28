export const ROLES = ["STUDENT", "PARENT", "TEACHER", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const STAGES = ["FOUNDATIONAL", "PREPARATORY", "MIDDLE", "SECONDARY"] as const;
export type Stage = (typeof STAGES)[number];

export const LOCALES = ["en", "hi"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const SUBJECT_COLORS = [
  "rose",
  "orange",
  "amber",
  "lime",
  "emerald",
  "teal",
  "sky",
  "indigo",
  "violet",
  "pink",
] as const;
export type SubjectColor = (typeof SUBJECT_COLORS)[number];

export const AVATARS = ["lion", "elephant", "peacock", "tiger", "rabbit", "parrot"] as const;
export type Avatar = (typeof AVATARS)[number];

export const AVATAR_EMOJI: Record<Avatar, string> = {
  lion: "🦁",
  elephant: "🐘",
  peacock: "🦚",
  tiger: "🐯",
  rabbit: "🐰",
  parrot: "🦜",
};

export const LOCALE_COOKIE = "vp_locale";
export const CLASS_COOKIE = "vp_class";
export const SESSION_COOKIE = "vp_session";
