import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SubjectGrid } from "@/components/SubjectGrid";
import { AVATAR_EMOJI, CLASS_COOKIE, type Avatar } from "@/lib/constants";
import { getClassWithSubjects } from "@/lib/data";
import { getDictionary, localized } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/session";

export default async function HomePage() {
  const [{ locale, t }, user, cookieStore] = await Promise.all([getDictionary(), getCurrentUser(), cookies()]);
  const classSlug = user?.studentProfile?.class.slug ?? cookieStore.get(CLASS_COOKIE)?.value;
  const klass = classSlug ? await getClassWithSubjects(classSlug) : null;
  if (!klass) redirect("/onboarding");

  const className = localized(locale, klass.name, klass.nameHi);
  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-gradient-to-r from-orange-400 to-amber-300 p-5 text-white shadow">
        <div className="flex items-center gap-3">
          <span aria-hidden className="text-5xl">
            {user ? (AVATAR_EMOJI[user.avatar as Avatar] ?? "🙂") : "👋"}
          </span>
          <div>
            <h1 className="text-2xl font-extrabold">
              {t.hello}, {user?.name ?? t.guest}!
            </h1>
            <p className="font-semibold opacity-95">{t.continueLearning}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/25 px-3 py-1 font-bold">{className}</span>
          <Link href="/onboarding" className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-brand-700 hover:bg-amber-50">
            {t.changeClass}
          </Link>
        </div>
      </section>
      <SubjectGrid classSlug={klass.slug} subjects={klass.subjects} kid={klass.audioFirst} locale={locale} t={t} />
    </div>
  );
}
