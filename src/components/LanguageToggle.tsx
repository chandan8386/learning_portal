"use client";

import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { setLocale } from "@/app/actions";
import type { Locale } from "@/lib/constants";

export function LanguageToggle({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const next: Locale = locale === "en" ? "hi" : "en";

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => setLocale(next, pathname))}
      className="rounded-full border-2 border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
      aria-label={next === "hi" ? "हिंदी में बदलें" : "Switch to English"}
    >
      {next === "hi" ? "हिंदी" : "English"}
    </button>
  );
}
