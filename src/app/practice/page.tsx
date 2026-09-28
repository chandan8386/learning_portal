import Link from "next/link";
import { cookies } from "next/headers";
import { CLASS_COOKIE } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { getDictionary } from "@/lib/i18n";
import { levelForClassOrder, LEVELS, maxTable, OPERATIONS, type Level, type Operation } from "@/lib/math-practice";
import { getCurrentUser } from "@/lib/session";
import { MathPractice } from "./MathPractice";

export const metadata = { title: "Maths practice" };

type SearchParams = Promise<{ class?: string; op?: string; table?: string; level?: string }>;

export default async function PracticePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const [{ locale, t }, user, cookieStore] = await Promise.all([getDictionary(), getCurrentUser(), cookies()]);

  // Level: explicit ?level, else from ?class, the student's class, or the chosen class.
  const classSlug = params.class ?? user?.studentProfile?.class.slug ?? cookieStore.get(CLASS_COOKIE)?.value;
  const klass = classSlug ? await prisma.class.findUnique({ where: { slug: classSlug }, select: { order: true } }) : null;
  const requestedLevel = Number(params.level);
  const level: Level = (LEVELS as readonly number[]).includes(requestedLevel)
    ? (requestedLevel as Level)
    : levelForClassOrder(klass?.order ?? 5);

  const op = (OPERATIONS as readonly string[]).includes(params.op ?? "") ? (params.op as Operation) : undefined;
  const tableNumber = Number(params.table);
  const table = Number.isInteger(tableNumber) && tableNumber >= 2 && tableNumber <= maxTable(4) ? tableNumber : undefined;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">🎯 {t.mathsPractice}</h1>
          <p className="text-slate-600">{t.mathsPracticeIntro}</p>
        </div>
        <Link href="/practice/tables" className="rounded-full bg-pink-100 px-4 py-2 font-bold text-pink-900 hover:bg-pink-200">
          🔢 {t.tablesTitle}
        </Link>
      </div>
      <MathPractice
        key={`${op}-${table}-${level}`}
        t={t}
        locale={locale}
        defaultLevel={level}
        initialOp={op}
        initialTable={table}
        seed={Date.now()}
      />
    </div>
  );
}
