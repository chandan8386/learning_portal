import { cookies } from "next/headers";
import { RegisterForm } from "@/components/AuthForms";
import { CLASS_COOKIE } from "@/lib/constants";
import { getClasses } from "@/lib/data";
import { getDictionary, localized } from "@/lib/i18n";

export const metadata = { title: "Sign up" };

export default async function RegisterPage() {
  const [{ locale, t }, classes, cookieStore] = await Promise.all([getDictionary(), getClasses(), cookies()]);
  return (
    <div className="mx-auto max-w-md rounded-3xl bg-white p-6 shadow-sm">
      <h1 className="mb-5 text-center text-3xl font-extrabold">{t.register}</h1>
      <RegisterForm
        t={t}
        defaultClass={cookieStore.get(CLASS_COOKIE)?.value}
        classes={classes.map((c) => ({ slug: c.slug, label: localized(locale, c.name, c.nameHi) }))}
      />
    </div>
  );
}
