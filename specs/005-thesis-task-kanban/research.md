# Research: Thesis Development Task Kanban

**Feature**: 005-thesis-task-kanban | **Date**: 2026-08-07

Phase 0 research resolves every technical choice the spec left open. Each decision
records what was chosen, why, and what was rejected. No `[NEEDS CLARIFICATION]`
markers remain after this file.

---

## D1 — Stages: fixed enum vs. configurable `Stage` table

**Decision**: Stages are a fixed enum (`todo`, `in_progress`, `review`, `done`),
stored as a string column on `tasks`. There is no `stages` table and no per-board
stage configuration in v1.

**Rationale**: The spec (Assumptions) explicitly scopes custom stage configuration
out of v1 and assumes a sensible default is sufficient. A fixed enum keeps the
model to one entity (`Task`), avoids a second table + ordering + per-thesis
seed logic, and lets the board render four known columns with known semantics
(overdue/done flags depend on stage meaning). This matches the constitution's
KISS principle and the existing `GuidancePoint.status` enum pattern (string
column with inline comment listing accepted values).

**Alternatives considered**:
- A `stages` table with `thesis_id` + `position` + `key` + `label`, allowing
  per-board custom columns. Rejected for v1: spec defers it, and it doubles the
  model surface and validation (must guard against deleting a stage that holds
  tasks, must re-map tasks on rename). Revisit only if a future spec allows
  custom stages.
- An `enum` PHP column type / backed enum. Rejected: the existing thesis tables
  use `string` columns with inline-comment value lists (e.g. `guidance_points.status`,
  `supervision_guides.origin`); follow that convention for consistency.

---

## D2 — Suggestion persistence: ephemeral vs. stored-pending

**Decision**: LLM suggestions are **ephemeral**. `GenerateTaskSuggestionsAction`
calls `TaskSuggestionLlmClient` and returns an array of suggestion DTOs; nothing is
written to the database. Accepting a suggestion calls the normal `StoreTaskRequest`
→ `CreateTaskAction` path with the suggestion's fields. Dismissed suggestions are
simply not submitted.

**Rationale**: The spec (FR-011, Clarification Decision Q1 = B) requires that no
task is ever created without the student accepting it, and frames suggestions as a
per-notulen, on-demand accelerator — not a background pipeline. Ephemeral
suggestions mean: no `task_suggestions` table, no cleanup job, no "stale
suggestion" state, no orphaned rows when a notulen is edited. It also means
re-requesting suggestions from the same notulen may resurface similar items
(already captured in the spec's edge cases) — acceptable and simpler than
tracking dismissals.

**Alternatives considered**:
- A `task_suggestions` table storing proposed-but-undecided items with a
  `status` (pending/accepted/dismissed). Rejected: introduces lifecycle, dedup
  state, and cleanup for no spec-required benefit; the student curates in one
  sitting. Revisit only if the spec later requires cross-session suggestion
  memory or a "dismissed permanently" rule.
- Auto-creating suggestions as `todo` tasks the student must delete. Rejected —
  this is option C from Clarification Q1, which the product owner explicitly did
  not choose.

---

## D3 — Drag-and-drop: library choice

**Decision**: Install `@dnd-kit/core` + `@dnd-kit/sortable` for accessible
drag-and-drop of task cards across the four columns and within a column. Use
`PointerSensor` for pointer drag and `KeyboardSensor` for keyboard
accessibility (arrow keys to grab, move, drop — required by
`/ui-ux-pro-max` CRITICAL accessibility tier). Provide a fallback "Pindah ke"
(move to stage) dropdown on each card for no-pointer / reduced-motion contexts,
so DnD is never the only way to move a task.

**Rationale**: The user asked for a Linear/ERPNext-feel board (via
`/ui-ux-pro-max` + `/make-interfaces-feel-better`), and a Kanban without drag is
awkward. `@dnd-kit` is the de-facto modern choice: tree-shakeable, accessible by
default (keyboard sensors, screen-reader announcements), and composes with
`motion` for drop animations. It is a focused, single-purpose dependency, in
line with KISS. The fallback dropdown guarantees the move action is reachable
when DnD is impractical.

**Alternatives considered**:
- Native HTML5 drag-and-drop. Rejected: poor keyboard accessibility and
  inconsistent touch behavior; would fail the accessibility gate and feel
  unpolished on mobile.
- `motion`'s built-in drag (`drag` prop). Rejected: `motion` drag is for
  small-scope element drag, not multi-list sortable reordering with cross-list
  moves; building sortable on it reinvents `@dnd-kit` poorly.
- No DnD at all — move only via dropdown + up/down arrows. Rejected: matches
  ERPNext's simpler model but loses the Linear feel the user asked for; keep
  DnD with the dropdown as the a11y/no-pointer fallback instead.

---

## D4 — Motion library: reuse installed `motion`

**Decision**: Use the already-installed `motion` (v12) for all enter/exit,
staggered card entrance, drop indicators, and icon cross-fades — per
`/make-interfaces-feel-better` (spring `duration: 0.3, bounce: 0`; subtle
`translateY` exits; `initial={false}` on `AnimatePresence` for default state;
split-and-stagger entrances ~100ms). No new animation dependency.

**Rationale**: `motion` is already in `apps/web/package.json`. The polish skill
explicitly references its API. Reusing it keeps one motion model across the app
and avoids a second library. All motion respects `prefers-reduced-motion`
(ui-ux-pro-max HIGH tier) and animates only `transform`/`opacity` (60fps).

**Alternatives considered**:
- CSS-only transitions + keyframes. Rejected: viable for hover/press but
  awkward for sortable drop indicators and staggered entrances; `motion` is
  already available and cleaner.
- Adding `framer-motion`. Rejected: `motion` is the current package name for the
  same library; installing the old name would duplicate.

---

## D5 — Overdue / due-soon computation: backend-derived vs. frontend-derived

**Decision**: Compute the **derived flags** (`is_overdue`, `is_due_soon`,
`is_high_priority`) on the **frontend** (`use-task-board.ts`) from the raw
`due_date`, `stage`, and `priority` fields returned by the API. The API returns
raw data only (`due_date`, `stage`, `priority`); it does not serialize computed
urgency flags. "Due soon" = due within the next 3 days.

**Rationale**: These flags are presentational and depend on "today", which
shifts without data changing — computing them client-side keeps the API
stateless and avoids stale-flag bugs when a task sits open overnight. The
flags are cheap to derive and already used for visual treatment only. The spec
(SC-003, FR-007) is satisfied as long as the board surfaces them, which the
hook does. `is_overdue` requires `stage !== 'done'` and `due_date < today`;
completed tasks are never flagged (FR-007).

**Alternatives considered**:
- Compute flags on the API in `TaskResource`. Rejected: flags would be frozen
  at response time; a task left open across midnight would show yesterday's
  flag until refetched. The board is long-lived in the SPA, so client-side is
  more accurate.
- Store `is_overdue` on the row. Rejected: denormalized, stale, and needless —
  it is a pure function of `due_date` + `stage` + today.

---

## D6 — Reuse of existing `components/datatable` and `components/forms`

**Decision**: Reuse both as-is, with no re-styling and no duplication.

- The task **list view** (`task-list-view.tsx`) is built on the existing
  `DataTable` (`@/components/datatable/data-table.tsx`) with `ColumnDef`s for
  title, stage, priority, due date, links, and row actions. This is the
  accessibility-required table alternative to the board view
  (ui-ux-pro-max: `data-table` guideline) and gives sortable/filterable access.
- The create/edit (`task-form-dialog.tsx`), link (`link-task-dialog.tsx`), and
  suggestion-review (`suggest-tasks-dialog.tsx`) dialogs all use the existing
  `Form` + field components (`@/components/forms/*`) + `useFormSubmit`, with
  `zod` schemas for validation, exactly like the existing `add-point-form.tsx`.

**Rationale**: The user explicitly required reusing these. The constitution
(Principle IV/V) forbids one-off styled duplicates. Both components already
wrap `components/ui` primitives and the project's `api()`/`toast` plumbing, so
the new feature gets consistent styling, error handling, and dark-mode parity
for free.

**Alternatives considered**: Building board-native forms or a board-specific
table. Rejected — violates the reuse mandate and the no-duplicate rule.

---

## D7 — Board privacy enforcement: policy + scope

**Decision**: Enforce "board is private to the owning student" with two layers:
(1) `TaskPolicy` with `view`/`update`/`delete` returning `$user->is($task->thesis->user)`,
mirroring the existing `ThesisPolicy`; (2) tasks are always reached through the
thesis route parameter (`thesis/{thesis}/tasks/{task}`), and `Thesis` carries the
`OwnedByUserScope('user_id')` global scope, so a student can never address another
student's thesis. No supervisor role or permission is referenced anywhere in this
feature.

**Rationale**: The spec (FR-012, Clarification Decision Q2) makes the board
student-only. The existing thesis feature already enforces ownership exactly
this way (`ThesisPolicy` + `OwnedByUserScope`); reusing the pattern is the
simplest correct enforcement and needs no new role/permission machinery.

**Alternatives considered**:
- A dedicated `task.board.view` permission via spatie/permission. Rejected:
  adds permission machinery for a single-actor feature with no supervisor role
  in scope; the policy + scope already fully enforce ownership.
- A `user_id` column on `tasks` (denormalized owner). Rejected: ownership is
  already unambiguous through `thesis.user_id`; a denormalized column would need
  sync on thesis transfer (which does not exist) and invites drift.

---

## Summary

All spec-open technical questions are resolved. No `[NEEDS CLARIFICATION]`
markers remain. The design in `data-model.md` and `contracts/` is built directly
on these decisions.