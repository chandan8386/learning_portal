import Link from "next/link";
import type { Locale } from "@/lib/constants";
import type { Dictionary } from "@/lib/dictionaries";
import { localized } from "@/lib/i18n";
import { subjectStyle } from "./colors";
import { SpeakButton } from "./SpeakButton";

type Subject = {
  slug: string;
  name: string;
  nameHi: string;
  icon: string;
  color: string;
  _count: { chapters: number };
};

export function SubjectGrid({
  classSlug,
  subjects,
  kid,
  locale,
  t,
}: {
  classSlug: string;
  subjects: Subject[];
  kid: boolean;
  locale: Locale;
  t: Dictionary;
}) {
  return (
    <ul className={`grid gap-4 ${kid ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
      {subjects.map((s) => {
        const name = localized(locale, s.name, s.nameHi);
        const style = subjectStyle(s.color);
        return (
          <li key={s.slug}>
            <Link
              href={`/class/${classSlug}/${s.slug}`}
              className={`flex h-full items-center gap-3 rounded-3xl border-2 p-4 shadow-sm transition active:scale-[0.98] ${style.card} ${kid ? "min-h-28" : "min-h-20"}`}
            >
              <span aria-hidden className={kid ? "text-5xl" : "text-3xl"}>
                {s.icon}
              </span>
              <span className="flex-1">
                <span className={`block font-bold ${kid ? "text-2xl" : "text-base sm:text-lg"}`}>{name}</span>
                <span className="text-sm text-slate-600">
                  {s._count.chapters} {t.chapters}
                </span>
              </span>
              {kid && <SpeakButton text={name} label={t.listen} />}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
