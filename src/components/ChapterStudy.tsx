import { textFor, type ChapterContent, type Text } from "@/lib/chapter-content";
import type { Locale } from "@/lib/constants";
import type { Dictionary } from "@/lib/dictionaries";
import { SpeakButton } from "./SpeakButton";

type Props = {
  content: ChapterContent;
  locale: Locale;
  t: Dictionary;
  /** Audio-first classes get bigger text and a speaker button on every line. */
  kid: boolean;
};

/**
 * Chapter study material: explanation, key points, formulas, solved examples
 * with step-by-step working, and practice questions with hidden answers.
 * Answers use <details> so they work without JavaScript.
 */
export function ChapterStudy({ content, locale, t, kid }: Props) {
  const say = (text: Text) => textFor(text, locale);
  const speak = (text: string) => (kid ? <SpeakButton text={text} label={t.listen} /> : null);
  const body = kid ? "text-lg" : "";

  return (
    <div className="space-y-6">
      {content.status === "DRAFT" && (
        <p className="rounded-2xl bg-amber-100 p-3 text-sm font-semibold text-amber-900">⚠️ {t.draftNotice}</p>
      )}

      <section aria-labelledby="understand" className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 id="understand" className="mb-2 text-xl font-bold">
          📘 {t.understand}
        </h2>
        <div className="flex items-start gap-3">
          <p className={`flex-1 whitespace-pre-line leading-relaxed ${body}`}>{say(content.intro)}</p>
          {speak(say(content.intro))}
        </div>
      </section>

      <section aria-labelledby="key-points" className="rounded-3xl bg-sky-50 p-5 shadow-sm">
        <h2 id="key-points" className="mb-3 text-xl font-bold">
          ⭐ {t.keyPoints}
        </h2>
        <ul className="space-y-2">
          {content.keyPoints.map((point, i) => (
            <li key={i} className={`flex items-start gap-2 ${body}`}>
              <span aria-hidden className="mt-0.5">✔️</span>
              <span className="flex-1">{say(point)}</span>
              {speak(say(point))}
            </li>
          ))}
        </ul>
      </section>

      {content.formulas && content.formulas.length > 0 && (
        <section aria-labelledby="formulas" className="rounded-3xl border-2 border-violet-200 bg-violet-50 p-5">
          <h2 id="formulas" className="mb-3 text-xl font-bold">
            🧮 {t.formulas}
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {content.formulas.map((formula) => (
              <li key={formula} className="rounded-xl bg-white px-3 py-2 font-mono text-sm font-semibold sm:text-base">
                {formula}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="examples">
        <h2 id="examples" className="mb-3 text-xl font-bold">
          ✏️ {t.solvedExamples}
        </h2>
        <ol className="space-y-4">
          {content.examples.map((example, i) => (
            <li key={i} className="rounded-3xl border-2 border-emerald-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">
                {t.example} {i + 1}
                {example.title && ` · ${say(example.title)}`}
              </p>
              <div className="mt-1 flex items-start gap-3">
                <p className={`flex-1 font-semibold ${kid ? "text-xl" : "text-lg"}`}>{say(example.problem)}</p>
                {speak(say(example.problem))}
              </div>
              <ol className="mt-3 space-y-2 border-l-4 border-emerald-200 pl-4">
                {example.steps.map((step, j) => (
                  <li key={j} className={`flex items-start gap-2 ${body}`}>
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                      {j + 1}
                    </span>
                    <span className="flex-1 whitespace-pre-line">{say(step)}</span>
                    {speak(say(step))}
                  </li>
                ))}
              </ol>
              <div className="mt-3 flex items-center gap-3 rounded-2xl bg-emerald-50 p-3">
                <p className={`flex-1 font-bold text-emerald-900 ${body}`}>
                  ✅ {t.answer}: {say(example.answer)}
                </p>
                {speak(say(example.answer))}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="practice">
        <h2 id="practice" className="text-xl font-bold">
          🧠 {t.practice}
        </h2>
        <p className="mb-3 text-slate-600">{t.practiceHint}</p>
        <ol className="space-y-3">
          {content.practice.map((q, i) => (
            <li key={i} className="rounded-2xl border-2 border-orange-200 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <p className={`flex-1 font-semibold ${body}`}>
                  <span className="mr-1 text-orange-600">Q{i + 1}.</span> {say(q.question)}
                </p>
                {speak(say(q.question))}
              </div>
              {q.hint && (
                <p className="mt-1 text-sm text-slate-600">
                  💡 {t.hint}: {say(q.hint)}
                </p>
              )}
              <details className="group mt-2">
                <summary className="inline-flex min-h-11 cursor-pointer list-none items-center rounded-full bg-orange-100 px-4 font-semibold text-orange-800 hover:bg-orange-200 group-open:bg-orange-200">
                  👀 {t.showAnswer}
                </summary>
                <div className={`mt-2 rounded-xl bg-orange-50 p-3 ${body}`}>
                  <div className="flex items-center gap-3">
                    <p className="flex-1 font-bold">
                      {t.answer}: {say(q.answer)}
                    </p>
                    {speak(say(q.answer))}
                  </div>
                  {q.solution && q.solution.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-semibold text-slate-600">{t.solution}:</p>
                      <ol className="list-decimal pl-5">
                        {q.solution.map((line, j) => (
                          <li key={j}>{say(line)}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              </details>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
