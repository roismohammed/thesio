# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Thesio — tools pembantu mahasiswa mengerjakan skripsi secara terstruktur. Dosen tidak ikut campur dalam alur tool; tool memandu mahasiswa mandiri lewat tahapan skripsi.

A Bun/npm workspaces monorepo with two independent apps. The two apps are currently standalone (no Inertia or shared runtime contract linking them): `apps/web` is a React SPA, `apps/api` is a Laravel backend. There is no `packages/` directory yet (the workspace glob `packages/*` is reserved).

A root-level `build.ts`, `styles/globals.css`, and root `components.json` are leftovers from the `bun-react-tailwind-shadcn-template` — the real frontend lives in `apps/web`. Do not treat the root as the frontend entrypoint.

## Commands

### apps/web (React + Vite + TypeScript)
Run from `apps/web`:
- `bun run dev` — Vite dev server
- `bun run build` — `tsc -b && vite build` (type-check then build)
- `bun run lint` — ESLint flat config
- `bun run preview` — preview production build
- TS type check only: `npx tsc -b` (or `npx tsc --noEmit -p tsconfig.app.json`)

### apps/api (Laravel 13, PHP 8.3)
Run from `apps/api`:
- `composer run dev` — concurrent: `php artisan serve` + queue:listen + pail (logs) + vite (asset HMR)
- `composer run setup` — install deps, copy .env, key:generate, migrate, build assets
- `php artisan test` — run the full suite (PHPUnit, class-based tests; `phpunit.xml` forces SQLite `:memory:`, array cache/queue/session)
- `php artisan test --filter=TestName` — single test / class
- `vendor/bin/pint` — format PHP
- `php artisan tinker` — REPL
- `php -l <file>` — syntax check a single PHP file

Speckit feature workflow is installed (`.specify/`, `.claude/skills/speckit-*`): spec.md → plan.md → tasks.md driven by the `/speckit-*` skills. The constitution at `.specify/memory/constitution.md` is still the unfilled template.

## Testing

Tidak ada unit test dalam pengerjaan project ini. Jangan tulis/minta test otomatis (PHPUnit/Pest, vitest, dsb.) kecuali user memintanya secara eksplisit. Verifikasi perubahan dilakukan via `php -l` (PHP syntax check), `npx tsc --noEmit --incremental` (TS type check), dan inspeksi diff — bukan lewat test suite.

## Architecture

### apps/web
React 19 SPA built with Vite 8. Key, non-obvious setup:
- **React Compiler is enabled** (`babel-plugin-react-compiler` via `@rolldown/plugin-babel` + `@vitejs/plugin-react`). Avoid manual `useMemo`/`useCallback`/`React.memo` unless the compiler proves insufficient; the compiler handles memoization automatically.
- **shadcn "base-nova" style on `@base-ui/react` primitives** — not classic shadcn/ui (which uses Radix). Components in `src/components/ui/*` wrap `@base-ui/react/*` with `class-variance-authority`. `components.json` style is `base-nova`; add components via the `shadcn` CLI against this registry. Icons: `lucide-react`.
- **Tailwind v4** via `@tailwindcss/vite` (no `tailwind.config.js`). Theme tokens are CSS variables in `src/index.css`, which also imports `shadcn/tailwind.css`, `tw-animate-css`, and `@fontsource-variable/geist`. Dark mode via the `.dark` class (`@custom-variant dark`).
- **Path alias `@/*` → `src/*`** in both `tsconfig.app.json` and `vite.config.ts`.
- `tsconfig.app.json` enforces `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`, `strict`. `verbatimModuleSyntax` is on — use `import type` for type-only imports.
- `src/lib/utils.ts` exports `cn` (clsx + tailwind-merge). `src/hooks/use-mobile.ts` is the shared responsive hook.

### apps/api
Laravel 13 backend (`App\` PSR-4 → `app/`). Pattern: **MVC Flat + Service -> Action**.
- **Structure**:
  - `app/Http/Controllers/` — thin controllers. HTTP boundary only (request validation, delegate to Service/Action, return JSON resource/response).
  - `app/Services/` — domain orchestration. Coordinate multiple actions, manage DB transactions (`DB::transaction`), handle multi-step workflow logic.
  - `app/Actions/` — single-purpose atomic operations. Single public method (`handle` / `execute` / `__invoke`). One class = one job (e.g. `CreateSubscriptionAction`, `VerifyPaymentAction`).
  - `app/Models/` — flat Eloquent models. Schema definitions, relations, casts, query scopes. No business orchestration.
- **Data Flow**:
  `Route` → `FormRequest` → `Controller` → `Service` → `Action(s)` → `Model / External API` → `Resource/Response`
  *(Simple one-step mutation skip Service, call Action direct from Controller).*
- Default DB: SQLite (dev/test), MySQL/PostgreSQL (prod). Queue/cache/session: database driver. Asset bundle: `laravel-vite-plugin`.

### Conventions to match
- **Naming language: English only — no negotiation.** Every identifier (entity, variable, function, class, file, folder, table, column, route, i18n key, config key) MUST use common English technical terms. No Indonesian, no mixed language. Comments may be Indonesian, but identifiers stay English.
- **Case format follows the standard convention per language/ecosystem** (what programmers commonly use for that language), not one rule for all:
  - **JS/TS/CSS/SCSS/HTML/JSON/YAML/config** → kebab-case for files & folders (`post-card.tsx`, `use-debounce.ts`); TS/JS identifiers camelCase (`fetchUserPosts`); TS types/interfaces PascalCase (`UserPost`).
  - **PHP (Laravel)** → PascalCase class files (`PaymentService.php`); snake_case config/route/migration (`blog_post.php`, `2024_01_01_create_blog_posts_table.php`); camelCase method names, PascalCase class names per PSR.
  - **SQL** → table & column snake_case (`blog_posts`, `created_at`).
  - When unsure, follow the framework's official default — do not invent.
- UI text: Indonesian, semi-formal but friendly.

## Engineering Standards

### Clean Code Principles (/clean-code-principles)
- **SOLID & Core**: SRP (one reason to change), DRY (single source of truth), KISS, YAGNI (no speculative abstractions/helpers).
- **Composition over Inheritance**: favor composing small units over deep inheritance chains.
- **Fail Fast & Safe Boundaries**: validate at system edges (Form Requests, API payloads); trust internal types.
- **File & Function Limits**:
  - PHP class max 300 lines; method max 100 lines. Extract to Action/Service/Trait when exceeded.
  - React component file max 300 lines. Extract to `components/` or `partials/` subfolders; logic to custom hooks (`use-*`).
  - Keep functions small, single-purpose, minimal arguments, zero unintended side effects.

### Laravel Best Practices (/laravel-best-practices)
- **Architecture Flow (MVC Flat + Service -> Action)**:
  - **Controller**: thin HTTP boundary (< 15 lines per method). Authorize, validate via Form Request, delegate to Service/Action, return response.
  - **Service**: orchestrate multi-action flows, external integrations, cross-entity coordination, wrap transactions (`DB::transaction`).
  - **Action**: pure single-responsibility unit. Single execution method. Reusable across Controllers, Jobs, Commands, and Services.
  - **Model**: flat entity definition. Table metadata, relations, casts, local scopes. No orchestration or heavy side-effects.
- **Controllers & Routing**: thin controllers, delegate domain logic to single-action classes or services. Use route model binding and `apiResource`.
- **Validation**: always use Form Request classes; only access sanitized data via `$request->validated()` — never `$request->all()`.
- **Eloquent & Database**:
  - Eager load relations via `with()` to prevent N+1 queries; use `withCount()` for aggregate counts.
  - Select only required columns for heavy queries (`select(...)`).
  - Cast attributes using `casts()` method on models; enforce return types on relation methods.
  - Define `$fillable` or `$guarded` on every model; authorize actions via Policies/Gates.
  - Use `chunkById()` or `cursor()` for large data processing; add DB indexes for columns used in `WHERE`, `ORDER BY`, and foreign keys.
- **Configuration & Secrets**: `env()` strictly inside `config/*.php` files only; application code must use `config(...)`.
- **API Responses**: ensure consistent JSON error and resource formats for all API endpoints.

### Frontend Craft & Interaction (/emil-design-eng & /make-interfaces-feel-better)
- **Animation Strategy**:
  - Never animate high-frequency actions (keyboard shortcuts, quick toggles, command palettes).
  - Duration budget: UI animations must stay under 300ms (150–250ms sweet spot; button press feedback 100–160ms).
  - Easings: use `ease-out` (starts fast, feels responsive) or custom curves (`cubic-bezier(0.23, 1, 0.32, 1)`). Never use `ease-in` for entrance animations.
  - Enter states: never animate from `scale(0)`; start from `scale(0.95)` with `opacity: 0`.
  - Transitions: never use `transition: all` — specify exact properties (`transition-transform`, `opacity`).
- **Tactile Feedback**:
  - Interactive pressables: apply subtle scale on active press (`active:scale-[0.97]` or `active:scale-[0.96]`) with `transition-transform duration-150`.
  - Hit area: interactive targets must meet minimum 44×44px (touch/mobile) or 40×40px (dense desktop).
- **Surfaces & Layout Details**:
  - Concentric border radius: nested containers must respect `outerRadius = innerRadius + padding`.
  - Depth: prefer layered soft shadows with transparency over harsh solid borders.
  - Popovers & Menus: origin-aware scale (`transform-origin: var(--transform-origin)`). Modals remain centered.
- **Typography & Numbers**:
  - Dynamic numbers / counters / timers: always apply `tabular-nums` to eliminate layout shift.
  - Headings: apply `text-wrap: balance`. Paragraph text: apply `text-wrap: pretty`.
  - Ensure root layout sets font smoothing (`antialiased`).