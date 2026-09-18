# Implementation Plan: Thesis Development Task Kanban

**Branch**: `005-thesis-task-kanban` | **Date**: 2026-08-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-thesis-task-kanban/spec.md`

## Summary

A per-thesis Kanban task board where a student captures, stages, prioritizes, and
chases the actionable items from bimbingan and chapter work. Tasks live as cards on
four ordered stages (Todo → In Progress → Review → Done), optionally linked to a
chapter and/or supervision note (notulen) for traceability, with priority and due
dates that surface overdue/due-soon items. A progress overview maps completion
against the defense deadline. A student-initiated, per-notulen LLM flow proposes
actionable tasks the student accepts, edits, or dismisses — no task is ever
created without acceptance. The board is fully private to the owning student; the
supervisor (dosen) is not a user of this feature.

Technical approach: a new `Task` model (one board per thesis, stages as a fixed
enum, in-stage ordering via a `position` column) behind the existing layered
Controller → Service → Action architecture, narrative activity logging, and
policy-gated ownership. The frontend adds a `task-board` page under the existing
`features/thesis` feature, reusing the project's `components/datatable` (list
view) and `components/forms` (create/edit/link/suggest dialogs), with `motion`
for enter/exit polish and `@dnd-kit` for accessible card drag-and-drop. Design
follows `/ui-ux-pro-max` (productivity, accessibility, data-table-as-a11y-alt,
horizontal-scroll board) and polish follows `/make-interfaces-feel-better`
(concentric radii, shadows-over-borders, staggered entrance, tabular-nums,
scale-on-press), while keeping the project's existing Geist + base-nova tokens.

## Technical Context

**Language/Version**: PHP 8.3 (backend, Laravel 13); TypeScript on React 19 (frontend).

**Primary Dependencies**:
- Backend: Laravel 13, Eloquent ORM, `spatie/laravel-activitylog` (audit),
  `spatie/laravel-permission` (roles), `openai-php/laravel` (OpenAI-compatible
  LLM, already used by supervision guidance).
- Frontend: React 19 (React Compiler enabled), Vite 8, Tailwind v4,
  `@base-ui/react` + `class-variance-authority` (shadcn "base-nova"),
  `@tanstack/react-table` (existing DataTable), `react-hook-form` + `zod`
  (existing forms), `react-router-dom` v7, `react-i18next`, `motion` v12
  (already installed). New: `@dnd-kit/core` + `@dnd-kit/sortable` (see research.md D3).

**Storage**: SQLite default (Eloquent ORM; `:memory:` + array drivers in tests).
Single CRUD via ORM only; raw SQL prohibited (Constitution Principle II).

**Testing**: No automated test suite (project policy). Objective checks: `php -l`
(PHP syntax), `npx tsc --noEmit --incremental` (TS type check), diff inspection.

**Target Platform**: Web — React SPA (`apps/web`) consuming Laravel API (`apps/api`)
on the same origin via Sanctum cookie auth. No mobile/offline target for v1.

**Project Type**: Web application (SPA frontend + API backend in a Bun/npm monorepo).

**Performance Goals**: Board view renders in < 1s for a typical thesis (tens of
tasks); LLM suggestion returns within the existing 30s LLM timeout; card
drag/move interaction at 60fps (transform/opacity only).

**Constraints**: PHP class ≤ 300 lines, method ≤ 100 lines; React component file
≤ 300 lines (Constitution Principle V + II). No `transition: all`; motion
respects `prefers-reduced-motion`. UI text in semi-formal friendly Indonesian.

**Scale/Scope**: One board per active thesis; expected tens to low-hundreds of
tasks per board. Single student owner per board; no collaboration.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Checked against `.specify/memory/constitution.md` v1.1.0. All gates pass — no
violations, no complexity-tracking entries required.

| Principle | Gate | How this plan complies |
|-----------|------|------------------------|
| I. Layered HTTP (Controller → Service → Action) | PASS | `TaskController` only parses/authorizes/returns; `TaskService` orchestrates use cases (create, update, delete, move, suggest, accept-suggestion) and holds the LLM infra boundary; `Create/Update/Delete/MoveTaskAction` execute concrete DB units. Dependency direction stays one-way Controller → Service → Action → Eloquent. No Action calls a Service. |
| II. Action single responsibility & DB execution | PASS | Each Action does exactly one DB unit (`Create…`, `Update…`, `Delete…`, `Move…`); ORM only, no raw SQL. `GenerateTaskSuggestionsAction` is a read-only LLM call that returns a DTO array and persists nothing — accepting a suggestion routes through `CreateTaskAction`. No Service is injected into any Action. |
| III. Narrative activity logging | PASS | Every create/update/delete/move records a `activity('thesis')` entry with causer, subject, and a narrative Indonesian description (e.g. "Memperbarui tugas 'Revisi Bab II' — tahap berubah dari 'todo' ke 'in_progress'."). |
| IV. Productivity-app design language | PASS | Board + list views, base-nova components only (no one-off styled duplicates), dark-mode parity via tokens, purposeful motion (drag, staggered entrance, scale-on-press), dense-but-legible layout. Reuses existing `components/datatable` and `components/forms`. |
| V. Frontend design craft | PASS | Breadcrumb in header (Thesis → board); Indonesian UI text; create/edit modals ≤ 5 fields (links handled in a separate dialog); components ≤ 300 lines; feature-based placement — page-specific parts in `pages/task-board/partials/`, feature-shared card/badges in `features/thesis/components/`, nothing hoisted into `components/ui/`. |

**Re-check after Phase 1**: design artifacts (data-model.md, contracts/) preserve
the layering, size limits, and placement rules above. No new violations introduced.

## Project Structure

### Documentation (this feature)

```text
specs/005-thesis-task-kanban/
├── plan.md              # This file
├── research.md          # Phase 0 — decisions (D1–D5)
├── data-model.md        # Phase 1 — Task entity, stages, state transitions
├── quickstart.md        # Phase 1 — manual validation scenarios
├── contracts/
│   ├── api.md           # Phase 1 — REST contract (endpoints, bodies, responses)
│   └── ui.md            # Phase 1 — UI contract (board/list/forms/suggestion + design)
└── tasks.md             # Phase 2 (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
apps/api/                                   # Laravel backend
├── app/
│   ├── Actions/Thesis/
│   │   ├── CreateTaskAction.php
│   │   ├── UpdateTaskAction.php
│   │   ├── DeleteTaskAction.php
│   │   ├── MoveTaskAction.php             # stage change + within/across-stage reorder
│   │   └── GenerateTaskSuggestionsAction.php  # read-only LLM call → DTO array (no persist)
│   ├── Http/
│   │   ├── Controllers/Thesis/TaskController.php
│   │   ├── Requests/Thesis/
│   │   │   ├── StoreTaskRequest.php
│   │   │   ├── UpdateTaskRequest.php
│   │   │   ├── MoveTaskRequest.php
│   │   │   └── SuggestTasksRequest.php
│   │   └── Resources/Thesis/
│   │       ├── TaskResource.php
│   │       └── TaskSuggestionResource.php
│   ├── Models/Task.php
│   ├── Policies/TaskPolicy.php
│   └── Services/Thesis/
│       ├── TaskService.php                 # orchestrates CRUD/move/suggest/accept
│       └── TaskSuggestionLlmClient.php     # OpenAI-compatible client (infra Service)
├── routes/thesis.php                       # +task routes nested under thesis/{thesis}
└── database/migrations/
    └── 2026_08_07_000001_create_tasks_table.php

apps/web/                                    # React SPA frontend
└── src/
    ├── features/thesis/
    │   ├── api/task-board.ts                # list/create/update/delete/move/suggest
    │   ├── types.ts                         # +Task, TaskStage, TaskSuggestion, BoardSummary
    │   ├── hooks/use-task-board.ts          # load, mutate, suggest, derived overdue/due-soon
    │   ├── components/                       # feature-shared (used by >1 page/view)
    │   │   ├── task-card.tsx
    │   │   ├── task-priority-badge.tsx
    │   │   ├── task-due-badge.tsx
    │   │   └── task-link-badge.tsx
    │   └── pages/task-board/
    │       ├── index.tsx                    # page shell: AppLayout + breadcrumb + view switch
    │       └── partials/                    # page-only sections
    │           ├── board-view.tsx           # kanban columns (horizontal scroll)
    │           ├── board-column.tsx          # one stage column + drop target
    │           ├── task-list-view.tsx       # DataTable list view (reuses components/datatable)
    │           ├── task-form-dialog.tsx     # create/edit modal (reuses components/forms)
    │           ├── link-task-dialog.tsx     # link-to chapter/notulen (combobox fields)
    │           ├── suggest-tasks-dialog.tsx # LLM suggestion review (accept/edit/dismiss)
    │           ├── progress-overview.tsx    # per-stage counts + completion + time-to-defense
    │           └── board-empty-state.tsx
    └── App.tsx                              # +<Route path="/thesis/:thesisId/tasks">
```

**Structure Decision**: The backend follows the existing `Thesis` feature
placement (Actions/Services/Requests/Resources/Controllers under the `Thesis`
namespace, routes appended to `routes/thesis.php`, migration timestamp-prefixed).
The frontend follows the existing feature-based architecture: a new
`pages/task-board/` page under `features/thesis`, page-specific sections in its
`partials/` folder, and genuinely feature-shared card/badge components in
`features/thesis/components/` (consumed by both the board view and the list view).
No component is hoisted into the project-wide `src/components/ui/` — none are
generic enough. The existing `src/components/datatable/` and `src/components/forms/`
are reused as-is (no duplication, no re-styling).

## Complexity Tracking

> Not applicable — Constitution Check has no violations to justify.