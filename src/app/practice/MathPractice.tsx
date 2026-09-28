"use client";

import { useState } from "react";
import { NumberPad } from "@/components/NumberPad";
import { SpeakButton } from "@/components/SpeakButton";
import type { Locale } from "@/lib/constants";
import type { Dictionary } from "@/lib/dictionaries";
import {
  LEVELS,
  makeRound,
  maxTable,
  operationsForLevel,
  spokenQuestion,
  type Level,
  type Operation,
  type Question,
} from "@/lib/math-practice";

const OP_STYLE: Record<Operation, { icon: string; card: string }> = {
  add: { icon: "➕", card: "bg-emerald-100 border-emerald-300" },
  sub: { icon: "➖", card: "bg-sky-100 border-sky-300" },
  mul: { icon: "✖️", card: "bg-violet-100 border-violet-300" },
  div: { icon: "➗", card: "bg-orange-100 border-orange-300" },
  tables: { icon: "🔢", card: "bg-pink-100 border-pink-300" },
};

const ROUND_SIZE = 10;

type Props = {
  t: Dictionary;
  locale: Locale;
  defaultLevel: Level;
  initialOp?: Operation;
  initialTable?: number;
  /** Seed from the server so the first round renders the same on server and client. */
  seed: number;
};

export function MathPractice({ t, locale, defaultLevel, initialOp, initialTable, seed }: Props) {
  const [level, setLevel] = useState<Level>(defaultLevel);
  // A tables round needs a table number; without one we start by choosing it.
  const [op, setOp] = useState<Operation | null>(
    initialOp && (initialOp !== "tables" || initialTable) ? initialOp : null,
  );
  const [table, setTable] = useState<number | null>(initialOp === "tables" ? (initialTable ?? null) : null);
  const [choosingTable, setChoosingTable] = useState(initialOp === "tables" && !initialTable);
  const [round, setRound] = useState<Question[] | null>(() =>
    initialOp && (initialOp !== "tables" || initialTable)
      ? makeRound(initialOp, defaultLevel, seed, ROUND_SIZE, initialTable)
      : null,
  );
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [checked, setChecked] = useState<null | boolean>(null);
  const [score, setScore] = useState(0);

  const opLabel: Record<Operation, string> = {
    add: t.opAdd,
    sub: t.opSub,
    mul: t.opMul,
    div: t.opDiv,
    tables: t.opTables,
  };
  const levelLabel: Record<Level, string> = { 1: t.level1, 2: t.level2, 3: t.level3, 4: t.level4 };

  function start(nextOp: Operation, nextTable?: number) {
    setOp(nextOp);
    setTable(nextTable ?? null);
    setChoosingTable(false);
    setRound(makeRound(nextOp, level, Date.now(), ROUND_SIZE, nextTable));
    setIndex(0);
    setInput("");
    setChecked(null);
    setScore(0);
  }

  function reset() {
    setOp(null);
    setTable(null);
    setChoosingTable(false);
    setRound(null);
  }

  // Step 1: choose level and operation.
  if (!round && !choosingTable) {
    return (
      <div className="space-y-6">
        <fieldset>
          <legend className="mb-2 font-bold">{t.level}</legend>
          <div className="flex flex-wrap gap-2">
            {LEVELS.map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={level === l}
                onClick={() => setLevel(l)}
                className={`rounded-full border-2 px-4 py-2 font-semibold ${level === l ? "border-brand-500 bg-brand-500 text-white" : "border-amber-200 bg-white"}`}
              >
                {levelLabel[l]}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {operationsForLevel(level).map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => (o === "tables" ? setChoosingTable(true) : start(o))}
              className={`flex min-h-32 flex-col items-center justify-center gap-2 rounded-3xl border-2 p-4 text-xl font-extrabold shadow-sm transition active:scale-95 ${OP_STYLE[o].card}`}
            >
              <span aria-hidden className="text-5xl">
                {OP_STYLE[o].icon}
              </span>
              {opLabel[o]}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Step 1b: choose which table.
  if (choosingTable) {
    return (
      <div>
        <h2 className="mb-3 text-xl font-bold">{t.chooseTable}</h2>
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
          {Array.from({ length: maxTable(level) - 1 }, (_, i) => i + 2).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => start("tables", n)}
              className="h-14 rounded-2xl border-2 border-pink-300 bg-pink-100 text-xl font-bold active:scale-95"
            >
              {n}
            </button>
          ))}
        </div>
        <BackLink label={t.changeTopic} onClick={reset} />
      </div>
    );
  }

  if (!round || !op) return null;

  // Step 3: results.
  if (index >= round.length) {
    const stars = score === round.length ? 3 : score >= round.length * 0.7 ? 2 : score >= round.length * 0.4 ? 1 : 0;
    return (
      <div className="rounded-3xl bg-white p-6 text-center shadow-sm">
        <p aria-hidden className="text-5xl">
          {"⭐".repeat(stars) || "💪"}
        </p>
        <h2 className="mt-3 text-2xl font-extrabold">
          {t.score}: {score} / {round.length}
        </h2>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => start(op, table ?? undefined)}
            className="min-h-12 rounded-full bg-brand-500 px-6 font-bold text-white hover:bg-brand-600"
          >
            🔁 {t.playAgain}
          </button>
          <button type="button" onClick={reset} className="min-h-12 rounded-full bg-slate-100 px-6 font-bold hover:bg-slate-200">
            {t.changeTopic}
          </button>
        </div>
      </div>
    );
  }

  // Step 2: answer questions one at a time.
  const q = round[index];
  function check() {
    if (checked !== null || input === "") return;
    const ok = Number(input) === q.answer;
    setChecked(ok);
    if (ok) setScore((s) => s + 1);
  }
  function next() {
    setIndex((i) => i + 1);
    setInput("");
    setChecked(null);
  }
  const type = (d: string) => checked === null && setInput((v) => (v.length < 7 ? (v === "0" ? d : v + d) : v));

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-3 flex items-center justify-between text-sm font-semibold text-slate-600">
        <span>
          {opLabel[op]}
          {table ? ` · ${t.tableOf} ${table}` : ""}
        </span>
        <span>
          {t.question} {index + 1} {t.of} {round.length} · ⭐ {score}
        </span>
      </div>
      <div className="mb-2 h-2 overflow-hidden rounded-full bg-amber-100">
        <div className="h-full bg-brand-500 transition-all" style={{ width: `${(index / round.length) * 100}%` }} />
      </div>

      <div className="rounded-3xl bg-white p-5 text-center shadow-sm">
        <div className="flex items-center justify-center gap-3">
          <p className="text-4xl font-extrabold tracking-wide sm:text-5xl" data-testid="question">
            {q.text} =
          </p>
          <SpeakButton text={spokenQuestion(q, locale)} label={t.listen} />
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (checked === null) check();
            else next();
          }}
          className="mt-4"
        >
          <label className="sr-only" htmlFor="answer">
            {t.yourAnswer}
          </label>
          <input
            id="answer"
            inputMode="numeric"
            autoComplete="off"
            value={input}
            readOnly={checked !== null}
            onChange={(e) => setInput(e.target.value.replace(/\D/g, "").slice(0, 7))}
            placeholder="?"
            className={`w-40 rounded-2xl border-4 bg-amber-50 py-2 text-center text-4xl font-extrabold ${
              checked === null ? "border-amber-300" : checked ? "border-emerald-500" : "border-rose-400"
            }`}
          />
          {checked === null ? (
            <button
              type="submit"
              disabled={input === ""}
              className="mt-4 block min-h-14 w-full rounded-full bg-brand-500 text-xl font-extrabold text-white disabled:opacity-50"
            >
              {t.check}
            </button>
          ) : (
            <div className="mt-4 space-y-3">
              <p
                role="status"
                className={`rounded-2xl p-3 text-lg font-bold ${checked ? "bg-emerald-100 text-emerald-900" : "bg-rose-100 text-rose-900"}`}
              >
                {checked ? `✅ ${t.correct}` : `❌ ${t.notQuite} ${q.answer}.`}
              </p>
              {!checked && (
                <p className="rounded-2xl bg-amber-50 p-3 text-left">
                  <span className="font-semibold">{t.howToSolve}: </span>
                  {locale === "hi" ? q.working.hi : q.working.en}
                </p>
              )}
              <button type="submit" autoFocus className="min-h-14 w-full rounded-full bg-brand-500 text-xl font-extrabold text-white">
                {t.nextQuestion} →
              </button>
            </div>
          )}
        </form>
      </div>

      {checked === null && (
        <div className="mt-4">
          <NumberPad
            onDigit={type}
            onBackspace={() => setInput((v) => v.slice(0, -1))}
            onClear={() => setInput("")}
            clearLabel={t.clear}
          />
        </div>
      )}
      <BackLink label={t.changeTopic} onClick={reset} />
    </div>
  );
}

function BackLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div className="mt-6 text-center">
      <button type="button" onClick={onClick} className="rounded-full px-4 py-2 font-semibold text-slate-600 hover:bg-amber-100">
        ← {label}
      </button>
    </div>
  );
}

