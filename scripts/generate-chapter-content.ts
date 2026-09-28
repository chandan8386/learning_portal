/**
 * Drafts chapter study material (explanation, solved examples, practice) with
 * the Claude API for chapters that don't have a content file yet.
 *
 * Every generated file is saved with status "DRAFT" so the page shows a
 * "waiting for teacher review" notice. A teacher should check the maths and
 * facts, then change the status to "REVIEWED".
 *
 * Usage:
 *   npm run generate:content -- --class class-2                  # all subjects
 *   npm run generate:content -- --class class-7 --subject science
 *   npm run generate:content -- --class class-4 --limit 3 --dry-run
 *
 * Needs ANTHROPIC_API_KEY (or an `ant auth login` profile).
 */
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { z } from "zod/v4";
import { chapterContentSchema, type ChapterContent } from "../src/lib/chapter-content";
import { CHAPTER_CONTENT_DIR } from "../src/lib/load-chapter-content";
import { loadSyllabus } from "../src/lib/load-syllabus";
import { normalizeChapters, type ClassSyllabus, type NormalizedChapter } from "../src/lib/syllabus";

const MODEL = "claude-opus-5";
const CONCURRENCY = 3;

// The model always writes both languages; empty lists are dropped when saving.
const bilingual = z.object({
  en: z.string().describe("English text"),
  hi: z.string().describe("The same text in simple Hindi (Devanagari)"),
});

const generatedSchema = z.object({
  intro: bilingual,
  keyPoints: z.array(bilingual),
  formulas: z.array(z.string()).describe("Formulas or rules, empty if the chapter has none"),
  examples: z.array(
    z.object({
      title: bilingual,
      problem: bilingual,
      steps: z.array(bilingual),
      answer: bilingual,
    }),
  ),
  practice: z.array(
    z.object({
      question: bilingual,
      answer: bilingual,
      solution: z.array(bilingual).describe("Short working; empty for one-word answers"),
    }),
  ),
});
type Generated = z.infer<typeof generatedSchema>;

const SYSTEM_PROMPT = `You write study material for VidyaPath, an Indian learning portal for Nursery to Class 10 that follows the CBSE / NCERT curriculum.

For the chapter you are given, write:
- intro: a short, clear explanation of the core idea (3–5 sentences), starting from basics.
- keyPoints: 3–6 things the student must remember.
- formulas: the formulas or rules used in the chapter (empty if none).
- examples: 3–4 solved examples that go from easy to harder, each with clear numbered steps and a final answer. Use Indian contexts (rupees, cricket, festivals, local foods, Indian names).
- practice: 4–5 practice questions with correct answers, and short solutions where working is needed.

Rules:
- Write original content. Do not copy text from NCERT or any textbook.
- Match the language level to the student's age. For Nursery to Class 2, use very short sentences and simple words, since the text is read aloud to children who cannot read yet.
- Every answer must be correct. Work each problem out fully before writing it, and check the arithmetic.
- Write maths in plain text with Unicode symbols (×, ÷, −, ², √, π, ≤, θ). Do not use LaTeX or Markdown.
- The Hindi text should be natural, simple Hindi that a Hindi-medium student would understand, not a word-for-word translation. Keep numbers and formulas in the same form as the English.`;

interface Job {
  klass: ClassSyllabus;
  subject: ClassSyllabus["subjects"][number];
  chapter: NormalizedChapter;
  file: string;
}

function buildPrompt({ klass, subject, chapter }: Job): string {
  const lines = [
    `Class: ${klass.name} (age ${klass.ageRange})`,
    `Subject: ${subject.name}${subject.book ? ` (reference book: ${subject.book})` : ""}`,
    `Chapter ${chapter.order}: ${chapter.title}${chapter.titleHi ? ` / ${chapter.titleHi}` : ""}`,
  ];
  if (chapter.topics.length) lines.push(`Topics: ${chapter.topics.map((t) => t.title).join("; ")}`);
  if (chapter.learningOutcomes.length) lines.push(`Learning outcomes: ${chapter.learningOutcomes.join("; ")}`);
  const otherChapters = normalizeChapters(subject.chapters)
    .filter((c) => c.slug !== chapter.slug)
    .map((c) => c.title);
  lines.push(`Other chapters in this subject (stay within this chapter's scope): ${otherChapters.join("; ")}`);
  return lines.join("\n");
}

function toContent(generated: Generated): ChapterContent {
  const content: ChapterContent = {
    status: "DRAFT",
    intro: generated.intro,
    keyPoints: generated.keyPoints,
    formulas: generated.formulas.length ? generated.formulas : undefined,
    examples: generated.examples,
    practice: generated.practice.map(({ solution, ...rest }) => ({
      ...rest,
      solution: solution.length ? solution : undefined,
    })),
  };
  // Validate against the portal's own schema before writing to disk.
  return chapterContentSchema.parse(content);
}

async function generate(client: Anthropic, job: Job): Promise<ChapterContent> {
  const response = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    output_config: { effort: "high", format: betaZodOutputFormat(generatedSchema) },
    // If a request is declined, retry it server-side on a fallback model.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildPrompt(job) }],
  });

  if (response.stop_reason === "refusal") {
    throw new Error(`request was declined (${response.stop_details?.category ?? "no category"})`);
  }
  if (response.stop_reason === "max_tokens") {
    throw new Error("response was cut off at max_tokens");
  }
  if (!response.parsed_output) {
    throw new Error("response did not match the expected format");
  }
  return toContent(response.parsed_output);
}

async function main() {
  const { values } = parseArgs({
    options: {
      class: { type: "string" },
      subject: { type: "string" },
      limit: { type: "string" },
      overwrite: { type: "boolean", default: false },
      "dry-run": { type: "boolean", default: false },
    },
  });
  if (!values.class) {
    console.error("Usage: npm run generate:content -- --class <class-slug> [--subject <slug>] [--limit N] [--overwrite] [--dry-run]");
    process.exit(1);
  }

  const klass = loadSyllabus().find((c) => c.slug === values.class);
  if (!klass) throw new Error(`Unknown class "${values.class}"`);
  const subjects = klass.subjects.filter((s) => !values.subject || s.slug === values.subject);
  if (!subjects.length) throw new Error(`Unknown subject "${values.subject}" in ${klass.slug}`);

  let jobs: Job[] = subjects.flatMap((subject) =>
    normalizeChapters(subject.chapters).map((chapter) => ({
      klass,
      subject,
      chapter,
      file: path.join(CHAPTER_CONTENT_DIR, klass.slug, subject.slug, `${chapter.slug}.json`),
    })),
  );
  if (!values.overwrite) jobs = jobs.filter((job) => !fs.existsSync(job.file));
  if (values.limit) jobs = jobs.slice(0, Number(values.limit));

  console.log(`${jobs.length} chapter(s) to generate for ${klass.name}.`);
  if (values["dry-run"]) {
    for (const job of jobs) console.log(`  ${path.relative(process.cwd(), job.file)}`);
    return;
  }

  const client = new Anthropic();
  const failures: string[] = [];
  let next = 0;

  async function worker() {
    while (next < jobs.length) {
      const job = jobs[next++];
      const label = `${job.subject.slug}/${job.chapter.slug}`;
      try {
        const content = await generate(client, job);
        fs.mkdirSync(path.dirname(job.file), { recursive: true });
        fs.writeFileSync(job.file, JSON.stringify(content, null, 2) + "\n");
        console.log(`✔ ${label}`);
      } catch (error) {
        const message =
          error instanceof Anthropic.APIError ? `API error ${error.status}: ${error.message}` : String(error);
        failures.push(`${label}: ${message}`);
        console.error(`✘ ${label}: ${message}`);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, jobs.length) }, worker));

  console.log(`\nDone: ${jobs.length - failures.length} written, ${failures.length} failed.`);
  if (jobs.length > failures.length) {
    console.log("Review the drafts, set \"status\" to \"REVIEWED\", then run: npm run db:seed");
  }
  if (failures.length) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
