import { describe, expect, it } from "vitest";
import {
  LEVELS,
  levelForClassOrder,
  makeRound,
  operationsForLevel,
  OPERATIONS,
  spokenQuestion,
  type Level,
} from "@/lib/math-practice";

function evaluate(text: string): number {
  const [a, op, b] = text.split(" ");
  const x = Number(a);
  const y = Number(b);
  switch (op) {
    case "+":
      return x + y;
    case "−":
      return x - y;
    case "×":
      return x * y;
    case "÷":
      return x / y;
  }
  throw new Error(`unknown operator in ${text}`);
}

describe("math practice questions", () => {
  for (const level of LEVELS) {
    for (const op of operationsForLevel(level)) {
      it(`level ${level} ${op}: answers are correct whole numbers`, () => {
        for (let seed = 1; seed <= 30; seed++) {
          for (const q of makeRound(op, level, seed)) {
            expect(evaluate(q.text), q.text).toBe(q.answer);
            expect(Number.isInteger(q.answer), q.text).toBe(true);
            expect(q.answer, q.text).toBeGreaterThanOrEqual(0);
          }
        }
      });
    }
  }

  it("keeps the youngest level within 10 and without multiplication or division", () => {
    expect(operationsForLevel(1)).toEqual(["add", "sub"]);
    for (let seed = 1; seed <= 50; seed++) {
      for (const q of makeRound("add", 1, seed)) expect(q.answer).toBeLessThanOrEqual(10);
    }
  });

  it("gives 10 different questions per round and is reproducible from the seed", () => {
    const round = makeRound("mul", 2, 42);
    expect(round).toHaveLength(10);
    expect(new Set(round.map((q) => q.text)).size).toBe(10);
    expect(makeRound("mul", 2, 42)).toEqual(round);
  });

  it("asks only the chosen table", () => {
    for (const q of makeRound("tables", 2, 7, 10, 7)) {
      expect(q.a).toBe(7);
      expect(q.b).toBeGreaterThanOrEqual(1);
      expect(q.b).toBeLessThanOrEqual(10);
    }
  });

  it("maps classes to levels", () => {
    const levels: Level[] = [0, 2, 3, 4, 5, 6, 7, 12].map(levelForClassOrder);
    expect(levels).toEqual([1, 1, 2, 2, 3, 3, 4, 4]);
  });

  it("reads questions aloud in English and Hindi", () => {
    const [q] = makeRound("div", 3, 1);
    expect(spokenQuestion(q, "en")).toBe(`${q.a} divided by ${q.b}`);
    expect(spokenQuestion(q, "hi")).toBe(`${q.a} भाग ${q.b}`);
  });

  it("covers every operation", () => {
    expect(OPERATIONS).toEqual(["add", "sub", "mul", "div", "tables"]);
  });
});
