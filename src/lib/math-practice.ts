/**
 * Generates arithmetic practice questions (addition, subtraction,
 * multiplication, division and times tables) at a level that matches the
 * child's class. All answers are whole numbers: subtraction never goes below
 * zero and division always divides exactly.
 */

export const OPERATIONS = ["add", "sub", "mul", "div", "tables"] as const;
export type Operation = (typeof OPERATIONS)[number];

export const LEVELS = [1, 2, 3, 4] as const;
export type Level = (typeof LEVELS)[number];

export interface Question {
  op: Operation;
  a: number;
  b: number;
  answer: number;
  /** e.g. "7 + 5" */
  text: string;
  /** How to work it out, shown after answering. */
  working: { en: string; hi: string };
}

const SYMBOL: Record<Operation, string> = { add: "+", sub: "−", mul: "×", div: "÷", tables: "×" };

/** A small seeded random generator so tests and "play again" are reproducible. */
export function createRng(seed: number): () => number {
  let state = seed >>> 0 || 1;
  return () => {
    // mulberry32
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function int(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

/** Default level for a class: Nursery–UKG 1, Class 1–2 2, Class 3–4 3, Class 5+ 4. */
export function levelForClassOrder(order: number): Level {
  if (order <= 2) return 1;
  if (order <= 4) return 2;
  if (order <= 6) return 3;
  return 4;
}

/** Operations that make sense at a level (no multiplication or division for the youngest). */
export function operationsForLevel(level: Level): Operation[] {
  return level === 1 ? ["add", "sub"] : [...OPERATIONS];
}

/** Highest times table offered at a level. */
export function maxTable(level: Level): number {
  return level <= 2 ? 10 : 20;
}

const ADD_MAX: Record<Level, number> = { 1: 9, 2: 99, 3: 999, 4: 99999 };

function addition(rng: () => number, level: Level): Question {
  const max = ADD_MAX[level];
  const a = int(rng, 1, max);
  const b = int(rng, 1, level === 1 ? max - a || 1 : max);
  return {
    op: "add",
    a,
    b,
    answer: a + b,
    text: `${a} + ${b}`,
    working:
      level === 1
        ? { en: `Start at ${a} and count ${b} more.`, hi: `${a} से शुरू करके ${b} आगे गिनो।` }
        : { en: `Add the ones first, then the tens, carrying when a column is 10 or more.`, hi: `पहले इकाई जोड़ो, फिर दहाई; 10 या ज़्यादा हो तो हासिल आगे ले जाओ।` },
  };
}

function subtraction(rng: () => number, level: Level): Question {
  const max = ADD_MAX[level];
  const a = int(rng, level === 1 ? 2 : 10, max);
  const b = int(rng, 1, a);
  return {
    op: "sub",
    a,
    b,
    answer: a - b,
    text: `${a} − ${b}`,
    working:
      level === 1
        ? { en: `Start at ${a} and count back ${b}.`, hi: `${a} से ${b} पीछे गिनो।` }
        : { en: `Check: ${a - b} + ${b} = ${a}.`, hi: `जाँचो: ${a - b} + ${b} = ${a}।` },
  };
}

function multiplication(rng: () => number, level: Level): Question {
  const [a, b] =
    level === 2
      ? [int(rng, 2, 10), int(rng, 1, 10)]
      : level === 3
        ? [int(rng, 11, 99), int(rng, 2, 9)]
        : [int(rng, 100, 999), int(rng, 11, 99)];
  return {
    op: "mul",
    a,
    b,
    answer: a * b,
    text: `${a} × ${b}`,
    working:
      level === 2
        ? { en: `Use the table of ${a}: ${a} × ${b} = ${a * b}.`, hi: `${a} का पहाड़ा: ${a} × ${b} = ${a * b}।` }
        : { en: `Break it up: ${splitWorking(a, b)}.`, hi: `तोड़कर गुणा करो: ${splitWorking(a, b)}।` },
  };
}

function splitWorking(a: number, b: number): string {
  const tens = a - (a % 10);
  const ones = a % 10;
  if (!ones) return `${a} × ${b} = ${a * b}`;
  return `${tens} × ${b} = ${tens * b}, ${ones} × ${b} = ${ones * b}, ${tens * b} + ${ones * b} = ${a * b}`;
}

function division(rng: () => number, level: Level): Question {
  // Build it backwards from a multiplication so it always divides exactly.
  const [divisor, quotient] =
    level === 2
      ? [int(rng, 2, 5), int(rng, 1, 10)]
      : level === 3
        ? [int(rng, 2, 9), int(rng, 2, 12)]
        : [int(rng, 2, 25), int(rng, 11, 99)];
  const dividend = divisor * quotient;
  return {
    op: "div",
    a: dividend,
    b: divisor,
    answer: quotient,
    text: `${dividend} ÷ ${divisor}`,
    working: {
      en: `Which number times ${divisor} makes ${dividend}? ${divisor} × ${quotient} = ${dividend}.`,
      hi: `${divisor} को किससे गुणा करें कि ${dividend} बने? ${divisor} × ${quotient} = ${dividend}।`,
    },
  };
}

function tableQuestion(rng: () => number, table: number): Question {
  const b = int(rng, 1, 10);
  return {
    op: "tables",
    a: table,
    b,
    answer: table * b,
    text: `${table} × ${b}`,
    working: { en: `Table of ${table}: ${table} × ${b} = ${table * b}.`, hi: `${table} का पहाड़ा: ${table} × ${b} = ${table * b}।` },
  };
}

export function makeQuestion(op: Operation, level: Level, rng: () => number, table?: number): Question {
  switch (op) {
    case "add":
      return addition(rng, level);
    case "sub":
      return subtraction(rng, level);
    case "mul":
      return multiplication(rng, level === 1 ? 2 : level);
    case "div":
      return division(rng, level === 1 ? 2 : level);
    case "tables":
      return tableQuestion(rng, table ?? int(rng, 2, maxTable(level)));
  }
}

/** A round of distinct questions. */
export function makeRound(op: Operation, level: Level, seed: number, count = 10, table?: number): Question[] {
  const rng = createRng(seed);
  const round: Question[] = [];
  const seen = new Set<string>();
  for (let tries = 0; round.length < count && tries < count * 20; tries++) {
    const q = makeQuestion(op, level, rng, table);
    if (seen.has(q.text)) continue;
    seen.add(q.text);
    round.push(q);
  }
  return round;
}

/** Text for the speaker button, e.g. "7 plus 5" / "7 जमा 5". */
export function spokenQuestion(q: Question, lang: "en" | "hi"): string {
  const words =
    lang === "hi"
      ? { add: "जमा", sub: "घटा", mul: "गुणा", div: "भाग", tables: "गुणा" }
      : { add: "plus", sub: "minus", mul: "times", div: "divided by", tables: "times" };
  return `${q.a} ${words[q.op]} ${q.b}`;
}

export function symbolFor(op: Operation): string {
  return SYMBOL[op];
}
