import { Prisma, PrismaClient } from "@prisma/client";
import { findOrphanContent, loadChapterContent } from "../src/lib/load-chapter-content";
import { loadSyllabus } from "../src/lib/load-syllabus";
import { normalizeChapters } from "../src/lib/syllabus";

const prisma = new PrismaClient();

/**
 * Loads the syllabus tree from content/syllabus into the database.
 * Safe to re-run: every row is upserted by its natural key (slugs).
 */
async function main() {
  const board = await prisma.board.upsert({
    where: { code: "CBSE" },
    update: {},
    create: { code: "CBSE", name: "CBSE / NCERT" },
  });

  const classes = loadSyllabus();
  const contentFiles = loadChapterContent();
  const orphans = findOrphanContent(classes, contentFiles);
  if (orphans.length) throw new Error(orphans.join("\n"));
  const contentByKey = new Map(
    contentFiles.map((f) => [`${f.classSlug}/${f.subjectSlug}/${f.chapterSlug}`, f.content]),
  );
  let subjectCount = 0;
  let chapterCount = 0;
  let topicCount = 0;

  for (const c of classes) {
    const classData = {
      name: c.name,
      nameHi: c.nameHi,
      order: c.order,
      stage: c.stage,
      ageRange: c.ageRange,
      audioFirst: c.audioFirst,
      boardId: board.id,
    };
    const klass = await prisma.class.upsert({
      where: { slug: c.slug },
      update: classData,
      create: { slug: c.slug, ...classData },
    });

    for (const [i, s] of c.subjects.entries()) {
      const subjectData = {
        name: s.name,
        nameHi: s.nameHi,
        icon: s.icon,
        color: s.color,
        order: i + 1,
        book: s.book ?? null,
      };
      const subject = await prisma.subject.upsert({
        where: { classId_slug: { classId: klass.id, slug: s.slug } },
        update: subjectData,
        create: { classId: klass.id, slug: s.slug, ...subjectData },
      });
      subjectCount++;

      for (const ch of normalizeChapters(s.chapters)) {
        const content = contentByKey.get(`${c.slug}/${s.slug}/${ch.slug}`);
        const chapterData = {
          title: ch.title,
          titleHi: ch.titleHi ?? null,
          order: ch.order,
          learningOutcomes: ch.learningOutcomes,
          content: content ?? Prisma.DbNull,
        };
        const chapter = await prisma.chapter.upsert({
          where: { subjectId_slug: { subjectId: subject.id, slug: ch.slug } },
          update: chapterData,
          create: { subjectId: subject.id, slug: ch.slug, ...chapterData },
        });
        chapterCount++;

        for (const t of ch.topics) {
          const topicData = { title: t.title, titleHi: t.titleHi ?? null, order: t.order };
          await prisma.topic.upsert({
            where: { chapterId_slug: { chapterId: chapter.id, slug: t.slug } },
            update: topicData,
            create: { chapterId: chapter.id, slug: t.slug, ...topicData },
          });
          topicCount++;
        }
      }
    }
  }

  console.log(
    `Seeded ${classes.length} classes, ${subjectCount} subjects, ${chapterCount} chapters, ${topicCount} topics, ` +
      `study material for ${contentFiles.length} chapters.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
