import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { subjectStyle } from "@/components/colors";
import { SpeakButton } from "@/components/SpeakButton";
import { textFor } from "@/lib/chapter-content";
import { getSubjectWithChapters, learningOutcomes } from "@/lib/data";
import { getDictionary, localized } from "@/lib/i18n";

type Params = { params: Promise<{ classSlug: string; subjectSlug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { classSlug, subjectSlug } = await params;
  const found = await getSubjectWithChapters(classSlug, subjectSlug);
  return { title: found ? `${found.subject.name} – ${found.klass.name}` : "Subject" };
}

export default async function SubjectPage({ params }: Params) {
  const { classSlug, subjectSlug } = await params;
  const [{ locale, t }, found] = await Promise.all([getDictionary(), getSubjectWithChapters(classSlug, subjectSlug)]);
  if (!found) notFound();
  const { klass, subject } = found;
  const kid = klass.audioFirst;
  const style = subjectStyle(subject.color);
  const subjectName = localized(locale, subject.name, subject.nameHi);

  return (
    <div>
      <Breadcrumbs
        items={[
          { href: "/classes", label: t.allClasses },
          { href: `/class/${klass.slug}`, label: localized(locale, klass.name, klass.nameHi) },
          { label: subjectName },
        ]}
      />
      <div className={`mb-6 flex items-center gap-3 rounded-3xl border-2 p-4 ${style.card}`}>
        <span aria-hidden className="text-5xl">{subject.icon}</span>
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold">{subjectName}</h1>
          {subject.book && (
            <p className="text-sm text-slate-700">
              {t.referenceBook}: {subject.book}
            </p>
          )}
        </div>
        {kid && <SpeakButton text={subjectName} label={t.listen} size="lg" />}
      </div>

      <p className="-mt-3 mb-6 text-sm text-slate-600">
        ✅ {t.boardAlignment} ·{" "}
        <a href="https://ncert.nic.in/textbook.php" target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-700 underline">
          {t.ncertBooks} ↗
        </a>
      </p>

      {(subject.slug === "maths" || subject.slug === "numbers") && (
        <Link
          href={`/practice?class=${klass.slug}`}
          className="mb-6 flex items-center gap-3 rounded-3xl border-2 border-pink-200 bg-pink-50 p-4 transition hover:bg-pink-100"
        >
          <span aria-hidden className="text-4xl">🎯</span>
          <span className="flex-1">
            <span className="block text-lg font-extrabold">{t.mathsPractice}</span>
            <span className="text-sm text-slate-600">
              {t.opAdd} · {t.opSub} · {t.opMul} · {t.opDiv} · {t.opTables}
            </span>
          </span>
          <span aria-hidden className="text-2xl">→</span>
        </Link>
      )}

      <h2 className="mb-3 text-xl font-bold">
        {t.chapters} ({subject.chapters.length})
      </h2>
      <ol className="space-y-3">
        {subject.chapters.map((c) => {
          const title = localized(locale, c.title, c.titleHi);
          const href = `/class/${klass.slug}/${subject.slug}/${c.slug}`;
          const outcomes = learningOutcomes(c.learningOutcomes);
          const hasPreview = outcomes.length > 0 || c.preview !== null;
          return (
            <li key={c.id} className={`rounded-2xl border border-l-8 border-slate-200 bg-white shadow-sm ${style.bar}`}>
              <Link
                href={href}
                className={`flex items-center gap-3 rounded-2xl p-4 transition hover:bg-slate-50 active:scale-[0.99] ${kid ? "min-h-20" : ""}`}
              >
                <span
                  className={`flex shrink-0 items-center justify-center rounded-full font-bold text-white ${style.chip} ${kid ? "h-12 w-12 text-xl" : "h-9 w-9"}`}
                >
                  {c.order}
                </span>
                <span className="flex-1">
                  <span className={`block font-semibold ${kid ? "text-xl" : ""}`}>{title}</span>
                  <span className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                    {c._count.topics > 0 && (
                      <span>
                        {c._count.topics} {t.topics}
                      </span>
                    )}
                    {c.hasContent && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-800">
                        ✏️ {t.withExamples}
                      </span>
                    )}
                  </span>
                </span>
                {kid && <SpeakButton text={title} label={t.listen} />}
              </Link>
              {hasPreview && (
                <details className="group border-t border-slate-100 px-4 pb-3">
                  <summary className="cursor-pointer list-none py-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
                    <span aria-hidden className="inline-block transition group-open:rotate-90">▸</span> 👁️ {t.previewChapter}
                  </summary>
                  <div className="space-y-2 text-sm">
                    {c.preview && <p className="text-slate-700">{textFor(c.preview.intro, locale)}</p>}
                    {outcomes.length > 0 && (
                      <div>
                        <p className="font-semibold">🎯 {t.whatYouWillLearn}</p>
                        <ul className="list-disc pl-5 text-slate-700">
                          {outcomes.map((o, i) => (
                            <li key={i}>{textFor(o, locale)}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {c.preview && (
                      <p className="text-slate-600">
                        ✏️ {c.preview.examples} {t.solvedCount} · 🧠 {c.preview.practice} {t.practiceCount}
                      </p>
                    )}
                    <Link href={href} className="inline-block font-semibold text-brand-700 underline">
                      {t.openChapter} →
                    </Link>
                  </div>
                </details>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
