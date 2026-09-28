import { describe, expect, it } from "vitest";
import { chapterContentSchema, parseChapterContent, textFor } from "@/lib/chapter-content";
import { findOrphanContent, loadChapterContent } from "@/lib/load-chapter-content";
import { loadSyllabus } from "@/lib/load-syllabus";
import { normalizeChapters } from "@/lib/syllabus";

const files = loadChapterContent();
const classes = loadSyllabus();

describe("chapter study material files", () => {
  it("all parse and match a chapter in the syllabus", () => {
    expect(files.length).toBeGreaterThanOrEqual(35);
    expect(findOrphanContent(classes, files)).toEqual([]);
  });

  it("covers every Class 1 and Class 10 maths chapter", () => {
    for (const classSlug of ["class-1", "class-10"]) {
      const maths = classes.find((c) => c.slug === classSlug)!.subjects.find((s) => s.slug === "maths")!;
      const covered = files.filter((f) => f.classSlug === classSlug && f.subjectSlug === "maths").length;
      expect(covered, classSlug).toBe(maths.chapters.length);
    }
  });

  it("covers every chapter of every subject from Nursery to Class 2", () => {
    const have = new Set(files.map((f) => `${f.classSlug}/${f.subjectSlug}/${f.chapterSlug}`));
    const missing = classes
      .filter((c) => c.audioFirst)
      .flatMap((c) => c.subjects.flatMap((s) => normalizeChapters(s.chapters).map((ch) => `${c.slug}/${s.slug}/${ch.slug}`)))
      .filter((key) => !have.has(key));
    expect(missing).toEqual([]);
  });

  it("gives Hindi for every text in the audio-first classes", () => {
    const audioFirst = new Set(classes.filter((c) => c.audioFirst).map((c) => c.slug));
    for (const f of files.filter((file) => audioFirst.has(file.classSlug))) {
      const texts = [
        f.content.intro,
        ...f.content.keyPoints,
        ...f.content.examples.flatMap((e) => [e.problem, ...e.steps]),
        ...f.content.practice.map((p) => p.question),
      ];
      for (const text of texts) {
        // Plain strings are allowed only for language-neutral text like "3 + 3 = ?".
        const hindi = typeof text === "string" ? !/[a-z]{3,}/i.test(text) : Boolean(text.hi);
        expect(hindi, `${f.classSlug}/${f.subjectSlug}/${f.chapterSlug}: ${JSON.stringify(text)}`).toBe(true);
      }
    }
  });
});

describe("chapterContentSchema", () => {
  const minimal = {
    status: "REVIEWED",
    intro: "Intro",
    keyPoints: ["Point"],
    examples: [{ problem: "2 + 2", steps: ["Add"], answer: "4" }],
    practice: [{ question: "1 + 1", answer: "2" }],
  };

  it("accepts the minimal shape", () => {
    expect(chapterContentSchema.safeParse(minimal).success).toBe(true);
  });

  it("requires at least one example and one practice question", () => {
    expect(chapterContentSchema.safeParse({ ...minimal, examples: [] }).success).toBe(false);
    expect(chapterContentSchema.safeParse({ ...minimal, practice: [] }).success).toBe(false);
  });

  it("parseChapterContent returns null for missing or broken content", () => {
    expect(parseChapterContent(null)).toBeNull();
    expect(parseChapterContent({ status: "REVIEWED" })).toBeNull();
    expect(parseChapterContent(minimal)?.intro).toBe("Intro");
  });
});

describe("textFor", () => {
  it("picks Hindi when available and falls back to English", () => {
    expect(textFor({ en: "Add", hi: "जोड़ो" }, "hi")).toBe("जोड़ो");
    expect(textFor({ en: "Add" }, "hi")).toBe("Add");
    expect(textFor({ en: "Add", hi: "जोड़ो" }, "en")).toBe("Add");
    expect(textFor("3 + 3", "hi")).toBe("3 + 3");
  });
});
