import type { SubjectColor } from "@/lib/constants";

// Full class names are listed so Tailwind can find them at build time.
export const SUBJECT_STYLES: Record<SubjectColor, { card: string; chip: string; bar: string }> = {
  rose: { card: "bg-rose-100 border-rose-300 hover:bg-rose-200", chip: "bg-rose-500", bar: "border-l-rose-400" },
  orange: { card: "bg-orange-100 border-orange-300 hover:bg-orange-200", chip: "bg-orange-500", bar: "border-l-orange-400" },
  amber: { card: "bg-amber-100 border-amber-300 hover:bg-amber-200", chip: "bg-amber-500", bar: "border-l-amber-400" },
  lime: { card: "bg-lime-100 border-lime-300 hover:bg-lime-200", chip: "bg-lime-600", bar: "border-l-lime-500" },
  emerald: { card: "bg-emerald-100 border-emerald-300 hover:bg-emerald-200", chip: "bg-emerald-500", bar: "border-l-emerald-400" },
  teal: { card: "bg-teal-100 border-teal-300 hover:bg-teal-200", chip: "bg-teal-500", bar: "border-l-teal-400" },
  sky: { card: "bg-sky-100 border-sky-300 hover:bg-sky-200", chip: "bg-sky-500", bar: "border-l-sky-400" },
  indigo: { card: "bg-indigo-100 border-indigo-300 hover:bg-indigo-200", chip: "bg-indigo-500", bar: "border-l-indigo-400" },
  violet: { card: "bg-violet-100 border-violet-300 hover:bg-violet-200", chip: "bg-violet-500", bar: "border-l-violet-400" },
  pink: { card: "bg-pink-100 border-pink-300 hover:bg-pink-200", chip: "bg-pink-500", bar: "border-l-pink-400" },
};

export function subjectStyle(color: string) {
  return SUBJECT_STYLES[color as SubjectColor] ?? SUBJECT_STYLES.sky;
}
