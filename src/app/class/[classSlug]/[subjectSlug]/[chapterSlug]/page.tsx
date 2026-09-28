import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ChapterStudy } from "@/components/ChapterStudy";
import { subjectStyle } from "@/components/colors";
import { SpeakButton } from "@/components/SpeakButton";
import { parseChapterContent } from "@/lib/chapter-content";
import { getChapter, learningOutcomes } from "@/lib/data";
import { getDictionary, localized } from "@/lib/i18n";

type Params = { params: Promise<{ classSlug: string; subjectSlug: string; chapterSlug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { classSlug, subjectSlug, chapterSlug } = await params;
  const found = await getChapter(classSlug, subjectSlug, chapterSlug);
  return { title: found ? `${found.chapter.title} – ${found.subject.name}` : "Chapter" };
}

export default async function ChapterPage({ params }: Params) {
  const { classSlug, subjectSlug, chapterSlug } = await params;
  const [{ locale, t }, found] = await Promise.all([
    getDictionary(),
    getChapter(classSlug, subjectSlug, chapterSlug),
  ]);
  if (!found) notFound();
  const { klass, subject, chapter, prev, next } = found;
  const kid = klass.audioFirst;
  const style = subjectStyle(subject.color);
  const title = localized(locale, chapter.title, chapter.titleHi);
  const outcomes = learningOutcomes(chapter.learningOutcomes);
  const study = parseChapterContent(chapter.content);
  const base = `/class/${klass.slug}/${subject.slug}`;

  return (
    <div>
      <Breadcrumbs
        items={[
          { href: `/class/${klass.slug}`, label: localized(locale, klass.name, klass.nameHi) },
          { href: base, label: localized(locale, subject.name, subject.nameHi) },
          { label: `${t.chapter} ${chapter.order}` },
        ]}
      />
      <div className="mb-6 flex items-start gap-3">
        <div className="flex-1">
          <p className="font-semibold text-slate-500">
            {t.chapter} {chapter.order}
          </p>
          <h1 className={`font-extrabold ${kid ? "text-4xl" : "text-3xl"}`}>{title}</h1>
        </div>
        {kid && <SpeakButton text={title} label={t.listen} size="lg" />}
      </div>

      {outcomes.length > 0 && (
        <section className="mb-6 rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-lg font-bold">🎯 {t.whatYouWillLearn}</h2>
          <ul className="space-y-2">
            {outcomes.map((o) => (
              <li key={o} className="flex items-center gap-2">
                <span aria-hidden>✅</span>
                <span className="flex-1">{o}</span>
                {kid && <SpeakButton text={o} label={t.listen} />}
              </li>
            ))}
          </ul>
        </section>
      )}

      {chapter.topics.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 text-lg font-bold">{t.topics}</h2>
          <ol className={`grid gap-3 ${kid ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-3"}`}>
            {chapter.topics.map((topic) => {
              const topicTitle = localized(locale, topic.title, topic.titleHi);
              return (
                <li key={topic.id} className={`flex items-center gap-3 rounded-2xl border-2 p-4 ${style.card}`}>
                  <span className={`font-semibold ${kid ? "text-xl" : ""} flex-1`}>
                    {topic.order}. {topicTitle}
                  </span>
                  {kid && <SpeakButton text={topicTitle} label={t.listen} />}
                </li>
              );
            })}
          </ol>
        </section>
      )}

      <div className="mb-8">
        {study ? (
          <ChapterStudy content={study} locale={locale} t={t} kid={kid} />
        ) : (
          <p className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 p-4 text-slate-700">
            📖 {t.examplesComingSoon}
          </p>
        )}
      </div>

      <nav className="flex justify-between gap-3">
        {prev ? (
          <Link href={`${base}/${prev.slug}`} className="rounded-full bg-white px-4 py-2 font-semibold shadow-sm hover:bg-slate-50">
            ← {t.previous}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`${base}/${next.slug}`} className="rounded-full bg-brand-500 px-4 py-2 font-semibold text-white shadow-sm hover:bg-brand-600">
            {t.next} →
          </Link>
        )}
      </nav>
    </div>
  );
}
