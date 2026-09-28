# Master Prompt: Nursery to Class 10 Online Learning Portal

> **How to use (kaise use karein):** Copy everything below the line into Claude (Claude Code, or claude.ai with a project). It's written to be run in phases. After each phase, say **"Phase X complete, start Phase X+1"** so Claude builds and tests one part at a time instead of everything at once.

---

## ROLE

You are a senior full-stack engineer, instructional designer, and child-UX specialist. You are building **"VidyaPath"** (placeholder name, keep it configurable), a production-ready online learning portal for students from **Nursery to Class 10**, aligned to the **CBSE / NCERT curriculum** (with the option to add state boards later). The portal must be **simple, child-friendly, bilingual (English + Hindi), mobile-first, and work on low-end Android phones and slow 3G/4G internet.**

Work in phases. Before writing code in each phase, show a short plan (files, data models, decisions), then implement, then run tests/linters, then summarize what was done and what's next. Never skip tests. Ask me only when a decision is truly mine to make; otherwise choose sensible defaults and state them.

---

## 1. GOALS

1. Cover the **complete syllabus** for every class (Nursery, LKG, UKG, Class 1–10) and every subject, organized as **Class → Subject → Chapter/Unit → Topic → Lesson**.
2. Provide an **e-book** for every subject and chapter (readable online, downloadable as PDF, usable offline).
3. For **Nursery to Class 2 (below Class 3)**: every piece of study material must have **audio / "speaker" support**. Children who can't read yet must be able to **tap and listen** to everything: letters, words, sentences, instructions, stories, rhymes, questions, and answer options.
4. Build strong **fundamentals**: phonics, number sense, reading comprehension, basic science concepts, mental maths. Every chapter must start from basics and go step by step.
5. Be **user-friendly** for three kinds of users: small children, older students, and parents/teachers who may not be tech-savvy.

---

## 2. TECH STACK (use these defaults unless I say otherwise)

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **PWA:** installable, offline support via service worker (Workbox / next-pwa); cache e-books, audio, and the lessons a student has opened
- **Backend:** Next.js API routes / server actions
- **Database:** PostgreSQL + Prisma ORM (SQLite for local development)
- **Auth:** NextAuth (Auth.js). Login with mobile OTP / email plus a **picture-password or 4-digit PIN for young kids**
- **Storage:** S3-compatible storage (Cloudflare R2 / AWS S3) for PDFs, images, and audio, served through a CDN
- **Audio / Text-to-Speech:**
  - Pre-generate MP3 audio for all Nursery–Class 2 content at build/seed time (natural Indian-English and Hindi voices, e.g. Google Cloud TTS / Azure TTS `en-IN` and `hi-IN`). Keep the provider behind an interface so it can be swapped.
  - Fallback: browser **Web Speech API** (`speechSynthesis`) when a pre-generated file isn't available
  - Support **word-by-word highlighting** synced with the audio (read-along)
- **E-book reader:** in-browser reader (react-pdf / PDF.js for PDFs; a custom HTML reader for our own content) with font size, night mode, bookmarks, highlights, and read-aloud
- **i18n:** next-intl with English and Hindi from day one; the structure should make adding more languages easy
- **Testing:** Vitest + React Testing Library (unit), Playwright (end-to-end)
- **Quality:** ESLint, Prettier, TypeScript strict mode, Lighthouse score ≥ 90 on mobile
- **Deployment:** Vercel, or Docker + any VPS. Include a `README` with setup steps and a `.env.example`

---

## 3. USER ROLES

| Role | What they can do |
|---|---|
| **Student** | Choose their class, study lessons, read e-books, listen to audio, take quizzes, earn stars and badges, see progress |
| **Parent** | Link one or more children, see progress reports, set screen-time limits, get weekly summaries |
| **Teacher** | Create classes/batches, assign homework and tests, see student analytics, upload extra material |
| **Admin / Content Manager** | Manage the syllabus tree, upload or edit e-books, lessons, audio, and quizzes; bulk import (CSV/JSON); publish or unpublish; manage users |

---

## 4. COMPLETE SYLLABUS STRUCTURE (seed this as data, not hardcoded UI)

Create a **syllabus seed file** (`/content/syllabus/*.json`) for every class. Each class has subjects → chapters → topics → learning outcomes. Follow the latest **NCERT / CBSE** curriculum (NCF 2023 for the Foundational Stage). Use this outline as the minimum, and expand every subject into its full chapter list:

### Foundational Stage: Nursery, LKG, UKG (ages 3–6), fully audio-enabled
- **English (Pre-literacy):** alphabet recognition A–Z (upper and lower case), phonics sounds, letter tracing, sight words, rhymes, picture stories
- **Hindi (Varnamala):** swar (अ–अः), vyanjan (क–ज्ञ), tracing, simple words, balgeet (children's songs)
- **Numbers:** counting 1–10 → 1–50 → 1–100, number tracing, more/less, big/small, shapes, colours, patterns, simple addition with pictures
- **EVS / General Awareness:** my body, my family, fruits, vegetables, animals, birds, transport, seasons, good habits, safety
- **Activities:** drawing, colouring, rhymes and songs, stories, moral stories

### Class 1–2 (Foundational Stage), fully audio-enabled
- **English:** NCERT *Mridang*; phonics, reading, simple sentences, grammar basics (naming words, action words)
- **Hindi:** NCERT *Sarangi*; matras, reading, simple sentences
- **Mathematics:** NCERT *Joyful Mathematics*; numbers to 100/1000, addition, subtraction, shapes, measurement, time, money, patterns, data handling basics
- **General Awareness / EVS basics**, art, health and well-being

### Class 3–5 (Preparatory Stage)
- **English:** NCERT *Santoor* (and the latest editions), grammar, comprehension, writing
- **Hindi:** NCERT *Veena*, vyakaran (grammar), rachna (composition)
- **Mathematics:** NCERT *Maths Mela* and later editions; place value, the four operations, fractions, decimals, geometry, measurement, time, money, data handling
- **EVS / The World Around Us:** family, food, water, shelter, plants, animals, travel, maps, environment
- Computer basics, GK, value education, art

### Class 6–8 (Middle Stage)
- **English:** *Poorvi* and the current NCERT books, grammar, writing skills
- **Hindi:** *Malhar* and the current NCERT books, vyakaran
- **Mathematics:** *Ganita Prakash*; number system, algebra, geometry, mensuration, data handling, ratio and proportion, integers, exponents
- **Science:** *Curiosity*; food, materials, motion, light, electricity, living organisms, environment
- **Social Science:** *Exploring Society: India and Beyond*; history, geography, civics/political science, economics
- **Sanskrit** (optional), computer science / coding basics, GK

### Class 9–10 (Secondary Stage, board preparation)
- **English:** *Beehive / Moments* (Class 9), *First Flight / Footprints Without Feet* (Class 10), grammar, writing
- **Hindi:** Course A (*Kshitij, Kritika*) and Course B (*Sparsh, Sanchayan*), vyakaran
- **Mathematics:** number systems, polynomials, coordinate geometry, linear equations, triangles, circles, quadratics, AP, trigonometry, statistics, probability, mensuration
- **Science:** physics, chemistry, and biology chapters as per NCERT
- **Social Science:** history, geography, political science, economics
- **Board Prep:** previous years' papers, sample papers, chapter-wise important questions, formula sheets, marking-scheme tips
- IT / computer applications (optional)

> ⚠️ **Copyright rule:** Do NOT copy NCERT textbook text verbatim into the portal. For official e-books, **link to the official free NCERT sources** (ncert.nic.in textbooks, ePathshala, DIKSHA). All **notes, explanations, worksheets, quizzes, stories, and audio scripts must be original content** that we write, aligned to the chapter's learning outcomes.

---

## 5. CONTENT TYPES PER LESSON

Every **Topic/Lesson** should support these content blocks (a block-based content model, stored as JSON):

1. **Learning objective**: 1–3 simple lines ("Today we will learn…")
2. **Concept explanation**: short paragraphs, images/diagrams, real-life Indian examples (rupees, cricket, festivals, local foods)
3. **Audio narration**: required for Nursery–Class 2, optional but available for Class 3+
4. **Video embed slot**: YouTube/Vimeo/self-hosted, optional
5. **Interactive activity**: drag-and-drop, match the pairs, tap the correct picture, tracing canvas (for letters and numbers), fill in the blanks
6. **Worked examples**: step-by-step solutions (Maths/Science)
7. **Quick check / Practice quiz**: MCQ, true/false, fill in the blanks, picture MCQ; instant feedback and an explanation
8. **Summary / Key points and Formula box**
9. **Worksheet**: printable PDF
10. **Chapter test**: timed, auto-graded, with a result analysis

### E-book module
- An e-book per **subject** (all chapters) and per **chapter**
- Two sources: (a) **our own generated e-books** (HTML → PDF, with read-aloud); (b) **external official links** (NCERT/DIKSHA)
- Reader features: page navigation, table of contents, search, bookmarks, highlights, notes, font resize, night mode, **"Read Aloud"** button, **download for offline use**

---

## 6. SPECIAL REQUIREMENTS FOR NURSERY – CLASS 2 ("Speaker" / Listen Mode)

These kids can't read yet, so design for **zero reading ability**:

- A **speaker icon 🔊 on every text element**: tap it to hear the text. Auto-play the instructions when a screen opens (with a mute toggle).
- **Read-along:** words highlight as the audio plays
- **Big, colourful buttons** (minimum 64px tap targets), icons plus pictures instead of text menus
- **Phonics player:** tap a letter → hear its name and sound, and see an example word with a picture (A → "a" → Apple 🍎)
- **Hindi varnamala player:** tap अ → hear "अ" → अनार (with an image)
- **Counting player:** tap objects to count them aloud (1 apple, 2 apples…)
- **Tracing canvas:** trace letters and numbers with a finger, guided by an animated stroke order, with voice praise ("Well done!", "शाबाश!")
- **Rhymes and stories:** audio with animated or illustrated pages and auto page-turn
- **Quizzes are audio-first:** the question is spoken aloud, the options are pictures, and each option can be tapped to hear it
- **Rewards:** stars, stickers, and a happy animation and sound on correct answers; gentle encouragement on wrong ones (never a harsh "Wrong!")
- **Voice selection:** English (Indian accent) / Hindi; playback speed 0.75x / 1x
- **Parent lock:** settings and logout sit behind a simple parent gate (e.g. "hold for 3 seconds" or a simple sum)
- **Screen-time reminder** after N minutes (set by the parent)

---

## 7. UX / UI PRINCIPLES (USER-FRIENDLY)

- **Onboarding in 3 steps:** choose language → choose class → start learning (login can come later, with guest mode allowed)
- **Age-based themes:**
  - Nursery–Class 2: playful, bright colours, mascot character, audio-first
  - Class 3–5: friendly, colourful, with light gamification
  - Class 6–10: clean, focused, dashboard-style, exam oriented
- **Home dashboard:** "Continue where you left off", today's lesson, streak, progress by subject
- **Maximum 3 taps** from home to any lesson
- **Global search** across chapters, topics, and e-books (Hindi + English)
- **Accessibility:** WCAG 2.1 AA, keyboard navigation, screen-reader labels, high-contrast mode, dyslexia-friendly font option
- **Performance:** first load < 3s on 3G, lazy-load images/audio, compress assets (WebP, Opus/MP3 at 64 kbps)
- **Low data mode:** turns off auto-play video and loads lower-quality images
- **Offline:** downloaded lessons, e-books, and audio work without internet; progress syncs when back online
- **Errors:** friendly messages in simple language, never raw error codes

---

## 8. GAMIFICATION AND PROGRESS

- Stars per activity, badges per chapter, daily streak, level up per class
- Progress: % complete per chapter/subject, quiz accuracy, time spent, weak topics
- **Adaptive practice:** recommend topics where accuracy is below 60%
- **Parent report:** a weekly summary (in the app, plus email/WhatsApp-share friendly)
- **Teacher analytics:** class-wise performance heatmap and assignment completion

---

## 9. DATA MODEL (Prisma, starting point, refine as needed)

```
User(id, name, role[STUDENT|PARENT|TEACHER|ADMIN], phone, email, pin, avatar, language, createdAt)
StudentProfile(id, userId, classId, board, dob, parentId?, schoolName?)
Board(id, name)                          // CBSE default
Class(id, name, order, stage[FOUNDATIONAL|PREPARATORY|MIDDLE|SECONDARY], audioFirst:boolean)
Subject(id, classId, name, nameHi, icon, color, order)
Chapter(id, subjectId, title, titleHi, order, learningOutcomes[])
Topic(id, chapterId, title, titleHi, order)
Lesson(id, topicId, title, contentBlocks:Json, audioUrl?, audioUrlHi?, videoUrl?, durationMin, published)
EBook(id, subjectId?, chapterId?, title, language, sourceType[GENERATED|EXTERNAL], fileUrl?, externalUrl?, pages)
Quiz(id, chapterId?, lessonId?, type[PRACTICE|CHAPTER_TEST|SAMPLE_PAPER], timeLimitSec?)
Question(id, quizId, type[MCQ|TF|FILL|MATCH|PICTURE_MCQ|DRAG], prompt:Json, options:Json, answer:Json, explanation, audioUrl?, difficulty)
Attempt(id, userId, quizId, score, answers:Json, startedAt, finishedAt)
Progress(id, userId, lessonId, status[NOT_STARTED|IN_PROGRESS|DONE], stars, lastPosition, updatedAt)
Bookmark(id, userId, ebookId|lessonId, page?, note?)
Badge(id, code, name, icon) ; UserBadge(userId, badgeId, earnedAt)
Assignment(id, teacherId, batchId, quizId|lessonId, dueAt)
Batch(id, teacherId, classId, name) ; BatchMember(batchId, studentId)
```

---

## 10. CONTENT GENERATION PIPELINE

Build an **admin + scripts pipeline** so content can scale to thousands of lessons:

1. `scripts/seed-syllabus.ts`: loads the class → subject → chapter → topic tree from JSON
2. `scripts/generate-lessons.ts`: for each topic, generates original lesson content blocks (objective, explanation, examples, 5–10 practice questions, summary) with the Claude API, in **English and Hindi**, in simple age-appropriate language. Save it as JSON for **human review** before publishing (status: DRAFT → REVIEWED → PUBLISHED).
3. `scripts/generate-audio.ts`: for every lesson where `class.audioFirst = true` (Nursery–Class 2), convert every text block, question, and option to MP3 with TTS; store the word timings for read-along
4. `scripts/build-ebooks.ts`: compiles each chapter's and subject's lessons into a nicely formatted **e-book (HTML → PDF with Playwright)** with a cover, table of contents, images, and exercises
5. **Admin panel:** WYSIWYG block editor, audio upload/re-generate button, preview as student, bulk CSV import for questions, publish workflow

Start by generating **complete sample content for one full chapter in each class** (13 classes), so the whole flow can be demoed end to end, and then scale out.

---

## 11. SECURITY, PRIVACY, AND COMPLIANCE

- Children's data: collect the minimum, get parental consent for under-18s (in line with India's **DPDP Act 2023**), no ads and no third-party trackers for kids
- Role-based access control on every API route; validate input with Zod
- Rate limiting on OTP and login
- Signed URLs for paid/premium content (if monetization is added later)
- HTTPS only, secure cookies, CSRF protection

---

## 12. OPTIONAL (Phase 2+)

- Live classes (Zoom/Jitsi integration), doubt-solving chat with AI tutor ("Ask a doubt" powered by Claude, restricted to syllabus scope and child-safe)
- Subscription plans (Razorpay), free and premium content
- Android app wrapper (TWA / Capacitor)
- More languages (Marathi, Bengali, Tamil, etc.) and state boards

---

## 13. PHASED DELIVERY PLAN

- **Phase 1: Foundation:** project setup, design system, i18n (EN/HI), auth (including the kid PIN), DB schema, seed syllabus for all classes, onboarding flow, class/subject/chapter browsing
- **Phase 2: Lessons and E-books:** block-based lesson renderer, e-book reader (PDF + HTML), bookmarks, notes, offline download (PWA)
- **Phase 3: Audio / Speaker mode (Nursery–Class 2):** TTS pipeline, read-along highlighting, phonics/varnamala/counting players, tracing canvas, audio-first quizzes, parent gate
- **Phase 4: Quizzes and Tests:** all question types, practice + chapter tests + sample papers, results and explanations
- **Phase 5: Progress and Gamification:** stars, badges, streaks, student dashboard, parent dashboard, weekly report
- **Phase 6: Teacher and Admin:** batches, assignments, analytics, admin content editor, bulk import, publish workflow
- **Phase 7: Content at scale:** run the generation scripts for all classes, review queue, e-book builds
- **Phase 8: Polish and Launch:** accessibility audit, Lighthouse/performance, Playwright end-to-end tests for the main flows, SEO, deployment docs

---

## 14. ACCEPTANCE CRITERIA (Definition of Done)

- [ ] A student can pick any class from Nursery to 10 and see every subject with its full chapter list
- [ ] Every chapter has at least one lesson, a practice quiz, and an e-book (generated or an official link)
- [ ] On Nursery–Class 2 screens, **every** text, question, and option has a working 🔊 speaker button, and instructions auto-play
- [ ] Read-along highlighting works for the audio lessons
- [ ] The e-book can be read online, downloaded, and opened offline
- [ ] The whole UI works in both English and Hindi
- [ ] Works on a 360px-wide Android screen, Lighthouse mobile ≥ 90
- [ ] The parent can see child progress; the teacher can assign a quiz and see results
- [ ] Admin can add or edit a chapter, lesson, and quiz without touching code
- [ ] All tests pass; README explains setup, seeding, content generation, and deployment

---

## START NOW

Begin with **Phase 1**. First show me:
1. The folder structure
2. The Prisma schema
3. The syllabus JSON format with one complete example class (Class 1)
4. Wireframe descriptions of the Onboarding, Home, Class → Subject → Chapter, and Lesson screens (both the kid and senior themes)

Then implement Phase 1, run the tests, and report back.
