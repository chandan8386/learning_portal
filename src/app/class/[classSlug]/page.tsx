import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SpeakButton } from "@/components/SpeakButton";
import { SubjectGrid } from "@/components/SubjectGrid";
import { getClassWithSubjects } from "@/lib/data";
import { getDictionary, localized } from "@/lib/i18n";
import { stageLabel } from "@/lib/stages";

type Params = { params: Promise<{ classSlug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const klass = await getClassWithSubjects((await params).classSlug);
  return { title: klass?.name ?? "Class" };
}

export default async function ClassPage({ params }: Params) {
  const { classSlug } = await params;
  const [{ locale, t }, klass] = await Promise.all([getDictionary(), getClassWithSubjects(classSlug)]);
  if (!klass) notFound();

  const name = localized(locale, klass.name, klass.nameHi);
  return (
    <div>
      <Breadcrumbs items={[{ href: "/classes", label: t.allClasses }, { label: name }]} />
      <div className="mb-6 flex items-center gap-3">
        <h1 className={`font-extrabold ${klass.audioFirst ? "text-4xl" : "text-3xl"}`}>{name}</h1>
        {klass.audioFirst && <SpeakButton text={name} label={t.listen} size="lg" />}
      </div>
      <p className="-mt-4 mb-6 text-slate-600">
        {stageLabel(klass.stage, t)} · {t.age} {klass.ageRange}
      </p>
      <SubjectGrid classSlug={klass.slug} subjects={klass.subjects} kid={klass.audioFirst} locale={locale} t={t} />
    </div>
  );
}
