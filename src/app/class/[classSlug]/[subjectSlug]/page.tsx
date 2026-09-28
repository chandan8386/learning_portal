import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { subjectStyle } from "@/components/colors";
import { SpeakButton } from "@/components/SpeakButton";
import { getSubjectWithChapters } from "@/lib/data";
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

      <h2 className="mb-3 text-xl font-bold">
        {t.chapters} ({subject.chapters.length})
      </h2>
      <ol className="space-y-3">
        {subject.chapters.map((c) => {
          const title = localized(locale, c.title, c.titleHi);
          return (
            <li key={c.id}>
              <Link
                href={`/class/${klass.slug}/${subject.slug}/${c.slug}`}
                className={`flex items-center gap-3 rounded-2xl border border-l-8 border-slate-200 bg-white p-4 shadow-sm transition hover:bg-slate-50 active:scale-[0.99] ${style.bar} ${kid ? "min-h-20" : ""}`}
              >
                <span
                  className={`flex shrink-0 items-center justify-center rounded-full font-bold text-white ${style.chip} ${kid ? "h-12 w-12 text-xl" : "h-9 w-9"}`}
                >
                  {c.order}
                </span>
                <span className="flex-1">
                  <span className={`block font-semibold ${kid ? "text-xl" : ""}`}>{title}</span>
                  {c._count.topics > 0 && (
                    <span className="text-sm text-slate-500">
                      {c._count.topics} {t.topics}
                    </span>
                  )}
                </span>
                {kid && <SpeakButton text={title} label={t.listen} />}
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
