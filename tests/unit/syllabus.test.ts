import { describe, expect, it } from "vitest";
import { loadSyllabus } from "@/lib/load-syllabus";
import { findSyllabusProblems, normalizeChapters, slugify } from "@/lib/syllabus";

const classes = loadSyllabus();

describe("syllabus content", () => {
  it("covers every class from Nursery to Class 10 in order", () => {
    expect(classes.map((c) => c.slug)).toEqual([
      "nursery", "lkg", "ukg",
      "class-1", "class-2", "class-3", "class-4", "class-5",
      "class-6", "class-7", "class-8", "class-9", "class-10",
    ]);
    expect(classes.map((c) => c.order)).toEqual([...Array(13).keys()]);
  });

  it("marks exactly Nursery to Class 2 as audio-first", () => {
    const audioFirst = classes.filter((c) => c.audioFirst).map((c) => c.slug);
    expect(audioFirst).toEqual(["nursery", "lkg", "ukg", "class-1", "class-2"]);
  });

  it("has no duplicate slugs anywhere", () => {
    expect(classes.flatMap(findSyllabusProblems)).toEqual([]);
  });

  it("gives every class English, Hindi and a maths subject", () => {
    for (const c of classes) {
      const slugs = c.subjects.map((s) => s.slug);
      expect(slugs, c.slug).toContain("english");
      expect(slugs, c.slug).toContain("hindi");
      expect(slugs.some((s) => s === "maths" || s === "numbers"), c.slug).toBe(true);
    }
  });

  it("gives Hindi titles to every chapter and topic in the audio-first classes", () => {
    for (const c of classes.filter((k) => k.audioFirst)) {
      for (const s of c.subjects) {
        for (const ch of normalizeChapters(s.chapters)) {
          expect(ch.titleHi, `${c.slug}/${s.slug}/${ch.slug}`).toBeTruthy();
        }
      }
    }
  });

  it("includes the core NCERT Class 10 maths and science chapters", () => {
    const class10 = classes.find((c) => c.slug === "class-10")!;
    const titles = (slug: string) =>
      normalizeChapters(class10.subjects.find((s) => s.slug === slug)!.chapters).map((c) => c.title);
    expect(titles("maths")).toContain("Quadratic Equations");
    expect(titles("maths")).toHaveLength(14);
    expect(titles("science")).toContain("Electricity");
  });
});

describe("slugify", () => {
  it("makes URL-safe slugs", () => {
    expect(slugify("Light – Reflection and Refraction")).toBe("light-reflection-and-refraction");
    expect(slugify("Is Matter Around Us Pure?")).toBe("is-matter-around-us-pure");
    expect(slugify("Heron's Formula")).toBe("heron-s-formula");
    expect(slugify("Food & Water")).toBe("food-and-water");
  });

  it("returns an empty string for Devanagari-only text", () => {
    expect(slugify("दो बैलों की कथा")).toBe("");
  });
});

describe("normalizeChapters", () => {
  it("accepts strings and objects and falls back to positional slugs for Hindi", () => {
    const result = normalizeChapters([
      "Real Numbers",
      "सूरदास के पद",
      { title: "Shapes", titleHi: "आकृतियाँ", topics: ["Circle", { title: "Square", titleHi: "वर्ग" }] },
    ]);
    expect(result.map((c) => c.slug)).toEqual(["real-numbers", "chapter-2", "shapes"]);
    expect(result[2].topics).toEqual([
      { slug: "circle", title: "Circle", titleHi: undefined, order: 1 },
      { slug: "square", title: "Square", titleHi: "वर्ग", order: 2 },
    ]);
  });
});
