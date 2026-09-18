# Data Model: Thesis Development Task Kanban

**Feature**: 005-thesis-task-kanban | **Date**: 2026-08-07

One persistent entity is introduced (`Task`). The `Board` is implicit (a thesis's
task collection), `Stage` is a fixed enum, the `Task Link` is two nullable foreign
keys on `Task`, and the `Task Suggestion` is an ephemeral DTO (not persisted —
see research.md D2). Existing entities (`Thesis`, `Chapter`, `SupervisionNote`)
are referenced, not modified.

---

## Entities

### Task (new — `tasks` table)

A single actionable item the student must pursue for their thesis.

**Fields**:

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | bigint unsigned (PK) | no | auto | |
| `thesis_id` | bigint unsigned FK → `theses.id` | no | — | cascade on delete |
| `title` | string(255) | no | — | the actionable item |
| `description` | text | yes | null | optional details / context |
| `stage` | string(20) | no | `'todo'` | enum: `todo`, `in_progress`, `review`, `done` |
| `priority` | integer | yes | null | lower = more urgent (mirrors `guidance_points.priority`); null = unset |
| `due_date` | date | yes | null | optional deadline |
| `chapter_id` | bigint unsigned FK → `chapters.id` | yes | null | nullOnDelete — optional link to origin chapter |
| `supervision_note_id` | bigint unsigned FK → `supervision_notes.id` | yes | null | nullOnDelete — optional link to origin notulen |
| `position` | integer | no | `0` | ordering within a stage (drag reorder); lower = higher in column |
| `created_at` / `updated_at` | timestamp | no | — | |

**Indexes**:
- `index(thesis_id)` — board load.
- `index(thesis_id, stage, position)` — fetch one column ordered (board render).
- `index(thesis_id, due_date)` — overdue/due-soon scan.

**Validation rules** (enforced in Form Requests — see contracts/api.md):
- `title` — required, string, max 255.
- `description` — nullable, string.
- `stage` — required on store/move; must be one of the four enum values; defaults
  to `todo` on store when omitted.
- `priority` — nullable, integer, min 1.
- `due_date` — nullable, date (ISO `Y-m-d`). Past dates allowed (immediately
  overdue — spec edge case).
- `chapter_id` — nullable, must exist in `chapters` and belong to the same thesis.
  (Belonging is enforced in the request via a thesis-scoped existence rule, so a
  student cannot link a task to another student's chapter.)
- `supervision_note_id` — nullable, must exist in `supervision_notes` and belong
  to a chapter of the same thesis.
- `position` — nullable integer on move; ignored on store (auto-assigned).

**Relationships**:
- `task.thesis()` → `belongsTo(Thesis::class)` (the owning thesis).
- `task.chapter()` → `belongsTo(Chapter::class)` (optional origin).
- `task.supervisionNote()` → `belongsTo(SupervisionNote::class)` (optional origin).
- `thesis.tasks()` → `hasMany(Task::class)->orderBy('stage')->orderBy('position')`.

**State transitions** (the `stage` machine):

```
        ┌─────────────────────────────────────────────┐
        │                                             ▼
  todo ──────► in_progress ──────► review ──────► done
   ▲                                             │
   └─────────────────────────────────────────────┘
        (reopen: done → any earlier stage is allowed)
```

- Any stage → any stage is permitted (drag is free-form; the board does not
  force a linear path). This keeps move logic a single branchless reorder.
- "Reopen" = moving a `done` task back to an open stage; its overdue flag resumes
  if `due_date` is still past (handled client-side, research.md D5).
- A task reaches `done` only by an explicit move; there is no auto-completion.

**Within-stage ordering** (`position`):
- On create: `position = (max position in target stage) + 1`.
- On move within the same stage: the target's neighbors are shifted to close the
  old gap and open the new one (ORM updates, single transaction).
- On move across stages: old column is compacted (positions decremented above the
  vacated slot), then the task is inserted at the target position in the new
  column (neighbors shifted down).
- `MoveTaskAction` performs the reorder inside a `DB::transaction` so a board
  never ends up with duplicate/missing positions.

**Ownership / access** (research.md D7):
- `Task` has no global scope of its own; it is always reached via a `Thesis` (which
  carries `OwnedByUserScope('user_id')`) and authorized by `TaskPolicy`.
- `TaskPolicy::view/update/delete` return `$user->is($task->thesis->user)`.

### Task Suggestion (ephemeral DTO — not a table)

A task proposed by the LLM from a chosen supervision note, pending the student's
accept/edit/dismiss decision.

**Shape** (returned by `TaskSuggestionResource`, never persisted):
```
{ title: string, description: string, chapter_id: int|null,
  supervision_note_id: int|null, priority: int|null,
  duplicates_task_id: int|null }
```
- `duplicates_task_id` — set when the suggestion closely matches an existing
  open task on the board (dedup hint, spec edge case); the frontend uses it to
  flag the likely duplicate so the student can skip it.
- Accepting a suggestion = `POST /api/thesis/{thesis}/tasks` with the (possibly
  edited) fields; nothing about suggestions is stored separately.

### Existing entities referenced (unchanged)

- **Thesis** — the board's owner; already has `defense_deadline_at` (used by the
  progress overview) and `user_id` (ownership). A `tasks()` relation is added to
  the `Thesis` model (relation only; no migration change to `theses`).
- **Chapter** — optional link target. A `tasks()` relation is added
  (`hasMany`) for convenience, but no migration change.
- **SupervisionNote** — optional link target and the source for LLM suggestions.
  Read-only here; no change to its model or table.

---

## Activity log entries (Constitution Principle III)

Every mutating use case logs to the `thesis` activity log, narrative Indonesian:

| Use case | Example log description |
|----------|--------------------------|
| Create (manual or accepted suggestion) | `Membuat tugas 'Revisi paragraf landasan teori Bab II' pada papan skripsi '<judul>' — tahap 'todo'.` |
| Update fields | `Memperbarui tugas 'Revisi paragraf landasan teori Bab II' — judul/tenggat diubah.` |
| Move (stage change) | `Memindahkan tugas 'Revisi paragraf landasan teori Bab II' — tahap berubah dari 'todo' ke 'in_progress'.` |
| Move (reorder only, same stage) | (logged only if it meaningfully reorders; otherwise omitted to avoid noise) |
| Delete | `Menghapus tugas 'Revisi paragraf landasan teori Bab II' dari papan skripsi '<judul>'.` |

The causer is `request()->user()`; the subject is the `Task` (or the `Thesis` for
cross-cutting events). Before/after stage values are included when the stage
changed (mirrors the supervision-guide service's narrative style).

---

## Migration summary

A single migration creates the `tasks` table with the columns, foreign keys
(cascade on `thesis`, null-on-delete for the two optional links), and indexes
listed above. Foreign keys follow the existing thesis migrations' style
(`foreignId(...)->constrained()->cascadeOnDelete()` / `->nullOnDelete()`).

No migration alters existing tables; the `Thesis`, `Chapter`, and
`SupervisionNote` models gain relation methods only (no schema change).