import Link from "next/link";
import { STAGES } from "@/lib/constants";
import { getClasses } from "@/lib/data";
import { getDictionary, localized } from "@/lib/i18n";
import { stageLabel } from "@/lib/stages";

export const metadata = { title: "All Classes" };

export default async function ClassesPage() {
  const [{ locale, t }, classes] = await Promise.all([getDictionary(), getClasses()]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-extrabold">{t.allClasses}</h1>
      {STAGES.map((stage) => {
        const inStage = classes.filter((c) => c.stage === stage);
        if (!inStage.length) return null;
        return (
          <section key={stage} aria-labelledby={`stage-${stage}`}>
            <h2 id={`stage-${stage}`} className="mb-3 text-lg font-bold text-slate-700">
              {stageLabel(stage, t)}
            </h2>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {inStage.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/class/${c.slug}`}
                    className="flex min-h-24 flex-col justify-center rounded-2xl border-2 border-amber-200 bg-white p-4 shadow-sm transition hover:border-brand-500 active:scale-[0.98]"
                  >
                    <span className="text-xl font-extrabold">{localized(locale, c.name, c.nameHi)}</span>
                    <span className="text-sm text-slate-600">
                      {t.age} {c.ageRange} · {c._count.subjects} {t.subjects}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
