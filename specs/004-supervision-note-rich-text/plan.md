# Implementation Plan: Supervision Note Rich Text & Date

**Branch**: `004-supervision-note-rich-text` | **Date**: 2026-08-06 | **Spec**: `specs/004-supervision-note-rich-text/spec.md`

**Input**: Feature specification from `/specs/004-supervision-note-rich-text/spec.md`

## Summary

Evolve the existing per-chapter "notulen" (supervision note) in place: add a `session_date`
(waktu bimbingan, no future dates) and replace the plain-text `TextareaField` with a tiptap rich
text editor (headings, bullet/numbered lists, bold, italic). The 1:1 `supervision_notes` record per
chapter is preserved; existing plain-text content stays fully readable (rendered as paragraphs, no
data loss). A new read-only **Riwayat Notulen** datatable aggregates all chapters' notes for a
thesis. Reuses `components/forms/*` (notulen form) and `components/datatable/*` (history list);
design via `/ui-ux-pro-max`, polish via `/make-interfaces-feel-better`.

## Technical Context

**Language/Version**: PHP 8.3 (Laravel 13) backend; React 19 + Vite 8 + TypeScript frontend.

**Primary Dependencies**: Existing — react-hook-form, zod v4, @base-ui/react 1.6, TanStack Table,
react-day-picker v10, date-fns v4, react-i18next, spatie/activitylog. New — `@tiptap/react`,
`@tiptap/starter-kit`, `@tiptap/pm` (tiptap v3, React 19 compatible; confirm exact versions via
Context7 during implementation).

**Storage**: SQLite default. `supervision_notes.content` is already `longText` (stores tiptap HTML);
new `session_date` column (date, nullable for legacy rows).

**Testing**: No automated tests (project policy). Verify via `php -l`, `npx tsc --noEmit
--incremental`, and diff inspection. `php artisan test` only if explicitly requested.

**Target Platform**: existing web SPA (`apps/web`).

**Project Type**: web service (Laravel API) + SPA.

**Performance Goals**: SC-002 — open notulen and see date + formatted notes within 2 s.

**Constraints**: FR-004 session date not in the future; FR-005 reject empty/whitespace-only notes;
FR-009 zero data loss on existing plain-text notes; 1:1 note-per-chapter preserved.

**Scale/Scope**: one note per chapter; history list = one row per chapter (small, client-paginated).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution v1.1.0 — all principles PASS, no violations:

- **I. Layered HTTP (Controller → Service → Action)**: `SupervisionNoteController` →
  `SupervisionNoteService` → `Upsert/DeleteSupervisionNoteAction`. The new `index` endpoint is a
  read: Controller → Service (no Action — Actions execute DB mutations, reads go via Eloquent).
- **II. Action Single Responsibility**: `UpsertSupervisionNoteAction` keeps one use case
  (create-or-update); signature extended to accept `{ session_date, content }`. ORM `updateOrCreate`.
- **III. Narrative Activity Logging**: existing `activity('thesis')` log extended to mention the
  session date in the narrative.
- **IV. Productivity-App Design Language**: reuse design-system primitives; dark-mode parity; tabular
  numbers for dates; purposeful motion on view↔edit swap and delete dialog.
- **V. Frontend Design Craft**: feature-based placement (see Project Structure); breadcrumb on the
  new history page; React component files ≤ 300 lines; Indonesian UI text, English identifiers.

Re-evaluated after Phase 1 design: still PASS — the data model, contracts, and component placement
do not introduce any size, naming, or layering violation. No complexity tracking table needed.

## Project Structure

### Documentation (this feature)

```text
specs/004-supervision-note-rich-text/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── api.md           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
apps/api/
  database/migrations/
    2026_08_06_000003_add_session_date_to_supervision_notes_table.php   # NEW
  app/Models/SupervisionNote.php                                        # MODIFY
  app/Http/Requests/Thesis/UpsertSupervisionNoteRequest.php             # MODIFY
  app/Http/Controllers/Thesis/SupervisionNoteController.php             # MODIFY (+ index)
  app/Services/Thesis/SupervisionNoteService.php                        # MODIFY (+ list)
  app/Actions/Thesis/UpsertSupervisionNoteAction.php                    # MODIFY
  routes/thesis.php                                                     # MODIFY

apps/web/
  package.json                                                          # MODIFY (tiptap deps)
  src/components/ui/date-picker.tsx                                     # NEW (project-wide)
  src/components/forms/date-field.tsx                                   # NEW (Form field)
  src/features/thesis/components/rich-text-editor.tsx                   # NEW (feature-shared)
  src/features/thesis/components/rich-text-viewer.tsx                   # NEW (feature-shared)
  src/features/thesis/types.ts                                          # MODIFY
  src/features/thesis/api/thesis.ts                                     # MODIFY
  src/features/thesis/pages/chapter/partials/notulen-tab.tsx            # MODIFY (evolve)
  src/features/thesis/pages/supervision-notes/index.tsx                 # NEW (history page)
  src/features/thesis/pages/supervision-notes/partials/empty-state.tsx  # NEW (page-local)
  src/App.tsx                                                           # MODIFY (route)
  src/features/thesis/pages/thesis/detail.tsx                           # MODIFY (link)
  src/i18n/locales/{id,en}/thesis.json                                  # MODIFY
```

**Structure Decision**: Web application — `apps/api` (Laravel) + `apps/web` (React SPA), independent
apps with no shared runtime contract. Component placement follows Principle V: `date-picker` →
`components/ui/` (generic cross-feature primitive); `date-field` → `components/forms/` (Form-context
field, sibling to `text-field.tsx`); `rich-text-editor`/`rich-text-viewer` →
`features/thesis/components/` (thesis-feature-shared); history page + empty-state →
`features/thesis/pages/supervision-notes/`; notulen tab stays a page-local partial of the chapter
page (`pages/chapter/partials/`).

## Scope Note (spec amendment required)

Two clarifications expand scope beyond the original `spec.md` and MUST be amended into the spec
(via `/speckit-specify` or manual edit) before `/speckit-tasks`:

1. **Riwayat Notulen list** — a read-only datatable aggregating all chapters' notes for a thesis
   (does NOT change 1:1 cardinality; adds an index view). Add a User Story + supporting FRs.
2. **Custom date-picker** — a calendar popover in `components/ui/` (not the native date input).

## Implementation Delegation

Per global rules: BE changes → `ammar` (skills `/laravel-best-practices` +
`/clean-code-principles`); FE changes → `sierly` (skills `/ui-ux-pro-max` +
`/make-interfaces-feel-better` + `/react-expert`). BE and FE are independent → delegate in parallel
once `tasks.md` exists. Push BE → `haikal` (`/code-review` level low) only when the user asks to
push.