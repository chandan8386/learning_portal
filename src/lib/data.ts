import { Prisma } from "@prisma/client";
import { cache } from "react";
import { prisma } from "./db";

export const getClasses = cache(() =>
  prisma.class.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { subjects: true } } },
  }),
);

export const getClassWithSubjects = cache((slug: string) =>
  prisma.class.findUnique({
    where: { slug },
    include: {
      subjects: {
        orderBy: { order: "asc" },
        include: { _count: { select: { chapters: true } } },
      },
    },
  }),
);

export const getSubjectWithChapters = cache(async (classSlug: string, subjectSlug: string) => {
  const klass = await prisma.class.findUnique({ where: { slug: classSlug } });
  if (!klass) return null;
  const subject = await prisma.subject.findUnique({
    where: { classId_slug: { classId: klass.id, slug: subjectSlug } },
    include: {
      chapters: {
        orderBy: { order: "asc" },
        omit: { content: true },
        include: { _count: { select: { topics: true } } },
      },
    },
  });
  if (!subject) return null;
  // Which chapters have study material, without loading the material itself.
  const withContent = await prisma.chapter.findMany({
    where: { subjectId: subject.id, NOT: { content: { equals: Prisma.DbNull } } },
    select: { id: true },
  });
  const hasContent = new Set(withContent.map((c) => c.id));
  return {
    klass,
    subject: { ...subject, chapters: subject.chapters.map((c) => ({ ...c, hasContent: hasContent.has(c.id) })) },
  };
});

export const getChapter = cache(
  async (classSlug: string, subjectSlug: string, chapterSlug: string) => {
    const found = await getSubjectWithChapters(classSlug, subjectSlug);
    if (!found) return null;
    const chapter = await prisma.chapter.findUnique({
      where: { subjectId_slug: { subjectId: found.subject.id, slug: chapterSlug } },
      include: { topics: { orderBy: { order: "asc" } } },
    });
    if (!chapter) return null;
    const index = found.subject.chapters.findIndex((c) => c.id === chapter.id);
    return {
      ...found,
      chapter,
      prev: found.subject.chapters[index - 1] ?? null,
      next: found.subject.chapters[index + 1] ?? null,
    };
  },
);

export function learningOutcomes(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}
