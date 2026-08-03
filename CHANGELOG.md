# CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.5.0] - 2026-08-03

### Added

- AI layer (`src/lib/ai.ts`): OpenAI-powered cover letters, resume analysis,
  follow-up emails, assistant chat, interview coach and weekly reports —
  with deterministic offline fallbacks when `OPENAI_API_KEY` is unset
- Server actions (`src/actions/ai.ts`, 10 actions): cover letter generate +
  delete, resume create/analyze/set-primary/delete, assistant chat, interview
  coach, follow-up email generator, weekly report
- AI Assistant page (`/assistant`): chat UI with suggestion chips and a
  one-click weekly report generator
- Cover Letters page (`/cover-letters`): library list, generate dialog
  (company, position, job description, resume, tone), preview + download
- Resume Library page (`/resumes`): paste-text resume storage, one-click AI
  ATS analysis (score + strengths + weaknesses + suggestions), primary resume
- Interview Coach page (`/interviews`): 8-question mock interview session with
  per-answer scoring and STAR feedback
- AI follow-up email button on application detail pages (subject + body,
  copyable)

## [0.4.0] - 2026-08-03

### Added

- Tasks page: grouped to-do/completed lists, overdue detection, add-task dialog
  (recurring + interval), priority badges, delete confirmation
- Calendar page: month grid of interviews and task deadlines, day drill-down
  with meeting join links and application links
- Notifications module: full list page, unread badges, mark-read, mark-all-read,
  delete; in-app notification helper library
- Reminder cron endpoint (`/api/cron/reminders`, optional `CRON_SECRET` bearer)
  that creates in-app reminders for interviews and tasks due within 24h
- Google Calendar sync: OAuth2 connect/callback/disconnect/sync routes,
  token storage + refresh in the `Integration` model, upcoming interviews
  pushed to the user's primary calendar
- Settings page: notification preferences (email/browser/weekly summary),
  application goals (weekly/monthly targets, target role/company)
- Shared PageHeader component; sidebar + command palette entries for
  Notifications and Settings

### Fixed

- Server/client boundary: `toCalendarEvents` moved out of the `"use client"`
  calendar component into `src/lib/calendar-events.ts`
- Reminder dedup looked for reminders `scheduledAt >= now`, producing
  duplicates on every cron run — now matches any unsent reminder

## [0.1.0] - 2026-08-02

### Added

- Next.js 15 (App Router) + React 19 + TypeScript project scaffold
- TailwindCSS v4 configuration with dark/light themes and glassmorphism utilities
- shadcn/ui component library (40+ components) initialized with radix-nova style
- Prisma ORM with fully normalized PostgreSQL schema (25 models, 15 enums)
- Auth.js v5 with Email (credentials) + Google + GitHub providers
- JWT session strategy with role-based auth and middleware protection
- Docker + docker-compose setup (Next.js standalone + PostgreSQL 16)
- Code quality tooling: ESLint, Prettier, Husky, Commitlint, lint-staged
- Test tooling: Vitest, Testing Library, jsdom
- Project metadata files (CHANGELOG, TODO, PROJECT_STATUS)

## [0.3.0] - 2026-08-03

### Added

- Applications module: TanStack Table list with search, status/source filters,
  sorting and pagination; create/edit form (react-hook-form + Zod v4);
  detail page with status stepper, overview, interviews, tasks and activity feed
- Server actions with ownership checks and activity logging: application CRUD,
  status updates, bookmark toggle, company CRUD, interview + task CRUD
- Kanban board with @dnd-kit drag & drop mapped to the 6 pipeline stages
- Companies module: card grid, detail page with research notes, and CRUD dialog
- Zod v4 validators for application/company/interview/task inputs

### Fixed

- zod v4 `z.coerce.number()` produced `unknown` resolver types — replaced with
  string-based numeric fields coerced in server actions
- Prisma boolean update requires `set` (no `flip` operation)
- ActivityLog requires a `type` enum on create
- Application `bookmarked` field (not `isBookmarked`) in queries/components

## [0.2.0] - 2026-08-03

### Added

- Database migrations applied (init + company unique index) and seed script with
  demo user, admin user, 20 applications, interviews, tasks, notifications
- Server actions: register, login, forgot/reset password, profile update,
  change password (Zod-validated, bcrypt-hashed)
- Resend email service with React Email templates (welcome, password reset)
- Auth pages: login, register, forgot-password, reset-password (glassmorphism
  cards, react-hook-form + zod, OAuth buttons)
- Dashboard shell: sidebar navigation, topbar with notifications bell, user
  menu, Cmd+K command palette, theme toggle
- Dashboard page: stat cards (applications/interviews/offers/rejected), recent
  applications, activity feed, upcoming interviews, tasks, response rate
- Notifications API route for recent notifications
- Landing page with feature grid and marketing navigation
- Embedded PostgreSQL dev workflow (scripts/start-db.mjs) for Windows dev
  machines without Docker

### Fixed

- TooltipProvider missing around Sidebar tooltips (radix-nova sidebar)
- useSearchParams pages wrapped in Suspense boundaries
- Zod v4 issue path typing in server actions
- lucide-react brand icon removal (custom GitHub icon component)

