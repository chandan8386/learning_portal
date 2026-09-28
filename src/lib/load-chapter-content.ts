import fs from "node:fs";
import path from "node:path";
import { chapterContentSchema, type ChapterContent } from "./chapter-content";
import { normalizeChapters, type ClassSyllabus } from "./syllabus";

export const CHAPTER_CONTENT_DIR = path.join(process.cwd(), "content", "chapters");

export interface ChapterContentFile {
  classSlug: string;
  subjectSlug: string;
  chapterSlug: string;
  file: string;
  content: ChapterContent;
}

/**
 * Reads every content/chapters/<class>/<subject>/<chapter>.json file.
 * Throws with the file name when a file does not match the schema.
 */
export function loadChapterContent(dir: string = CHAPTER_CONTENT_DIR): ChapterContentFile[] {
  if (!fs.existsSync(dir)) return [];
  const results: ChapterContentFile[] = [];
  for (const classSlug of fs.readdirSync(dir).sort()) {
    const classDir = path.join(dir, classSlug);
    if (!fs.statSync(classDir).isDirectory()) continue;
    for (const subjectSlug of fs.readdirSync(classDir).sort()) {
      const subjectDir = path.join(classDir, subjectSlug);
      if (!fs.statSync(subjectDir).isDirectory()) continue;
      for (const name of fs.readdirSync(subjectDir).sort()) {
        if (!name.endsWith(".json")) continue;
        const file = path.join(subjectDir, name);
        const parsed = chapterContentSchema.safeParse(JSON.parse(fs.readFileSync(file, "utf8")));
        if (!parsed.success) {
          throw new Error(`Invalid chapter content ${path.relative(process.cwd(), file)}:\n${parsed.error.toString()}`);
        }
        results.push({ classSlug, subjectSlug, chapterSlug: name.replace(/\.json$/, ""), file, content: parsed.data });
      }
    }
  }
  return results;
}

/** Lists content files that don't match a chapter in the syllabus (usually a slug typo). */
export function findOrphanContent(classes: ClassSyllabus[], files: ChapterContentFile[]): string[] {
  const known = new Set<string>();
  for (const c of classes) {
    for (const s of c.subjects) {
      for (const ch of normalizeChapters(s.chapters)) known.add(`${c.slug}/${s.slug}/${ch.slug}`);
    }
  }
  return files
    .map((f) => `${f.classSlug}/${f.subjectSlug}/${f.chapterSlug}`)
    .filter((key) => !known.has(key))
    .map((key) => `content/chapters/${key}.json does not match any chapter in the syllabus`);
}
