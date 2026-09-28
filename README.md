# VidyaPath: Nursery to Class 10 Learning Portal

A mobile-first, bilingual (English + हिंदी) learning portal covering the full syllabus from **Nursery to Class 10**, aligned to CBSE / NCERT. Nursery to Class 2 is **audio-first**: every title and learning outcome has a 🔊 speaker button, so children who can't read yet can listen.

The full product plan lives in [`CLAUDE_PROMPT.md`](./CLAUDE_PROMPT.md). This repo is being built phase by phase.

## Status

**Phase 1 (Foundation): done**
- Next.js 15 (App Router) + TypeScript (strict) + Tailwind CSS
- Prisma data model for the whole product (users, classes, subjects, chapters, topics, lessons, e-books, quizzes, progress, badges, batches, assignments)
- Syllabus for all 13 classes as JSON in `content/syllabus/`, seeded into the database: 81 subjects and 712 chapters. Class 1 is fully detailed with topics and learning outcomes.
- 3-step onboarding (language → class → start). Guest mode works without logging in.
- Browsing: all classes → class → subject → chapter (with topics and learning outcomes)
- English and Hindi UI, with a switch in the header
- Age-based themes: big, colourful, audio-first screens for Nursery to Class 2, and a cleaner layout for older classes
- Kid-friendly accounts: username, animal avatar, and a 4-digit PIN on a big number pad. PINs are hashed with bcrypt, sessions are signed JWT cookies, and login is rate-limited.
- Speaker buttons use the browser's built-in text-to-speech. The Indian English or Hindi voice is picked from the script of the text.
- Unit tests (Vitest) and end-to-end tests (Playwright, on a mobile viewport)

**Chapter study material: in progress**
- Every chapter page can show:
  - **Understand**: a short explanation
  - **Remember**: key points
  - **Formulas**
  - **Solved examples**: step-by-step working with the answer
  - **Practice questions**: the answer and solution open on tap
- On Nursery to Class 2 pages, every line has a speaker button and the text is in both English and Hindi.
- 35 chapters are written and checked by hand:
  - all of Class 1 Maths (12) and Class 10 Maths (14)
  - Class 10 Science: Electricity, Light, Chemical Reactions, Acids Bases and Salts
  - Class 9 Number Systems, Class 8 Linear Equations, Class 5 Fractions and Decimals, and Class 3 Multiplication
- Chapters without material show a "coming soon" note. `npm run generate:content` drafts the rest with the Claude API (see below).

**Maths practice and chapter previews**
- `/practice`: interactive practice for addition, subtraction, multiplication, division and times tables.
  - The level is set from the child's class: Nursery–UKG get sums within 10, and Class 5+ get 5-digit sums and long division.
  - Each round has 10 questions, answered on a big number pad.
  - Answers are checked instantly. A wrong answer shows how to solve it, and the round ends with a score and stars.
  - All answers are whole numbers: division always divides exactly and subtraction never goes below zero.
- `/practice/tables`: tables 1–20, with a speaker for each line or the whole table, and a button to practise that table.
- Every chapter of every subject (all 712) has a **👁️ Preview** on the subject page. It shows what the student will learn, plus the explanation and example counts when study material exists.
  - Nursery–Class 2 previews are in Hindi and English.
  - Hindi and Sanskrit subjects are in Hindi.
  - The other subjects in Class 3–10 are in English for now.
- Subject pages note that they follow the CBSE curriculum and NCERT textbooks, and link to the official NCERT textbooks site.
- Study material now covers 172 chapters:
  - **every chapter of every subject from Nursery to Class 2** (English, Hindi, Numbers/Maths, EVS/My World, Rhymes and Stories, Art and Health), each with an explanation, key points, solved examples and practice, in Hindi and English
  - Class 3 and 4 add/subtract/multiply/divide, Class 5 fractions and decimals, Class 8 linear equations, Class 9 number systems
  - all of Class 10 Maths and four Class 10 Science chapters

**Next:** Phase 2 (lesson renderer, e-book reader, offline PWA), Phase 3 (pre-generated audio, read-along, phonics and tracing), and the rest of the plan in `CLAUDE_PROMPT.md`.

## Getting started

```bash
npm install
cp .env.example .env        # then set AUTH_SECRET to a long random string
npm run db:setup            # creates the SQLite DB and seeds the syllabus
npm run dev                 # http://localhost:3000
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build and serve |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | End-to-end tests (Playwright). Run `npm run build` first. |
| `npm run db:setup` | Create the DB schema and seed the syllabus |
| `npm run db:seed` | Re-seed the syllabus (safe to run again, it upserts) |
| `npm run validate:syllabus` | Check the syllabus and chapter material JSON and print counts |
| `npm run generate:content -- --class <slug>` | Draft chapter material with the Claude API (see below) |

## Editing the syllabus

Each class is one file in `content/syllabus/` (for example `03-class-1.json`). A chapter can be a plain string or an object:

```json
{
  "title": "Addition",
  "titleHi": "जोड़",
  "learningOutcomes": [{ "en": "Add numbers up to 9 using objects", "hi": "चीज़ों से 9 तक जोड़ना" }],
  "topics": ["Adding with Objects", { "title": "Addition Stories", "titleHi": "जोड़ की कहानियाँ" }]
}
```

After editing, run `npm run validate:syllabus` and then `npm run db:seed`.

## Chapter study material

Each chapter's explanation, examples, and practice questions live in `content/chapters/<class>/<subject>/<chapter-slug>.json`. For example, `content/chapters/class-10/maths/quadratic-equations.json`. The chapter slug is the one in the page URL.

```json
{
  "status": "REVIEWED",
  "intro": { "en": "Addition means putting things together…", "hi": "जोड़ का मतलब है…" },
  "keyPoints": ["…"],
  "formulas": ["x = [−b ± √(b² − 4ac)] / 2a"],
  "examples": [{ "title": "…", "problem": "…", "steps": ["…", "…"], "answer": "…" }],
  "practice": [{ "question": "…", "hint": "…", "answer": "…", "solution": ["…"] }]
}
```

- Any text can be a plain string or `{ "en": "…", "hi": "…" }`.
- `formulas`, `hint`, and `solution` are optional.
- After editing, run `npm run validate:syllabus` and then `npm run db:seed`.

### Drafting the remaining chapters with Claude

```bash
export ANTHROPIC_API_KEY=sk-ant-...     # or run: ant auth login
npm run generate:content -- --class class-2 --dry-run          # list what would be generated
npm run generate:content -- --class class-2 --subject maths    # write the drafts
npm run db:seed
```

- The script only writes chapters that don't have a file yet. Pass `--overwrite` to redo existing ones and `--limit N` to try a few first.
- Every generated file is saved with `"status": "DRAFT"`, so the page shows a "waiting for teacher review" note.
- A teacher should check the answers, then change the status to `"REVIEWED"`.
- Generating costs money on your Anthropic account. Try `--limit 2` first.

**About the syllabus content:**
- Class 9 and 10 chapter names follow the current NCERT textbooks.
- Nursery to Class 8 use curriculum-aligned topic names. NCERT has been releasing new books for these classes, so check the chapters against the latest edition before publishing.
- The `book` field is a reference only. We don't copy NCERT text. Official e-books will be linked from ncert.nic.in, ePathshala, and DIKSHA.

## Production notes

- **Database:** switch the `provider` in `prisma/schema.prisma` to `postgresql` and set `DATABASE_URL`.
- **Login rate limiter:** it keeps its counts in memory, which only works on a single server. Use Redis if you run more than one instance.
- **Deviations from the plan:**
  - i18n uses a small built-in dictionary (`src/lib/dictionaries.ts`) instead of next-intl.
  - Auth uses a lightweight signed-cookie session instead of NextAuth. Parent and teacher login (OTP / email) will come with the Phase 5–6 dashboards.
