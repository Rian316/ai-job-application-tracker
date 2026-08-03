# CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

