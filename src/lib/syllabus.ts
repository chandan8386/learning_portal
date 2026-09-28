import { z } from "zod";
import { STAGES, SUBJECT_COLORS } from "./constants";

/**
 * Syllabus seed format (content/syllabus/*.json).
 *
 * A chapter can be written as a plain string (English title only) or as an
 * object with a Hindi title, learning outcomes and topics. Slugs are derived
 * from the English title when not given.
 */
const topicSchema = z.union([
  z.string().min(1),
  z.object({ title: z.string().min(1), titleHi: z.string().optional() }),
]);

const chapterSchema = z.union([
  z.string().min(1),
  z.object({
    slug: z.string().optional(),
    title: z.string().min(1),
    titleHi: z.string().optional(),
    learningOutcomes: z.array(z.string()).optional(),
    topics: z.array(topicSchema).optional(),
  }),
]);

const subjectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  nameHi: z.string().min(1),
  icon: z.string().min(1),
  color: z.enum(SUBJECT_COLORS),
  book: z.string().optional(),
  chapters: z.array(chapterSchema).min(1),
});

export const classSyllabusSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  nameHi: z.string().min(1),
  order: z.number().int().min(0),
  stage: z.enum(STAGES),
  ageRange: z.string(),
  audioFirst: z.boolean(),
  subjects: z.array(subjectSchema).min(1),
});

export type ClassSyllabus = z.infer<typeof classSyllabusSchema>;

export interface NormalizedTopic {
  slug: string;
  title: string;
  titleHi?: string;
  order: number;
}

export interface NormalizedChapter {
  slug: string;
  title: string;
  titleHi?: string;
  order: number;
  learningOutcomes: string[];
  topics: NormalizedTopic[];
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Hindi-only titles have no Latin characters to slugify, so fall back to a
 * positional slug ("chapter-3") to keep URLs ASCII and stable.
 */
function slugOrFallback(title: string, prefix: string, order: number): string {
  return slugify(title) || `${prefix}-${order}`;
}

export function normalizeChapters(
  chapters: ClassSyllabus["subjects"][number]["chapters"],
): NormalizedChapter[] {
  return chapters.map((chapter, i) => {
    const order = i + 1;
    const c = typeof chapter === "string" ? { title: chapter } : chapter;
    const topics = ("topics" in c && c.topics ? c.topics : []).map((topic, j) => {
      const t = typeof topic === "string" ? { title: topic } : topic;
      return {
        slug: slugOrFallback(t.title, "topic", j + 1),
        title: t.title,
        titleHi: t.titleHi,
        order: j + 1,
      };
    });
    return {
      slug: ("slug" in c && c.slug) || slugOrFallback(c.title, "chapter", order),
      title: c.title,
      titleHi: "titleHi" in c ? c.titleHi : undefined,
      order,
      learningOutcomes: ("learningOutcomes" in c && c.learningOutcomes) || [],
      topics,
    };
  });
}

/** Returns a list of human-readable problems (empty when the file is valid). */
export function findSyllabusProblems(data: ClassSyllabus): string[] {
  const problems: string[] = [];
  const subjectSlugs = new Set<string>();
  for (const subject of data.subjects) {
    if (subjectSlugs.has(subject.slug)) {
      problems.push(`${data.slug}: duplicate subject slug "${subject.slug}"`);
    }
    subjectSlugs.add(subject.slug);

    const chapterSlugs = new Set<string>();
    for (const chapter of normalizeChapters(subject.chapters)) {
      if (chapterSlugs.has(chapter.slug)) {
        problems.push(`${data.slug}/${subject.slug}: duplicate chapter slug "${chapter.slug}"`);
      }
      chapterSlugs.add(chapter.slug);

      const topicSlugs = new Set<string>();
      for (const topic of chapter.topics) {
        if (topicSlugs.has(topic.slug)) {
          problems.push(
            `${data.slug}/${subject.slug}/${chapter.slug}: duplicate topic slug "${topic.slug}"`,
          );
        }
        topicSlugs.add(topic.slug);
      }
    }
  }
  return problems;
}
