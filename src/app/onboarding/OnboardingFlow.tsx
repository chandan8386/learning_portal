"use client";

import { useState, useTransition } from "react";
import { completeOnboarding } from "@/app/actions";
import { SpeakButton } from "@/components/SpeakButton";
import { STAGES, type Locale } from "@/lib/constants";
import type { Dictionary } from "@/lib/dictionaries";
import { stageLabel } from "@/lib/stages";

type ClassOption = {
  slug: string;
  name: string;
  nameHi: string;
  stage: string;
  ageRange: string;
  audioFirst: boolean;
};

const LANGUAGES: { value: Locale; label: string; sample: string }[] = [
  { value: "en", label: "English", sample: "A B C" },
  { value: "hi", label: "हिंदी", sample: "अ आ इ" },
];

export function OnboardingFlow({
  initialLocale,
  dictionaries,
  classes,
}: {
  initialLocale: Locale;
  dictionaries: Record<Locale, Dictionary>;
  classes: ClassOption[];
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [classSlug, setClassSlug] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const t = dictionaries[locale];
  const chosen = classes.find((c) => c.slug === classSlug);
  const className = (c: ClassOption) => (locale === "hi" ? c.nameHi : c.name);

  return (
    <div className="mx-auto max-w-2xl">
      <ol className="mb-6 flex justify-center gap-2" aria-label="Steps">
        {[1, 2, 3].map((n) => (
          <li
            key={n}
            aria-current={step === n ? "step" : undefined}
            className={`h-3 w-12 rounded-full ${n <= step ? "bg-brand-500" : "bg-amber-200"}`}
          />
        ))}
      </ol>

      {step === 1 && (
        <section>
          <StepTitle text={t.onboardingLanguage} t={t} />
          <div className="grid grid-cols-2 gap-4">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.value}
                type="button"
                onClick={() => {
                  setLocale(lang.value);
                  setStep(2);
                }}
                className={`flex min-h-36 flex-col items-center justify-center rounded-3xl border-4 bg-white p-4 shadow-sm transition active:scale-95 ${locale === lang.value ? "border-brand-500" : "border-amber-200"}`}
              >
                <span className="text-4xl font-extrabold text-brand-600">{lang.sample}</span>
                <span className="mt-2 text-2xl font-bold">{lang.label}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 2 && (
        <section>
          <StepTitle text={t.onboardingClass} t={t} />
          <div className="space-y-5">
            {STAGES.map((stage) => {
              const inStage = classes.filter((c) => c.stage === stage);
              if (!inStage.length) return null;
              return (
                <div key={stage}>
                  <h3 className="mb-2 font-bold text-slate-600">{stageLabel(stage, t)}</h3>
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                    {inStage.map((c) => (
                      <button
                        key={c.slug}
                        type="button"
                        onClick={() => {
                          setClassSlug(c.slug);
                          setStep(3);
                        }}
                        className={`min-h-20 rounded-2xl border-4 bg-white p-2 text-lg font-extrabold shadow-sm transition active:scale-95 ${classSlug === c.slug ? "border-brand-500" : "border-amber-200"}`}
                      >
                        {className(c)}
                        <span className="block text-xs font-normal text-slate-500">
                          {t.age} {c.ageRange}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <BackButton label={t.back} onClick={() => setStep(1)} />
        </section>
      )}

      {step === 3 && chosen && (
        <section className="text-center">
          <p aria-hidden className="text-7xl">🎉</p>
          <StepTitle text={t.onboardingReady} t={t} />
          <p className="mb-6 text-2xl font-bold text-brand-700">{className(chosen)}</p>
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => completeOnboarding(locale, chosen.slug))}
            className="min-h-16 w-full rounded-full bg-brand-500 px-6 text-2xl font-extrabold text-white shadow-md transition hover:bg-brand-600 active:scale-95 disabled:opacity-60 sm:w-auto"
          >
            {t.startLearning} →
          </button>
          <BackButton label={t.back} onClick={() => setStep(2)} />
        </section>
      )}
    </div>
  );
}

function StepTitle({ text, t }: { text: string; t: Dictionary }) {
  return (
    <div className="mb-5 flex items-center justify-center gap-3">
      <h1 className="text-3xl font-extrabold">{text}</h1>
      <SpeakButton text={text} label={t.listen} />
    </div>
  );
}

function BackButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div className="mt-6 text-center">
      <button type="button" onClick={onClick} className="rounded-full px-4 py-2 font-semibold text-slate-600 hover:bg-amber-100">
        ← {label}
      </button>
    </div>
  );
}
