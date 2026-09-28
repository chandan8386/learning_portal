import fs from "node:fs";
import path from "node:path";
import { classSyllabusSchema, type ClassSyllabus } from "./syllabus";

export const SYLLABUS_DIR = path.join(process.cwd(), "content", "syllabus");

/** Reads and validates every class file in content/syllabus, sorted by class order. */
export function loadSyllabus(dir: string = SYLLABUS_DIR): ClassSyllabus[] {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  const classes = files.map((file) => {
    const raw = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
    const parsed = classSyllabusSchema.safeParse(raw);
    if (!parsed.success) {
      throw new Error(`Invalid syllabus file ${file}:\n${parsed.error.toString()}`);
    }
    return parsed.data;
  });
  return classes.sort((a, b) => a.order - b.order);
}
