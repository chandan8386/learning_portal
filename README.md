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
| `npm run validate:syllabus` | Check the syllabus JSON and print chapter counts |

## Editing the syllabus

Each class is one file in `content/syllabus/` (for example `03-class-1.json`). A chapter can be a plain string or an object:

```json
{
  "title": "Addition",
  "titleHi": "जोड़",
  "learningOutcomes": ["Adds numbers up to 9 using objects"],
  "topics": ["Adding with Objects", { "title": "Addition Stories", "titleHi": "जोड़ की कहानियाँ" }]
}
```

After editing, run `npm run validate:syllabus` and then `npm run db:seed`.

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
