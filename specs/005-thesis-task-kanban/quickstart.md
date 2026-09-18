# Quickstart: Thesis Development Task Kanban

**Feature**: 005-thesis-task-kanban | **Date**: 2026-08-07

A manual validation guide (the project runs no automated test suite — see
`CLAUDE.md`). It proves the feature works end-to-end against the contract
(`contracts/api.md`, `contracts/ui.md`) and the data model (`data-model.md`).
Implementation bodies belong in `tasks.md` and the implementation phase, not here.

---

## Prerequisites

- `apps/api` deps installed (`composer install`) and `.env` configured
  (database, `LLM_*` keys reuse the supervision-guidance LLM config —
  `config/openai.*`; no new env vars are introduced by this feature).
- `apps/web` deps installed (`bun install`); `@dnd-kit/core` +
  `@dnd-kit/sortable` added (research.md D3).
- A signed-in student with at least one thesis that has ≥ 1 chapter with a
  notulen (so the suggestion flow and link flow have targets).

## Run commands (execute these yourself — agents do not auto-run dev servers)

From `apps/api`: start the API server however you normally do (e.g.
`php artisan serve`). From `apps/web`: `bun run dev`. Migrate the new table:
`php artisan migrate` (creates `tasks`). Type-check after any code change:
`npx tsc --noEmit --p apps/web/tsconfig.app.json`; PHP syntax check changed
files: `php -l apps/api/app/Models/Task.php` (and the other new files).

---

## Objective checks (run after implementation)

- `php -l` on every new PHP file (Action, Controller, Service, LlmClient, Model,
  Policy, Requests, Resources) → "No syntax errors detected".
- `php artisan migrate --pretend` lists `2026_08_07_000001_create_tasks_table`
  and nothing else new.
- `npx tsc --noEmit -p apps/web/tsconfig.app.json` → 0 errors.
- `vendor/bin/pint` on the new PHP files → no formatting diff.

---

## Manual validation scenarios

Each scenario is a Given/When/Then mapped to a spec acceptance. Run them by hand
in the browser + (where noted) `php artisan tinker` or the API.

### S1 — Board renders and a task can be created (US1, SC-001)

1. Open `/thesis/:thesisId/tasks`. **Expect** breadcrumb `Skripsi › <judul> › Papan
   Tugas`; the four columns (Todo / In Progress / Review / Done) render; the
   progress overview shows the thesis's `defense_remaining_days` (or the
   "deadline belum ditetapkan" empty state).
2. Click "Tugas baru". The create dialog opens (≤ 5 fields). Enter a title, pick
   stage "Todo", save. **Expect** a card appears in the Todo column within 30s;
   a success toast shows; the Todo count increments (`tabular-nums`, no layout
   shift).
3. `tinker`: `App\Models\Task::where('thesis_id', $id)->get()` shows the row with
   `stage='todo'`, `position=0`; an `activity('thesis')` log entry exists with a
   narrative "Membuat tugas …" description.

### S2 — Move a card across columns (US1, SC-002)

1. Drag the card from Todo to In Progress. **Expect** a drop indicator animates
   in, the card lands in In Progress, no other card is disturbed.
2. Keyboard path: focus the card's drag handle, press Space, arrow to In
   Progress, Space to drop. **Expect** the same outcome (accessibility gate).
3. Fallback: use the card's "Pindah ke" dropdown → Review. **Expect** the card
   moves to Review.
4. API check: `GET /api/thesis/:id/tasks` returns the card with `stage` =
   the target and `position` reordered; the old column's remaining tasks have
   contiguous `position` values (no gaps/dupes). The activity log records the
   stage change with before/after values.

### S3 — Priority + due date surface overdue / due-soon (US3, SC-003)

1. Edit a task (card "edit" action): set priority high and due date = today.
   **Expect** the card shows a high-priority marker and an overdue badge
   (destructive token + icon) — not color-only.
2. Set another task's due date = +2 days, stage ≠ done. **Expect** a due-soon
   badge (amber).
3. Move the overdue task to Done. **Expect** the overdue badge disappears (FR-007:
   completed tasks are never flagged overdue).
4. Move it back to an open stage. **Expect** the overdue flag resumes (spec edge
   case "reopen").

### S4 — Link a task to its origin (US2, SC-004)

1. On a card, open "Tautkan". Pick a chapter and/or a notulen. Save. **Expect**
   the card shows chapter/notulen link chips; clicking a chip opens the chapter
   page or the notulen in ≤ 2 interactions.
2. Delete the linked chapter (in the chapters feature). **Expect** the task
   stays on the board with its link cleared (FR-008); the task is not deleted.
   (`tinker`: `App\Models\Task::find($id)->chapter_id` is null.)

### S5 — Suggest tasks from a notulen (US5, FR-011, SC-007)

1. Click "Sarankan dari notulen", pick a notulen with actionable feedback.
   **Expect** a loading state, then a list of suggestions (title/description/
   priority/link chips).
2. Accept one suggestion → "Terima". **Expect** the create dialog opens
   pre-filled (editable); saving creates a task linked to the source notulen.
3. Dismiss another → "Tutup". **Expect** no task is created for it.
4. If a suggestion matches an existing open task, **expect** a "Sudah ada tugas
   mirip" hint with `duplicates_task_id` (spec edge case).
5. Point it at a notulen with no actionable content → **expect** an empty result
   message, not fabricated tasks (spec edge case). Simulate an LLM failure
   (disable `LLM_API_KEY` temporarily) → **expect** a friendly "Gagal membuat
   saran tugas" with retry; the notulen and board are unchanged.

### S6 — Progress overview (US4, SC-005)

1. With tasks across stages, open the overview. **Expect** per-stage counts
   match the board, the completion % matches `done / total`, and the time to
   defense matches `defense_remaining_days`.
2. Empty board: **expect** the friendly empty state inviting the first task, not
   bare zeros.

### S7 — Board privacy (FR-012, research.md D7)

1. Sign in as a **different** student. `GET /api/thesis/<other-thesis-id>/tasks`
   → **expect** 403/404 (the `OwnedByUserScope` on `Thesis` prevents addressing
   another student's thesis; `TaskPolicy` blocks writes).
2. Confirm no supervisor role/permission is referenced anywhere in the new code
   (`grep -Ri "dosen\|supervisor\|supervis" apps/api/app/Actions/Thesis/*Task*
   apps/api/app/Services/Thesis/TaskService.php apps/api/app/Http/Controllers/Thesis/TaskController.php`
   → no hits in feature logic).

---

## Definition of done (cross-references)

All scenarios above pass; the objective checks (`php -l`, `tsc`, `pint`,
`migrate --pretend`) are clean; and the Constitution Check in `plan.md` still
passes (layering, size limits, narrative logging, placement, privacy). The
feature is then ready for the `/speckit-tasks` breakdown.