import Link from "next/link";
import { SpeakButton } from "@/components/SpeakButton";
import { getDictionary } from "@/lib/i18n";

export const metadata = { title: "Multiplication tables" };

const MAX_TABLE = 20;

type SearchParams = Promise<{ n?: string }>;

export default async function TablesPage({ searchParams }: { searchParams: SearchParams }) {
  const [{ locale, t }, params] = await Promise.all([getDictionary(), searchParams]);
  const requested = Number(params.n);
  const n = Number.isInteger(requested) && requested >= 1 && requested <= MAX_TABLE ? requested : 2;
  const rows = Array.from({ length: 10 }, (_, i) => i + 1);
  const times = locale === "hi" ? "गुणा" : "times";
  const is = locale === "hi" ? "बराबर" : "is";
  const spoken = (k: number) => `${n} ${times} ${k} ${is} ${n * k}`;

  return (
    <div>
      <h1 className="text-3xl font-extrabold">🔢 {t.tablesTitle}</h1>
      <p className="mb-4 text-slate-600">{t.tablesIntro}</p>

      <nav aria-label={t.chooseTable} className="mb-6 grid grid-cols-5 gap-2 sm:grid-cols-10">
        {Array.from({ length: MAX_TABLE }, (_, i) => i + 1).map((k) => (
          <Link
            key={k}
            href={`/practice/tables?n=${k}`}
            aria-current={k === n ? "page" : undefined}
            className={`flex h-12 items-center justify-center rounded-2xl border-2 text-lg font-bold ${
              k === n ? "border-pink-500 bg-pink-500 text-white" : "border-pink-200 bg-white hover:bg-pink-50"
            }`}
          >
            {k}
          </Link>
        ))}
      </nav>

      <section className="mx-auto max-w-md rounded-3xl bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-extrabold">
            {t.tableOf} {n}
          </h2>
          <SpeakButton text={rows.map(spoken).join(". ")} label={t.readTable} size="lg" />
        </div>
        <ol className="divide-y divide-pink-100">
          {rows.map((k) => (
            <li key={k} className="flex items-center justify-between gap-3 py-2 text-2xl font-bold">
              <span>
                {n} × {k} = <span className="text-pink-600">{n * k}</span>
              </span>
              <SpeakButton text={spoken(k)} label={t.listen} />
            </li>
          ))}
        </ol>
        <Link
          href={`/practice?op=tables&table=${Math.max(n, 2)}&level=4`}
          className="mt-4 block rounded-full bg-brand-500 py-3 text-center text-lg font-extrabold text-white hover:bg-brand-600"
        >
          🎯 {t.practiseTable}
        </Link>
      </section>
    </div>
  );
}
