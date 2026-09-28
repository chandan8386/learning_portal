import Link from "next/link";
import { getDictionary } from "@/lib/i18n";

export default async function NotFound() {
  const { t } = await getDictionary();
  return (
    <div className="py-16 text-center">
      <p aria-hidden className="text-6xl">🧭</p>
      <h1 className="mt-4 text-2xl font-bold">{t.notFound}</h1>
      <Link href="/" className="mt-6 inline-block rounded-full bg-brand-500 px-5 py-2 font-semibold text-white">
        {t.goHome}
      </Link>
    </div>
  );
}
