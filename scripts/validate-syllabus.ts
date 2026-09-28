import { loadSyllabus } from "../src/lib/load-syllabus";
import { findSyllabusProblems, normalizeChapters } from "../src/lib/syllabus";

const classes = loadSyllabus();
const problems = classes.flatMap(findSyllabusProblems);

for (const c of classes) {
  const chapters = c.subjects.reduce((n, s) => n + normalizeChapters(s.chapters).length, 0);
  console.log(`${c.name.padEnd(10)} ${String(c.subjects.length).padStart(2)} subjects  ${String(chapters).padStart(3)} chapters`);
}

if (problems.length) {
  console.error("\nProblems found:\n" + problems.join("\n"));
  process.exit(1);
}
console.log("\nSyllabus is valid.");
