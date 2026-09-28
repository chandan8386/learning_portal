import { z } from "zod";
import type { Locale } from "./constants";

/**
 * Chapter study material (content/chapters/<class>/<subject>/<chapter>.json):
 * a short explanation, key points, solved examples with steps, and practice
 * problems with answers.
 *
 * Any text can be a plain string (one language) or { en, hi }.
 */
export const textSchema = z.union([
  z.string().min(1),
  z.object({ en: z.string().min(1), hi: z.string().min(1).optional() }),
]);
export type Text = z.infer<typeof textSchema>;

export const exampleSchema = z.object({
  title: textSchema.optional(),
  problem: textSchema,
  steps: z.array(textSchema).min(1),
  answer: textSchema,
});

export const practiceSchema = z.object({
  question: textSchema,
  hint: textSchema.optional(),
  answer: textSchema,
  solution: z.array(textSchema).optional(),
});

export const chapterContentSchema = z.object({
  // DRAFT = machine-generated and not yet checked by a teacher.
  status: z.enum(["DRAFT", "REVIEWED"]),
  intro: textSchema,
  keyPoints: z.array(textSchema).min(1),
  formulas: z.array(z.string().min(1)).optional(),
  examples: z.array(exampleSchema).min(1),
  practice: z.array(practiceSchema).min(1),
});

export type ChapterContent = z.infer<typeof chapterContentSchema>;
export type Example = z.infer<typeof exampleSchema>;
export type Practice = z.infer<typeof practiceSchema>;

/** Returns the text for the locale, falling back to English. */
export function textFor(text: Text, locale: Locale): string {
  if (typeof text === "string") return text;
  return locale === "hi" && text.hi ? text.hi : text.en;
}

/** Parses content stored in the database; returns null when missing or invalid. */
export function parseChapterContent(value: unknown): ChapterContent | null {
  if (value == null) return null;
  const parsed = chapterContentSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
