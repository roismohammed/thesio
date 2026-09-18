<!--
=== Sync Impact Report ===
Version change: 1.0.0 → 1.1.0
Modified principles:
  - V. Frontend Design Craft — expanded with feature-based architecture and the
    components/ui vs. page-local partials/ placement rule
Added sections: none
Removed sections: none
Deferred TODOs: none
Rationale: MINOR bump — materially expanded guidance on an existing principle
(new placement convention for reusable vs. page-specific components). No existing
principle removed or redefined, so no MAJOR.

Historical:
  1.0.0 (2026-08-03): Initial ratification from the unfilled template. Principles
  I–V adopted; Technology Stack, Development Workflow, and Governance sections
  filled.
===
-->

# Thesio Constitution

## Core Principles

### I. Layered HTTP Architecture (Controller → Service → Action)

Controllers MUST only accept and translate HTTP requests: parse input, delegate
to a Service, and return an HTTP response. No business logic, no direct database
access, and no orchestration logic belongs in a Controller. Validation MUST be
delegated to Form Requests.

Services orchestrate use cases — they sequence the steps of a business workflow
and call Actions to execute each concrete unit of work. Services hold
cross-cutting infrastructure concerns (payment gateways, mail dispatch, external
APIs) and transactional boundaries, but MUST NOT perform database writes
themselves.

The dependency direction is strictly one-way:
`Controller → Service → Action → (Eloquent | Repository)`. A Service MAY call
multiple Actions; an Action MAY compose other Actions, but MUST NOT introduce
circular dependencies (A → B → A). An Action MUST NOT inject or call a Service.

Rationale: Separating transport (Controller), orchestration (Service), and
execution (Action) keeps each class testable, single-purpose, and replaceable.
This is the SOLID/KISS foundation enforced by the `/clean-code-principles` and
`/laravel-best-practices` skills.

### II. Action Single Responsibility & Database Execution

An Action executes exactly one concrete unit of work against the database
(`Create…`, `Update…`, `Delete…`, `Generate…`). All database mutations MUST go
through an Action, never through a Service or Controller directly.

Database access inside an Action MUST use Eloquent ORM or a Repository. Raw SQL
is prohibited for single CRUD operations — permitted only for large bulk
operations or genuinely complex queries where ORM is suboptimal, and MUST carry
an inline reason comment (`// raw query because …`). This rule is enforced by
the project's Database Action policy and the `/design-patterns` skill.

An Action MUST NOT inject a Service. It MAY inject a Repository (read), a Model,
a Form Request, an event dispatcher, or the activity logger. One Action = one
use case; logic is written directly in `execute()` or private helper methods.
Class size limits apply: a PHP class MUST NOT exceed 300 lines and a method MUST
NOT exceed 100 lines — extract to a Service/Action/Trait/Repository/private
method when exceeded.

Rationale: Single-responsibility Actions make database mutations auditable,
reusable, and independently testable. Banning Service-inside-Action prevents the
"proxy Action" anti-pattern that hides orchestration behind an execution layer.

### III. Narrative Activity Logging

Every data-changing action (create, update, delete) MUST record an activity log
entry via `spatie/laravel-activitylog`. Each log entry MUST capture: the causer
(who performed the action), the action verb, the subject (target model), the
timestamp, and a narrative description.

The description MUST be informative and narrative — not robotic. Describe the
real-world event in semi-formal, friendly Indonesian. State what changed and the
relevant before/after values when meaningful.

Accepted:
- "Menyetujui pendaftaran siswa Budi Santoso (id: 12) — status berubah dari
  'menunggu' menjadi 'disetujui'."
- "Membuat faktur INV-2026-0042 untuk pendaftaran Budi Santoso senilai
  Rp 1.500.000."

Rejected:
- "update record id=5"
- "Model::create success"

Rationale: Activity logs are read by humans (operators, auditors, support).
Narrative entries make the audit trail legible without cross-referencing code or
database rows, and they satisfy the project's auditability requirement.

### IV. Productivity-App Design Language

The product UI MUST follow the polish standard of modern productivity apps
exemplified by Linear and ERPNext: dense but legible information layouts, crisp
typography, restrained color, purposeful motion, and a quiet but confident
visual hierarchy. The aesthetic is functional, fast, and professional — not
decorative, not gamified, not marketing-oriented.

Concrete expectations:
- High information density without clutter; generous whitespace where it aids
  scanning, tight rhythm where it aids comparison.
- Consistent, design-system-driven components (shadcn "base-nova" on
  `@base-ui/react` for `apps/web`); no one-off styled duplicates.
- Purposeful micro-interactions and enter/exit transitions; motion MUST convey
  cause and state, never decorate.
- Dark mode parity (`.dark` variant) for every surface.

This principle is operationalized by the `/make-interfaces-feel-better` and
`/emil-design-eng` skills, which encode the polish details (shadows, borders,
optical alignment, font smoothing, tabular numbers, hover states, staggered
entrances).

Rationale: A productivity tool is judged by how efficiently a skilled user moves
through it. Linear/ERPNext-level polish reduces cognitive load, signals
reliability, and makes the product feel like professional tooling rather than a
prototype.

### V. Frontend Design Craft

Page and component design MUST be produced with the guidance of the
`/ui-ux-pro-max` skill, which supplies the design intelligence (styles,
palettes, font pairings, layout patterns) for the React + Tailwind v4 + shadcn
base-nova stack used in `apps/web`.

Non-negotiables:
- Every inner page (dashboard, detail, form, list) MUST include a breadcrumb in
  the header reflecting the root → active hierarchy; the last item is the current
  page (plain text), every other item links to its correct parent route (never
  `#`).
- All user-facing text (labels, buttons, messages, empty states, tooltips,
  notifications, errors) MUST be in semi-formal, friendly Indonesian.
  Identifiers and i18n keys stay English.
- Forms with ≤ 5 fields and no complex logic MAY use a modal; forms with > 5
  fields or heavy logic (multi-step, conditional, preview, calculation) MUST use
  a separate page.
- A React component file MUST NOT exceed 300 lines; extract to a
  `components/`/`partials/` subfolder in the same entity folder, or move logic
  into a `use-*` hook. Types used in more than one place MUST live in a dedicated
  types file.

**Feature-based component placement** (NON-NEGOTIABLE):

The frontend uses a feature-based architecture. Component placement is determined
by reuse scope, not by ad-hoc choice:

- **Reusable, cross-feature primitives** (buttons, inputs, dialogs, tables,
  badges, cards — the design-system layer) MUST live in
  `apps/web/src/components/ui/`. These are the shadcn "base-nova" wrappers on
  `@base-ui/react` and any project-wide shared primitives. A component belongs
  here only if it is generic enough to be consumed by more than one feature
  without feature-specific assumptions.
- **Page-specific components** (a section, panel, or sub-block that only makes
  sense within a single page) MUST live in a `partials/` folder **inside that
  page's own folder**, e.g. `apps/web/src/features/<feature>/pages/<page>/partials/`.
  They MUST NOT be hoisted into `components/ui/` and MUST NOT be imported by other
  pages.
- **Feature-shared components** (used by multiple pages within one feature but
  not project-wide) live under the feature's own folder (e.g.
  `apps/web/src/features/<feature>/components/`), never in `components/ui/`.

When a page-local partial grows reusable beyond its page, promote it deliberately:
move it to the appropriate feature-shared folder, then to `components/ui/` only
when it is genuinely project-wide. Never duplicate a component to avoid the move.

Rationale: Consistent design craft, feature-based boundaries, and structural
limits keep the SPA cohesive as it grows, prevent `components/ui/` from becoming
a dumping ground for one-off widgets, and ensure the productivity-app polish in
Principle IV is actually realized in every page.

## Technology Stack & Conventions

- **Monorepo**: Bun/npm workspaces. `apps/web` (React 19 + Vite 8 + TypeScript)
  and `apps/api` (Laravel 13, PHP 8.3) are independent apps; no shared runtime
  contract yet. `packages/*` is reserved.
- **Backend (apps/api)**: Laravel skeleton, Eloquent ORM, `spatie/activitylog`
  for audit, Form Request validation, layered Controller → Service → Action.
  Default DB SQLite (`:memory:` + array drivers in tests).
- **Frontend (apps/web)**: React 19 with React Compiler enabled (avoid manual
  `useMemo`/`useCallback`/`React.memo` unless proven insufficient). shadcn
  "base-nova" components on `@base-ui/react`, Tailwind v4 via `@tailwindcss/vite`
  (theme tokens as CSS variables in `src/index.css`). Path alias `@/*` → `src/*`.
- **Naming**: All file and folder names use common English technical terms — no
  Indonesian, no mixed language. Case follows each ecosystem's standard:
  JS/TS/CSS/HTML/JSON/config → kebab-case; PHP class files → PascalCase,
  config/route/migration → snake_case; SQL tables and columns → snake_case.
  Identifiers are English; comments MAY be Indonesian.
- **Comments**: Only for complex logic or edge cases, never self-explanatory
  code. PHP/JS/TS use `/** */` + `//`.

## Development Workflow & Quality Gates

- **Clean code is mandatory**: SOLID, DRY, KISS, and appropriate design patterns
  applied on every authoring, review, and refactor decision, per the
  `/clean-code-principles` skill.
- **Single DB action via ORM**: one CRUD operation uses Eloquent (or a
  Repository); raw SQL only for bulk/complex cases with a reason comment.
- **Size limits enforced**: PHP class ≤ 300 lines, method ≤ 100 lines; React
  component file ≤ 300 lines. Extract when exceeded.
- **Objective checks before handoff**:
  - PHP: `php -l <file>` syntax check, `php artisan test` for the suite.
  - TS: `npx tsc --noEmit --incremental` (or `npx tsc -b`) type check.
  - PHP formatting via `vendor/bin/pint`.
- **No auto-run of dev/build servers**: `bun run dev`, `bun run build`, and
  `composer run dev` are not run without an explicit user command. Tell the user
  to run them.
- **No browser automation without explicit request**: browser-act / browser-use
  skills are invoked only when the user asks to test, verify, or explore in a
  browser.
- **Output discipline**: no emoji in code, comments, commits, or output. Commit
  messages follow Conventional Commits with no AI attribution.

## Governance

This constitution is the supreme governance document for Thesio. It supersedes
any conflicting ad-hoc practice. All code reviews, planning artifacts
(`.specify/` spec.md, plan.md, tasks.md), and implementation work MUST comply.

**Amendment procedure**:
1. Propose the change with rationale (which principle, what shifts, why).
2. Update `.specify/memory/constitution.md` via `/speckit-constitution`.
3. Bump the version per semantic versioning (MAJOR for incompatible
   principle removal/redefinition, MINOR for new/expanded principle, PATCH for
   clarification/wording) and record it in the Sync Impact Report comment.
4. Note any migration steps required for existing code.

**Compliance review**: every PR and every Spec Kit task list MUST be checked
against these principles before merge/implementation. Complexity beyond the
stated limits MUST be justified in the change description.

**Runtime development guidance**: the skills referenced here
(`/clean-code-principles`, `/laravel-best-practices`, `/design-patterns`,
`/make-interfaces-feel-better`, `/emil-design-eng`, `/ui-ux-pro-max`) are the
authoritative elaboration of each principle and MUST be consulted during
implementation.

**Version**: 1.1.0 | **Ratified**: 2026-08-03 | **Last Amended**: 2026-08-03