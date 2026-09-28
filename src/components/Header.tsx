import Link from "next/link";
import { logout } from "@/app/actions";
import { AVATAR_EMOJI, type Avatar } from "@/lib/constants";
import { getDictionary } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/session";
import { LanguageToggle } from "./LanguageToggle";

export async function Header() {
  const [{ locale, t }, user] = await Promise.all([getDictionary(), getCurrentUser()]);

  return (
    <header className="sticky top-0 z-10 border-b border-amber-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-2">
        <Link href="/" className="flex items-center gap-2 text-xl font-extrabold text-brand-600">
          <span aria-hidden className="text-2xl">📚</span>
          <span>{t.appName}</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/classes" className="hidden rounded-full px-3 py-1.5 text-sm font-semibold hover:bg-amber-100 sm:inline">
            {t.allClasses}
          </Link>
          <LanguageToggle locale={locale} />
          {user ? (
            <form action={logout} className="flex items-center gap-2">
              <span className="hidden items-center gap-1 text-sm font-semibold sm:flex">
                <span aria-hidden className="text-xl">{AVATAR_EMOJI[user.avatar as Avatar] ?? "🙂"}</span>
                {user.name}
              </span>
              <button className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold hover:bg-slate-200">
                {t.logout}
              </button>
            </form>
          ) : (
            <Link href="/login" className="rounded-full bg-brand-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-600">
              {t.login}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
