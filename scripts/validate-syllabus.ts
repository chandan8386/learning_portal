import { findOrphanContent, loadChapterContent } from "../src/lib/load-chapter-content";
import { loadSyllabus } from "../src/lib/load-syllabus";
import { findSyllabusProblems, normalizeChapters } from "../src/lib/syllabus";

const classes = loadSyllabus();
const contentFiles = loadChapterContent();
const problems = [...classes.flatMap(findSyllabusProblems), ...findOrphanContent(classes, contentFiles)];

for (const c of classes) {
  const chapters = c.subjects.reduce((n, s) => n + normalizeChapters(s.chapters).length, 0);
  console.log(`${c.name.padEnd(10)} ${String(c.subjects.length).padStart(2)} subjects  ${String(chapters).padStart(3)} chapters`);
}

const drafts = contentFiles.filter((f) => f.content.status === "DRAFT").length;
console.log(`\nChapter study material: ${contentFiles.length} chapters (${drafts} drafts awaiting review)`);

if (problems.length) {
  console.error("\nProblems found:\n" + problems.join("\n"));
  process.exit(1);
}
console.log("\nSyllabus is valid.");
